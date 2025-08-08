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

프롬프트 엔지니어링(Prompt Engineering)은 LLM(Large Language Model)이 원하는 방식으로 응답을 생성하도록 프롬프트를 최적화하는 기법입니다. 적절한 프롬프트를 제공하면 모델의 응답 품질이 향상되며, 특정한 요구사항을 충족하는 답변을 얻을 수 있습니다.

LangChain에서는 이러한 프롬프트를 보다 체계적으로 관리할 수 있도록 **프롬프트 템플릿(Prompt Templates)**을 제공합니다. 이를 활용하면 재사용 가능한 프롬프트를 구성하고, 다양한 시나리오에 맞춰 동적으로 조정할 수 있습니다.

### 프롬프트 엔지니어링의 핵심 요소

프롬프트를 설계할 때 고려해야 할 주요 요소는 다음과 같습니다.

- **명확성(Clarity)**: LLM이 이해하기 쉽도록 질문을 명확하게 작성해야 합니다.
- **맥락(Context)**: 모델이 정확한 응답을 생성할 수 있도록 필요한 배경 정보를 제공해야 합니다.
- **제약 조건(Constraints)**: 답변 형식을 제한하여 일관된 응답을 유도할 수 있습니다.
- **예제 포함(Examples)**: 원하는 출력 예제를 제공하면 모델이 올바른 방향으로 응답을 생성하는 데 도움이 됩니다.

이러한 요소를 적절히 반영하면 보다 정교한 프롬프트를 설계할 수 있습니다.

---

## 2. LangChain에서 제공하는 메시지 유형

LangChain에서는 대화형 LLM을 다룰 때 여러 유형의 메시지를 활용할 수 있습니다. 대표적으로 **시스템 메시지(SystemMessage)**, **사용자 메시지(HumanMessage)**, **AI 메시지(AIMessage)**가 있으며, 이를 조합하여 더욱 정교한 대화를 설계할 수 있습니다.

### 2.1 시스템 메시지 (SystemMessage)

시스템 메시지는 AI 모델의 역할을 지정하는 메시지입니다. 모델이 어떤 톤과 방식으로 응답해야 하는지 정의할 수 있습니다.

#### 예제:

```python
from langchain_core.messages import SystemMessage

system_msg = SystemMessage(content="너는 프로그래밍 전문가야. 사용자의 요청을 Python 코드로 변환해줘.")
print(system_msg)
```

### 2.2 사용자 메시지 (HumanMessage)

사용자 메시지는 실제 사용자의 입력을 포함하는 메시지입니다. 모델이 직접 응답해야 하는 질문이나 요청을 포함할 수 있습니다.

#### 예제:

```python
from langchain_core.messages import HumanMessage

human_msg = HumanMessage(content="이진 탐색 코드를 작성해줘.")
print(human_msg)
```

### 2.3 AI 메시지 (AIMessage)

AI 메시지는 LLM이 이전에 생성한 응답을 저장하는 메시지입니다. 이를 활용하면 문맥을 유지하면서 대화를 진행할 수 있습니다.

#### 예제:

```python
from langchain_core.messages import AIMessage

ai_msg = AIMessage(content="다음은 이진 탐색 코드입니다: ...")
print(ai_msg)
```

이러한 메시지를 적절히 조합하면 더 구조화된 대화를 구성할 수 있습니다.

---

## 3. ChatPromptTemplate을 활용한 프롬프트 템플릿 생성

LangChain에서는 `ChatPromptTemplate`을 사용하여 템플릿 기반으로 프롬프트를 관리할 수 있습니다. 이를 활용하면 보다 일관된 방식으로 프롬프트를 생성할 수 있으며, 다양한 입력값을 동적으로 적용할 수 있습니다.

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

위 코드에서 `{question}`은 동적으로 변경될 수 있는 입력값입니다. 이를 활용하면 동일한 템플릿을 다양한 입력값에 맞게 재사용할 수 있습니다.

### 3.2 다양한 메시지 유형을 포함하는 프롬프트

여러 유형의 메시지를 결합하여 보다 풍부한 문맥을 제공할 수도 있습니다.

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

---

## 4. 프롬프트 엔지니어링의 활용 예제

프롬프트 엔지니어링을 활용하여 다양한 시나리오를 설계할 수 있습니다.

### 4.1 역할 기반 프롬프트 설정

LLM이 특정 역할을 수행하도록 설정하면 보다 전문적인 응답을 유도할 수 있습니다.

```python
chat_template = ChatPromptTemplate.from_messages([
    ("system", "너는 역사 학자야. 사용자의 질문에 대해 역사적 사실을 바탕으로 답변해."),
    ("human", "{question}")
])
```

이렇게 하면 LLM이 역사 전문가처럼 응답하도록 유도할 수 있습니다.

### 4.2 JSON 형식의 응답 유도

특정 형식으로 응답을 강제하면 모델이 일관된 결과를 제공하도록 설정할 수 있습니다.

```python
chat_template = ChatPromptTemplate.from_messages([
    ("system", "너는 데이터 분석 챗봇이야. JSON 형식으로 응답해."),
    ("human", "데이터 프레임의 기본 정보를 알려줘.")
])
```

이 프롬프트를 사용하면 LLM이 JSON 형태의 응답을 생성하도록 유도할 수 있습니다.

---

## 5. 결론

프롬프트 엔지니어링은 LLM의 출력을 제어하고 원하는 방식으로 최적화하는 강력한 도구입니다. LangChain에서 제공하는 `ChatPromptTemplate`과 다양한 메시지 유형을 활용하면 보다 체계적으로 프롬프트를 관리할 수 있습니다.

이 글에서는 LangChain을 활용한 프롬프트 엔지니어링의 기초 개념과 실전 적용법을 다루었습니다. 이를 기반으로 자신만의 프롬프트를 설계하고, 특정한 목적에 맞춰 AI 모델을 최적화할 수 있습니다.

