---
title: "LangChain 개요 및 환경 설정 - part.1"
author: mminzy22
date: 2025-02-21 20:00:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, LLM, AI, TIL]
description: "LangChain의 개념과 주요 기능, 환경 설정 방법을 소개합니다."
pin: false
math: true
---


## 1. LangChain이란?

LangChain은 대형 언어 모델(LLM)을 활용하여 AI 애플리케이션을 쉽게 개발할 수 있도록 도와주는 프레임워크입니다. 특히, 프롬프트 최적화, 대화 이력 관리, 외부 도구와의 연동, 벡터 데이터베이스와의 통합 등 다양한 기능을 제공합니다.

### 주요 기능
- **LLM 인터페이스 제공**: OpenAI, Hugging Face 등의 LLM과 쉽게 연결 가능
- **프롬프트 템플릿 관리**: 재사용 가능한 프롬프트 구조화
- **체인(Chains) 기능**: 여러 단계의 작업을 연결하여 복잡한 AI 워크플로우 구성 가능
- **에이전트(Agents) 지원**: 사용자의 요청에 따라 적절한 액션 수행
- **메모리 관리**: 대화 이력을 저장하고 활용할 수 있는 다양한 메모리 시스템 제공


## 2. LangChain 설치 및 환경 설정

LangChain을 사용하려면 Python 환경을 설정하고 필수 패키지를 설치해야 합니다.

### 2.1 Python 환경 준비
LangChain은 Python 3.8 이상에서 원활하게 작동합니다. 가상 환경을 생성한 후 진행하는 것을 추천합니다.

```bash
python -m venv langchain-env
source langchain-env/bin/activate  # (Windows: langchain-env\Scripts\activate)
```

### 2.2 필수 패키지 설치
LangChain의 기본 기능을 활용하기 위해 다음과 같은 패키지를 설치합니다.

```bash
pip install langchain langchain-openai
pip install tiktoken faiss-cpu pypdf
```

- **`langchain`**: LangChain의 핵심 라이브러리
- **`langchain-openai`**: OpenAI API 연동을 위한 패키지
- **`tiktoken`**: OpenAI 모델의 토큰화 지원
- **`faiss-cpu`**: 벡터 검색 기능 제공 (RAG 구현 시 유용)
- **`pypdf`**: PDF 문서 분석 시 사용


## 3. OpenAI API 키 설정

LangChain에서 OpenAI의 GPT 모델을 사용하려면 API 키를 설정해야 합니다.

```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass("Enter OpenAI API Key: ")
```

**보안 주의사항**: API 키는 코드에 직접 입력하지 말고, `.env` 파일을 활용하는 것이 좋습니다.

```bash
pip install python-dotenv
```

`.env` 파일 생성 후 다음과 같이 API 키 저장:

```
OPENAI_API_KEY=your_api_key_here
```

Python 코드에서 `.env` 파일을 불러오기:

```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
```


## 4. LangChain 기본 테스트 실행

설치가 완료되었는지 확인하기 위해 간단한 LangChain 코드 실행:

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-4o-mini")
response = chat.invoke("LangChain이 무엇인가요?")
print(response)
```

이 코드를 실행하면 LangChain이 OpenAI 모델을 활용하여 답변을 생성하는 것을 확인할 수 있습니다.


## 5. 프로젝트 폴더 구조 설정

LangChain 프로젝트를 체계적으로 관리하기 위해 다음과 같은 폴더 구조를 추천합니다.

```
/my-langchain-project
├── main.py  # 메인 실행 파일
├── requirements.txt  # 필수 패키지 목록
├── .env  # 환경 변수 파일 (API 키 저장)
├── data/  # 문서 저장 폴더
├── models/  # 사전 학습된 모델 저장 폴더
└── utils/  # 유틸리티 함수 모음
```

이렇게 폴더를 정리하면 프로젝트의 확장성과 유지보수성이 향상됩니다.

