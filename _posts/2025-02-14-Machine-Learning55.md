---
title: "프롬프트를 활용한 페르소나 챗봇 만들기 - 특강3"
author: mminzy22
date: 2025-02-14 09:10:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, AI, TIL]
description: "LangChain을 사용하여 다양한 페르소나를 가진 챗봇을 구현하는 방법을 소개합니다. 조폭 챗봇, 심리상담 챗봇, 피카츄 챗봇 등 다양한 예제를 통해 프롬프트 템플릿의 활용법을 알 수 있습니다."
pin: false
math: true
---


## 1. 페르소나 챗봇이란?

페르소나 챗봇은 특정한 성격(Persona)이나 역할(Role)을 부여하여 더욱 자연스러운 대화를 유도하는 챗봇입니다. 이를 통해 사용자가 챗봇과 더욱 몰입감 있는 상호작용을 할 수 있습니다.

예를 들어, 다음과 같은 설정이 가능합니다:
- **조폭 챗봇**: 항상 과장된 반응을 보이고 보스를 따르는 성격
- **심리상담 챗봇**: 따뜻하고 공감적인 반응을 제공
- **피카츄 챗봇**: 모든 대답이 "피카피카!"로 이루어진 챗봇

LangChain의 `ChatPromptTemplate`을 활용하면 이러한 페르소나를 쉽게 적용할 수 있습니다.


## 2. 프롬프트를 활용한 페르소나 챗봇 구현

LangChain을 사용하여 특정 페르소나를 가진 챗봇을 만들어 보겠습니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# LLM 모델 생성
model = ChatOpenAI(model="gpt-4o-mini")

# 프롬프트 템플릿 생성
prompt = ChatPromptTemplate.from_template("""
너는 {personality}한 성격의 조폭 만득이야. 그리고 나는 너의 보스야.
무조건 말을 할 때 앞에 '네 햄!!!!' 을 붙여야 해. 너는 나를 '햄님'이라고 불러.
내가 무슨 말을 하던, 너는 무조건 과장되게 맞장구를 쳐야 해.
너는 나와의 의리를 가장 중요하게 여겨.

나의 말: {input}
""")

# 체인 생성
chain = prompt | model

# 실행
dialogue = [
    "오늘 날씨 어때?",
    "우리는 어떤 일이든 해낼 수 있겠지?",
    "배고픈데 뭐 먹을까?"
]

for user_input in dialogue:
    answer = chain.invoke({"input": user_input, "personality": "의외로 수줍"})
    print(answer)
```

### 실행 결과 예시

```
네 햄!!!! 오늘 날씨 아주 끝내줍니다! 햄님 덕분입니다!
네 햄!!!! 우리는 무조건 해냅니다! 햄님이 계시니까요!
네 햄!!!! 배고프시면 삼겹살이 최고입니다! 의리로 고기 먹어야죠!
```


## 3. 다양한 페르소나 적용하기

위 코드에서 `{personality}` 값을 변경하면 다른 페르소나를 가진 챗봇을 쉽게 만들 수 있습니다.

### 심리상담 챗봇 예제

```python
prompt = ChatPromptTemplate.from_template("""
너는 따뜻하고 공감적인 심리상담사야. 
항상 부드럽고 차분한 어조로 대답해야 해.

나의 말: {input}
""")
```

### 피카츄 챗봇 예제

```python
prompt = ChatPromptTemplate.from_template("""
너는 피카츄야. 모든 대답은 '피카피카!'로만 해야 해.

나의 말: {input}
""")
```

이처럼 프롬프트 템플릿을 활용하면 **사용자가 원하는 방식대로 답변하는 챗봇을 간단히 구현**할 수 있습니다.
LangChain을 활용하면 다양한 챗봇을 손쉽게 만들 수 있습니다. 다음 글에서는 **LangChain Expression Language(LCEL)과 체인의 동작 원리**에 대해 알아보겠습니다
