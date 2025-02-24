---
title: "LangChain에서 Chains와 Workflow 활용하기 - part.5"
author: mminzy22
date: 2025-02-24 20:30:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, Chains, AI 워크플로우, AI, TIL]
description: "LangChain에서 다양한 Chains를 활용하여 AI 워크플로우를 최적화하는 방법을 소개합니다."
pin: false
math: true
---


## 1. Chains란?

LangChain에서 **Chains(체인)**은 여러 개의 LLM 호출 및 작업을 순차적으로 연결하여 복잡한 워크플로우를 구성하는 기능입니다. 단순한 질문-응답 방식이 아니라 여러 개의 작업을 조합하여 보다 복잡한 AI 애플리케이션을 만들 수 있도록 돕습니다.

### 주요 개념

| Chain 유형 | 설명 |
|------------|---------------------------------------------------|
| **SimpleSequentialChain** | 여러 단계를 순차적으로 실행하는 간단한 체인 |
| **LLMChain** | 특정 프롬프트와 LLM을 결합하여 실행하는 체인 |
| **RouterChain** | 입력을 기반으로 적절한 체인을 선택하여 실행하는 체인 |
| **Custom Chain** | 사용자가 직접 정의한 맞춤형 체인 |

체인을 활용하면 LLM을 단순히 한 번 호출하는 것이 아니라, 여러 단계를 거쳐 결과를 생성하는 복잡한 처리를 수행할 수 있습니다.

---

## 2. SimpleSequentialChain 활용

`SimpleSequentialChain`은 여러 개의 작업을 순차적으로 수행하도록 설정할 수 있습니다. 이전 단계의 출력을 다음 단계의 입력으로 사용하여 일련의 작업을 자동화할 수 있습니다.

### 2.1 기본적인 SimpleSequentialChain 예제

```python
from langchain.chains import SimpleSequentialChain, LLMChain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

llm = ChatOpenAI(model_name="gpt-4o-mini")

prompt1 = PromptTemplate.from_template("{text}을 요약해줘.")
prompt2 = PromptTemplate.from_template("요약된 내용을 한 문장으로 정리해줘.")

chain = SimpleSequentialChain(
    chains=[LLMChain(llm=llm, prompt=prompt1), LLMChain(llm=llm, prompt=prompt2)],
    verbose=True
)

response = chain.invoke("LangChain의 Chains 개념을 설명해줘.")
print(response)
```

**출력 예시:**

```
Chains는 여러 개의 LLM 호출을 연결하여 복잡한 작업을 자동화하는 기능이다.
```

이 방식은 여러 개의 단계를 거쳐 텍스트를 가공해야 할 때 유용합니다.

---

## 3. LLMChain을 활용한 맞춤형 프롬프트 워크플로우

`LLMChain`은 특정 프롬프트와 LLM을 결합하여 **일관된 텍스트 생성 워크플로우**를 제공합니다.

### 3.1 LLMChain 기본 사용법

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("{topic}에 대한 자세한 설명을 제공해줘.")

chain = LLMChain(llm=llm, prompt=prompt)
response = chain.invoke({"topic": "LangChain에서 Chains 활용법"})

print(response)
```

이 방식은 특정 주제에 대한 답변을 생성할 때 활용할 수 있습니다.

---

## 4. RouterChain을 활용한 입력 기반 체인 선택

`RouterChain`을 사용하면 사용자의 입력 유형에 따라 서로 다른 체인을 실행할 수 있습니다. 예를 들어, "요약"과 "번역"을 구분하여 다른 체인을 실행하도록 설정할 수 있습니다.

### 4.1 RouterChain 기본 사용법

```python
from langchain.chains import RouterChain

router = RouterChain(
    chains={
        "요약": LLMChain(llm=llm, prompt=PromptTemplate.from_template("{text}을 요약해줘.")),
        "번역": LLMChain(llm=llm, prompt=PromptTemplate.from_template("{text}을 영어로 번역해줘."))
    }
)

response = router.invoke({"text": "LangChain이란?", "type": "요약"})
print(response)
```

**출력:**

```
LangChain은 LLM을 활용한 AI 애플리케이션 구축 프레임워크이다.
```

이렇게 하면 입력된 요청 유형에 따라 적절한 체인이 실행되도록 설정할 수 있습니다.

---

## 5. Custom Chain을 활용한 맞춤형 AI 워크플로우 구축

LangChain에서는 `RunnableLambda`를 활용하여 맞춤형 체인을 쉽게 정의할 수 있습니다. 이를 통해 원하는 형태의 데이터 변환, 가공, 분석을 수행할 수 있습니다.

### 5.1 RunnableLambda를 활용한 Custom Chain 생성

```python
from langchain_core.runnables import RunnableLambda

custom_chain = RunnableLambda(lambda x: x.upper())
response = custom_chain.invoke("langchain을 활용한 AI 개발")
print(response)  # "LANGCHAIN을 활용한 AI 개발"
```

이 방식은 단순한 변환 작업뿐만 아니라, LLM과 조합하여 더욱 복잡한 워크플로우를 만들 수도 있습니다.

### 5.2 Custom Chain과 LLM 연동하기

아래 예제에서는 Custom Chain을 활용하여 먼저 문장을 요약한 후, 요약된 내용을 대문자로 변환하는 체인을 구성합니다.

```python
summary_chain = LLMChain(llm=llm, prompt=PromptTemplate.from_template("{text}을 요약해줘."))
uppercase_chain = RunnableLambda(lambda x: x.upper())

custom_workflow = SimpleSequentialChain(chains=[summary_chain, uppercase_chain], verbose=True)

response = custom_workflow.invoke("LangChain은 LLM을 활용한 AI 개발 프레임워크입니다.")
print(response)
```

**출력 예시:**

```
LANGCHAIN은 AI 개발을 위한 프레임워크이다.
```

이처럼 여러 개의 체인을 조합하여 복잡한 데이터 변환 및 처리를 자동화할 수 있습니다.

---

## 6. 결론

LangChain의 **Chains** 기능을 활용하면 단순한 LLM 호출을 넘어 복잡한 워크플로우를 자동화할 수 있습니다.

- **SimpleSequentialChain**: 여러 단계를 순차적으로 실행하는 체인.
- **LLMChain**: 특정 프롬프트 기반으로 동작하는 체인.
- **RouterChain**: 입력 유형에 따라 적절한 체인을 선택하는 기능.
- **Custom Chain**: 사용자가 직접 정의한 맞춤형 체인.
