---
title: "LangGraph를 활용한 복잡한 AI 워크플로우 구축 - part.8"
author: mminzy22
date: 2025-02-26 20:00:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, AI, TIL]
description: "LangGraph를 활용하여 복잡한 AI 워크플로우를 설계하고 실행하는 방법을 소개합니다."
pin: false
math: true
---


# LangGraph: LangChain 기반 AI 워크플로우 설계

LangGraph는 **LangChain의 고급 기능 중 하나로, 멀티스텝 AI 워크플로우를 설계하고 실행할 수 있는 프레임워크**입니다. 기존 LangChain 체인(Chains)보다 **더 복잡한 흐름을 설계할 수 있으며, 비동기 실행 및 조건부 분기 처리**를 지원하여 AI 시스템을 더욱 정교하게 구축할 수 있습니다.

---

## 1. LangGraph의 주요 특징

LangGraph는 **노드(Node) 기반의 워크플로우 프레임워크**로, AI 시스템을 보다 유연하고 확장 가능하게 만듭니다.

### 주요 기능

- **노드(Node) 기반의 워크플로우 설계** → 기능별 모듈화로 유지보수 용이
- **조건부 분기 처리(Dynamic Routing) 및 상태 유지(State Management)** → 데이터 흐름을 동적으로 제어
- **비동기 실행(Async Execution)** → 성능 최적화 및 응답 시간 단축
- **복잡한 AI 애플리케이션 구축 가능** → 챗봇, RAG 검색 시스템, 추천 엔진 등


---

## 2. LangGraph의 기본 개념

LangGraph에서는 AI 워크플로우를 **노드(Node)와 엣지(Edge)로 구성**하여 처리합니다.

### 🛠 핵심 개념

| 개념 | 설명 |
|------|------|
| **노드(Node)** | 데이터 처리의 기본 단위 (예: 텍스트 생성, API 호출, 데이터 검색) |
| **엣지(Edge)** | 노드 간의 연결 관계 (예: 특정 조건에 따라 다음 노드 실행) |
| **상태(State)** | 워크플로우 내에서 공유 및 업데이트되는 데이터 |


---

## 3. LangGraph 설치 및 환경 설정

LangGraph는 `pip`을 이용하여 LangChain과 함께 설치할 수 있습니다.

```bash
pip install langchain langgraph
```

설치 후, LangGraph를 활용하여 AI 워크플로우를 구성할 수 있습니다.


---

## 4. LangGraph 기본 예제: 간단한 워크플로우 구현

LangGraph를 이용하여 간단한 2단계 AI 워크플로우를 만들어보겠습니다.

### 예제: 간단한 단계별 실행

```python
from langgraph.graph import Graph
from langchain_openai import ChatOpenAI

# LangChain LLM 모델
llm = ChatOpenAI(model_name="gpt-4o-mini")

def step_1(state):
    return {"message": "첫 번째 단계 완료!"}

def step_2(state):
    return {"message": "두 번째 단계 완료!"}

# 그래프 생성
graph = Graph()
graph.add_node("step_1", step_1)
graph.add_node("step_2", step_2)
graph.add_edge("step_1", "step_2")

# 실행
graph.set_entry_point("step_1")
result = graph.invoke({})
print(result)
```

**출력:**

```json
{"message": "두 번째 단계 완료!"}
```

이처럼 LangGraph에서는 **단계를 노드로 정의하고, 노드 간 연결(Edge)을 설정하여 순차적 실행이 가능**합니다.


---

## 5. 조건부 분기 처리 (Dynamic Routing)

LangGraph는 입력값에 따라 다른 경로를 실행할 수 있도록 **조건부 분기 처리(Dynamic Routing)** 를 지원합니다.

### 예제: 입력값에 따라 다른 경로 실행

```python
def decision_node(state):
    if state["input"] == "A":
        return "step_A"
    else:
        return "step_B"

def step_A(state):
    return {"message": "A 경로 실행됨"}

def step_B(state):
    return {"message": "B 경로 실행됨"}

# 그래프 생성
graph = Graph()
graph.add_node("decision", decision_node)
graph.add_node("step_A", step_A)
graph.add_node("step_B", step_B)

graph.add_edge("decision", "step_A", condition=lambda state: state["input"] == "A")
graph.add_edge("decision", "step_B", condition=lambda state: state["input"] != "A")

graph.set_entry_point("decision")
result = graph.invoke({"input": "A"})
print(result)  # "A 경로 실행됨"
```

이 방식은 **AI 챗봇이 입력 질문에 따라 다른 응답을 제공**하거나, **데이터 분석 파이프라인에서 특정 조건에 따라 다른 분석 방법을 적용**하는 데 유용하게 활용될 수 있습니다.


---

## 6. 비동기 실행을 통한 성능 최적화

LangGraph는 `async` 기능을 활용하여 **비동기 실행(Async Execution)** 을 지원합니다. 이를 통해 대규모 데이터 처리나 네트워크 요청을 더욱 효율적으로 수행할 수 있습니다.

### 예제: 비동기 실행 적용

```python
import asyncio

def async_step(state):
    return asyncio.sleep(1, result={"message": "비동기 작업 완료"})

graph = Graph()
graph.add_node("async_step", async_step)
graph.set_entry_point("async_step")

result = asyncio.run(graph.invoke({}))
print(result)  # "비동기 작업 완료"
```

이처럼 **LangGraph를 활용하면 멀티스레딩과 유사한 방식으로 AI 프로세스를 최적화할 수 있습니다.**


---

## 7. 실제 서비스에서의 LangGraph 활용 사례

LangGraph는 다양한 AI 시스템에서 활용될 수 있습니다.

| 활용 사례 | 설명 |
|-----------|-------------------------------|
| **AI 챗봇** | 사용자 질문을 분석하고 적절한 응답을 생성 |
| **데이터 분석** | 실시간 데이터 수집 → 분석 → 보고서 생성 |
| **추천 시스템** | 사용자의 행동을 기반으로 맞춤 추천 제공 |
| **RAG 검색** | 문서 검색 → 요약 → 결과 제공 |


---

## 8. LangGraph를 활용한 AI 프로젝트 확장 방법

LangGraph는 **다양한 AI 기능과 결합하여 복잡한 AI 시스템을 구축하는 데 최적화**되어 있습니다.

### 확장 가능성

- **RAG 기반 검색 시스템**: 검색 엔진과 LangGraph를 연결하여 복합적인 검색 및 답변 시스템 구축
- **멀티모달 AI 응용**: 텍스트, 이미지, 음성 등 다양한 데이터 유형을 처리하는 AI 파이프라인 구성
- **고급 챗봇 개발**: OpenAI API와 연결하여 더 정교한 대화 흐름을 설계


---

## 결론

LangGraph는 **AI 시스템을 보다 정교하고 효율적으로 구축할 수 있는 강력한 프레임워크**입니다. 노드 기반의 유연한 워크플로우 설계, 조건부 분기, 비동기 실행 등의 기능을 통해 **더욱 복잡한 AI 애플리케이션을 손쉽게 개발할 수 있습니다.**
