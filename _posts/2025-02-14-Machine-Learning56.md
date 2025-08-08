---
title: "LangChain Expression Language(LCEL) 이해하기 - 특강4"
author: mminzy22
date: 2025-02-14 09:15:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, AI, TIL]
description: "LangChain Expression Language(LCEL)를 사용하여 체인을 구성하고 실행하는 방법을 알아봅니다. LCEL의 기본 개념, 체인에 컴포넌트 추가하기, 조건부 체인, 실행 시간 측정 등을 다룹니다."
pin: false
math: true
---


## 1. LCEL이란?

LangChain Expression Language(LCEL)는 LangChain에서 **체인(Chain)**을 쉽게 구성할 수 있도록 설계된 표현식 언어입니다. 이 언어를 활용하면 프롬프트, 모델, 출력 변환 등을 손쉽게 연결할 수 있습니다.

LCEL에서 가장 핵심적인 개념은 **`|` (파이프 연산자)**입니다. 이를 통해 여러 개의 컴포넌트를 연결하여 체인을 형성할 수 있습니다.


## 2. LCEL의 기본 개념

### 2.1 체인의 기본 구조

LCEL을 사용하면 다음과 같은 형태로 프롬프트, 모델, 출력 처리를 연결할 수 있습니다.

```python
chain = prompt | model
```

위 코드는 다음과 같이 동작합니다.
1. `prompt`에서 프롬프트 템플릿을 생성합니다.
2. `model`에서 LLM을 호출합니다.
3. `prompt`의 출력이 `model`의 입력으로 전달됩니다.

### 2.2 체인의 실행

체인은 `.invoke()` 메서드를 사용하여 실행할 수 있습니다.

```python
answer = chain.invoke({"input": "말티즈들의 고향은 어디야?"})
print(answer)
```

체인의 첫 번째 컴포넌트(`prompt`)에 입력을 전달하면, 실행된 결과가 마지막 컴포넌트의 출력으로 반환됩니다.


## 3. 체인에 컴포넌트 추가하기

LCEL에서는 체인에 여러 개의 컴포넌트를 추가하여 복잡한 처리를 할 수 있습니다.

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

여기서 `StrOutputParser()`는 모델의 출력을 문자열로 변환하는 역할을 합니다.


## 4. Runnable 컴포넌트와 조건부 체인

### 4.1 Runnable 인터페이스란?

LCEL에서 `|` (파이프)로 연결될 수 있는 컴포넌트는 **Runnable 인터페이스**를 구현해야 합니다. 기본적으로 LangChain에서 제공하는 프롬프트 템플릿, 모델, 출력 변환기 등은 모두 Runnable 인터페이스를 구현하고 있습니다.

### 4.2 커스텀 함수 추가하기

체인 내에서 직접 변환 함수를 추가할 수도 있습니다.

```python
def custom_formatter(response):
    return response.upper()

# 체인에 함수 추가
chain = prompt | model | custom_formatter

# 실행
answer = chain.invoke({"dog_breeds_input": "시츄"})
print(answer)
```

위 코드에서는 모델의 출력을 `custom_formatter()` 함수가 받아 대문자로 변환한 후 출력합니다.


## 5. RunnablePassthrough 활용하기

때때로 데이터 변환 없이 체인을 연결하고 싶을 때 `RunnablePassthrough()`를 사용할 수 있습니다.

```python
from langchain.schema.runnable import RunnablePassthrough

passthrough = RunnablePassthrough()

chain = prompt | passthrough | model | StrOutputParser()
```

이렇게 하면 `passthrough`는 입력을 변환하지 않고 그대로 다음 컴포넌트로 전달합니다.


## 6. 체인의 실행 시간 측정하기

체인의 실행 시간을 측정하려면 `RunnablePassthrough`를 확장하여 새로운 클래스를 만들 수 있습니다.

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

이렇게 하면 체인의 실행 시간을 자동으로 출력할 수 있습니다.


## 7. 마무리

LCEL을 활용하면 **LangChain에서 체인을 간편하게 구성하고 실행**할 수 있습니다. 이를 통해 복잡한 AI 애플리케이션도 보다 체계적으로 설계할 수 있습니다.

다음 글에서는 **Runnable 컴포넌트와 체인 확장하기**에 대해 알아보겠습니다
