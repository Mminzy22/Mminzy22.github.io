---
title: "LangChain과 LLM의 기본 개념 - 특강1"
author: mminzy22
date: 2025-02-14 09:00:00 +0900
categories: [Machine Learning, Deep Learning, LLM]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, AI, TIL]
description: "LangChain을 사용하여 대규모 언어 모델(LLM) 애플리케이션을 쉽게 개발하는 방법을 소개합니다. 환경 설정, 설치, 간단한 예제를 통해 LangChain의 기본 개념을 이해할 수 있습니다."
pin: false
math: true
---


## 1. LangChain이란?

LangChain은 **대규모 언어 모델(LLM)을 활용한 애플리케이션을 쉽게 개발할 수 있도록 도와주는 라이브러리**입니다. 이를 통해 프롬프트를 체계적으로 관리하고, LLM과의 상호작용을 효율적으로 수행할 수 있습니다.

기본적으로 LangChain은 **체인(Chain)** 개념을 활용하여 다양한 프롬프트, 모델, 출력을 연결할 수 있도록 설계되었습니다. 즉, LangChain을 사용하면 단순한 LLM 호출뿐만 아니라, 보다 정교한 템플릿 기반 질의응답 시스템이나 챗봇을 쉽게 구현할 수 있습니다.

## 2. 환경 설정 및 설치

LangChain을 사용하기 위해서는 먼저 필요한 패키지를 설치해야 합니다. OpenAI의 API를 사용하기 위해 아래 명령어를 실행합니다.

```bash
!pip install langchain-openai
!pip install tiktoken
```

설치가 완료되었으면 OpenAI API 키를 환경 변수에 설정합니다.

```python
import os
import getpass

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

이제 OpenAI의 LLM을 활용할 준비가 완료되었습니다.

## 3. LLM을 활용한 간단한 예제

LangChain에서 가장 기본적인 요소는 **프롬프트(Prompt)와 LLM**입니다. 프롬프트를 정의하고, 이를 LLM에 입력하면 응답을 받을 수 있습니다.

```python
from langchain_openai import ChatOpenAI

# LLM 모델 생성
model = ChatOpenAI(model="gpt-4o-mini")

# 프롬프트 정의
prompt = "말티즈들의 고향은 어디야?"

# 모델 실행
answer = model.invoke(prompt)
print(answer)
```

### 실행 결과

위 코드에서는 `ChatOpenAI` 클래스를 사용하여 OpenAI의 `gpt-4o-mini` 모델을 호출했습니다. `invoke()` 메서드를 이용해 프롬프트를 실행하고, 모델의 응답을 출력합니다.

이 방식은 기존에 우리가 OpenAI API를 호출하던 방식과 크게 다르지 않습니다. 하지만 LangChain을 활용하면 **프롬프트를 보다 정형화하고, 여러 개의 입력을 쉽게 관리할 수 있는 기능**을 사용할 수 있습니다.

이제 다음 단계로 넘어가서 **프롬프트를 효율적으로 관리하는 방법**에 대해 살펴보겠습니다.

