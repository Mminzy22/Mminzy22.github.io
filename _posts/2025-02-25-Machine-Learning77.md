---
title: "LangChain과 데이터베이스 및 벡터DB 연동 - part.6"
author: mminzy22
date: 2025-02-25 20:00:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, VectorDB, AI, TIL]
description: "LangChain을 활용하여 관계형 데이터베이스(SQL) 및 벡터 데이터베이스(VectorDB)와 연동하는 방법을 소개합니다."
pin: false
math: true
---


## 1. 데이터베이스와 벡터DB 개요

LangChain은 **관계형 데이터베이스(SQL)** 및 **벡터 데이터베이스(VectorDB)**와의 연동을 지원하여 LLM 기반 AI가 대량의 데이터를 검색하고 활용할 수 있도록 도와줍니다. 이를 통해 AI는 정형 데이터와 비정형 데이터를 모두 활용하여 보다 정교한 답변을 생성할 수 있습니다.

### 주요 개념

| 데이터베이스 유형 | 설명 |
|-------------------|------------------------------------------------|
| **SQL 데이터베이스** | 구조화된 데이터 저장 및 검색 (예: MySQL, PostgreSQL) |
| **벡터 데이터베이스(VectorDB)** | 비정형 데이터(텍스트, 이미지 등)를 유사도 기반으로 검색 (예: FAISS, ChromaDB, Pinecone) |


## 2. LangChain과 SQL 데이터베이스 연동하기

SQL 데이터베이스와 LangChain을 연동하면 **대량의 정형 데이터를 질의(Query)하고 활용할 수 있습니다.** 이를 통해 AI 모델이 데이터베이스 내 정보를 검색하고 분석할 수 있습니다.

### 2.1 데이터베이스 연결 설정

```python
from langchain.sql_database import SQLDatabase
from langchain_openai import OpenAI
from langchain.chains import SQLDatabaseChain

# 데이터베이스 연결 (예: SQLite, MySQL, PostgreSQL 등)
db = SQLDatabase.from_uri("sqlite:///example.db")

# LangChain LLM 모델 설정
llm = OpenAI(model_name="gpt-4o-mini")

# SQL 질의 체인 생성
chain = SQLDatabaseChain(llm=llm, database=db, verbose=True)

# 질의 실행
response = chain.invoke("사용자가 가장 많이 구매한 상품은?")
print(response)
```

### 2.2 MySQL/PostgreSQL 연결 예제

MySQL 및 PostgreSQL 같은 데이터베이스를 활용하려면 URI를 적절히 설정해야 합니다.

```python
# MySQL 연결
SQLDatabase.from_uri("mysql+pymysql://user:password@host/dbname")

# PostgreSQL 연결
SQLDatabase.from_uri("postgresql+psycopg2://user:password@host/dbname")
```


## 3. LangChain과 벡터 데이터베이스(VectorDB) 연동하기

벡터 데이터베이스(VectorDB)는 문서 검색, 유사성 기반 검색, RAG(Retrieval-Augmented Generation) 등에서 활용됩니다. 이를 통해 대량의 문서에서 관련 정보를 빠르게 찾을 수 있습니다.

### 3.1 FAISS를 활용한 문서 검색

FAISS(Facebook AI Similarity Search)를 사용하면 대량의 문서를 벡터화하여 유사도 검색을 수행할 수 있습니다.

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader

# 문서 로드 및 분할
loader = PyPDFLoader("example.pdf")
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(docs)

# FAISS 벡터스토어 생성
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
vectorstore = FAISS.from_documents(splits, embedding=embeddings)

# 벡터 검색
retriever = vectorstore.as_retriever()
query = "문서에서 LangChain 관련 내용을 찾아줘"
results = retriever.get_relevant_documents(query)
print(results)
```

### 3.2 ChromaDB 활용 예제

ChromaDB는 간편한 로컬 벡터 데이터베이스 솔루션입니다.

```python
from langchain_community.vectorstores import Chroma

vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
retriever = vectorstore.as_retriever()
```

### 3.3 Pinecone 활용 예제

Pinecone은 클라우드 기반의 벡터 데이터베이스로, 대량의 벡터 데이터를 효율적으로 검색할 수 있도록 지원합니다.

```python
from langchain_community.vectorstores import Pinecone
import pinecone

pinecone.init(api_key="your-api-key", environment="your-env")
vectorstore = Pinecone(index_name="your-index", embedding_function=embeddings)
retriever = vectorstore.as_retriever()
```


## 4. SQL과 벡터DB를 조합한 하이브리드 검색

LangChain을 활용하면 **정형 데이터(SQL)와 비정형 데이터(VectorDB)**를 결합하여 **하이브리드 검색**을 수행할 수 있습니다. 예를 들어, 문서에서 유사한 내용을 찾고 관련된 사용자 데이터를 데이터베이스에서 조회하는 방식입니다.

### 4.1 하이브리드 검색 구현 예제

```python
retrieved_docs = retriever.get_relevant_documents("LangChain 개념 설명")
sql_results = chain.invoke("LangChain 관련 정보를 제공하는 사용자 목록을 보여줘")

print("문서 검색 결과:", retrieved_docs)
print("SQL 데이터 검색 결과:", sql_results)
```

이 방식은 AI 기반 검색 엔진이나 챗봇의 **RAG(Retrieval-Augmented Generation) 시스템**에 활용할 수 있습니다.

### 4.2 RAG 시스템 예제

RAG(Retrieval-Augmented Generation)는 LLM이 사전에 학습되지 않은 정보를 검색하고 이를 기반으로 응답을 생성하는 기법입니다. 아래 코드는 SQL 데이터와 벡터 데이터를 조합하여 AI의 응답을 강화하는 예제입니다.

```python
query = "LangChain이 무엇인가요?"
doc_results = retriever.get_relevant_documents(query)
sql_results = chain.invoke("LangChain을 사용한 프로젝트 목록을 보여줘")

final_response = f"문서 검색 결과: {doc_results}\n\nSQL 검색 결과: {sql_results}"
print(final_response)
```

이렇게 하면 LLM이 **최신 정보**를 검색하여 더욱 신뢰성 있는 답변을 제공할 수 있습니다.


## 5. 결론

LangChain을 활용한 SQL 및 벡터 데이터베이스 연동은 AI 시스템의 검색 기능을 크게 향상시킵니다.

- **SQL 데이터베이스**: 정형 데이터(사용자 정보, 로그, 트랜잭션 데이터) 검색 및 분석.
- **벡터 데이터베이스**: 비정형 데이터(문서, 이미지, 텍스트) 유사성 검색.
- **하이브리드 검색**: SQL과 VectorDB를 결합하여 최적의 정보 검색 수행.
- **RAG 시스템**: 검색 기반 AI 응답 개선.

