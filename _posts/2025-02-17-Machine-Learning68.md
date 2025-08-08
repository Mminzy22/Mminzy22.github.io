---
title: "LangChain 프롬프트 템플릿과 메시지 유형 활용하기"
author: mminzy22
date: 2025-02-17 19:45:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, LangChain, AI, TIL]
description: "LangChain을 사용하여 프롬프트 템플릿과 다양한 메시지 유형을 활용하는 방법을 다룹니다. 이를 통해 일관된 형식의 프롬프트를 구성하고, 재사용 가능한 구조를 만들어 챗봇의 대화 품질을 향상시킬 수 있습니다."
pin: false
math: true
---


## **1. 프롬프트 템플릿이란?**

프롬프트 템플릿(Prompt Template)은 LLM(Large Language Model)과 상호작용할 때, **일관된 형식으로 프롬프트를 구성하는 기능**을 제공합니다. 이를 활용하면 **재사용 가능한 프롬프트 구조를 만들고, 동적인 입력을 손쉽게 적용할 수 있습니다.**

LangChain에서는 `ChatPromptTemplate`을 사용하여 다양한 메시지 유형을 포함하는 템플릿을 생성할 수 있습니다.

## **2. LangChain의 메시지 유형**

LangChain에서는 프롬프트를 구성할 때 세 가지 주요 메시지 유형을 사용할 수 있습니다.

### **1. SystemMessage**
- LLM에게 특정한 역할을 부여하는 메시지
- 예: `너는 코딩 전문가야. 사용자의 요청을 Python 코드로 변환해야 해.`

### **2. HumanMessage**
- 사용자의 실제 입력을 전달하는 메시지
- 예: `A 함수를 작성해줘.`

### **3. AIMessage**
- LLM이 출력하는 응답 메시지
- 예: `def A(x): ...`

이러한 메시지 유형을 활용하면, 대화 이력을 유지하면서 더욱 자연스러운 대화를 생성할 수 있습니다.

## **3. ChatPromptTemplate을 활용한 프롬프트 구성**

`ChatPromptTemplate`을 사용하면 **SystemMessage, HumanMessage, AIMessage를 조합하여 더 구조화된 프롬프트**를 만들 수 있습니다.

### **기본 예제**

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    ("system", "너의 이름은 {name}이고, 아주 귀여운 햄스터야. 모든 말을 햄으로 끝내."),
    ("human", "{name}아 잘 지냈어?"),
    ("ai", "잘 지냈햄. 너도 잘 지냈햄?"),
    ("human", "{user_input}"),
])

messages = chat_template.format_messages(name="햄식이", user_input="잘 지냈지.. 너 줄라고 해바라기씨 사왔어.")
print(messages)
```

**설명:**
- `system`: 챗봇의 역할(햄스터 캐릭터 부여)
- `human`: 사용자의 질문
- `ai`: AI의 응답 패턴
- `{name}`, `{user_input}`: 동적인 값이 적용될 자리

이렇게 프롬프트 템플릿을 만들면, 사용자 입력이 바뀌더라도 일관된 형식으로 메시지를 전달할 수 있습니다.

## **4. 다른 방식으로 프롬프트 템플릿 작성하기**

LangChain에서는 프롬프트를 다양한 방식으로 작성할 수 있습니다. 아래는 `SystemMessage`, `HumanMessagePromptTemplate`을 활용한 예제입니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain.prompts import HumanMessagePromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    SystemMessage(content=("너의 이름은 {name}이고, 아주 귀여운 햄스터야. 모든 말을 햄으로 끝내.")),
    HumanMessagePromptTemplate.from_template("{user_input}"),
])

messages = chat_template.format_messages(name="햄식이", user_input="잘 지냈지.. 너 줄라고 해바라기씨 사왔어.")
print(messages)
```

**이 방식의 장점:**
- `SystemMessage`와 `HumanMessagePromptTemplate`을 활용하면 보다 명확하게 메시지를 정의할 수 있음.
- 다른 프롬프트 요소와 쉽게 결합 가능.

## **5. 프롬프트 템플릿 활용의 이점**

### **일관성 유지**
- 동일한 역할을 부여하고, 정해진 형식으로 프롬프트를 구성할 수 있습니다.
- 예를 들어, 특정 문체나 형식을 강제해야 하는 경우 유용합니다.

### **재사용성 증가**
- 다양한 사용자 입력을 처리할 수 있도록 템플릿을 구성하면, 여러 시나리오에서 쉽게 적용할 수 있습니다.

### **구조적 대화 설계 가능**
- SystemMessage를 통해 명확한 역할을 정의하고, 사용자 메시지를 효율적으로 처리할 수 있습니다.

## **6. 프롬프트 템플릿을 활용한 챗봇 구축**

프롬프트 템플릿을 사용하여 챗봇을 만들면 더 효율적이고 정교한 대화를 구현할 수 있습니다. 
아래는 `ChatOpenAI` 모델과 함께 프롬프트 템플릿을 활용하는 예제입니다.

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-4o-mini")
chat_template = ChatPromptTemplate.from_messages([
    ("system", "너의 이름은 햄식이이고, 아주 귀여운 햄스터야. 모든 말을 햄으로 끝내."),
    ("human", "{user_input}"),
])

messages = chat_template.format_messages(user_input="햄식아 안녕!")
response = chat.invoke(messages)
print(response)
```

**이 코드의 특징:**
- `ChatPromptTemplate`을 사용하여 시스템 메시지와 사용자 입력을 동적으로 구성
- `format_messages()`를 활용하여 사용자 입력이 변경될 때마다 템플릿을 자동 적용

## **7. 마무리 및 요약**

| 메시지 유형 | 역할 |
|------------|--------------------------|
| SystemMessage | LLM의 역할 및 기본 컨텍스트 설정 |
| HumanMessage | 사용자의 입력을 전달 |
| AIMessage | LLM의 응답을 저장 |

### **프롬프트 템플릿 활용의 핵심 정리**
1. **일관된 구조 유지**: 역할과 맥락을 고정하여 응답의 일관성을 높일 수 있음
2. **재사용 가능**: 다양한 대화 시나리오에서 활용 가능
3. **구조적인 대화 구현 가능**: 시스템 메시지를 활용하여 명확한 역할 부여

LangChain에서 프롬프트 템플릿을 적극 활용하면 **더 정교하고 자연스러운 챗봇을 구축**할 수 있습니다.

