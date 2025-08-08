---
title: "벡터 저장소 구축과 리트리버 활용- Part.4"
author: mminzy22
date: 2025-02-14 19:30:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, AI, TIL]
description: "RAG 시스템에서 가장 중요한 벡터 저장소(Vector Store)와 리트리버(Retriever) 활용법. FAISS 기반 벡터 저장소 구축, 검색 최적화, 그리고 유사도 기반 검색 기법을 배울 수 있습니다."
pin: false
math: true
---


## 벡터 저장소(Vector Store)란?

이전 글에서는 문서를 작은 단위(청크)로 나누고, 이를 벡터로 변환하는 과정을 살펴보았습니다. 하지만 변환된 벡터는 **효율적으로 저장하고 검색할 수 있도록 데이터베이스에 보관**해야 합니다.

이 역할을 하는 것이 바로 **벡터 저장소(Vector Store)**입니다. 벡터 저장소는 기존 관계형 데이터베이스(RDBMS)와 달리, **유사도 기반 검색**을 통해 가장 관련성이 높은 문서를 찾아줍니다.


## 1. 벡터 저장소(Vector Store)와 기존 데이터베이스 비교

| 특징 | 전통적인 RDBMS | 벡터 저장소 (Vector Store) |
|------|--------------|-------------------|
| 데이터 형태 | 정형 데이터(테이블) | 비정형 데이터(텍스트, 이미지 등) |
| 검색 방식 | 정확한 값 검색 (예: ID=123) | 유사도 기반 검색 (예: "이 문장과 가장 유사한 문서 찾기") |
| 사용 사례 | 금융, ERP, CRUD 기반 서비스 | RAG, 추천 시스템, 검색 엔진 |

> **벡터 저장소는 주어진 입력과 가장 유사한 벡터를 검색하는 데 최적화되어 있습니다.**


## 2. FAISS를 활용한 벡터 저장소 구축

이번 실습에서는 **FAISS(Facebook AI Similarity Search)**를 사용하여 벡터 저장소를 구축합니다.

### FAISS(Vector Store) 생성하기

```python
from langchain_community.vectorstores import FAISS

# FAISS 벡터 저장소 생성
vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
```

이제 `vectorstore` 객체를 활용하면 유사도 검색을 수행할 수 있습니다.

#### **🔹 저장된 벡터 데이터 확인**

```python
print(vectorstore)
```

> **FAISS는 대량의 벡터 데이터를 빠르게 검색할 수 있도록 최적화되어 있습니다.**


## 3. 리트리버(Retriever) 설정하기

### 리트리버란?
리트리버는 **사용자의 질문(Query)에 대해 가장 관련성 높은 문서를 검색하는 역할**을 합니다.

벡터 저장소가 만들어졌다면, 이를 활용하여 특정 질문과 가장 유사한 문서를 검색할 수 있어야 합니다. 이를 위해 **retriever** 객체를 설정합니다.

### FAISS 기반 리트리버 생성

```python
# 리트리버 생성
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 5})
```

여기서 `search_type="similarity"`는 벡터 간 유사도를 기반으로 검색하는 방식이며, `k=5`는 가장 유사한 **상위 5개 문서**를 반환하도록 설정한 것입니다.

#### **검색 테스트**

```python
query = "우리 회사의 점심 시간은 언제인가요?"
retrieved_docs = retriever.get_relevant_documents(query)

for doc in retrieved_docs:
    print(doc.page_content)
```

> **사용자의 질문을 벡터로 변환하고, 저장된 벡터 중 가장 유사한 문서를 검색하여 반환합니다.**


## 4. 리트리버를 활용한 검색 및 응답 흐름

이제 전체 검색 과정의 흐름을 정리해보겠습니다.

**1. 사용자가 질문을 입력** → `"우리 회사의 점심 시간은 언제인가요?"`  
**2. 질문을 벡터로 변환** (`text-embedding-ada-002` 활용)  
**3. 벡터 저장소에서 유사한 문서 검색** (`retriever.get_relevant_documents(query)`)  
**4. 검색된 문서를 바탕으로 최종 답변 생성**  


## 정리

이번 글에서는 **벡터 저장소와 리트리버의 개념 및 구현 방법**을 다루었습니다.

**FAISS(Vector Store) 생성** – 벡터 데이터를 효율적으로 저장하고 검색  
**리트리버(Retriever) 설정** – 사용자 질문에 대한 최적의 문서 검색  
**유사도 검색 테스트** – 실제 검색 결과 확인  

