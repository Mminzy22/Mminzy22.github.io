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

// Notion 콜아웃 이모지 → Chirpy prompt 종류
const PROMPT_BY_EMOJI = [
  ['💡', 'tip'],
  ['🌟', 'tip'],
  ['✅', 'tip'],
  ['ℹ️', 'info'],
  ['ℹ', 'info'],
  ['📌', 'info'],
  ['📘', 'info'],
  ['📝', 'info'],
  ['⚠️', 'warning'],
  ['⚠', 'warning'],
  ['🚧', 'warning'],
  ['❗', 'danger'],
  ['❌', 'danger'],
  ['🚨', 'danger'],
  ['⛔', 'danger']
];

/**
 * `> 💡 내용` 형태로 나오는 Notion 콜아웃을 Chirpy 의 prompt 로 바꾼다.
 * 아는 이모지로 시작하는 인용구만 변환하고, 나머지는 그대로 둔다.
 */
export function convertCallouts(markdown) {
  const lines = markdown.split('\n');
  const output = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^>\s*(\S+)\s*(.*)$/);
    const entry = match && PROMPT_BY_EMOJI.find(([emoji]) => match[1] === emoji);

    if (!entry) {
      output.push(line);
      continue;
    }

    // 인용구 블록의 끝까지 모은다
    const block = [`> ${match[2]}`.trimEnd()];
    let j = i + 1;
    while (j < lines.length && lines[j].startsWith('>')) {
      block.push(lines[j]);
      j++;
    }

    output.push(...block, `{: .prompt-${entry[1]} }`);
    i = j - 1;
  }

  return output.join('\n');
}

/**
 * 본문을 보고 mermaid / math 사용 여부를 판단한다.
 *
 * Chirpy 는 front matter 플래그가 켜져 있을 때만 해당 라이브러리를 불러오는데,
 * 두 라이브러리 모두 1MB 급이라 실제로 쓰지 않는 글에서 켜두면 낭비다.
 */
export function detectFeatures(markdown) {
  // 코드블록 안의 내용이 오탐을 만들지 않도록, 펜스 언어만 따로 본다
  const hasMermaid = /^```\s*mermaid\b/m.test(markdown);

  // 블록 수식($$), 인라인 수식($...$), LaTeX 구분자(\( \[)
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

  let result = fixToggles(media.markdown);
  result = convertCallouts(result);

  return { markdown: result, ...media, features: detectFeatures(result) };
}
