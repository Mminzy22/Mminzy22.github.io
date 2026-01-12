---
title: "LangGraph 개요 정리"
author: mminzy22
date: 2026-01-12 20:47:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph 공식 문서의 Overview를 기반 LangGraph의 개념, 목적, 핵심 장점 정리"
pin: false
mermaid: false
math: false
---


## LangGraph란 무엇인가


LangGraph는 복잡한 작업을 안정적으로 처리하는 **에이전트 오케스트레이션**을 목표로 설계된 저수준(low-level) 프레임워크이자 런타임이다. Klarna, Replit, Elastic 등 에이전트 기반 시스템을 실제 서비스에 적용하는 기업들이 사용하고 있으며, **장시간 실행되고 상태를 유지해야 하는 에이전트**를 구축·관리·배포하는 데 초점을 둔다.


LangGraph의 가장 큰 특징은 추상화를 최소화했다는 점이다. 프롬프트나 에이전트 아키텍처를 감싸서 제공하지 않고, 개발자가 **에이전트의 흐름과 상태 전이를 직접 제어**할 수 있도록 기반 인프라만 제공한다. 즉, “어떤 에이전트를 만들 것인가”보다는 “에이전트가 어떻게 실행되고 이어지는가”에 집중한 도구이다.


## LangGraph를 사용하기 전에 알면 좋은 것


LangGraph는 에이전트 오케스트레이션에만 집중한 프레임워크이기 때문에, 사용 전 다음과 같은 개념에 대한 이해가 권장된다.

- LLM 모델 개념과 호출 방식
- 툴(tool) 호출과 결과 처리 방식

공식 문서에서도 모델과 툴에 대한 이해를 선행 학습으로 권장하고 있다. LangGraph는 이를 직접 제공하지 않으며, 필요하다면 LangChain의 컴포넌트를 함께 사용하는 구조를 택한다.


다만 중요한 점은 **LangGraph가 LangChain에 종속적이지 않다**는 것이다. LangChain 없이도 단독으로 사용할 수 있으며, 반대로 에이전트에 처음 입문하거나 더 높은 수준의 추상화를 원한다면 LangChain의 에이전트 기능을 사용하는 편이 적합하다.


## LangGraph의 핵심 지향점


LangGraph는 에이전트 오케스트레이션에서 중요한 다음과 같은 역량에 집중한다.


### 1. Durable Execution


에이전트 실행이 중간에 실패하더라도 상태를 보존하고, **중단된 지점부터 다시 실행**할 수 있는 내구성 있는 실행 모델을 제공한다. 장시간 실행되는 워크플로우나 외부 시스템 의존성이 높은 에이전트에서 특히 중요하다.


### 2. Human-in-the-loop


필요한 시점에 사람의 개입을 허용한다. 에이전트의 상태를 확인하고 수정한 뒤 다시 실행을 이어갈 수 있어, 완전 자동화가 부담스러운 업무에도 활용 가능하다.


### 3. Comprehensive Memory


단기적인 작업 맥락을 유지하는 **작업 메모리**와, 세션을 넘어 지속되는 **장기 메모리**를 모두 고려한 상태 관리가 가능하다. 이는 단순 질의응답을 넘어선 “기억하는 에이전트” 구현의 기반이 된다.


### 4. Debugging 및 가시성


LangSmith와 연계하여 에이전트 실행 경로, 상태 변화, 런타임 메트릭을 시각적으로 추적할 수 있다. 복잡한 에이전트일수록 디버깅과 관측 가능성은 필수 요소이다.


### 5. 프로덕션 배포 친화성


상태를 가지는 장시간 워크플로우라는 특성을 고려한 배포 환경을 전제로 설계되었다. 이는 실험용 코드에 머무르지 않고 실제 서비스로 확장하기 위한 중요한 전제 조건이다.


## 설치 및 가장 단순한 예제


LangGraph는 Python 환경에서 다음과 같이 설치할 수 있다.


```bash
pip install -U langgraph
```


설치 후, 가장 단순한 “hello world” 수준의 그래프 예제는 다음과 같다.


```python
from langgraph.graph import StateGraph, MessagesState, START, END

def mock_llm(state: MessagesState):
    return {"messages": [{"role": "ai", "content": "hello world"}]}

graph = StateGraph(MessagesState)
graph.add_node(mock_llm)
graph.add_edge(START, "mock_llm")
graph.add_edge("mock_llm", END)
graph = graph.compile()

graph.invoke({"messages": [{"role": "user", "content": "hi!"}]})
```


이 예제에서 중요한 점은 LangGraph가 **노드(node)와 엣지(edge)**로 구성된 그래프 기반 실행 모델을 사용한다는 것이다. 각 노드는 하나의 작업 단위를 의미하고, 엣지는 실행 흐름을 정의한다. 에이전트는 이 그래프를 따라 상태를 전달받으며 실행된다.


## LangGraph 생태계


LangGraph는 단독으로도 사용 가능하지만, LangChain 생태계와 함께 사용할 때 더 큰 시너지를 낸다.

- LangChain: 모델·툴 통합 및 상위 수준 에이전트 추상화 제공
- LangSmith: 추적, 평가, 모니터링을 통한 관측 가능성 강화
- LangSmith Agent Server: 장시간 실행 에이전트 배포 및 확장 지원

이 조합은 **로컬 프로토타이핑 → 관측 가능한 운영 환경 → 프로덕션 배포**로 이어지는 흐름을 자연스럽게 만든다.


## 정리


LangGraph는 “에이전트를 쉽게 만드는 도구”라기보다, **에이전트를 제대로 운영하기 위한 기반 프레임워크**에 가깝다. 상태 관리, 실행 내구성, 사람 개입, 디버깅과 배포까지 고려한 구조는 복잡한 에이전트 시스템을 다루는 데 필수적인 요소이다.

