---
title: "RAG 프롬프트 구성 및 LLM 응답 생성- Part.5"
author: mminzy22
date: 2025-02-14 19:30:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, AI, TIL]
description: "검색된 문서를 기반으로 LLM이 최적의 답변을 생성하는 방법. 효과적인 프롬프트 템플릿 작성법, RAG 체인 구성, 환각 방지 기법을 적용하여 AI 챗봇의 응답 품질을 개선하는 방법을 배울 수 있습니다."
pin: false
math: true
---


## 검색된 문서를 기반으로 LLM 응답 생성하기

이전 글에서는 벡터 저장소(Vector Store)와 리트리버(Retriever)를 활용하여 **유사한 문서를 검색하는 과정**을 다뤘습니다. 이제 검색된 문서를 기반으로 **프롬프트를 구성하고, LLM을 활용하여 답변을 생성하는 과정**을 살펴보겠습니다.


## 1. 프롬프트 템플릿이란?

**프롬프트 템플릿(Prompt Template)**은 검색된 문서(Context)와 사용자의 질문(Query)을 결합하여 LLM에 입력할 최적의 문장을 만드는 과정입니다.

### 기본적인 프롬프트 템플릿 예제

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
오로지 아래의 context만을 기반으로 질문에 대답하세요:
{context}

질문:
{question}
""")
```

이 프롬프트는:
- **{context}**: 리트리버가 검색한 문서 내용을 삽입
- **{question}**: 사용자의 질문 삽입

이렇게 구성된 프롬프트를 LLM에 전달하면, 검색된 정보만을 기반으로 응답을 생성할 수 있습니다.


## 2. 프롬프트를 활용한 RAG 체인 구축

### RAG 체인 구성

이제 검색된 문서를 LLM에 전달하기 위해 **프롬프트 - 검색 - 답변 생성** 단계를 하나의 체인으로 조합합니다.

```python
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

# LLM 모델 불러오기
llm = ChatOpenAI(model="gpt-4o-mini")

# RAG 체인 구성
rag_chain = (
    {"context": retriever | (lambda docs: "\n\n".join(doc.page_content for doc in docs)), "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

> **`retriever`는 검색된 문서를 가져오고, 이를 문자열로 변환하여 프롬프트에 삽입합니다.**

#### **질문을 입력하고 응답 생성하기**

```python
response = rag_chain.invoke("우리 회사의 야근 식대는 얼마인가요?")
print(response)
```

이제 LLM이 **벡터 저장소에서 검색된 문서(Context)를 기반으로, 환각 없이 신뢰할 수 있는 응답을 생성**합니다.


## 3. 프롬프트 최적화 기법

프롬프트는 답변의 품질을 결정하는 핵심 요소입니다. 몇 가지 **프롬프트 최적화 기법**을 적용하여 응답 품질을 높일 수 있습니다.

### 1) 명확한 지시 추가하기

```python
prompt = ChatPromptTemplate.from_template("""
너는 기업 규정을 안내하는 AI 비서야. 아래의 context만을 기반으로 질문에 답해.

{context}

질문:
{question}
""")
```

> **명확한 역할과 제한을 추가하여 환각(Hallucination)을 줄일 수 있습니다.**

### 2) 만약 답변을 모르면 "모른다"고 말하게 하기

```python
prompt = ChatPromptTemplate.from_template("""
오로지 아래의 context만을 기반으로 질문에 답하세요. 만약 답변을 모르면 "잘 모르겠습니다."라고 답변하세요.

{context}

질문:
{question}
""")
```

> **LLM이 허위 정보를 생성하지 않도록 유도할 수 있습니다.**

### 3) 다중 문서 요약 적용
검색된 문서가 많을 경우, **다중 문서를 요약하여 프롬프트 크기를 줄일 수 있습니다.**

```python
def summarize_docs(docs):
    return "\n".join(doc.page_content[:500] for doc in docs)  # 각 문서에서 500자씩만 추출

rag_chain = (
    {"context": retriever | summarize_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

> **검색된 문서가 너무 길 경우, 일부만 사용하여 프롬프트 크기를 조절할 수 있습니다.**


## 정리

이번 글에서는 **검색된 문서를 기반으로 프롬프트를 구성하고 LLM이 응답을 생성하는 과정**을 다루었습니다.

**프롬프트 템플릿 구성** – 검색된 문서와 질문을 결합하여 최적의 입력 생성  
**RAG 체인 구축** – 검색 - 프롬프트 - 응답 생성 과정을 자동화  
**프롬프트 최적화 기법 적용** – 환각을 줄이고 응답 품질을 높이는 방법  
