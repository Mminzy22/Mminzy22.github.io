---
title: "LangChain과 LangGraph를 활용한 실전 프로젝트 구축 - part.9"
author: mminzy22
date: 2025-02-27 20:00:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangGraph, AI, TIL]
description: "LangChain과 LangGraph를 활용하여 AI 기반 실전 프로젝트를 구축하는 방법을 소개합니다."
pin: false
math: true
---


## 1. 프로젝트 개요

이번 글에서는 **LangChain과 LangGraph를 활용하여 AI 기반 문서 분석 및 Q&A 챗봇을 구축하는 방법**을 다룹니다. **문서에서 정보를 검색하고 질문에 대한 답변을 생성하는 RAG(Retrieval-Augmented Generation) 시스템**을 개발하는 것이 목표입니다.

### 프로젝트 목표
- LangGraph를 활용하여 **복잡한 워크플로우 설계 및 실행**
- 문서를 벡터화하여 **효율적인 정보 검색** 구현
- AI 챗봇을 통해 **자연스러운 문서 기반 Q&A 지원**
- **확장 가능한 아키텍처 구축**


## 2. 프로젝트 환경 설정

### 2.1 필수 라이브러리 설치
LangChain, LangGraph, FAISS, ChromaDB 등을 설치하여 프로젝트 환경을 구성합니다.

```bash
pip install langchain langgraph faiss-cpu chromadb
```

### 2.2 필요한 모듈 가져오기

```python
from langchain_openai import ChatOpenAI
from langchain.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langgraph.graph import Graph
```


## 3. 문서 로드 및 벡터 저장소 구축

### 3.1 PDF 문서 불러오기 및 텍스트 분할
문서를 분석하기 위해 PDF 파일을 로드하고, 텍스트를 분할합니다.

```python
loader = PyPDFLoader("sample.pdf")
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(docs)
```

- **`PyPDFLoader`**: PDF 문서를 로드하는 역할
- **`RecursiveCharacterTextSplitter`**: 문서를 여러 개의 작은 청크로 나눔
- **청크 크기 설정**: 1000자 단위로 나누되, 100자 중첩하여 문맥 유지


### 3.2 문서 임베딩 및 벡터 저장
문서를 임베딩(벡터 변환)하여 FAISS 벡터 저장소에 저장하고, 검색을 위한 `retriever`를 생성합니다.

```python
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
vectorstore = FAISS.from_documents(splits, embedding=embeddings)
retriever = vectorstore.as_retriever()
```

- **`OpenAIEmbeddings`**: OpenAI의 `text-embedding-ada-002` 모델을 사용하여 문서를 벡터로 변환
- **`FAISS`**: 빠른 벡터 검색을 위한 저장소
- **`as_retriever()`**: 저장소를 검색 엔진으로 활용


## 4. LangGraph 기반 챗봇 워크플로우 구축

LangGraph를 활용하여 질문을 받아 문서를 검색한 후, AI 모델을 통해 답변을 생성하는 챗봇을 설계합니다.

### 4.1 챗봇 워크플로우 설계

```python
def receive_question(state):
    return {"query": state["input"]}

def search_docs(state):
    docs = retriever.get_relevant_documents(state["query"])
    return {"context": "\n".join([doc.page_content for doc in docs])}

def generate_answer(state):
    llm = ChatOpenAI(model_name="gpt-4o-mini")
    response = llm.invoke(f"{state['context']}\n질문: {state['query']}\n답변:")
    return {"answer": response}

# LangGraph 워크플로우 생성
graph = Graph()
graph.add_node("receive_question", receive_question)
graph.add_node("search_docs", search_docs)
graph.add_node("generate_answer", generate_answer)

graph.add_edge("receive_question", "search_docs")
graph.add_edge("search_docs", "generate_answer")

graph.set_entry_point("receive_question")
```

- **노드 구성**:
  - `receive_question`: 사용자의 질문을 입력받음
  - `search_docs`: 벡터 저장소에서 관련 문서 검색
  - `generate_answer`: 검색된 문서를 기반으로 AI 답변 생성
- **LangGraph를 활용하여 노드 간 연결**


## 5. 실전 테스트 및 실행

챗봇을 실행하여 문서에서 정보를 검색하고 질문에 답변하도록 합니다.

```python
result = graph.invoke({"input": "이 문서의 주요 내용은 무엇인가요?"})
print(result["answer"])
```

이제 **챗봇이 문서에서 관련 정보를 검색하고 질문에 대한 답변을 자동으로 생성**합니다.


## 6. 프로젝트 확장 아이디어

### 6.1 Web UI 적용
- **Streamlit**을 활용하여 웹 인터페이스 추가
- 사용자가 직접 질문을 입력하고 답변을 확인할 수 있도록 구현

### 6.2 멀티 문서 지원
- 여러 개의 PDF 문서를 동시에 처리하도록 확장
- 문서별 검색 최적화 기능 추가

### 6.3 대화 이력 관리
- **Memory 시스템을 도입**하여 대화의 흐름을 유지
- LangChain의 `ConversationBufferMemory` 활용

### 6.4 API 제공
- **FastAPI를 사용하여 RESTful API 형태로 제공**
- 외부 시스템과의 연동 지원


## 7. 정리

### 핵심 개념 정리
- LangChain 기본 개념 및 활용법
- Multi-turn 대화와 Memory 시스템 적용
- Tools, Agents, Chains 활용법
- LangGraph를 통한 복잡한 AI 워크플로우 설계
- API 및 벡터 데이터베이스 연동
