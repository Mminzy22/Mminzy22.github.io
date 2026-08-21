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

/**
 * 후처리 전체를 순서대로 적용한다.
 */
export async function postProcess(markdown, { mediaDir, mediaSubpath }) {
  const media = await processMedia(markdown, { mediaDir, mediaSubpath });

  // 콜아웃은 notion-sync.js 의 커스텀 변환기가 이미 prompt 로 바꿔둔다
  const result = fixToggles(media.markdown);

  const { markdown: body, thumbnail } = await extractThumbnail(result, { mediaDir });

  // media 를 먼저 펼친다. 순서를 바꾸면 media.markdown 이 후처리 결과를 덮어쓴다.
  return { ...media, markdown: body, features: detectFeatures(body), thumbnail };
}
