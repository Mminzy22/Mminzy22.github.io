---
title: "RAG 환경 설정 및 기본 코드 작성- Part.2"
author: mminzy22
date: 2025-02-14 19:30:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, AI, TIL]
description: "필요한 라이브러리 설치부터 OpenAI API 설정, 문서 로딩, 벡터 변환까지 따라하기 쉬운 단계별 튜토리얼을 제공합니다."
pin: false
math: true
---


## RAG 구축을 위한 환경 설정

이전 글에서 RAG의 개념과 구축 단계를 이해했다면, 이제 **실제로 환경을 설정하고 기본 코드를 작성하는 과정**을 살펴보겠습니다. 이번 글에서는 Python 환경을 설정하고, 필요한 라이브러리를 설치한 후, RAG 구축을 위한 기본적인 코드 작성을 진행합니다.


## 1. 필수 라이브러리 설치

LangChain을 활용한 RAG 구현을 위해 다음과 같은 라이브러리를 설치해야 합니다.

```bash
!pip install langchain_openai
!pip install langchain-community
!pip install pypdf
!pip install faiss-cpu
```

각 라이브러리의 역할은 다음과 같습니다:
- **langchain_openai**: OpenAI의 LLM 및 Embedding 모델을 사용할 수 있도록 지원
- **langchain-community**: LangChain의 다양한 기능을 포함한 확장 라이브러리
- **pypdf**: PDF 문서를 로드하는 데 사용
- **faiss-cpu**: 벡터 저장소(Vector DB) 구축을 위한 라이브러리

> **참고:** `faiss-cpu`는 CPU 환경에서 FAISS(Vector DB)를 사용할 수 있도록 해주는 패키지입니다. GPU를 사용한다면 `faiss-gpu`를 설치할 수도 있습니다.


## 2. OpenAI API 키 설정

LangChain에서 OpenAI API를 사용하려면 API 키를 설정해야 합니다.

```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass("OpenAI API key 입력: ")
```

> **보안 팁:** API 키는 절대 코드에 직접 하드코딩하지 마세요! `.env` 파일을 사용하거나 환경 변수를 활용하세요.


## 3. LangChain을 활용한 기본 코드 작성

이제 LangChain을 활용하여 간단한 RAG 시스템의 기초를 구축하는 코드를 작성해 보겠습니다.

### **LLM 모델 불러오기**

먼저 OpenAI의 LLM 모델을 불러옵니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
```

> `gpt-4o-mini` 모델을 사용하여 기본적인 LLM 환경을 구성합니다.


### **문서 로딩 (PDF 파일 불러오기)**

RAG는 외부 문서를 활용하는 것이 핵심이므로, PDF 문서를 로딩하는 과정을 살펴봅니다.

```python
from langchain.document_loaders import PyPDFLoader

# PDF 문서 불러오기
loader = PyPDFLoader("/content/sample.pdf")
docs = loader.load()
```

> **`docs` 객체에는 문서의 내용(`page_content`)과 메타데이터(`metadata`)가 포함됩니다.**

#### **🔹 문서 내용 출력해보기**

```python
print(docs[0].page_content)  # 첫 번째 페이지의 내용 출력
print(docs[0].metadata)  # 문서의 메타데이터 출력
```


### **문서 Chunking (문서 분할)**

LLM의 컨텍스트 윈도우 제한을 극복하기 위해 긴 문서를 적절한 크기로 나누는 과정입니다.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
```

> **`chunk_size`는 한 번에 처리할 텍스트 크기를 의미하며, `chunk_overlap`은 각 청크가 겹치는 부분을 조정합니다.**

#### **🔹 분할된 문서 확인**
```python
print(len(splits))  # 몇 개의 청크로 나뉘었는지 확인
print(splits[0])  # 첫 번째 청크 출력
```


### **임베딩 적용 (Embedding 생성)**

분할된 문서를 벡터화하여 검색이 가능하도록 변환합니다.

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
```

> **`text-embedding-ada-002` 모델은 OpenAI에서 제공하는 텍스트 임베딩 모델로, 빠르고 정확한 검색을 위해 사용됩니다.**


### **벡터 저장소 (Vector Store) 구축**

임베딩된 데이터를 벡터 DB에 저장하여 검색 기능을 구현합니다.

```python
from langchain_community.vectorstores import FAISS

vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
```

> **FAISS(Facebook AI Similarity Search)는 대량의 벡터 데이터를 효율적으로 검색할 수 있는 라이브러리입니다.**


## 정리

이번 글에서는 RAG 구축을 위한 **환경 설정 및 기본 코드 작성**을 진행했습니다.

**필수 라이브러리 설치** (`langchain_openai`, `faiss-cpu` 등)  
**OpenAI API 키 설정**  
**LangChain을 활용한 기본 코드 작성** (LLM 불러오기, 문서 로딩, 문서 분할, 임베딩 적용, 벡터 저장소 구축)  


