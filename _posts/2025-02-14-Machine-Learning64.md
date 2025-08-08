---
title: "RAG 챗봇 디버깅 및 성능 최적화- Part.6"
author: mminzy22
date: 2025-02-14 19:30:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, AI, TIL]
description: "RAG 챗봇의 성능을 최적화하는 방법. 검색된 문서 품질 점검, 프롬프트 최적화, Top-K 검색 조정, Chunk 크기 튜닝, AI 챗봇 환각 방지 등의 고급 최적화 기법을 소개합니다."
pin: false
math: true
---


## RAG 챗봇의 성능을 높이기 위한 접근법

이전 글에서는 검색된 문서를 기반으로 **프롬프트를 구성하고 LLM이 응답을 생성하는 과정**을 다뤘습니다. 이번 글에서는 RAG 챗봇의 성능을 분석하고, 디버깅하며, 최적화하는 방법을 다뤄보겠습니다.


## 1. RAG 챗봇 디버깅: 주요 체크 포인트

RAG 시스템을 디버깅하려면, 검색된 문서와 최종 응답이 **정확한지**를 확인하는 것이 중요합니다. 다음과 같은 **디버깅 포인트**를 점검해야 합니다.

### 1) 검색된 문서(Context) 점검하기
LLM이 제대로 된 응답을 생성하려면 **리트리버가 올바른 문서를 검색했는지** 확인해야 합니다.

```python
query = "우리 회사의 점심 시간은 언제인가요?"
retrieved_docs = retriever.get_relevant_documents(query)

for doc in retrieved_docs:
    print(doc.page_content)
```

> **검색된 문서가 올바르지 않다면, Chunking 크기나 Embedding 모델을 변경해야 합니다.**

### 2) 최종 프롬프트 점검하기
LLM이 입력을 어떻게 받는지 확인하여, 원치 않는 응답을 방지할 수 있습니다.

```python
formatted_prompt = prompt.format(context="\n\n".join([doc.page_content for doc in retrieved_docs]), question=query)
print(formatted_prompt)
```

> **프롬프트 구조를 최적화하면 모델의 응답 품질을 향상시킬 수 있습니다.**

### 3) LLM 응답 품질 점검하기

```python
response = rag_chain.invoke(query)
print(response)
```

> **환각(Hallucination) 문제를 방지하려면, "모른다면 모른다고 답변하도록" 프롬프트를 설정하세요.**


## 2. 성능 최적화 기법

### 1) Chunk 크기 및 Overlap 조정하기

Chunk 크기가 너무 크거나 너무 작으면 검색 정확도가 낮아질 수 있습니다.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,   # 조정된 크기
    chunk_overlap=100  # 겹치는 부분
)
```

> **문서에 따라 최적의 청크 크기를 찾는 것이 중요합니다.**

### 2) Top-K 검색 결과 조정

리트리버에서 검색된 문서의 개수(`k` 값)를 조절하여 최적의 검색 성능을 유지할 수 있습니다.

```python
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})
```

> **`k` 값을 높이면 더 많은 문서를 검색하지만, 불필요한 데이터가 많아질 수 있습니다.**

### 3) Embedding 모델 변경하기

OpenAI의 `text-embedding-ada-002` 모델을 사용했다면, 더 높은 성능의 임베딩 모델을 활용해볼 수도 있습니다.

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
```

> **임베딩 모델을 변경하면 검색 성능이 향상될 수 있지만, 비용이 증가할 수도 있습니다.**

### 4) 프롬프트 최적화

LLM이 보다 신뢰할 수 있는 답변을 제공하도록 프롬프트를 조정하는 것이 중요합니다.

```python
prompt = ChatPromptTemplate.from_template("""
너는 기업 규정을 안내하는 AI 비서야. 아래의 context만을 기반으로 질문에 답해.
만약 답을 모르면 "잘 모르겠습니다."라고 답해.

{context}

질문:
{question}
""")
```

> **명확한 지시를 추가하여 환각을 방지할 수 있습니다.**

### 5) 검색된 문서 요약 적용

검색된 문서가 너무 많거나 길 경우, 요약하여 컨텍스트 크기를 줄일 수 있습니다.

```python
def summarize_docs(docs):
    return "\n".join(doc.page_content[:500] for doc in docs)

rag_chain = (
    {"context": retriever | summarize_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

> **검색된 문서가 길면 요약하여 LLM이 보다 효과적으로 활용할 수 있도록 합니다.**


## 정리

이번 글에서는 **RAG 챗봇의 디버깅 및 성능 최적화** 방법을 다뤘습니다.

**디버깅 체크리스트** – 검색된 문서, 프롬프트, 응답 품질 점검  
**Chunk 크기 최적화** – 검색 정확도 개선  
**Top-K 검색 결과 조정** – 적절한 문서 개수 선택  
**Embedding 모델 변경** – 검색 성능 향상  
**프롬프트 최적화** – 환각(Hallucination) 방지  
**검색된 문서 요약 적용** – 컨텍스트 크기 조절  
