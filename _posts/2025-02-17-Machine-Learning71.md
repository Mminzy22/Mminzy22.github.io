---
title: "LangSmith Hub를 활용한 고급 프롬프트 최적화"
author: mminzy22
date: 2025-02-17 20:00:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, LangChain, AI, TIL]
description: "LangSmith Hub를 활용하여 고급 프롬프트를 최적화하고, RAG 챗봇 등 다양한 AI 모델에 적용하는 방법을 소개합니다."
pin: false
math: true
---


## **1. LangSmith Hub란?**

**LangSmith Hub**는 LangChain에서 제공하는 **프롬프트 저장소(Prompt Repository)** 로, 개발자가 다양한 프롬프트를 공유하고 재사용할 수 있도록 지원하는 플랫폼입니다. 이를 활용하면 **검증된 고급 프롬프트를 가져와 즉시 사용할 수 있으며, 직접 프롬프트를 최적화할 필요 없이 효율적인 응답을 생성할 수 있습니다.**

### **LangSmith Hub의 주요 기능**
- 다양한 **고급 프롬프트 템플릿 제공**
- 실무에서 검증된 **최적화된 프롬프트 활용 가능**
- 프롬프트 저장 및 버전 관리 지원
- 커뮤니티에서 공유한 프롬프트 검색 및 적용 가능

LangSmith Hub를 활용하면 **최적의 성능을 가진 프롬프트를 손쉽게 적용**할 수 있으며, **개별 프로젝트의 성능 최적화에도 큰 도움**이 됩니다.


## **2. LangSmith Hub에서 프롬프트 가져오기**

LangChain에서는 `hub.pull()` 메서드를 사용하여 LangSmith Hub에서 특정 프롬프트를 쉽게 가져올 수 있습니다.

### **기본적인 프롬프트 가져오기 예제**

```python
!pip install langsmith

from langchain import hub
from langchain_openai import ChatOpenAI

# LangSmith Hub에서 특정 프롬프트 불러오기
prompt = hub.pull("efriis/my-first-prompt")

# LLM 모델 초기화
model = ChatOpenAI(model_name="gpt-4o-mini")

# 프롬프트 실행
runnable = prompt | model
response = runnable.invoke({"profession": "biologist", "question": "What is special about parrots?"})

print(response)
```

**설명:**
- `hub.pull("efriis/my-first-prompt")`를 사용하여 특정 프롬프트를 LangSmith Hub에서 가져옴
- 가져온 프롬프트를 `ChatOpenAI` 모델과 연결하여 실행
- **기존에 검증된 프롬프트를 재사용함으로써 성능 최적화 가능**


## **3. LangSmith Hub를 활용한 고급 RAG 프롬프트 최적화**

RAG(Retrieval-Augmented Generation) 기반의 챗봇을 개발할 때, LangSmith Hub에서 제공하는 **최적화된 프롬프트**를 활용하면 보다 정교한 답변을 생성할 수 있습니다.

### **LangSmith Hub에서 RAG 프롬프트 가져와 적용하기**

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader
from langchain import hub

# 1. LLM 모델 불러오기
llm = ChatOpenAI(model_name="gpt-4o-mini")

# 2. 문서 불러오기
loader = PyPDFLoader("/content/sample.pdf")
docs = loader.load()

# 3. 문서 chunking 하기
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)

# 4. 자른 chunk들을 embedding 하기
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")

# 5. vector store 구축하기
vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)

# 6. retriever 구축하기
retriever = vectorstore.as_retriever()

# 7. LangSmith Hub에서 최적화된 RAG 프롬프트 가져오기
prompt = hub.pull("krunal/more-crafted-rag-prompt")

# 8. 최적화된 RAG 체인 구성
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
)

# 9. RAG 챗봇 실행
response = rag_chain.invoke("이 문서에서 상장 주식 대주주 기준이 언제부터 적용되는지 알려줘.")
print(response)
```

**설명:**
- LangSmith Hub에서 최적화된 RAG 프롬프트를 가져와 적용
- 가져온 프롬프트를 `retriever`, `vectorstore`, `LLM`과 결합하여 RAG 모델 최적화
- **사용자가 직접 프롬프트를 튜닝하지 않아도 최적의 결과를 얻을 수 있음**


## **4. LangSmith Hub 활용 시 장점**

**고품질 프롬프트 활용**: 이미 검증된 고급 프롬프트를 가져와 적용할 수 있어 **최적화 시간을 절약**
**다양한 프롬프트 검색 가능**: 여러 개발자가 공유한 다양한 프롬프트를 활용하여 **최상의 성능을 가진 프롬프트 선택 가능**
**재사용성과 일관성 증가**: 팀 내에서 동일한 프롬프트를 사용하여 **응답의 일관성을 유지**
**프롬프트 최적화 비용 절감**: 직접 프롬프트를 실험하며 튜닝할 필요 없이, **최적화된 프롬프트를 즉시 활용 가능**


## **5. LangSmith Hub의 활용 사례**

| 활용 사례 | 설명 |
|------------|----------------------------------|
| RAG 챗봇 구축 | 최적화된 검색 기반 응답 프롬프트 활용 |
| 고객 지원 챗봇 | 자연스럽고 빠른 답변 제공 |
| AI 면접 챗봇 | 기술 면접 질문 최적화 프롬프트 적용 |
| 법률 AI 상담 | 법률 문서를 기반으로 신뢰성 높은 답변 생성 |

LangSmith Hub를 활용하면 기존에 검증된 프롬프트를 손쉽게 가져와 **시간과 비용을 절약하면서도 더 정교한 AI 모델을 구축**할 수 있습니다.


## **6. 마무리 및 요약**

| 기능 | 설명 |
|------|--------------------------------|
| LangSmith Hub | 고급 프롬프트를 공유하고 재사용하는 저장소 |
| `hub.pull()` | LangSmith Hub에서 프롬프트 가져오는 함수 |
| RAG 최적화 | 최적화된 검색 기반 프롬프트를 활용한 성능 개선 |
| 주요 장점 | 프롬프트 최적화 비용 절감, 일관된 응답 제공 |

LangSmith Hub를 활용하면 **더욱 효율적으로 AI 모델을 구축하고, 프롬프트 최적화를 손쉽게 수행할 수 있습니다.**

