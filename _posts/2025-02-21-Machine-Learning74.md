---
title: "LangChain에서 Multi-turn 대화와 Memory 활용하기 - part.3"
author: mminzy22
date: 2025-02-21 21:30:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, Multi-turn, AI, TIL]
description: "LangChain에서 Multi-turn 대화를 구현하고 다양한 Memory 시스템을 활용하는 방법을 소개합니다."
pin: false
math: true
---


## 1. Multi-turn 대화란?

Multi-turn 대화란 사용자의 이전 대화 맥락을 기억하고, 이를 바탕으로 연속적인 대화를 이어가는 방식입니다. 반면, Single-turn 대화는 매번 새로운 질문을 받고 독립적인 응답을 반환하는 방식입니다. Multi-turn 대화를 활용하면 대화형 AI가 보다 자연스럽고 일관된 대화를 제공할 수 있습니다.

### Single-turn 대화 예시

Single-turn 방식에서는 AI가 사용자의 이전 질문을 기억하지 못하고, 모든 요청을 독립적인 질의로 처리합니다.

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-4o-mini")

response1 = chat.invoke("햄식아, 나 어제 수능 봤어.")
response2 = chat.invoke("햄식아, 내가 어제 뭐 했는지 기억해?")

print(response1.content)
print(response2.content)  # 이전 내용을 기억하지 못함
```

위 코드에서 `response2`는 AI가 `response1`의 내용을 기억하지 않기 때문에 올바른 답변을 제공하지 못합니다.

### Multi-turn 대화 예시

Multi-turn 방식에서는 AI가 이전 대화 맥락을 기억하여 보다 자연스러운 대화를 유지할 수 있습니다.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    ("system", "너의 이름은 햄식이이고, 귀여운 햄스터야. 모든 말을 햄으로 끝내."),
    ("human", "햄식아, 나 어제 수능 봤어."),
    ("ai", "진짜햄? 고생 많았햄!!"),
    ("human", "햄식아, 내가 어제 뭐 했는지 기억해?"),
])

messages = chat_template.format_messages()
chat = ChatOpenAI(model_name="gpt-4o-mini")
response = chat.invoke(messages)

print(response.content)  # 이전 대화 내용을 유지하며 응답
```

이처럼 Multi-turn 대화를 사용하면 AI가 사용자의 대화 흐름을 이해하고 일관된 답변을 제공할 수 있습니다.

---

## 2. LangChain Memory 개념

LangChain은 대화 맥락을 유지하기 위해 다양한 **Memory 시스템**을 제공합니다. 이를 활용하면 긴 대화에서도 문맥을 유지하면서 보다 자연스러운 상호작용이 가능합니다.

### 주요 Memory 유형

| Memory 유형 | 설명 |
|-------------|------------------------------------|
| ConversationBufferMemory | 대화 내용을 버퍼에 저장하여 최근 대화 내역 유지 |
| ConversationSummaryMemory | 요약된 형태로 대화 맥락을 저장하여 메모리 사용량 절약 |
| ConversationKGMemory | 지식 그래프(KG) 기반으로 정보를 연결하여 기억 |
| VectorStoreRetrieverMemory | 벡터DB를 활용하여 대화 기록을 저장하고 검색 |

이러한 Memory 시스템을 적절히 활용하면 다양한 요구사항에 맞춘 대화형 AI를 개발할 수 있습니다.

---

## 3. ConversationBufferMemory 사용법

`ConversationBufferMemory`는 가장 기본적인 Memory 방식으로, 최근 대화 내용을 그대로 저장하여 문맥을 유지할 수 있습니다.

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model_name="gpt-4o-mini")
memory = ConversationBufferMemory()

chain = LLMChain(llm=llm, memory=memory)

chain.invoke("오늘 날씨 어때?")
chain.invoke("내가 방금 뭐 물어봤어?")  # 대화 기억
```

위 코드를 실행하면 `chain`은 사용자의 이전 질문을 기억하고, 문맥에 맞는 응답을 제공할 수 있습니다.

---

## 4. ConversationSummaryMemory 사용법

`ConversationSummaryMemory`는 대화 내용을 그대로 저장하는 대신, 요약된 형태로 저장하여 메모리 사용량을 줄일 수 있습니다. 대화의 핵심만 저장하는 방식이므로 장기간의 대화에서 유용합니다.

```python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=llm)

chain = LLMChain(llm=llm, memory=memory)
chain.invoke("우리가 지금까지 어떤 이야기를 했어?")
```

이 방식은 긴 대화를 효율적으로 관리할 수 있도록 도와줍니다.

---

## 5. Redis를 활용한 Memory 저장

긴 대화 히스토리를 유지하려면 메모리에만 의존하지 않고 **Redis**와 같은 외부 저장소를 활용할 수 있습니다. Redis를 활용하면 서버를 재시작해도 대화 기록이 유지됩니다.

### Redis 설치
먼저 Redis를 설치해야 합니다.

```bash
pip install redis
```

### Redis를 활용한 Memory 설정

```python
from langchain.memory import RedisChatMessageHistory
from langchain.memory import ConversationBufferMemory

message_history = RedisChatMessageHistory(url="redis://localhost:6379/0")
memory = ConversationBufferMemory(chat_memory=message_history)
```

이제 AI는 Redis를 통해 대화 기록을 저장하고 필요할 때 불러올 수 있습니다. 이를 통해 보다 장기간의 대화를 유지하고 관리할 수 있습니다.

---

## 6. 결론

Multi-turn 대화는 AI가 보다 자연스럽고 문맥에 맞는 답변을 제공할 수 있도록 돕는 핵심 기술입니다. LangChain에서는 다양한 Memory 시스템을 제공하여 사용자의 요구에 맞게 대화 기록을 관리할 수 있습니다.

- **Single-turn 대화**: 대화 맥락을 기억하지 않고 독립적인 응답을 제공
- **Multi-turn 대화**: 이전 대화를 기억하며 자연스럽게 이어지는 대화 가능
- **LangChain Memory**: `ConversationBufferMemory`, `ConversationSummaryMemory`, `ConversationKGMemory` 등을 활용하여 대화 히스토리 유지
- **Redis 연동**: 장기적인 대화 기록을 저장하고 활용 가능

이제 LangChain의 Memory 기능을 활용하여 더욱 정교한 대화형 AI를 설계할 수 있습니다.

