#!/usr/bin/env node

/**
 * Notion 데이터베이스에서 상태가 "완료"인 페이지를 가져와서
 * Jekyll 포스트 형식으로 변환하여 _posts 폴더에 저장하는 스크립트
 */

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { writeFile, mkdir, stat, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const POSTS_DIR = join(__dirname, '..', '_posts');

// 환경 변수에서 Notion 설정 가져오기
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('❌ 환경 변수가 설정되지 않았습니다:');
  console.error('   NOTION_TOKEN: ', NOTION_TOKEN ? '✓' : '✗');
  console.error('   NOTION_DATABASE_ID: ', NOTION_DATABASE_ID ? '✓' : '✗');
  process.exit(1);
}

// Notion 클라이언트 초기화
const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

/**
 * 파일명에서 위험 문자를 제거하고 slug 생성
 */
function createSlug(title) {
  return title
    .trim()
    .replace(/[\/\\:*?"<>|]/g, '-') // 위험 문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
    .toLowerCase();
}

/**
 * 날짜를 KST(+0900) 기준으로 포맷팅
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  // KST는 UTC+9
  const kstOffset = 9 * 60; // 분 단위
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (kstOffset * 60000));
  
  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, '0');
  const day = String(kst.getDate()).padStart(2, '0');
  const hours = String(kst.getHours()).padStart(2, '0');
  const minutes = String(kst.getMinutes()).padStart(2, '0');
  const seconds = String(kst.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0900`;
}

/**
 * 날짜에서 YYYY-MM-DD 형식 추출
 */
function getDatePrefix(dateString) {
  const date = new Date(dateString);
  const kstOffset = 9 * 60;
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (kstOffset * 60000));
  
  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, '0');
  const day = String(kst.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Notion 속성에서 값 추출
 */
function getPropertyValue(page, propertyName, propertyType) {
  const prop = page.properties[propertyName];
  if (!prop) return null;

  switch (propertyType) {
    case 'title':
      return prop.title?.[0]?.plain_text || '';
    case 'rich_text':
      return prop.rich_text?.[0]?.plain_text || '';
    case 'date':
      return prop.date?.start || null;
    case 'created_time':
      // created_time은 ISO 8601 문자열 형식
      return prop.created_time ? new Date(prop.created_time).toISOString() : null;
    case 'multi_select':
      return prop.multi_select?.map(item => item.name) || [];
    case 'checkbox':
      return prop.checkbox || false;
    case 'select':
      return prop.select?.name || null;
    case 'status':
      return prop.status?.name || null;
    default:
      return null;
  }
}

/**
 * Front matter 생성
 */
function generateFrontMatter(page) {
  const title = getPropertyValue(page, '파일명', 'title') || 'Untitled';
  const author = getPropertyValue(page, '작성자', 'rich_text') || 'mminzy22';
  const dateStr = getPropertyValue(page, '생성 일시', 'created_time');
  const description = getPropertyValue(page, '설명', 'rich_text') || '';
  const categories = getPropertyValue(page, '카테고리', 'multi_select') || [];
  const tags = getPropertyValue(page, '태그', 'multi_select') || [];
  const pin = getPropertyValue(page, 'pin', 'checkbox') || false;
  const mermaid = getPropertyValue(page, 'mermaid', 'checkbox') || false;
  const math = getPropertyValue(page, 'math', 'checkbox') || false;
  
  // 이미지 관련 속성 (선택사항)
  const mediaSubpath = getPropertyValue(page, '미디어 경로', 'rich_text') || null;
  const imagePath = getPropertyValue(page, '이미지 경로', 'rich_text') || null;
  const imageAlt = getPropertyValue(page, '이미지 설명', 'rich_text') || null;

  const date = dateStr ? formatDate(dateStr) : new Date().toISOString();

  const frontMatter = {
    title: `"${title}"`,
    author,
    date,
    categories: categories.length > 0 ? categories : [],
    tags: tags.length > 0 ? tags : [],
    description: `"${description}"`,
    pin,
    mermaid,
    math
  };

  // YAML 형식으로 변환
  let yaml = '---\n';
  yaml += `title: ${frontMatter.title}\n`;
  yaml += `author: ${frontMatter.author}\n`;
  yaml += `date: ${frontMatter.date}\n`;
  yaml += `categories: ${JSON.stringify(frontMatter.categories)}\n`;
  yaml += `tags: ${JSON.stringify(frontMatter.tags)}\n`;
  yaml += `description: ${frontMatter.description}\n`;
  yaml += `pin: ${frontMatter.pin}\n`;
  yaml += `mermaid: ${frontMatter.mermaid}\n`;
  yaml += `math: ${frontMatter.math}\n`;
  
  // 미디어 경로가 있으면 추가 (null, 빈 문자열, 공백만 있는 경우 제외)
  if (mediaSubpath && mediaSubpath.trim()) {
    yaml += `media_subpath: ${mediaSubpath.trim()}\n`;
  }
  
  // 이미지 정보가 있으면 추가 (null, 빈 문자열, 공백만 있는 경우 제외)
  if (imagePath && imagePath.trim()) {
    yaml += `image:\n`;
    yaml += `  path: ${imagePath.trim()}\n`;
    if (imageAlt && imageAlt.trim()) {
      yaml += `  alt: "${imageAlt.trim()}"\n`;
    }
  }
  
  yaml += '---\n';

  return { frontMatter: yaml, title, dateStr };
}

/**
 * Git에서 파일의 마지막 커밋 시간 가져오기
 */
function getGitLastCommitTime(filepath) {
  try {
    // Git 저장소인지 확인
    const gitDir = join(__dirname, '..', '.git');
    if (!existsSync(gitDir)) {
      return null;
    }

    // 파일의 마지막 커밋 시간 가져오기 (Unix timestamp)
    const result = execSync(
      `git log -1 --format=%ct -- "${filepath}"`,
      { cwd: join(__dirname, '..'), encoding: 'utf-8' }
    ).trim();

    if (!result) {
      return null;
    }

    return parseInt(result) * 1000; // 밀리초로 변환
  } catch (error) {
    // 파일이 Git에 없거나 에러 발생 시 null 반환
    return null;
  }
}

/**
 * Notion 페이지를 Markdown으로 변환
 */
async function convertPageToMarkdown(pageId) {
  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdBlocks);
    return mdString.parent || '';
  } catch (error) {
    console.error(`❌ 페이지 변환 실패 (${pageId}):`, error.message);
    return '';
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 Notion 동기화 시작...\n');

  try {
    // _posts 디렉토리 확인 및 생성
    if (!existsSync(POSTS_DIR)) {
      await mkdir(POSTS_DIR, { recursive: true });
      console.log(`📁 ${POSTS_DIR} 디렉토리 생성됨`);
    }

    // Notion 데이터베이스에서 상태가 "완료"인 페이지 조회 (페이지네이션 처리)
    console.log('📡 Notion 데이터베이스 조회 중...');
    const pages = [];
    let cursor = undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: {
          property: '상태',
          status: {
            equals: '완료'
          }
        },
        sorts: [
          {
            property: '생성 일시',
            direction: 'descending'
          }
        ],
        start_cursor: cursor,
        page_size: 100
      });

      pages.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor;
    }

    console.log(`✓ ${pages.length}개의 완료된 페이지 발견\n`);

    // 상태가 "삭제"인 페이지 조회 (삭제 대상)
    console.log('🗑️  삭제 대상 페이지 조회 중...');
    const deletePages = [];
    cursor = undefined;
    hasMore = true;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: {
          property: '상태',
          status: {
            equals: '삭제'
          }
        },
        sorts: [
          {
            property: '생성 일시',
            direction: 'descending'
          }
        ],
        start_cursor: cursor,
        page_size: 100
      });

      deletePages.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor;
    }

    console.log(`✓ ${deletePages.length}개의 삭제 대상 페이지 발견\n`);

    if (pages.length === 0) {
      console.log('⚠️  동기화할 페이지가 없습니다.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let updateCount = 0;
    let skipCount = 0;
    const updatedFiles = [];

    // 각 페이지를 처리
    for (const page of pages) {
      try {
        const { frontMatter, title, dateStr } = generateFrontMatter(page);
        
        if (!title || title === 'Untitled') {
          console.warn(`⚠️  제목이 없는 페이지 건너뜀: ${page.id}`);
          continue;
        }

        if (!dateStr) {
          console.warn(`⚠️  생성 일시가 없는 페이지 건너뜀: ${title}`);
          continue;
        }

        // 파일명 생성
        const slug = createSlug(title);
        const datePrefix = getDatePrefix(dateStr);
        const filename = `${datePrefix}-${slug}.md`;
        const filepath = join(POSTS_DIR, filename);

        // 파일이 존재하는지 확인하고 last_edited_time 비교
        const fileExists = existsSync(filepath);
        let shouldUpdate = true;

        if (fileExists) {
          try {
            // Git의 마지막 커밋 시간 사용 (GitHub에 올라간 실제 수정 시간)
            const gitCommitTime = getGitLastCommitTime(filepath);
            // Notion API가 자동으로 제공하는 페이지 마지막 수정 시간
            const notionLastEdited = new Date(page.last_edited_time).getTime();
            
            // Git에 커밋 기록이 없으면 업데이트 진행
            if (gitCommitTime === null) {
              if (process.env.DEBUG) {
                console.log(`  📅 ${filename}: Git 커밋 기록 없음, 업데이트 진행`);
              }
            } else {
              // 디버깅: 시간 비교 정보 출력 (환경 변수로 제어 가능)
              if (process.env.DEBUG) {
                console.log(`  📅 ${filename}:`);
                console.log(`     Notion 수정: ${new Date(notionLastEdited).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
                console.log(`     Git 커밋: ${new Date(gitCommitTime).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
              }
              
              // Notion에서 수정된 시간이 Git 커밋 시간보다 이전이거나 같으면 스킵
              if (notionLastEdited <= gitCommitTime) {
                shouldUpdate = false;
                skipCount++;
                if (process.env.DEBUG) {
                  console.log(`     → 변경 없음, 스킵`);
                }
              } else {
                if (process.env.DEBUG) {
                  console.log(`     → 변경 감지, 업데이트 필요`);
                }
              }
            }
          } catch (error) {
            // 에러 발생 시 업데이트 진행
            console.warn(`⚠️  파일 정보 확인 실패 (${filename}), 업데이트 진행:`, error.message);
          }
        }

        if (!shouldUpdate) {
          continue;
        }

        // 본문 변환
        const content = await convertPageToMarkdown(page.id);
        
        // 파일 작성
        const fullContent = frontMatter + '\n' + content;
        await writeFile(filepath, fullContent, 'utf-8');

        const action = fileExists ? '업데이트' : '생성';
        console.log(`✓ ${filename} (${action})`);
        updatedFiles.push(filename);
        successCount++;
        if (fileExists) updateCount++;
      } catch (error) {
        console.error(`❌ 페이지 처리 실패 (${page.id}):`, error.message);
        errorCount++;
      }
    }

    // 상태가 "삭제"인 페이지의 파일 삭제
    let deletedCount = 0;
    const deletedFiles = [];
    
    if (deletePages.length > 0) {
      console.log('\n🗑️  삭제 대상 파일 처리 중...');
      
      for (const page of deletePages) {
        try {
          const { title, dateStr } = generateFrontMatter(page);
          
          if (!title || title === 'Untitled') {
            console.warn(`⚠️  제목이 없는 삭제 대상 페이지 건너뜀: ${page.id}`);
            continue;
          }

          if (!dateStr) {
            console.warn(`⚠️  생성 일시가 없는 삭제 대상 페이지 건너뜀: ${title}`);
            continue;
          }

          // 파일명 생성
          const slug = createSlug(title);
          const datePrefix = getDatePrefix(dateStr);
          const filename = `${datePrefix}-${slug}.md`;
          const filepath = join(POSTS_DIR, filename);

          // 파일이 존재하면 삭제
          if (existsSync(filepath)) {
            await unlink(filepath);
            console.log(`🗑️  ${filename} (삭제)`);
            deletedFiles.push(filename);
            deletedCount++;
          } else {
            console.log(`⚠️  ${filename} (파일 없음, 스킵)`);
          }
        } catch (error) {
          console.error(`❌ 삭제 대상 페이지 처리 실패 (${page.id}):`, error.message);
        }
      }
    }

    console.log(`\n✅ 동기화 완료:`);
    console.log(`   - 생성/업데이트: ${successCount}개 (신규: ${successCount - updateCount}개, 업데이트: ${updateCount}개)`);
    console.log(`   - 변경 없음: ${skipCount}개`);
    console.log(`   - 삭제: ${deletedCount}개`);
    console.log(`   - 실패: ${errorCount}개`);
    
    // 업데이트/삭제된 파일 목록을 환경 변수로 내보내기 (GitHub Actions에서 사용)
    const allChangedFiles = [...updatedFiles, ...deletedFiles];
    if (allChangedFiles.length > 0) {
      process.env.UPDATED_FILES = JSON.stringify(allChangedFiles);
      if (updatedFiles.length > 0) {
        console.log(`\n📝 업데이트된 파일: ${updatedFiles.join(', ')}`);
      }
      if (deletedFiles.length > 0) {
        console.log(`🗑️  삭제된 파일: ${deletedFiles.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('❌ 동기화 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 치명적 오류:', error);
  process.exit(1);
});

