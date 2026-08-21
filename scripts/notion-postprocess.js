/**
 * Notion → Jekyll 변환 결과 후처리
 *
 * notion-to-md 의 출력만으로는 블로그에서 제대로 동작하지 않는 것들을 보정한다.
 *   1. 미디어: Notion 이 주는 URL 은 1시간 뒤 만료되므로 파일을 내려받아 저장소에 보관
 *   2. 토글: kramdown 은 HTML 블록 안의 마크다운을 파싱하지 않으므로 markdown="1" 부여
 *   3. 콜아웃: 평범한 인용구로 나오는 것을 Chirpy 의 prompt 스타일로 변환
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

// 블로그 본문 폭을 고려한 상한. 이보다 큰 이미지는 축소한다.
const MAX_IMAGE_WIDTH = 1600;
const WEBP_QUALITY = 82;

// 이미지가 아닌 첨부(동영상·PDF 등)를 저장소에 담을 때의 상한
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.avif'
]);

// 마크다운의 이미지/링크를 모두 잡는다. 앞의 '!' 유무로 이미지와 링크를 구분한다.
const MEDIA_PATTERN = /(!?)\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

/**
 * Notion 이 호스팅하는(= 만료되는) URL 인지 판별.
 * 사용자가 직접 붙인 외부 이미지 링크는 건드리지 않는다.
 */
function isNotionHosted(url) {
  return (
    /^https?:\/\/prod-files-secure\./.test(url) ||
    /^https?:\/\/s3[.-][^/]*\.amazonaws\.com\//.test(url) ||
    /secure\.notion-static\.com/.test(url) ||
    /^https?:\/\/(www\.)?notion\.so\/(image|signed)\//.test(url) ||
    /^https?:\/\/file\.notion\.so\//.test(url)
  );
}

/**
 * 저장 파일명 생성.
 *
 * 서명 파라미터는 동기화할 때마다 바뀌므로 경로 부분만으로 해시를 만든다.
 * 그래야 같은 이미지가 항상 같은 파일명을 얻어 불필요한 커밋이 생기지 않는다.
 */
function assetBasename(url) {
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = url.split('?')[0];
  }

  const hash = createHash('sha1').update(pathname).digest('hex').slice(0, 10);
  const ext = extname(pathname).toLowerCase();
  return { hash, ext, pathname };
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * 이미지를 WebP 로 재인코딩하고, 너무 크면 축소한다.
 * 애니메이션(GIF 등)은 프레임을 유지한다.
 */
async function optimizeImage(buffer) {
  const probe = sharp(buffer, { animated: true });
  const metadata = await probe.metadata();

  let pipeline = probe;
  if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });
  }

  return pipeline.webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer();
}

/**
 * Notion 에 올라간 이미지·첨부를 내려받아 저장소에 보관하고 링크를 바꾼다.
 *
 * 이미지는 media_subpath 가 적용되도록 파일명만 남기고,
 * 그 외 첨부는 media_subpath 가 적용되지 않으므로 절대경로로 적는다.
 */
export async function processMedia(markdown, { mediaDir, mediaSubpath }) {
  const matches = [...markdown.matchAll(MEDIA_PATTERN)].filter((m) => isNotionHosted(m[3]));

  if (matches.length === 0) {
    return { markdown, downloaded: 0, skipped: 0 };
  }

  await mkdir(mediaDir, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  const replacements = new Map();

  for (const match of matches) {
    const [full, bang, label, url] = match;
    if (replacements.has(full)) continue;

    const isImage = bang === '!' || IMAGE_EXTENSIONS.has(assetBasename(url).ext);
    const { hash, ext } = assetBasename(url);

    try {
      if (isImage && ext !== '.svg') {
        const filename = `${hash}.webp`;
        const target = join(mediaDir, filename);

        // 이미 받아둔 파일이면 다시 내려받지 않는다.
        if (!existsSync(target)) {
          const optimized = await optimizeImage(await fetchBuffer(url));
          await writeFile(target, optimized);
          downloaded++;
        } else {
          skipped++;
        }

        replacements.set(full, `![${label}](${filename})`);
      } else {
        const filename = `${hash}${ext || ''}`;
        const target = join(mediaDir, filename);

        if (!existsSync(target)) {
          const buffer = await fetchBuffer(url);

          if (buffer.length > MAX_ATTACHMENT_BYTES) {
            console.warn(
              `   ⚠️  첨부가 너무 큽니다(${(buffer.length / 1048576).toFixed(1)}MB), 건너뜀: ${label || filename}`
            );
            continue; // 링크를 그대로 두면 만료되지만, 저장소를 부풀리는 것보다 낫다
          }

          await writeFile(target, buffer);
          downloaded++;
        } else {
          skipped++;
        }

        replacements.set(full, `[${label}](${mediaSubpath}/${filename})`);
      }
    } catch (error) {
      console.warn(`   ⚠️  미디어 처리 실패(${error.message}): ${url.slice(0, 60)}...`);
    }
  }

  let result = markdown;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }

  return { markdown: result, downloaded, skipped };
}

/**
 * Notion 이 호스팅하는 첨부를 내려받아 저장하고 파일명을 돌려준다.
 * 이미지가 아니므로 재인코딩 없이 원본 그대로 보관한다.
 */
async function saveAttachment(url, mediaDir) {
  const { hash, ext } = assetBasename(url);
  const filename = `${hash}${ext || ''}`;
  const target = join(mediaDir, filename);

  if (existsSync(target)) return { filename, downloaded: false };

  const buffer = await fetchBuffer(url);
  if (buffer.length > MAX_ATTACHMENT_BYTES) {
    throw new Error(`파일이 너무 큽니다 (${(buffer.length / 1048576).toFixed(1)}MB)`);
  }

  await mkdir(mediaDir, { recursive: true });
  await writeFile(target, buffer);
  return { filename, downloaded: true };
}

// notion-sync.js 의 오디오/동영상 변환기가 남긴 Liquid include 안의 src 를 찾는다
const EMBED_SRC_PATTERN = /(\{%\s*include\s+embed\/(?:audio|video)\.html\s+src=')([^']+)(')/g;

/**
 * 오디오/동영상 include 의 src 가 Notion 임시 URL 이면 파일을 내려받아 파일명으로 바꾼다.
 * media_subpath 가 적용되므로 파일명만 남기면 된다.
 */
export async function processEmbeddedMedia(markdown, { mediaDir }) {
  const matches = [...markdown.matchAll(EMBED_SRC_PATTERN)].filter((m) => isNotionHosted(m[2]));
  if (matches.length === 0) return { markdown, downloaded: 0, skipped: 0 };

  let downloaded = 0;
  let skipped = 0;
  const replacements = new Map();

  for (const [full, head, url, tail] of matches) {
    if (replacements.has(full)) continue;
    try {
      const saved = await saveAttachment(url, mediaDir);
      saved.downloaded ? downloaded++ : skipped++;
      replacements.set(full, `${head}${saved.filename}${tail}`);
    } catch (error) {
      console.warn(`   ⚠️  첨부 미디어 처리 실패(${error.message}): ${url.slice(0, 60)}...`);
    }
  }

  let result = markdown;
  for (const [from, to] of replacements) result = result.split(from).join(to);

  return { markdown: result, downloaded, skipped };
}

/**
 * kramdown 은 기본적으로 HTML 블록 안의 마크다운을 파싱하지 않는다.
 * markdown="1" 을 붙여야 토글 내용이 제대로 렌더링된다.
 */
export function fixToggles(markdown) {
  return markdown.replace(/<details>/g, '<details markdown="1">');
}

// 본문 최상단의 "썸네일" 섹션을 대문 이미지로 승격시킨다.
const THUMBNAIL_HEADING = /^#{1,6}\s*(썸네일|thumbnail)\s*$/i;

/**
 * 소셜 공유 미리보기는 WebP 를 못 읽는 클라이언트가 아직 있어서
 * 썸네일만은 JPEG 사본을 만들어 그쪽을 가리킨다.
 */
async function toShareableThumbnail(mediaDir, filename) {
  if (!filename.endsWith('.webp')) return filename;

  const jpegName = filename.replace(/\.webp$/, '.jpg');
  const jpegPath = join(mediaDir, jpegName);

  try {
    if (!existsSync(jpegPath)) {
      await sharp(join(mediaDir, filename)).jpeg({ quality: 85 }).toFile(jpegPath);
    }
    return jpegName;
  } catch (error) {
    // 사본을 못 만들어도 썸네일 자체는 살린다
    console.warn(`   ⚠️  썸네일 JPEG 사본 생성 실패(${error.message}), 원본 사용`);
    return filename;
  }
}

const DIVIDER_LINE = /^(-{3,}|\*{3,}|_{3,})$/;
const HEADING_LINE = /^#{1,6}\s/;
const IMAGE_LINE = /!\[([^\]]*)\]\(([^)]+)\)/;

/**
 * 최상단 "썸네일" 섹션을 찾아 본문에서 떼어내고 대문 이미지 정보를 돌려준다.
 *
 * 섹션의 끝은 구분선(---) 또는 다음 제목이다. 구분선은 함께 지우고 제목은 남긴다.
 * 둘 다 없으면 본문을 통째로 삼키지 않도록 이미지 한 장까지만 걷어낸다.
 */
export async function extractThumbnail(markdown, { mediaDir }) {
  const lines = markdown.split('\n');

  let start = 0;
  while (start < lines.length && lines[start].trim() === '') start++;

  if (start >= lines.length || !THUMBNAIL_HEADING.test(lines[start].trim())) {
    return { markdown, thumbnail: null };
  }

  let terminator = -1;
  let terminatorIsDivider = false;

  for (let i = start + 1; i < lines.length; i++) {
    if (DIVIDER_LINE.test(lines[i].trim())) {
      terminator = i;
      terminatorIsDivider = true;
      break;
    }
    if (HEADING_LINE.test(lines[i])) {
      terminator = i;
      break;
    }
  }

  let section;
  let bodyStart;

  if (terminator !== -1) {
    section = lines.slice(start + 1, terminator).join('\n');
    bodyStart = terminatorIsDivider ? terminator + 1 : terminator;
  } else {
    // 종료 표시가 없다: 제목 바로 다음의 이미지 한 줄까지만 안전하게 처리
    let imageIndex = -1;
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      if (IMAGE_LINE.test(lines[i])) imageIndex = i;
      break;
    }

    section = imageIndex === -1 ? '' : lines[imageIndex];
    bodyStart = imageIndex === -1 ? start + 1 : imageIndex + 1;
  }

  const rest = lines.slice(bodyStart).join('\n').replace(/^\n+/, '');
  const found = section.match(IMAGE_LINE);

  if (!found) {
    return { markdown: rest, thumbnail: null };
  }

  const [, alt, path] = found;
  const isLocal = !/^https?:\/\//.test(path);

  return {
    markdown: rest,
    thumbnail: {
      path: isLocal ? await toShareableThumbnail(mediaDir, path) : path,
      alt: alt || null
    }
  };
}

// 북마크 카드용 메타데이터 조회 설정
const OG_TIMEOUT_MS = 6000;
const OG_USER_AGENT = 'Mozilla/5.0 (compatible; MinjiBlogBot/1.0; +https://mminzy22.github.io)';

function firstMatch(html, patterns) {
  for (const pattern of patterns) {
    const found = html.match(pattern);
    if (found?.[1]) return decodeEntities(found[1].trim());
  }
  return null;
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

const metaPattern = (property) =>
  new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    'i'
  );

const metaPatternReversed = (property) =>
  new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );

/**
 * 링크의 Open Graph 정보를 읽어 카드에 쓸 값을 돌려준다.
 * 실패하면 null 을 돌려주고 호출부가 단순 링크로 대체한다.
 */
export async function fetchLinkPreview(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': OG_USER_AGENT, accept: 'text/html,*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(OG_TIMEOUT_MS)
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const type = response.headers.get('content-type') || '';
  if (!type.includes('html')) throw new Error(`HTML 이 아님 (${type.split(';')[0]})`);

  // 메타 정보는 head 에 있으므로 앞부분만 읽어도 충분하다
  const html = (await response.text()).slice(0, 200000);

  const title =
    firstMatch(html, [
      metaPattern('og:title'),
      metaPatternReversed('og:title'),
      metaPattern('twitter:title'),
      /<title[^>]*>([\s\S]*?)<\/title>/i
    ]) || new URL(url).hostname;

  const description = firstMatch(html, [
    metaPattern('og:description'),
    metaPatternReversed('og:description'),
    metaPattern('twitter:description'),
    metaPattern('description')
  ]);

  const image = firstMatch(html, [
    metaPattern('og:image'),
    metaPatternReversed('og:image'),
    metaPattern('twitter:image')
  ]);

  // <link rel="icon"> 계열에서 파비콘을 찾는다
  const iconHref = firstMatch(html, [
    /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i
  ]);

  return {
    title,
    description,
    image: image ? new URL(image, response.url).href : null,
    favicon: iconHref ? new URL(iconHref, response.url).href : new URL('/favicon.ico', response.url).href,
    site: new URL(response.url).hostname.replace(/^www\./, '')
  };
}

/**
 * 링크 미리보기 카드 HTML 을 만든다.
 *
 * 썸네일에 <img> 대신 배경 이미지를 쓰는 이유는, Chirpy 가 본문의 <img> 를
 * 자동으로 <a> 로 감싸면서 카드 링크 안에 링크가 중첩되기 때문이다.
 * kramdown 이 중간에 문단을 끼워 넣지 않도록 한 줄로 만든다.
 */
export function renderLinkCard(url, preview) {
  const safe = (value) => escapeHtml(value ?? '');

  const head = [
    preview.favicon
      ? `<img class="notion-bookmark-favicon no-refactor" src="${safe(preview.favicon)}" alt="" loading="lazy" />`
      : '',
    `<span class="notion-bookmark-site">${safe(preview.site)}</span>`
  ].join('');

  const body = [
    `<span class="notion-bookmark-title">${safe(preview.title)}</span>`,
    preview.description
      ? `<span class="notion-bookmark-desc">${safe(preview.description)}</span>`
      : '',
    `<span class="notion-bookmark-meta">${head}</span>`
  ].join('');

  const thumb = preview.image
    ? `<span class="notion-bookmark-thumb"><img class="no-refactor" src="${safe(preview.image)}" alt="" loading="lazy" /></span>`
    : '';

  return (
    `<a class="notion-bookmark" href="${safe(url)}" target="_blank" rel="noopener noreferrer">` +
    `<span class="notion-bookmark-body">${body}</span>${thumb}</a>`
  );
}

const LIST_ITEM = /^([-*+]\s|\d+[.)]\s)/;

/**
 * Notion 에서 Tab 으로 들여쓴 블록을 처리한다.
 *
 * notion-to-md 는 중첩 블록을 4칸 들여쓰기로 표현하는데,
 * 목록이 아닌 경우 마크다운에서는 그게 코드블록 문법이라 내용이 깨진다.
 * 들여쓴 만큼 여백을 주는 div 로 감싸 원래 의도대로 보이게 한다.
 */
export function fixIndentedBlocks(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  let fence = null;
  let lastTopLevelWasList = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 코드블록 안은 손대지 않는다
    const fenceMark = trimmed.match(/^(```+|~~~+)/);
    if (fenceMark) {
      if (fence === null) fence = fenceMark[1][0];
      else if (trimmed.startsWith(fence.repeat(3))) fence = null;
      out.push(line);
      i++;
      continue;
    }
    if (fence !== null) {
      out.push(line);
      i++;
      continue;
    }

    const indent = line.length - line.trimStart().length;

    if (indent === 0) {
      if (trimmed !== '') lastTopLevelWasList = LIST_ITEM.test(trimmed);
      out.push(line);
      i++;
      continue;
    }

    // 목록의 하위 항목이면 4칸 들여쓰기가 정상 문법이다
    if (indent < 4 || lastTopLevelWasList) {
      out.push(line);
      i++;
      continue;
    }

    // 들여쓴 구간을 모아 한 단계 벗겨낸다
    const block = [];
    while (
      i < lines.length &&
      (lines[i].trim() === '' || lines[i].length - lines[i].trimStart().length >= 4)
    ) {
      block.push(lines[i].slice(4));
      i++;
    }
    while (block.length && block[block.length - 1].trim() === '') block.pop();

    // 더 깊은 들여쓰기는 재귀로 처리한다
    const inner = fixIndentedBlocks(block.join('\n')).trim();
    out.push('<div class="notion-indent" markdown="1">', '', inner, '', '</div>', '');
  }

  return out.join('\n');
}

const TAB_OPEN = /^<!--notion-tab:(.*)-->$/;
const TAB_CLOSE = /^<!--\/notion-tab-->$/;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 변환기가 남긴 탭 표시를 찾아 연속된 것끼리 하나의 탭 묶음으로 만든다.
 *
 * 라디오 버튼과 라벨을 앞에 모으고 패널을 뒤에 두면
 * CSS 만으로 탭 전환이 되어 자바스크립트가 필요 없다.
 */
export function groupTabs(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  let group = 0;
  let i = 0;

  while (i < lines.length) {
    if (!TAB_OPEN.test(lines[i])) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const tabs = [];
    while (i < lines.length) {
      // 탭 사이의 빈 줄은 건너뛰되, 뒤에 탭이 없으면 멈춘다
      let peek = i;
      while (peek < lines.length && lines[peek].trim() === '') peek++;
      if (peek >= lines.length || !TAB_OPEN.test(lines[peek])) break;

      const title = lines[peek].match(TAB_OPEN)[1];
      const body = [];
      i = peek + 1;
      while (i < lines.length && !TAB_CLOSE.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // 닫는 표시 건너뛰기
      tabs.push({ title, body: body.join('\n').trim() });
    }

    if (tabs.length === 0) continue;

    group++;
    const name = `notion-tabs-${group}`;
    const head = tabs.map(
      (tab, index) =>
        `<input type="radio" name="${name}" id="${name}-${index}"${index === 0 ? ' checked="checked"' : ''} />\n` +
        `<label for="${name}-${index}">${escapeHtml(tab.title)}</label>`
    );
    const panels = tabs.map(
      (tab) => `<div class="notion-tab-panel" markdown="1">\n\n${tab.body}\n\n</div>`
    );

    out.push(
      `<div class="notion-tabs" markdown="1">`,
      ...head,
      ...panels,
      `</div>`,
      ''
    );
  }

  return out.join('\n');
}

/**
 * 본문을 보고 mermaid / math 사용 여부를 판단한다.
 *
 * Chirpy 는 front matter 플래그가 켜져 있을 때만 해당 라이브러리를 불러오는데,
 * 두 라이브러리 모두 1MB 급이라 실제로 쓰지 않는 글에서 켜두면 낭비다.
 */
export function detectFeatures(markdown) {
  const hasMermaid = /^```\s*mermaid\b/m.test(markdown);

  const hasMath =
    /\$\$[\s\S]*?\$\$/.test(markdown) ||
    /(^|[^\\$])\$[^$\n]+\$/.test(markdown) ||
    /\\\(|\\\[/.test(markdown);

  return { mermaid: hasMermaid, math: hasMath };
}

/**
 * 후처리 전체를 순서대로 적용한다.
 */
export async function postProcess(markdown, { mediaDir, mediaSubpath }) {
  const media = await processMedia(markdown, { mediaDir, mediaSubpath });

  // 콜아웃은 notion-sync.js 의 커스텀 변환기가 이미 prompt 로 바꿔둔다
  const audio = await processEmbeddedMedia(fixToggles(media.markdown), { mediaDir });

  const { markdown: withoutThumb, thumbnail } = await extractThumbnail(audio.markdown, { mediaDir });
  const body = fixIndentedBlocks(groupTabs(withoutThumb));

  return {
    markdown: body,
    downloaded: media.downloaded + audio.downloaded,
    skipped: media.skipped + audio.skipped,
    features: detectFeatures(body),
    thumbnail
  };
}
