---
title: "LangChain에서 Tools와 Agents 활용하기 - part.4"
author: mminzy22
date: 2025-02-24 20:00:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, Tools, Agents, AI, TIL]
description: "LangChain에서 Tools와 Agents를 활용하여 LLM을 더욱 강력하게 활용하는 방법을 소개합니다."
pin: false
math: true
---


## 1. Tools와 Agents 개요

LangChain에서 **Tools(도구)**는 LLM이 특정 작업을 수행할 수 있도록 돕는 기능이며, **Agents(에이전트)**는 사용자의 요청을 분석하고 필요한 도구를 선택하여 실행하는 시스템입니다. 

LLM은 단순한 질의응답을 넘어 실제 기능을 수행할 수 있도록 도구와 연계되며, 이를 통해 검색, 계산, 데이터 조회 등의 작업을 수행할 수 있습니다.

### 주요 개념

- **Tools**: 계산기, 검색 API, 데이터베이스 조회 등 특정 기능을 수행하는 도구.
- **Agents**: 주어진 질문을 분석하여 적절한 도구를 선택하고 실행하는 역할.
- **ReAct 원리**: LLM이 문제를 분석하고 필요한 도구를 실행하는 방식. (Reasoning + Acting)

Agents는 Tools를 활용하여 복잡한 문제를 해결하며, 단순한 질문 응답에서 벗어나 실제 작업을 수행할 수 있도록 합니다.

---

## 2. LangChain에서 Tools 활용하기

LangChain에서는 다양한 **내장 도구**를 제공하며, 필요에 따라 커스텀 도구도 만들 수 있습니다.

### 2.1 기본적인 Tool 사용 예제

Tools는 특정 기능을 수행하는 함수로 정의되며, `Tool` 클래스를 사용하여 LangChain에서 활용할 수 있습니다.

```python
from langchain.tools import Tool

def my_calculator(query):
    return eval(query)  # 문자열 연산을 수행하여 계산 결과 반환

calc_tool = Tool(
    name="Calculator",
    func=my_calculator,
    description="간단한 수학 연산을 수행합니다."
)

print(calc_tool.run("3 + 5 * 2"))  # 13 출력
```

### 2.2 Tavily 검색 API 활용 예제

LangChain에서 제공하는 검색 도구를 활용하여 웹에서 최신 정보를 가져올 수 있습니다.

```python
from langchain_community.tools import TavilySearchResults

search_tool = TavilySearchResults(max_results=1)
result = search_tool.run("2024년 올림픽 개최지는 어디인가?")
print(result)
```

이러한 Tools를 조합하여 복합적인 작업을 수행할 수 있습니다.

---

## 3. LangChain에서 Agents 활용하기

Agents는 **LLM이 사용자의 요청을 분석하여 적절한 도구를 선택하고 실행**하는 방식으로 동작합니다.

### 3.1 기본적인 Agent 실행 예제

`initialize_agent`를 사용하여 에이전트를 설정하고, 다양한 Tools를 연동할 수 있습니다.

```python
from langchain.agents import initialize_agent, AgentType
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model_name="gpt-4o-mini")

agent = initialize_agent(
    tools=[search_tool, calc_tool],
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

response = agent.invoke("100의 제곱근을 구하고, 2024년 올림픽 개최지도 알려줘.")
print(response)
```

위 코드에서는 `calc_tool`과 `search_tool`을 활용하여 수학 연산과 정보 검색을 동시에 수행할 수 있습니다.

### 3.2 에이전트 동작 방식 (ReAct 원리)

LangChain의 에이전트는 **ReAct(Reasoning + Acting) 원리**를 기반으로 동작합니다.

1. LLM이 입력을 분석하여 문제를 이해.
2. 해결에 필요한 도구를 결정.
3. 도구를 실행하여 결과를 얻고 최종 답변 반환.

예를 들어, 사용자가 "100의 제곱근을 구하고 2024년 올림픽 개최지를 알려줘"라고 입력하면:
- LLM은 먼저 "100의 제곱근을 구하는 것이 필요하다"고 판단하여 `calc_tool`을 실행.
- 이후 "올림픽 개최지를 찾으려면 검색이 필요하다"고 판단하여 `search_tool`을 실행.
- 각 결과를 조합하여 최종 응답을 생성.

이를 통해 LLM이 단순 질의응답을 넘어서서 **실제 작업을 수행**할 수 있습니다.

---

## 4. Custom Tool과 API 연동하기

LangChain에서는 커스텀 API를 활용한 Tool도 쉽게 만들 수 있습니다.

### 4.1 외부 API를 활용한 날씨 정보 제공 도구

```python
import requests
from langchain.tools import Tool

def weather_api(query):
    response = requests.get(f"https://api.weatherapi.com/v1/current.json?key=API_KEY&q={query}")
    return response.json()["current"]["condition"]["text"]

weather_tool = Tool(
    name="Weather",
    func=weather_api,
    description="실시간 날씨 정보를 제공합니다."
)
```

위 `weather_tool`을 에이전트와 함께 사용하면, LLM이 필요할 때 자동으로 API를 호출하여 최신 날씨 정보를 제공할 수 있습니다.

### 4.2 Custom Tool을 Agents와 함께 사용하기

```python
agent = initialize_agent(
    tools=[weather_tool, search_tool, calc_tool],
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

response = agent.invoke("서울의 날씨가 어때? 그리고 2024년 올림픽 개최지도 알려줘.")
print(response)
```

이제 에이전트는 사용자 질문에 맞춰 적절한 도구를 선택하고 실행할 수 있습니다.

---

## 5. 결론

LangChain의 Tools와 Agents를 활용하면 LLM이 단순한 질의응답을 넘어 **실제 기능을 수행**할 수 있습니다. 

- **Tools**: 특정 기능을 수행하는 도구 (계산기, 검색, API 연동 등).
- **Agents**: 사용자의 요청을 분석하여 적절한 도구를 선택하고 실행하는 시스템.
- **ReAct 원리**: LLM이 논리적 사고를 기반으로 필요한 도구를 호출하고 결과를 반환.
- **Custom Tools**: API를 연동하여 날씨, 주식 정보, 데이터베이스 조회 등 다양한 기능 추가 가능.

이제 LangChain의 Agents와 Tools를 활용하여 더욱 강력한 대화형 AI 애플리케이션을 개발할 수 있습니다
