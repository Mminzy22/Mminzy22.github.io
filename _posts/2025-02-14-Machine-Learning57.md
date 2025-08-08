---
title: "Runnable 컴포넌트와 체인 확장하기 - 특강5"
author: mminzy22
date: 2025-02-14 09:20:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, AI, TIL]
description: "LangChain의 Runnable 컴포넌트를 활용하여 체인을 구성하고 확장하는 방법을 다룹니다. 기본적인 체인 구성부터 커스텀 함수 적용, 실행 시간 측정, 추가적인 컴포넌트 활용 방법까지 다양한 예제를 통해 설명합니다."
pin: false
math: true
---


## 1. Runnable 컴포넌트란?

LangChain에서 **Runnable 컴포넌트**는 체인의 구성 요소로 사용될 수 있는 객체를 의미합니다. `Runnable` 인터페이스를 구현하면 체인의 일부로 작동할 수 있습니다. 

### **Runnable 컴포넌트의 주요 예제**
1. `ChatOpenAI` – LLM 모델 실행
2. `ChatPromptTemplate` – 프롬프트 템플릿 처리
3. `StrOutputParser` – 모델 출력을 문자열로 변환
4. `RunnablePassthrough` – 입력을 변환 없이 그대로 전달


## 2. 기본적인 Runnable 컴포넌트 체인 구성

LangChain에서 `|` (파이프 연산자)를 활용하여 체인을 구성할 수 있습니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

# 모델 생성
model = ChatOpenAI(model="gpt-4o-mini")

# 프롬프트 템플릿 생성
prompt = ChatPromptTemplate.from_template("{dog_breeds_input}들의 고향은 어디야?")

# 체인 생성
chain = prompt | model | StrOutputParser()

# 실행
answer = chain.invoke({"dog_breeds_input": "말티즈"})
print(answer)
```

위 코드에서 `ChatPromptTemplate`, `ChatOpenAI`, `StrOutputParser`가 모두 Runnable 컴포넌트로 동작하며 체인을 형성합니다.


## 3. 커스텀 Runnable 함수 추가하기

Runnable 체인에 직접 변환 함수를 추가할 수도 있습니다.

```python
def custom_formatter(response):
    return response.upper()

# 체인에 함수 추가
chain = prompt | model | custom_formatter

# 실행
answer = chain.invoke({"dog_breeds_input": "시츄"})
print(answer)
```

위 코드에서는 `custom_formatter()` 함수가 체인 내에서 LLM의 출력을 대문자로 변환하는 역할을 합니다.


## 4. RunnablePassthrough 활용하기

때때로 데이터 변환 없이 체인을 연결하고 싶다면 `RunnablePassthrough()`를 사용할 수 있습니다.

```python
from langchain.schema.runnable import RunnablePassthrough

passthrough = RunnablePassthrough()

chain = prompt | passthrough | model | StrOutputParser()
```

이렇게 하면 `passthrough`는 입력을 변환하지 않고 그대로 다음 컴포넌트로 전달합니다.


## 5. 체인의 실행 시간 측정하기

실행 시간을 측정하는 커스텀 `RunnablePassthrough`를 만들 수 있습니다.

```python
import time
from langchain.schema.runnable import RunnablePassthrough

class TimingRunnablePassthrough(RunnablePassthrough):
    def invoke(self, input, *args):
        start_time = time.time()
        output = super().invoke(input)
        end_time = time.time()
        print(f"Processing time: {end_time - start_time:.6f} seconds")
        return output

# 실행 시간 측정
timed_passthrough = TimingRunnablePassthrough()

chain = prompt | timed_passthrough | model | StrOutputParser()

answer = chain.invoke({"dog_breeds_input": "말티즈"})
print(answer)
```

이렇게 하면 체인의 실행 시간이 자동으로 출력됩니다.


## 6. 체인의 데이터 변환을 위한 추가 Runnable 컴포넌트

### **1) StrOutputParser()**
모델의 출력을 문자열로 변환할 때 사용합니다.

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
```

### **2) RunnablePassthrough()**
입력을 그대로 전달하며, 데이터 흐름을 디버깅하거나 검증할 때 유용합니다.

```python
from langchain.schema.runnable import RunnablePassthrough

chain = prompt | RunnablePassthrough() | model
```

### **3) RunnableLambda()**
사용자 정의 람다 함수를 체인에서 실행할 때 사용합니다.

```python
from langchain.schema.runnable import RunnableLambda

uppercase_formatter = RunnableLambda(lambda x: x.upper())

chain = prompt | model | uppercase_formatter
```


## 7. 마무리

이번 글에서는 **Runnable 컴포넌트를 활용하여 LangChain의 체인을 확장하는 방법**을 살펴보았습니다.

- LCEL을 활용한 기본적인 체인 구성
- 커스텀 함수 및 RunnablePassthrough 적용
- 실행 시간 측정을 위한 커스텀 Runnable 생성
- 추가적인 Runnable 컴포넌트 활용 방법

다음 글에서는 **LangChain을 활용한 고급 체인 구성 및 최적화 전략**을 다뤄보겠습니다
