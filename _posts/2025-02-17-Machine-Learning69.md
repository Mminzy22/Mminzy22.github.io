---
title: "LangChain에서 Multi-turn 대화 구현하기"
author: mminzy22
date: 2025-02-17 19:50:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, LangChain, AI, TIL]
description: "LangChain을 사용하여 Multi-turn 대화를 구현하는 방법. 다양한 예시와 함께 대화 이력 관리, 메모리 최적화 등의 고려사항을 다룹니다."
pin: false
math: true
---


## **1. Multi-turn 대화란?**

Multi-turn 대화란 사용자의 이전 대화 맥락을 기억하고, 이를 바탕으로 연속적인 대화를 이어가는 방식입니다. 반면, Single-turn 대화는 매번 새로운 질문을 받고 독립적인 응답을 반환하는 방식입니다.

### **Single-turn 대화 예시**

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-4o-mini")

response1 = chat.invoke("햄식아, 나 어제 수능 봤어.")
response2 = chat.invoke("햄식아, 내가 어제 뭐 했는지 기억해?")

print(response1.content)
print(response2.content)  # 이전 내용을 기억하지 못하고 대답할 가능성이 높음
```

**문제점:** LLM이 이전 대화를 기억하지 않아 사용자의 맥락을 놓칠 수 있습니다.

### **Multi-turn 대화 예시**

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    ("system", "너의 이름은 햄식이이고, 아주 귀여운 햄스터야. 모든 말을 햄으로 끝내."),
    ("human", "햄식아, 나 어제 수능 봤어."),
    ("ai", "진짜햄? 고생 많았햄!!"),
    ("human", "햄식아, 내가 어제 뭐 했는지 기억해?"),
])

messages = chat_template.format_messages()
model = ChatOpenAI(model_name="gpt-4o-mini")
response = model.invoke(messages)

print(response.content)  # 이전 대화 내용을 유지하며 응답함
```

**해결:** 이전 대화 내역을 유지하면 문맥을 이해하고 자연스러운 대화가 가능합니다.

## **2. Multi-turn 대화 구현 방식**

LangChain에서는 Multi-turn 대화를 구현하는 방법이 여러 가지 있습니다.

### **1. ChatPromptTemplate을 활용한 방식**
사용자가 직접 이전 대화를 저장하고 이를 포함하여 프롬프트를 구성하는 방식입니다.

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    ("system", "너의 이름은 햄식이이고, 아주 귀여운 햄스터야. 모든 말을 햄으로 끝내."),
    ("human", "{user_input}"),
])

messages = chat_template.format_messages(user_input="햄식아, 오늘 날씨 어때?")
model = ChatOpenAI(model_name="gpt-4o-mini")
response = model.invoke(messages)

print(response.content)
```

- **장점**: 단순한 방식으로 프롬프트를 유지하면서 대화를 이어갈 수 있습니다.
- **단점**: 사용자가 직접 이전 대화를 포함해야 하므로 확장성이 떨어집니다.

### **2. ChatMessageHistory를 활용한 방식**
LangChain의 `ChatMessageHistory`를 사용하면 대화 기록을 자동으로 저장하고 활용할 수 있습니다.

```python
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_openai import ChatOpenAI

chat_history = ChatMessageHistory()
chat_history.add_system_message("너의 이름은 햄식이이고, 아주 귀여운 햄스터야. 모든 말을 햄으로 끝내.")
chat_history.add_user_message("햄식아, 나 어제 수능 봤어.")
chat_history.add_ai_message("진짜햄? 고생 많았햄!!")

model = ChatOpenAI(model_name="gpt-4o-mini")
response = model.invoke(chat_history.messages)
print(response.content)
```

- **장점**: 대화 기록을 자동으로 관리할 수 있어 더욱 효율적
- **단점**: 기본적으로 메모리에 저장되므로 장기간 유지가 어려울 수 있음

### **3. RunnableWithMessageHistory를 활용한 방식**
LangChain에서 제공하는 `RunnableWithMessageHistory`를 활용하면 더욱 직관적인 방식으로 대화 기록을 유지할 수 있습니다.

```python
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.chat_models import ChatOpenAI

model = ChatOpenAI(model_name="gpt-4o-mini")
chat_history = ChatMessageHistory()

chat_history.messages.append(SystemMessage(content="너의 이름은 햄식이이고, 아주 귀여운 햄스터야. 모든 말을 햄으로 끝내."))
chat_history.add_user_message("햄식아, 나 어제 수능 봤어.")
chat_history.add_ai_message("진짜햄? 고생 많았햄!!")

while True:
    user_input = input("사용자: ")
    if user_input in ["그만", "잘 있어", "햄식아 날 잊어줘.."]:
        print("햄식봇 종료")
        break

    chat_history.add_user_message(user_input)
    messages = chat_history.messages
    ai_message = model.invoke(messages)
    chat_history.add_ai_message(ai_message.content)
    print(f"햄식이: {ai_message.content}")
```

- **장점**: 자동으로 대화 이력을 관리하여 손쉽게 Multi-turn 대화 구현 가능
- **단점**: 메시지 저장소 설정이 필요할 수 있음

## **3. Multi-turn 대화 구현 시 고려해야 할 점**

**대화 이력 관리**: 대화가 길어질수록 히스토리가 많아지므로, 필요하지 않은 대화는 정리할 필요가 있음
**메모리 사용 최적화**: 장기간 유지할 경우, Redis나 데이터베이스에 저장하는 방식도 고려할 수 있음
**이전 메시지 압축**: 중요 대화 내용만 남기고 불필요한 정보는 요약하는 기법 적용 가능

## **4. 마무리 및 요약**

| 방식 | 장점 | 단점 |
|------|------|------|
| `ChatPromptTemplate` | 간단한 구현 가능 | 확장성이 낮음 |
| `ChatMessageHistory` | 자동으로 메시지 관리 가능 | 메모리 제한이 있을 수 있음 |
| `RunnableWithMessageHistory` | 최적의 대화 기록 유지 가능 | 설정이 필요할 수 있음 |

LangChain을 활용한 Multi-turn 대화는 보다 자연스럽고 인간적인 대화를 구현하는 핵심 요소입니다.
