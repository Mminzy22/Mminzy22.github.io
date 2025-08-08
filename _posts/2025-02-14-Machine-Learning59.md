---
title: "RAG (Retrieval-Augmented Generation) 개념 및 구축 과정 개요- Part.1"
author: mminzy22
date: 2025-02-14 19:30:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, AI, TIL]
description: "LLM의 한계를 극복하는 최신 AI 검색 기술, RAG의 개념과 구축 과정 5단계를 쉽게 설명합니다."
pin: false
math: true
---


## RAG란 무엇인가?

최근 자연어 처리(NLP)와 인공지능(AI) 분야에서 가장 주목받는 기술 중 하나가 **RAG(Retrieval-Augmented Generation)**입니다. 이는 **사전 학습된 대형 언어 모델(LLM)이 단독으로 생성하는 응답의 한계를 극복**하기 위해 고안된 기법입니다.

### 왜 RAG가 필요할까?

LLM은 방대한 데이터를 학습하여 다양한 질문에 답변할 수 있지만, 몇 가지 한계가 있습니다:
- **사전 학습된 데이터 이후의 최신 정보 부족**: LLM이 학습한 이후의 새로운 정보를 반영하기 어렵습니다.
- **환각(Hallucination) 문제**: 없는 정보를 생성하는 경우가 많아 신뢰성이 낮아질 수 있습니다.
- **도메인 특정 지식 부족**: 특정 산업이나 회사 내부 정보를 기반으로 정확한 답변을 생성하기 어렵습니다.

RAG는 이러한 문제를 해결하기 위해 **LLM과 정보 검색(Retrieval)을 결합한 방법론**입니다.


## RAG의 핵심 개념

RAG는 기본적으로 다음과 같은 **두 가지 주요 단계**로 이루어집니다:

### **Retrieval (검색 단계)**
사용자의 질문(Query)과 관련된 문서를 외부 데이터 저장소(Vector DB)에서 검색하는 과정입니다. 여기서는 문서를 미리 임베딩(Embedding)하여 벡터로 변환하고, 유사한 문서를 효율적으로 찾을 수 있도록 구성합니다.

### **Augmented Generation (생성 단계)**
검색된 문서(Context)를 활용하여 프롬프트를 구성하고, LLM을 이용해 최적의 응답을 생성하는 단계입니다. LLM은 검색된 정보(Context)를 기반으로 답변을 생성하므로, 더 신뢰할 수 있는 응답을 제공합니다.

이 두 가지 단계가 결합됨으로써, RAG는 **최신 정보 반영, 신뢰도 높은 답변 제공, 도메인 특화 정보 활용**이 가능합니다.


## RAG 구축 과정 (5단계)

RAG 시스템을 구축하기 위해서는 다음과 같은 주요 단계를 거칩니다:

### **1. 문서 로딩 (Document Loading)**
다양한 문서 형식을 불러올 수 있습니다.
- JSON, CSV, PDF, TXT, 이미지 등 다양한 데이터 소스를 활용 가능
- LangChain의 문서 로더(`PyPDFLoader`, `CSVLoader` 등)를 사용해 문서를 로드

### **2. 문서 청크 분할 (Chunking, Splitting)**
긴 문서를 적절한 크기로 나누어 관리합니다.
- LLM의 컨텍스트 윈도우 한계를 고려하여 작은 단위로 분할
- `RecursiveCharacterTextSplitter` 같은 도구를 활용하여 효과적으로 문서 분할

### **3. 임베딩 변환 (Embedding)**
텍스트 데이터를 벡터로 변환하여 검색에 최적화합니다.
- `OpenAIEmbeddings`, `HuggingFaceEmbeddings` 등 다양한 임베딩 모델 활용 가능
- 문서의 의미적 유사도를 계산하기 위해 필수적인 과정

### **4. 벡터 저장소 구축 (Vector Store)**
벡터화된 문서를 효율적으로 저장하고 검색할 수 있도록 데이터베이스를 구축합니다.
- `FAISS`, `ChromaDB`, `Pinecone` 등의 Vector DB 활용 가능

### **5. 리트리버 및 LLM 응답 생성 (Retriever & Augmented Generation)**
- 리트리버(Retriever)를 활용해 관련 문서를 검색
- 검색된 문서(Context)를 포함하여 프롬프트 구성 후 LLM을 이용해 응답 생성
- `ChatPromptTemplate`을 활용한 프롬프트 최적화


## RAG를 구축하면 어떤 장점이 있을까?

**최신 정보 반영 가능** – 정적인 모델과 달리 실시간 데이터를 활용 가능
**LLM 환각 문제 해결** – 근거 없는 답변을 줄이고 신뢰성 높은 정보 제공
**도메인 특화 정보 검색** – 기업 내부 데이터, 특정 산업 지식 등을 활용한 맞춤형 답변 가능
**성능 최적화** – 벡터 DB를 활용하여 검색 속도를 최적화하고, 비용을 절감

