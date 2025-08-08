---
title: "문서 처리: Chunking과 Embedding- Part.3"
author: mminzy22
date: 2025-02-14 19:30:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, AI, TIL]
description: "RAG 성능을 높이려면 문서 청크(Chunking)와 임베딩(Embedding)을 최적화해야 합니다. 문서를 작은 단위로 나누고 벡터화하여 검색 성능을 개선하는 방법을 실습 코드와 함께 제공합니다."
pin: false
math: true
---


## 문서를 효과적으로 다루기 위한 단계

이전 글에서는 RAG 구축을 위한 환경 설정과 기본적인 코드 작성을 진행했습니다. 이번 글에서는 문서를 더욱 효율적으로 다루기 위해 **Chunking(문서 분할)과 Embedding(벡터 변환) 과정**을 살펴보겠습니다.

RAG에서 **문서 처리**는 검색 정확도를 높이는 데 중요한 역할을 합니다. 문서를 어떻게 나누고, 어떻게 벡터화하는지가 검색 및 응답 품질을 결정하기 때문입니다.


## 1. 문서 Chunking (문서 분할)

### 왜 문서를 청크로 나눠야 할까?

LLM이 한 번에 처리할 수 있는 **컨텍스트 윈도우(Context Window)**에는 제한이 있습니다. 너무 긴 문서를 한꺼번에 전달하면 모델이 정보를 적절히 활용하지 못할 수 있습니다. 또한 검색 성능을 높이기 위해 **문서를 작고 의미 있는 단위로 나누는 과정이 필요합니다.**

### 문서 분할하는 방법
LangChain에서는 `RecursiveCharacterTextSplitter`를 활용해 문서를 효과적으로 나눌 수 있습니다.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Chunking 설정
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # 각 청크의 최대 크기 (문자 수)
    chunk_overlap=200  # 청크 간의 중첩 부분 (정보 손실 방지)
)

# 문서를 불러온 후 청크로 나누기
splits = text_splitter.split_documents(docs)
```

#### **🔹 청크 데이터 확인**

```python
print(f"총 {len(splits)}개의 청크로 분할되었습니다.")
print(splits[0])  # 첫 번째 청크 확인
```

> **`chunk_overlap`을 적절히 설정하면 문서의 문맥을 유지하는 데 도움을 줄 수 있습니다.**


## 2. 문서 Embedding (벡터 변환)

### 왜 문서를 벡터로 변환해야 할까?

컴퓨터는 텍스트 데이터를 직접 이해할 수 없기 때문에, **문장을 수치화(벡터화)하여 저장**해야 합니다. 이 과정에서 **Embedding 모델**을 활용하여 텍스트를 의미적으로 비교할 수 있도록 변환합니다.

### OpenAI Embedding 모델 적용하기

LangChain에서는 OpenAI의 `text-embedding-ada-002` 모델을 활용할 수 있습니다.

```python
from langchain_openai import OpenAIEmbeddings

# 임베딩 모델 초기화
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
```

이제 문서 청크들을 벡터로 변환하여 저장해봅니다.

```python
embedded_chunks = embeddings.embed_documents([chunk.page_content for chunk in splits])
```

#### **변환된 벡터 데이터 확인**

```python
print(embedded_chunks[0])  # 첫 번째 청크의 벡터값 확인
```

> **임베딩된 벡터는 검색 과정에서 유사도 기반 검색(Similarity Search)에 활용됩니다.**


## 3. 임베딩된 데이터 벡터 저장소(Vector Store)에 저장

### FAISS(Vector DB)에 저장하기

이제 생성한 벡터 데이터를 저장하여 검색할 수 있도록 설정해야 합니다. 이를 위해 **FAISS(Facebook AI Similarity Search)**를 사용합니다.

```python
from langchain_community.vectorstores import FAISS

# 벡터 저장소 생성
vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
```

> **FAISS는 대량의 벡터 데이터를 빠르게 검색할 수 있도록 도와줍니다.**


## 정리

이번 글에서는 **문서 처리(Chunking & Embedding)의 중요성**과 그 구현 방법을 다루었습니다.

**문서 Chunking** – LLM의 컨텍스트 윈도우 한계를 극복하기 위해 문서를 작은 단위로 나눔  
**문서 Embedding** – 문서를 벡터화하여 검색 성능을 향상  
**FAISS(Vector DB) 저장** – 벡터 데이터를 저장하여 검색할 수 있도록 구성  
