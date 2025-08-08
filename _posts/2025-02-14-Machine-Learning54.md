---
title: "프롬프트 템플릿 활용하기 (ChatPromptTemplate) - 특강2"
author: mminzy22
date: 2025-02-14 09:05:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, AI, TIL]
description: "LangChain의 ChatPromptTemplate 클래스를 사용하여 프롬프트를 템플릿화하는 방법과 이를 통해 효율적으로 LLM과 상호작용하는 방법을 다룹니다."
pin: false
math: true
---


## 1. 왜 프롬프트를 템플릿으로 만들어야 할까?

프롬프트를 활용할 때 동일한 패턴의 질문을 반복적으로 입력해야 하는 경우가 많습니다. 예를 들어, 다양한 강아지 품종의 고향을 알고 싶을 때 아래와 같은 질문을 여러 번 해야 합니다.

```
"말티즈들의 고향은 어디야?"
"리트리버들의 고향은 어디야?"
"시츄들의 고향은 어디야?"
```

매번 전체 문장을 직접 입력하는 것은 비효율적이며, 실수를 유발할 가능성도 있습니다. 따라서 **프롬프트 템플릿**을 활용하여 특정 변수만 바꿔서 사용할 수 있도록 하면 편리합니다.

## 2. ChatPromptTemplate을 활용한 템플릿 생성

LangChain에서는 `ChatPromptTemplate` 클래스를 사용하여 프롬프트를 템플릿화할 수 있습니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# LLM 모델 생성
model = ChatOpenAI(model="gpt-4o-mini")

# 프롬프트 템플릿 생성
prompt = ChatPromptTemplate.from_template("{dog_breeds_input}들의 고향은 어디야?")

# 체인 생성
chain = prompt | model

# 체인 실행
dog_breeds = ["말티즈", "골든리트리버", "시츄"]
for breed in dog_breeds:
    answer = chain.invoke({"dog_breeds_input": breed})
    print(answer)
```

위 코드를 실행하면 `dog_breeds_input` 변수에 따라 템플릿이 자동으로 업데이트됩니다.

## 3. 템플릿을 활용한 자동화된 질의응답

프롬프트 템플릿을 사용하면 **질문 패턴을 유지하면서 다양한 입력을 쉽게 적용**할 수 있습니다. 이를 통해 **재사용성이 높아지고 유지보수가 용이**해집니다.

### 실행 결과

```
말티즈들의 고향은 어디야? → 답변 출력
골든리트리버들의 고향은 어디야? → 답변 출력
시츄들의 고향은 어디야? → 답변 출력
```

이제 우리는 프롬프트 템플릿을 활용하여 **더욱 효율적으로 LLM과 상호작용**할 수 있습니다. 다음 단계에서는 **프롬프트를 활용하여 챗봇에 페르소나를 부여하는 방법**을 살펴보겠습니다

