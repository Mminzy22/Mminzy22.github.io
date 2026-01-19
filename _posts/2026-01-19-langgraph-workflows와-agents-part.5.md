---
title: "LangGraph Workflows와 Agents - part.5"
author: mminzy22
date: 2026-01-19 14:40:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph Agents 패턴 구조와 예제 정리"
pin: false
mermaid: true
math: true
media_subpath: /assets/img/langgraph
---


## Agents


Agents는 일반적으로 LLM이 [tools](https://docs.langchain.com/oss/python/langchain/tools)를 사용해 행동을 수행하는 구조로 구현된다. 에이전트는 **연속적인 피드백 루프** 안에서 동작하며, 문제와 해결 방법이 사전에 명확히 정의되지 않은 상황에서 사용된다. 워크플로우보다 높은 자율성을 가지며, 어떤 도구를 사용할지, 어떤 순서로 문제를 해결할지 스스로 판단한다.


다만 완전한 자유를 주는 것은 아니며, 사용할 수 있는 **도구 집합**과 **행동 가이드라인**은 여전히 개발자가 정의한다.


![agent](agent.avif)


### Tool 기반 Agent 예제


아래 예제는 간단한 산술 연산을 수행하는 에이전트를 정의한다. LLM은 입력을 보고 직접 답변할지, 아니면 도구를 호출할지 판단한다.


```python
from langchain.tools import tool


# Define tools
@tool
def multiply(a: int, b: int) -> int:
    """Multiply `a` and `b`."""
    return a * b


@tool
def add(a: int, b: int) -> int:
    """Adds `a` and `b`."""
    return a + b


@tool
def divide(a: int, b: int) -> float:
    """Divide `a` and `b`."""
    return a / b


# Augment the LLM with tools
tools = [add, multiply, divide]
tools_by_name = {tool.name: tool for tool in tools}
llm_with_tools = llm.bind_tools(tools)
```


### Graph API 기반 Agent


Graph API에서는 메시지 상태(MessagesState)를 중심으로 LLM 호출과 도구 실행을 반복하는 구조를 만든다. 아래 예시는 **노드 정의 → 조건부 라우팅(도구 실행 여부) → 그래프 컴파일 → 실행**까지 전체 흐름을 포함한다.


```python
from typing_extensions import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState
from langchain.messages import SystemMessage, HumanMessage, ToolMessage
from IPython.display import Image, display


# Nodes
def llm_call(state: MessagesState):
    """LLM decides whether to call a tool or not"""

    return {
        "messages": [
            llm_with_tools.invoke(
                [
                    SystemMessage(
                        content="You are a helpful assistant tasked with performing arithmetic on a set of inputs."
                    )
                ]
                + state["messages"]
            )
        ]
    }


def tool_node(state: dict):
    """Performs the tool call"""

    result = []
    for tool_call in state["messages"][-1].tool_calls:
        tool = tools_by_name[tool_call["name"]]
        observation = tool.invoke(tool_call["args"])
        result.append(ToolMessage(content=observation, tool_call_id=tool_call["id"]))
    return {"messages": result}


# Conditional edge function to route to the tool node or end based upon whether the LLM made a tool call
def should_continue(state: MessagesState) -> Literal["tool_node", END]:
    """Decide if we should continue the loop or stop based upon whether the LLM made a tool call"""

    messages = state["messages"]
    last_message = messages[-1]

    # If the LLM makes a tool call, then perform an action
    if last_message.tool_calls:
        return "tool_node"

    # Otherwise, we stop (reply to the user)
    return END


# Build workflow
agent_builder = StateGraph(MessagesState)

# Add nodes
agent_builder.add_node("llm_call", llm_call)
agent_builder.add_node("tool_node", tool_node)

# Add edges to connect nodes
agent_builder.add_edge(START, "llm_call")
agent_builder.add_conditional_edges(
    "llm_call",
    should_continue,
    ["tool_node", END]
)
agent_builder.add_edge("tool_node", "llm_call")

# Compile the agent
agent = agent_builder.compile()

# Show the agent
display(Image(agent.get_graph(xray=True).draw_mermaid_png()))

# Invoke
messages = [HumanMessage(content="Add 3 and 4.")]
messages = agent.invoke({"messages": messages})
for m in messages["messages"]:
    m.pretty_print()
```


이 예제의 핵심은 `should_continue()`이다. 마지막 메시지에 `tool_calls`가 존재하면 `tool_node`로 보내 도구를 실행하고, 그렇지 않으면 `END`로 종료한다. 즉, **LLM ↔ Tool 실행**을 필요할 때까지 반복하는 에이전트 루프를 그래프로 표현한 것이다.


### Functional API 기반 Agent


Functional API에서는 while 루프 형태로 동일한 패턴을 구현할 수 있다. 아래 코드는 **LLM 호출 → 도구 실행(병렬) → 메시지 누적(add_messages) → 다시 LLM 호출**을 반복한다.


```python
from langgraph.func import entrypoint, task
from langgraph.graph import add_messages
from langchain.messages import (
    SystemMessage,
    HumanMessage,
    ToolCall,
)
from langchain_core.messages import BaseMessage


@task
def call_llm(messages: list[BaseMessage]):
    """LLM decides whether to call a tool or not"""
    return llm_with_tools.invoke(
        [
            SystemMessage(
                content="You are a helpful assistant tasked with performing arithmetic on a set of inputs."
            )
        ]
        + messages
    )


@task
def call_tool(tool_call: ToolCall):
    """Performs the tool call"""
    tool = tools_by_name[tool_call["name"]]
    return tool.invoke(tool_call)


@entrypoint()
def agent(messages: list[BaseMessage]):
    llm_response = call_llm(messages).result()

    while True:
        if not llm_response.tool_calls:
            break

        # Execute tools
        tool_result_futures = [
            call_tool(tool_call) for tool_call in llm_response.tool_calls
        ]
        tool_results = [fut.result() for fut in tool_result_futures]
        messages = add_messages(messages, [llm_response, *tool_results])
        llm_response = call_llm(messages).result()

    messages = add_messages(messages, llm_response)
    return messages


# Invoke
messages = [HumanMessage(content="Add 3 and 4.")]
for chunk in agent.stream(messages, stream_mode="updates"):
    print(chunk)
    print("\\n")
```


이 방식은 코드 가독성이 높고, 단순한 에이전트 로직을 구현할 때 적합하다.

