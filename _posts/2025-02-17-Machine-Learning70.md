---
title: "LangChain 에이전트 (Agent) 개념과 활용"
author: mminzy22
date: 2025-02-17 19:55:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, LangChain, AI, TIL]
description: "LangChain 에이전트의 개념, 동작 원리, 기본 구현 및 도구 활용 방법을 소개합니다. ReAct 원리를 기반으로 한 에이전트의 실행 방식을 설명하고, 다양한 예제를 통해 실습해봅니다."
pin: false
math: true
---


## **1. 에이전트(Agent)란?**

LangChain에서 **에이전트(Agent)** 는 사용자의 요청을 해석하고, 필요한 도구(Tool)를 선택하여 실행한 후, 최적의 응답을 생성하는 AI 시스템을 의미합니다. 단순한 프롬프트 기반 모델과 달리, **에이전트는 주어진 문제를 해결하기 위해 필요한 액션을 스스로 결정할 수 있습니다.**

### **에이전트의 특징**
- 사용자의 입력을 해석하고 **문제 해결을 위한 액션을 결정**
- 주어진 **도구(Tool)를 사용하여 정보 검색, 계산 등 복잡한 작업 수행**
- 필요할 경우, **여러 단계를 거쳐 최적의 결과 도출** (예: 검색 후 데이터 분석)

## **2. LangChain 에이전트의 동작 원리**

LangChain 에이전트는 다음과 같은 단계를 거쳐 동작합니다:
1. **사용자 입력을 분석** → 사용자가 원하는 정보를 파악
2. **필요한 도구 선택** → 검색, 계산, API 호출 등 적절한 도구를 실행
3. **도구 실행 및 결과 획득** → 예: 검색 결과를 가져오거나 수학 연산 수행
4. **결과 정리 및 응답 반환** → 최종 응답을 구성하여 사용자에게 전달

이제 이러한 기능을 실제 코드로 구현해보겠습니다.


## **3. LangChain 에이전트 기본 구현**

LangChain에서는 다양한 **에이전트 유형**을 제공하지만, 가장 기본적인 `AgentType.ZERO_SHOT_REACT_DESCRIPTION`를 사용하여 에이전트를 생성할 수 있습니다.

### **기본적인 에이전트 예제**

```python
from langchain.agents import initialize_agent, AgentType
from langchain_community.tools import TavilySearchResults
from langchain_openai import ChatOpenAI

# LLM 모델 로드
llm = ChatOpenAI(model_name="gpt-4o-mini")

# 사용할 도구(Tool) 정의
search_tool = TavilySearchResults(max_results=1)

tools = [search_tool]

# 에이전트 초기화
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 에이전트 실행
response = agent.invoke("2023년 오스카 수상자는 누구야?")
print(response)
```

**설명:**
- `initialize_agent()`를 사용하여 LLM과 도구를 결합하여 에이전트 생성
- `TavilySearchResults`를 통해 인터넷 검색 기능 추가
- 사용자의 질문에 따라 필요한 정보를 검색하고 결과를 제공


## **4. 도구(Tool)를 활용한 에이전트 구성**

에이전트는 다양한 도구(Tool)를 사용하여 더욱 강력한 기능을 수행할 수 있습니다.

### **LangChain에서 지원하는 주요 도구**

| 도구 이름 | 설명 |
|-----------|------------------------------|
| `SerpAPIWrapper` | Google 검색 API를 통한 정보 검색 |
| `TavilySearchResults` | Tavily 검색 API를 통한 정보 검색 |
| `LLMMathChain` | 수학 계산 수행 |
| `PythonREPLTool` | Python 코드를 실행하여 결과 반환 |
| `WikipediaAPIWrapper` | 위키백과에서 정보 검색 |

### **도구를 활용한 에이전트 예제**

아래 코드는 검색 기능과 수학 연산 기능을 모두 포함한 에이전트를 구현하는 예제입니다.

```python
from langchain.agents import initialize_agent, AgentType
from langchain_community.tools import TavilySearchResults, LLMMathChain
from langchain_openai import ChatOpenAI

# LLM 모델
llm = ChatOpenAI(model_name="gpt-4o-mini")

# 검색 도구 및 수학 계산 도구 추가
tools = [
    TavilySearchResults(max_results=1),
    LLMMathChain(llm=llm)
]

# 에이전트 초기화
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 에이전트 실행
response = agent.invoke("100의 제곱근을 구하고, 2023년 오스카 수상자도 알려줘.")
print(response)
```

**설명:**
- 검색과 수학 연산을 동시에 수행하는 에이전트를 생성
- `TavilySearchResults`를 통해 인터넷 검색 수행
- `LLMMathChain`을 사용하여 수학 연산 수행


## **5. Agent의 실행 방식: ReAct 원리**

LangChain 에이전트는 Google Brain 연구팀이 발표한 **ReAct (Reasoning + Acting) 방식**을 사용하여 실행됩니다.

### **ReAct 실행 방식**
1. **LLM이 질문을 분석하고 필요한 액션을 결정**
2. **필요한 도구를 실행하여 데이터를 가져옴**
3. **획득한 데이터를 바탕으로 최종 응답을 생성**

### **ReAct 방식 예제 (추론 + 액션)**

```
사용자 입력: "100의 제곱근을 구하고, 2023년 오스카 수상자도 알려줘."

1. [추론] 수학 연산이 필요함 → LLMMathChain 실행
2. [액션] 100의 제곱근을 계산 → 결과: 10
3. [추론] 최신 정보를 검색해야 함 → TavilySearchResults 실행
4. [액션] 검색 API를 통해 2023 오스카 수상자 정보 획득
5. [응답] "100의 제곱근은 10이고, 2023년 오스카 수상자는 X입니다."
```

이 방식은 **단순한 LLM 응답 방식보다 훨씬 정교한 답변을 생성할 수 있도록 해줍니다.**


## **6. 마무리 및 요약**

| 개념 | 설명 |
|------|--------------------------|
| **Agent** | 사용자의 요청을 분석하고 도구를 활용하여 답변을 생성하는 AI 시스템 |
| **Tools** | 검색, 계산, API 호출 등 에이전트가 실행할 수 있는 기능 |
| **ReAct 원리** | LLM이 문제를 분석하고, 필요한 도구를 실행하여 최적의 답변을 생성하는 방식 |

**LangChain 에이전트 활용 시 기대 효과**
- 단순한 텍스트 응답을 넘어 다양한 기능을 수행하는 AI 구축 가능
- 검색, 계산, API 호출 등 실용적인 기능을 결합하여 더욱 강력한 챗봇 개발 가능
- 사용자 입력에 따라 최적의 해결 방법을 찾아주는 AI 시스템 구축 가능
