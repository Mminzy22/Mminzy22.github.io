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

Multi-turn 대화란 사용자의 이전 대화 맥락을 기억하고, 이를 바탕으로 연속적인 대화를 이어가는 방식입니다. 반면, Single-turn 대화는 매번 새로운 질문을 받고 독립적인 응답을 반환하는 방식입니다.

### Single-turn 대화 예시

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-4o-mini")

response1 = chat.invoke("햄식아, 나 어제 수능 봤어.")
response2 = chat.invoke("햄식아, 내가 어제 뭐 했는지 기억해?")

print(response1.content)
print(response2.content)  # 이전 내용을 기억하지 못함
```

### Multi-turn 대화 예시

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

## 2. LangChain Memory 개념

LangChain은 대화 맥락을 유지하기 위해 다양한 **Memory 시스템**을 제공합니다.

### 주요 Memory 유형

| Memory 유형 | 설명 |
|-------------|------------------------------------|
| ConversationBufferMemory | 대화 내용을 버퍼에 저장 |
| ConversationSummaryMemory | 요약된 형태로 대화 맥락 저장 |
| ConversationKGMemory | 지식 그래프(KG) 기반 저장 |
| VectorStoreRetrieverMemory | 벡터DB를 활용한 대화 기록 관리 |


## 3. ConversationBufferMemory 사용법

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

## 4. ConversationSummaryMemory 사용법

ConversationSummaryMemory는 이전 대화를 요약하여 저장하는 방식입니다.

```python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(llm=llm)

chain = LLMChain(llm=llm, memory=memory)
chain.invoke("우리가 지금까지 어떤 이야기를 했어?")
```


## 5. Redis를 활용한 Memory 저장

긴 대화 히스토리를 유지하려면 Redis와 같은 외부 저장소를 활용할 수 있습니다.

```python
pip install redis
```

```python
from langchain.memory import RedisChatMessageHistory
from langchain.memory import ConversationBufferMemory

message_history = RedisChatMessageHistory(url="redis://localhost:6379/0")
memory = ConversationBufferMemory(chat_memory=message_history)
```
