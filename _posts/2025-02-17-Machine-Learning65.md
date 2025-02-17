---
title: "LangChain 시작하기: 필수 라이브러리 설치 및 환경 설정"
author: mminzy22
date: 2025-02-17 19:30:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, LangChain, AI, TIL]
description: "LangChain을 사용하기 위한 필수 라이브러리를 설치하고, 환경을 설정하는 방법을 단계별로 설명"
pin: false
math: true
---


## 1. LangChain이란?

LangChain은 대형 언어 모델(LLM)과 연동하여 강력한 AI 애플리케이션을 쉽게 구축할 수 있도록 돕는 프레임워크입니다. 특히 LangChain을 활용하면 자연어 처리, 문서 요약, 질의응답 시스템, 챗봇 등을 손쉽게 구현할 수 있습니다.


## 2. 필수 라이브러리 설치

LangChain을 사용하려면 몇 가지 필수 패키지를 설치해야 합니다. 아래 명령어를 실행하여 필요한 패키지를 설치합니다.

```bash
!pip install langchain-openai
!pip install tiktoken
!pip install langchain-community langchain-core
!pip install pypdf
!pip install faiss-cpu
```

### 각 라이브러리의 역할
- **langchain-openai**: OpenAI의 GPT 모델과 LangChain을 연동할 수 있도록 도와주는 패키지
- **tiktoken**: OpenAI의 토크나이저로, LLM의 입력을 효과적으로 처리하는 데 필요
- **langchain-community / langchain-core**: LangChain의 주요 기능을 제공하는 핵심 라이브러리
- **pypdf**: PDF 문서를 불러와 분석할 때 사용
- **faiss-cpu**: 벡터 검색을 최적화하여 RAG(Retrieval-Augmented Generation) 기능을 구현할 때 필수


## 3. API 키 설정하기

LangChain에서 OpenAI 모델을 사용하려면 API 키를 설정해야 합니다. 아래 코드를 실행하여 OpenAI API 키를 환경 변수에 저장합니다.

```python
import os
import getpass

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

### 코드 설명
1. `os.environ`을 사용하여 환경 변수에 API 키를 저장합니다.
2. `getpass.getpass()`를 활용하면 API 키를 입력할 때 화면에 노출되지 않습니다.

**주의:** API 키를 코드에 직접 입력하지 마세요! 보안상 위험할 수 있습니다.


## 4. LangChain 간단한 테스트 실행

라이브러리가 정상적으로 설치되었는지 확인하기 위해 간단한 LangChain 코드를 실행해 봅시다.

```python
from langchain_openai import ChatOpenAI

# GPT-4o-mini 모델을 사용하여 LangChain 객체 생성
chat = ChatOpenAI(model_name="gpt-4o-mini")

# 간단한 질문 실행
response = chat.invoke("LangChain이란 무엇인가요?")
print(response)
```

이 코드를 실행하면 LangChain을 통해 GPT-4o-mini 모델이 응답을 생성하고 출력하는 것을 확인할 수 있습니다.


## 5. 프로젝트 폴더 구조 정리

LangChain 프로젝트를 체계적으로 관리하기 위해 다음과 같은 폴더 구조를 추천합니다.

```
/my-langchain-project
├── main.py  # 메인 실행 파일
├── requirements.txt  # 설치해야 할 패키지 목록
├── .env  # 환경 변수 파일 (API 키 저장)
├── data/  # 문서 저장 폴더 (PDF, 텍스트 파일 등)
├── models/  # 사전 학습된 모델 저장 폴더
└── utils/  # 유틸리티 함수 모음
```

### `.env` 파일 활용하기
환경 변수를 코드에 직접 입력하는 것은 보안상 위험합니다. 대신 `.env` 파일을 만들어 API 키를 저장하고, `dotenv` 라이브러리를 활용하면 안전하게 관리할 수 있습니다.

1. `.env` 파일 생성 후 아래 내용 입력:

```
OPENAI_API_KEY=your-api-key-here
```

2. Python 코드에서 `.env` 파일 불러오기:

```python
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
```

이제 코드에서 `os.getenv("OPENAI_API_KEY")`를 사용하여 API 키를 불러올 수 있습니다.


## 6. 마무리 및 다음 단계

이번 글에서는 LangChain을 시작하기 위한 필수 라이브러리 설치 및 환경 설정 방법을 알아보았습니다. 다음 글에서는 **Streaming 기능을 활용한 실시간 응답 구현**에 대해 다룰 예정입니다.

**다음 글 예고: LangChain Streaming 기능으로 실시간 챗봇 만들기**

