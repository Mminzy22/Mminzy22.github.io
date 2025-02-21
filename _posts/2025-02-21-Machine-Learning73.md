---
title: "LangChain의 프롬프트 엔지니어링과 메시지 유형 활용하기 - part.2"
author: mminzy22
date: 2025-02-21 21:00:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, 프롬프트 엔지니어링, AI, TIL]
description: "LangChain에서 효과적인 프롬프트를 설계하는 방법과 다양한 메시지 유형을 활용하는 기법을 소개합니다."
pin: false
math: true
---


## 1. 프롬프트 엔지니어링이란?

프롬프트 엔지니어링(Prompt Engineering)이란 LLM(Large Language Model)이 원하는 방식으로 응답을 생성하도록 프롬프트를 최적화하는 기법입니다. LangChain에서는 이를 더 체계적으로 관리할 수 있도록 **프롬프트 템플릿(Prompt Templates)**을 제공합니다.

### 프롬프트 엔지니어링의 핵심 요소
- **명확성(Clarity)**: 모델이 이해할 수 있도록 명확하게 질문 구성
- **맥락(Context)**: 필요한 배경 정보를 포함하여 보다 정확한 답변 유도
- **제약 조건(Constraints)**: 답변 형식을 명확히 설정하여 일관성 확보
- **예제 포함(Examples)**: 적절한 예제를 제시하여 출력 방향 유도


## 2. LangChain에서 제공하는 메시지 유형

LangChain에서는 대화형 LLM을 다룰 때 세 가지 메시지 유형을 활용할 수 있습니다.

### 2.1 시스템 메시지(SystemMessage)
- AI가 어떤 역할을 수행해야 하는지 설정하는 메시지
- 예제:

```python
from langchain_core.messages import SystemMessage
system_msg = SystemMessage(content="너는 프로그래밍 전문가야. 사용자의 요청을 Python 코드로 변환해줘.")
```

### 2.2 사용자 메시지(HumanMessage)
- 실제 사용자 입력을 포함하는 메시지
- 예제:

```python
from langchain_core.messages import HumanMessage
human_msg = HumanMessage(content="이진 탐색 코드를 작성해줘.")
```

### 2.3 AI 메시지(AIMessage)
- AI가 이전에 생성한 응답을 포함하는 메시지
- 예제:

```python
from langchain_core.messages import AIMessage
ai_msg = AIMessage(content="다음은 이진 탐색 코드입니다: ...")
```

이러한 메시지를 적절히 조합하면 더 구조화된 대화를 구성할 수 있습니다.


## 3. ChatPromptTemplate을 활용한 프롬프트 템플릿 생성

LangChain에서는 `ChatPromptTemplate`을 사용하여 템플릿 기반으로 프롬프트를 관리할 수 있습니다.

### 3.1 기본적인 프롬프트 템플릿 생성

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    ("system", "너는 Python 전문가야. 사용자의 질문에 대해 정확한 코드 예제를 제공해."),
    ("human", "{question}")
])

messages = chat_template.format_messages(question="퀵 정렬 코드를 작성해줘.")
print(messages)
```

이렇게 하면 `question`에 따라 동적으로 프롬프트가 생성됩니다.


### 3.2 다양한 메시지 유형을 포함하는 프롬프트

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessagePromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    SystemMessage(content="너는 데이터 분석 전문가야. Pandas와 NumPy를 사용하여 문제를 해결해."),
    HumanMessagePromptTemplate.from_template("{user_input}")
])

messages = chat_template.format_messages(user_input="데이터 프레임에서 결측치를 처리하는 방법 알려줘.")
print(messages)
```

이 방식은 다양한 상황에 맞춰 재사용 가능한 프롬프트를 쉽게 정의할 수 있도록 도와줍니다.


## 4. 프롬프트 엔지니어링의 활용 예제

### 4.1 역할 기반 프롬프트 설정

```python
chat_template = ChatPromptTemplate.from_messages([
    ("system", "너는 역사 학자야. 사용자의 질문에 대해 역사적 사실을 바탕으로 답변해."),
    ("human", "{question}")
])
```

이렇게 하면 LLM이 특정 역할을 부여받아 더 전문적인 답변을 제공할 수 있습니다.


### 4.2 JSON 형식의 응답 유도

```python
chat_template = ChatPromptTemplate.from_messages([
    ("system", "너는 데이터 분석 챗봇이야. JSON 형식으로 응답해."),
    ("human", "데이터 프레임의 기본 정보를 알려줘.")
])
```

LLM이 JSON 형식으로 응답하도록 강제할 수도 있습니다.

