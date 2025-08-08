---
title: "LangChain에서 실시간 응답을 위한 Streaming 구현"
author: mminzy22
date: 2025-02-17 19:35:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, LangChain, AI, TIL]
description: "LangChain에서 실시간 응답을 위한 Streaming 기능을 구현하는 방법과 그 원리에 대해 설명합니다. Streaming을 통해 챗봇의 응답 속도를 향상시키고, 사용자 경험을 개선하는 방법을 알아봅니다."
pin: false
math: true
---


## **1. Streaming이란?**

일반적인 LLM(Language Model) 응답 방식은 사용자의 입력을 받은 후, 모델이 전체 답변을 생성한 뒤 한 번에 반환하는 방식입니다. 하지만 **Streaming**을 사용하면 모델이 한 단어씩(또는 토큰 단위로) 즉시 응답을 출력하므로, 사용자 경험(UX)이 크게 향상됩니다.

예를 들어, ChatGPT가 마치 사람이 실시간으로 타이핑하는 것처럼 응답을 생성하는 방식이 Streaming의 대표적인 예입니다. 이 방식은 긴 문장을 기다릴 필요 없이 즉각적인 피드백을 제공하기 때문에 응답 대기 시간을 줄이고, 더 자연스러운 대화 경험을 제공합니다.

## **2. Streaming의 원리**

LLM은 한 번에 전체 답변을 생성하는 것이 아니라, **토큰(token)** 단위로 한 단어씩 예측하여 출력합니다. 이 과정에서 Streaming 기능을 활용하면 모델이 예측한 토큰을 즉시 사용자에게 전달할 수 있습니다.

Streaming의 핵심 동작 원리는 다음과 같습니다:

1. 모델이 입력을 받아 한 단어(또는 토큰)씩 생성
2. 생성된 단어를 즉시 사용자에게 출력
3. 새로운 단어가 생성될 때마다 이를 반복

이 방식을 사용하면, 사용자는 전체 응답이 완성되기를 기다릴 필요 없이 즉시 출력을 볼 수 있습니다.

## **3. Streaming과 일반적인 invoke() 호출 비교**

LangChain에서는 일반적으로 `invoke()` 메서드를 사용하여 모델의 응답을 가져옵니다. 하지만 `invoke()`는 전체 응답을 생성한 후 반환하기 때문에, 응답을 기다려야 하는 시간이 더 길어질 수 있습니다.

반면, `stream()` 메서드를 사용하면 모델이 응답을 생성하는 즉시 출력할 수 있습니다. 아래는 두 방식의 차이를 보여주는 코드 예제입니다.

### **일반적인 invoke() 방식**

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-4o-mini")
response = chat.invoke("고양이에 대한 시를 써줘.")
print(response.content)
```

- 전체 시가 생성된 후에 한 번에 출력됨
- 사용자는 모든 응답이 생성될 때까지 기다려야 함

### **Streaming 방식**

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model_name="gpt-4o-mini")

for chunk in chat.stream("고양이에 대한 시를 써줘."):
    print(chunk.content, end="", flush=True)
```

- 모델이 한 단어(또는 토큰)씩 생성하면서 즉시 출력됨
- 실시간으로 문장이 생성되는 것을 확인 가능

## **4. Streaming이 챗봇 UX에 미치는 영향**

### **응답 대기 시간 단축**
Streaming을 활용하면 모델이 문장을 다 생성한 후에 응답을 반환하는 것이 아니라, 생성하는 즉시 토큰을 출력하므로 사용자 대기 시간이 단축됩니다.

### **자연스러운 대화 흐름**
대화형 챗봇에서는 사람이 타이핑하는 것과 같은 자연스러운 대화 흐름을 구현하는 것이 중요합니다. Streaming을 적용하면 사용자는 모델이 즉각적인 응답을 제공한다고 느끼게 됩니다.

### **사용자 경험(UX) 개선**
일반적인 LLM 챗봇과 차별화된 경험을 제공할 수 있습니다. 예를 들어, AI 비서 또는 실시간 질문응답 시스템에서 더 몰입감 있는 상호작용을 가능하게 합니다.

## **5. Streaming 적용 실습 코드**

다음은 Streaming을 활용하여 실시간 응답이 가능한 챗봇을 만드는 예제 코드입니다.

```python
from langchain_openai import ChatOpenAI

def streaming_chat():
    chat = ChatOpenAI(model_name="gpt-4o-mini")
    user_input = input("질문을 입력하세요: ")
    
    print("AI 응답: ", end="")
    for chunk in chat.stream(user_input):
        print(chunk.content, end="", flush=True)
    print()  # 줄 바꿈

# 실행
treaming_chat()
```

이 코드를 실행하면 사용자가 입력한 질문에 대해 LLM이 실시간으로 응답을 생성하며 출력하는 모습을 확인할 수 있습니다.

## **6. Streaming 적용 시 고려할 점**

### **네트워크 및 API 호출 비용**
- Streaming 방식은 여러 개의 작은 응답을 지속적으로 반환하므로, API 호출이 더 많아질 수 있습니다.
- 사용량이 많은 경우, OpenAI API 요금이 증가할 수 있으므로 주의해야 합니다.

### **UI/UX 최적화 필요**
- Web 또는 모바일 환경에서 Streaming을 사용할 경우, 프론트엔드에서 실시간으로 텍스트를 업데이트하는 방식(UI 구현)이 필요합니다.
- 예를 들어, `React`에서는 `useState`를 활용하여 텍스트를 동적으로 업데이트하는 방식을 사용할 수 있습니다.

### **처리 속도와 사용자 경험의 균형 유지**
- 너무 빠른 Streaming은 오히려 가독성을 해칠 수 있습니다.
- 적절한 속도로 텍스트를 출력하는 기능을 추가하는 것이 좋습니다. 예를 들어, 일정 간격(delay)을 두고 출력을 할 수도 있습니다.

## **7. 마무리 및 요약**

| 비교 항목 | 일반적인 invoke() 방식 | Streaming 방식 |
|-----------|--------------------|--------------|
| 응답 방식 | 전체 문장을 생성 후 출력 | 한 단어(토큰)씩 실시간 출력 |
| 응답 속도 | 문장 전체가 생성될 때까지 기다려야 함 | 즉각적인 출력으로 대기 시간을 단축 |
| UX 향상 | 응답이 늦어 답답할 수 있음 | 더 자연스럽고 실시간 대화처럼 보임 |
| API 비용 | 한 번의 API 호출로 해결 | 여러 개의 API 호출 발생 가능 |

Streaming 기능을 활용하면 챗봇의 응답이 훨씬 자연스러워지고, 사용자 경험이 개선됩니다. 특히, **실시간 상호작용이 중요한 챗봇**에서는 필수적인 기능이 될 수 있습니다.

