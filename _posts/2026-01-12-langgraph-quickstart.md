---
title: "LangGraph Quickstart"
author: mminzy22
date: 2026-01-12 20:57:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph 공식 문서 Quickstart를 기반으로 Graph API와 Functional API를 사용해 계산기 에이전트를 만드는 과정 정리"
pin: false
mermaid: true
math: true
---


## Quickstart 개요


LangGraph Quickstart는 **계산기 에이전트(calculator agent)** 를 예제로 하여, LangGraph에서 에이전트를 구성하는 두 가지 방식을 비교한다.

- **Graph API**: 노드(node)와 엣지(edge)를 명시적으로 정의하여 에이전트를 그래프로 구성하는 방식이다.
- **Functional API**: 하나의 함수 안에서 일반적인 제어 흐름(조건문, 반복문)으로 에이전트를 정의하는 방식이다.

두 방식 모두 동일한 문제를 해결하지만, **에이전트의 흐름을 어떻게 표현할 것인가**에 따라 선택지가 달라진다.


이 예제를 실행하려면 Anthropic의 Claude 모델을 사용하기 위한 API 키가 필요하다. 로컬 환경에 `ANTHROPIC_API_KEY` 환경 변수를 먼저 설정해야 한다.


---


## Graph API로 계산기 에이전트 만들기


### 1. 모델과 도구 정의


먼저 LLM 모델과 에이전트가 사용할 도구를 정의한다. 여기서는 덧셈, 곱셈, 나눗셈을 수행하는 간단한 수학 도구를 만든다.


```python
from langchain.tools import tool
from langchain.chat_models import init_chat_model

model = init_chat_model(
    "claude-sonnet-4-5-20250929",
    temperature=0
)

@tool
def add(a: int, b: int) -> int:
    return a + b

@tool
def multiply(a: int, b: int) -> int:
    return a * b

@tool
def divide(a: int, b: int) -> float:
    return a / b

# LLM에 도구 바인딩
tools = [add, multiply, divide]
tools_by_name = {tool.name: tool for tool in tools}
model_with_tools = model.bind_tools(tools)
```


이 단계에서 중요한 점은 **LLM이 직접 계산하지 않고, 필요할 때 도구를 호출하도록 유도**한다는 점이다.


---


### 2. 상태(State) 정의


Graph API에서는 에이전트가 실행되는 동안 유지되는 상태를 명시적으로 정의한다.


```python
from langchain.messages import AnyMessage
from typing_extensions import TypedDict, Annotated
import operator

class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    llm_calls: int
```


`messages`는 대화 이력을 누적 저장하고, `llm_calls`는 LLM이 몇 번 호출되었는지를 기록한다. `Annotated`와 `operator.add`를 사용해 메시지가 덮어쓰기되지 않고 **누적**되도록 한다.


---


### 3. LLM 노드 정의


LLM 노드는 현재 상태의 메시지를 기반으로 다음 행동을 결정한다. 계산이 필요하면 도구 호출을 포함한 응답을 반환한다.


```python
from langchain.messages import SystemMessage

def llm_call(state: dict):
    return {
        "messages": [
            model_with_tools.invoke(
                [
                    SystemMessage(
                        content="You are a helpful assistant tasked with performing arithmetic on a set of inputs."
                    )
                ] + state["messages"]
            )
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }
```


---


### 4. 도구 노드 정의


도구 노드는 LLM이 요청한 tool call을 실제로 실행하고, 그 결과를 메시지로 반환한다.


```python
from langchain.messages import ToolMessage

def tool_node(state: dict):
    result = []
    for tool_call in state["messages"][-1].tool_calls:
        tool = tools_by_name[tool_call["name"]]
        observation = tool.invoke(tool_call["args"])
        result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
    return {"messages": result}
```


---


### 5. 종료 조건 정의


조건부 엣지를 사용해, LLM이 도구 호출을 했는지 여부에 따라 다음 노드를 결정한다.


```python
from typing import Literal
from langgraph.graph import END

def should_continue(state: MessagesState) -> Literal["tool_node", END]:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tool_node"
    return END
```


---


### 6. 그래프 구성 및 실행


마지막으로 노드와 엣지를 연결해 그래프를 만들고 컴파일한다.


```python
from langgraph.graph import StateGraph, START

builder = StateGraph(MessagesState)
builder.add_node("llm_call", llm_call)
builder.add_node("tool_node", tool_node)

builder.add_edge(START, "llm_call")
builder.add_conditional_edges(
    "llm_call",
    should_continue,
    ["tool_node", END]
)
builder.add_edge("tool_node", "llm_call")

agent = builder.compile()
```


이 구조는 **LLM → 도구 → LLM** 형태의 반복 루프를 명확한 그래프로 표현한다.


---


## Functional API로 계산기 에이전트 만들기


Functional API는 동일한 로직을 **단일 함수** 안에서 자연스러운 파이썬 제어 흐름으로 표현한다.


### 1. 작업(Task) 정의


`@task` 데코레이터를 사용해 LLM 호출과 도구 호출을 작업 단위로 정의한다.


```python
from langgraph.func import task
from langchain.messages import SystemMessage

@task
def call_llm(messages):
    return model_with_tools.invoke(
        [SystemMessage(content="You are a helpful assistant tasked with performing arithmetic on a set of inputs.")]
        + messages
    )
```


```python
from langchain.messages import ToolCall

@task
def call_tool(tool_call: ToolCall):
    tool = tools_by_name[tool_call["name"]]
    return tool.invoke(tool_call)
```


---


### 2. 에이전트 엔트리포인트 정의


`@entrypoint` 함수 안에서 while 루프와 조건문을 사용해 에이전트의 실행 흐름을 정의한다.


```python
from langgraph.func import entrypoint
from langgraph.graph import add_messages

@entrypoint()
def agent(messages):
    model_response = call_llm(messages).result()

    while model_response.tool_calls:
        tool_futures = [call_tool(tc) for tc in model_response.tool_calls]
        tool_results = [f.result() for f in tool_futures]
        messages = add_messages(messages, [model_response, *tool_results])
        model_response = call_llm(messages).result()

    messages = add_messages(messages, model_response)
    return messages
```


Graph API와 달리, 노드·엣지를 명시적으로 선언하지 않고도 동일한 반복 구조를 표현할 수 있다.


---


## Graph API와 Functional API 비교

- **Graph API**는 실행 흐름을 시각화하고, 상태 전이를 명확히 제어해야 하는 경우에 적합하다.
- **Functional API**는 파이썬 코드 흐름 그대로 에이전트를 작성하고 싶을 때 적합하다.

둘 중 어느 쪽이 더 낫다기보다는, **에이전트의 복잡도와 팀의 개발 스타일**에 따라 선택하는 것이 바람직하다.


## 마무리


Quickstart 예제는 LangGraph의 핵심 개념인 **상태 관리, 도구 호출, 반복 실행**을 가장 단순한 형태로 보여준다. 이 구조를 이해하면 이후 더 복잡한 워크플로우나 장시간 실행되는 에이전트로 확장하기가 수월해진다.

