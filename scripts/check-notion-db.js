#!/usr/bin/env node

/**
 * Notion 데이터베이스의 속성 정보를 확인하는 스크립트
 */

import { Client } from '@notionhq/client';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error('❌ 환경 변수가 설정되지 않았습니다');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function main() {
  try {
    console.log('📡 Notion 데이터베이스 정보 조회 중...\n');
    
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID
    });

    console.log('📋 데이터베이스 속성 목록:\n');
    
    for (const [propName, prop] of Object.entries(database.properties)) {
      console.log(`  ${propName}:`);
      console.log(`    타입: ${prop.type}`);
      
      if (prop.type === 'select' && prop.select) {
        console.log(`    옵션: ${prop.select.options?.map(o => o.name).join(', ') || '없음'}`);
      } else if (prop.type === 'multi_select' && prop.multi_select) {
        console.log(`    옵션: ${prop.multi_select.options?.map(o => o.name).join(', ') || '없음'}`);
      } else if (prop.type === 'status' && prop.status) {
        console.log(`    옵션: ${prop.status.options?.map(o => o.name).join(', ') || '없음'}`);
      }
      
      console.log('');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.body) {
      console.error('   상세:', JSON.parse(error.body));
    }
    process.exit(1);
  }
}

main();

