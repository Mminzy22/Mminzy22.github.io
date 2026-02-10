---
title: "LangGraph Durable Execution 개념과 사용 방법 정리"
author: mminzy22
date: 2026-02-10 10:45:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph의 Durable Execution 개념과 persistence, determinism, task 사용 방법 정리"
pin: false
mermaid: true
math: true
media_subpath: /assets/img/langgraph
---


# Durable execution

Durable execution은 프로세스나 워크플로우가 주요 시점마다 진행 상태를 저장하고, 중단되더라도 정확히 이전 위치에서 다시 재개할 수 있도록 하는 기법이다. 이 방식은 사용자가 중간에 개입해 상태를 확인·검증·수정하는 human-in-the-loop 시나리오나, 실행 시간이 길고 외부 요인(예: LLM 호출 타임아웃, 시스템 장애 등)으로 중단될 수 있는 작업에 특히 유용하다. 이미 완료된 작업 결과를 보존하기 때문에, 일정 시간이 지난 뒤(예: 일주일 후)에도 이전 단계를 다시 실행하지 않고 이어서 수행할 수 있다.

LangGraph는 내장 persistence 레이어를 통해 durable execution을 제공한다. 그래프 실행 과정의 각 단계 상태를 영속 저장소에 기록하며, 시스템 장애나 human-in-the-loop 인터럽트로 실행이 중단되더라도 마지막으로 기록된 상태에서 안전하게 재개할 수 있도록 보장한다.

> Tip
> LangGraph에서 checkpointer를 사용하고 있다면, 이미 durable execution은 활성화된 상태이다. 워크플로우는 언제든지 일시 중지 및 재개가 가능하다. 이 기능을 제대로 활용하려면 워크플로우를 deterministic하고 idempotent하게 설계해야 하며, 부수 효과나 비결정적 동작은 반드시 task로 감싸야 한다. task는 StateGraph(Graph API)와 Functional API 모두에서 사용할 수 있다.

## Requirements

LangGraph에서 durable execution을 활용하기 위해서는 다음 조건을 충족해야 한다.

1. persistence를 활성화해야 한다. 이를 위해 workflow 컴파일 시 checkpointer를 지정하여 실행 상태를 저장하도록 설정해야 한다.
2. 워크플로우 실행 시 thread identifier를 반드시 지정해야 한다. 이 식별자는 특정 실행 인스턴스의 히스토리를 추적하는 데 사용된다.
3. 랜덤 값 생성, 파일 쓰기, 외부 API 호출과 같은 비결정적이거나 부수 효과가 있는 연산은 반드시 task로 감싸야 한다. 그래야 재개 시 동일한 실행에 대해 중복 실행되지 않고 persistence 레이어에 저장된 결과를 재사용할 수 있다.

## Determinism and consistent replay

워크플로우를 재개할 때, 실행은 중단된 코드의 정확한 라인에서 이어지는 것이 아니다. 대신 LangGraph는 적절한 시작 지점을 판단하고, 해당 지점부터 중단 지점까지의 과정을 다시 replay한다. 이 때문에 워크플로우는 항상 동일한 입력과 동일한 결과를 보장하도록 설계되어야 한다.

따라서 비결정적 연산이나 부수 효과를 가지는 코드는 반드시 task 또는 node 단위로 감싸야 한다. 이렇게 하면 재실행 시 동일한 결과를 재현할 수 있다.

다음은 일관된 replay를 보장하기 위한 가이드라인이다.

* 반복 작업 방지: 하나의 node 안에 여러 부수 효과 연산이 있다면, 각각을 별도의 task로 분리하는 것이 좋다. 그래야 재개 시 중복 실행을 방지할 수 있다.
* 비결정적 연산 캡슐화: 랜덤 값 생성과 같이 실행 시마다 결과가 달라질 수 있는 코드는 반드시 task 또는 node로 감싼다.
* Idempotent 설계: API 호출이나 데이터 쓰기 작업은 가능하면 멱등성을 보장해야 한다. task 실행 도중 실패가 발생해 재시도가 이루어지더라도 동일한 결과를 유지하도록 키를 사용하거나 기존 결과를 확인하는 방식이 필요하다.

이러한 원칙은 Functional API의 Common Pitfalls 섹션과 StateGraph(Graph API) 전반에 동일하게 적용된다.

## Durability modes

LangGraph는 성능과 데이터 안정성의 균형을 위해 세 가지 durability 모드를 제공한다. 실행 시 graph 호출 옵션으로 durability 모드를 지정할 수 있다.

```python
graph.stream(
    {"input": "test"},
    durability="sync"
)
```

각 모드는 다음과 같다.

* "exit": 그래프 실행이 정상 종료되거나 오류 또는 human-in-the-loop 인터럽트로 종료될 때만 상태를 저장한다. 성능은 가장 좋지만, 실행 중 시스템 장애가 발생하면 중간 상태 복구는 불가능하다.
* "async": 다음 스텝이 실행되는 동안 비동기로 상태를 저장한다. 성능과 안정성의 균형이 좋지만, 실행 중 프로세스가 강제 종료되면 체크포인트가 누락될 수 있다.
* "sync": 다음 스텝으로 넘어가기 전에 반드시 상태를 동기적으로 저장한다. 가장 높은 내구성을 제공하지만 성능 오버헤드가 발생한다.

## Using tasks in nodes

하나의 node 안에 여러 연산이 포함된 경우, 각 연산을 개별 node로 나누는 대신 task로 분리하는 것이 더 간단한 경우가 많다.

아래 예시는 API 호출이라는 부수 효과 연산을 task로 감싸지 않은 경우와, task로 분리한 경우를 비교한 것이다.

### Original

```python
from typing import NotRequired
from typing_extensions import TypedDict
import uuid

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, END
import requests

class State(TypedDict):
    url: str
    result: NotRequired[str]

def call_api(state: State):
    result = requests.get(state['url']).text[:100]
    return {"result": result}

builder = StateGraph(State)
builder.add_node("call_api", call_api)
builder.add_edge(START, "call_api")
builder.add_edge("call_api", END)

checkpointer = InMemorySaver()
graph = builder.compile(checkpointer=checkpointer)

thread_id = uuid.uuid4()
config = {"configurable": {"thread_id": thread_id}}

graph.invoke({"url": "https://www.example.com"}, config)
```

### With task

```python
from typing import NotRequired
from typing_extensions import TypedDict
import uuid

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import task
from langgraph.graph import StateGraph, START, END
import requests

class State(TypedDict):
    urls: list[str]
    result: NotRequired[list[str]]

@task
def _make_request(url: str):
    return requests.get(url).text[:100]

def call_api(state: State):
    requests_ = [_make_request(url) for url in state['urls']]
    results = [req.result() for req in requests_]
    return {"results": results}

builder = StateGraph(State)
builder.add_node("call_api", call_api)
builder.add_edge(START, "call_api")
builder.add_edge("call_api", END)

checkpointer = InMemorySaver()
graph = builder.compile(checkpointer=checkpointer)

thread_id = uuid.uuid4()
config = {"configurable": {"thread_id": thread_id}}

graph.invoke({"urls": ["https://www.example.com"]}, config)
```

## Resuming workflows

Durable execution을 활성화한 이후에는 다음과 같은 시나리오에서 워크플로우를 재개할 수 있다.

* 일시 중지 및 재개: interrupt 함수로 실행을 중단하고, Command를 통해 업데이트된 상태와 함께 재개할 수 있다.
* 장애 복구: 동일한 thread identifier를 사용하여 입력값을 None으로 실행하면, 마지막 성공 지점부터 자동으로 재개된다.

## Starting points for resuming workflows

워크플로우 재개 시 시작 지점은 사용 중인 API 유형에 따라 다르다.

* StateGraph(Graph API)를 사용하는 경우, 실행이 중단된 node의 시작 지점부터 다시 실행된다.
* node 내부에서 subgraph를 호출하다 중단된 경우, 상위 node가 시작 지점이 되며, subgraph 내부에서는 중단된 node부터 재개된다.
* Functional API를 사용하는 경우, entrypoint 함수의 시작 지점이 재개 위치가 된다.

