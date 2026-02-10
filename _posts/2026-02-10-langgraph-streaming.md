---
title: "LangGraph Streaming"
author: mminzy22
date: 2026-02-10 11:00:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph의 스트리밍(Streaming) 시스템과 stream_mode별 동작, 서브그래프/토큰/커스텀 데이터 스트리밍, Python < 3.11 비동기 주의사항을 정리"
pin: false
mermaid: true
math: true
media_subpath: /assets/img/langgraph
---


# Streaming

LangGraph는 실시간 업데이트를 표면화(surfacing)하기 위한 스트리밍 시스템을 구현하고 있다. 스트리밍은 LLM 기반 애플리케이션의 반응성을 높이는 데 핵심적인 요소이다. 완전한 응답이 준비되기 전에라도 출력을 점진적으로 보여줌으로써, 특히 LLM의 지연(latency)이 있는 상황에서 UX가 크게 개선된다.

LangGraph 스트리밍으로 가능한 것들은 다음과 같다.

* **Stream graph state** — `updates` 및 `values` 모드로 상태 업데이트/값을 받을 수 있다.
* **Stream subgraph outputs** — 부모 그래프와 중첩 서브그래프의 출력을 함께 스트리밍할 수 있다.
* **Stream LLM tokens** — 노드, 서브그래프, 도구 어디에서든 LLM 토큰 스트림을 캡처할 수 있다.
* **Stream custom data** — 도구 함수에서 커스텀 업데이트나 진행(progress) 시그널을 직접 스트리밍할 수 있다.
* **Use multiple streaming modes** — `values`(전체 상태), `updates`(상태 델타), `messages`(LLM 토큰 + 메타데이터), `custom`(임의 사용자 데이터), `debug`(상세 트레이스) 중에서 선택하거나 조합할 수 있다.

## Supported stream modes

`stream` 또는 `astream` 메서드에 `stream_mode`를 리스트(또는 단일 값)로 전달하여 스트리밍 모드를 지정할 수 있다.

* `stream`: 동기 스트리밍
* `astream`: 비동기 스트리밍

| Mode       | Description                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `values`   | 그래프의 각 스텝 이후 상태(state)의 **전체 값(full value)**을 스트리밍한다.                                                                 |
| `updates`  | 그래프의 각 스텝 이후 상태(state)의 **업데이트(변경분)**를 스트리밍한다. 같은 스텝에서 여러 업데이트가 발생하면(예: 여러 노드가 같은 스텝에서 실행되는 경우) 업데이트가 각각 분리되어 스트리밍된다. |
| `custom`   | 그래프 노드 내부에서 발생시키는 **커스텀 데이터**를 스트리밍한다.                                                                                |
| `messages` | LLM이 호출되는 노드에서 발생하는 2-튜플(LLM token, metadata)을 스트리밍한다.                                                                |
| `debug`    | 그래프 실행 과정 전반에서 가능한 많은 정보를 스트리밍한다.                                                                                     |

## Basic usage example

LangGraph 그래프는 스트리밍 출력을 이터레이터로 내보내는 `stream`(sync)과 `astream`(async) 메서드를 제공한다.

```python
for chunk in graph.stream(inputs, stream_mode="updates"):
    print(chunk)
```

#### Extended example: streaming updates

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    topic: str
    joke: str

def refine_topic(state: State):
    return {"topic": state["topic"] + " and cats"}

def generate_joke(state: State):
    return {"joke": f"This is a joke about {state['topic']}"}

graph = (
    StateGraph(State)
    .add_node(refine_topic)
    .add_node(generate_joke)
    .add_edge(START, "refine_topic")
    .add_edge("refine_topic", "generate_joke")
    .add_edge("generate_joke", END)
    .compile()
)

# The stream() method returns an iterator that yields streamed outputs
for chunk in graph.stream(  # [!code highlight]
    {"topic": "ice cream"},
    # Set stream_mode="updates" to stream only the updates to the graph state after each node
    # Other stream modes are also available. See supported stream modes for details
    stream_mode="updates",  # [!code highlight]
):
    print(chunk)
```

```python
{'refineTopic': {'topic': 'ice cream and cats'}}
{'generateJoke': {'joke': 'This is a joke about ice cream and cats'}}
```

## Stream multiple modes

`stream_mode` 파라미터에 리스트를 전달하면 여러 모드를 동시에 스트리밍할 수 있다.

이때 스트리밍 출력은 `(mode, chunk)` 형태의 튜플이며, `mode`는 스트림 모드 이름, `chunk`는 해당 모드가 내보낸 데이터이다.

```python
for mode, chunk in graph.stream(inputs, stream_mode=["updates", "custom"]):
    print(chunk)
```

## Stream graph state

그래프 실행 중 상태(state)를 스트리밍하려면 `updates` 또는 `values` 모드를 사용한다.

* `updates`: 각 스텝 이후 상태의 **업데이트(변경분)**을 스트리밍한다.
* `values`: 각 스텝 이후 상태의 **전체 값(full state)**을 스트리밍한다.

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
  topic: str
  joke: str


def refine_topic(state: State):
    return {"topic": state["topic"] + " and cats"}


def generate_joke(state: State):
    return {"joke": f"This is a joke about {state['topic']}"}

graph = (
  StateGraph(State)
  .add_node(refine_topic)
  .add_node(generate_joke)
  .add_edge(START, "refine_topic")
  .add_edge("refine_topic", "generate_joke")
  .add_edge("generate_joke", END)
  .compile()
)
```

### updates

이 모드는 각 스텝 이후 노드가 반환한 **상태 업데이트만** 스트리밍한다. 출력에는 노드 이름과 업데이트가 포함된다.

```python
for chunk in graph.stream(
    {"topic": "ice cream"},
    stream_mode="updates",  # [!code highlight]
):
    print(chunk)
```

### values

이 모드는 각 스텝 이후 그래프의 **전체 상태**를 스트리밍한다.

```python
for chunk in graph.stream(
    {"topic": "ice cream"},
    stream_mode="values",  # [!code highlight]
):
    print(chunk)
```

## Stream subgraph outputs

서브그래프의 출력까지 함께 스트리밍하려면, 부모 그래프의 `.stream()` 호출에서 `subgraphs=True`를 설정하면 된다. 그러면 부모 그래프와 모든 서브그래프에서 발생한 출력을 함께 스트리밍한다.

이때 출력은 `(namespace, data)` 형태의 튜플로 스트리밍된다.

* `namespace`: 서브그래프가 호출되는 노드까지의 경로를 담은 튜플이다. 예를 들어 `("parent_node:<task_id>", "child_node:<task_id>")` 형태가 될 수 있다.
* `data`: 해당 그래프(또는 서브그래프)에서 발생한 스트리밍 데이터이다.

```python
for chunk in graph.stream(
    {"foo": "foo"},
    # Set subgraphs=True to stream outputs from subgraphs
    subgraphs=True,  # [!code highlight]
    stream_mode="updates",
):
    print(chunk)
```

#### Extended example: streaming from subgraphs

```python
from langgraph.graph import START, StateGraph
from typing import TypedDict

# Define subgraph
class SubgraphState(TypedDict):
    foo: str  # note that this key is shared with the parent graph state
    bar: str

def subgraph_node_1(state: SubgraphState):
    return {"bar": "bar"}

def subgraph_node_2(state: SubgraphState):
    return {"foo": state["foo"] + state["bar"]}

subgraph_builder = StateGraph(SubgraphState)
subgraph_builder.add_node(subgraph_node_1)
subgraph_builder.add_node(subgraph_node_2)
subgraph_builder.add_edge(START, "subgraph_node_1")
subgraph_builder.add_edge("subgraph_node_1", "subgraph_node_2")
subgraph = subgraph_builder.compile()

# Define parent graph
class ParentState(TypedDict):
    foo: str

def node_1(state: ParentState):
    return {"foo": "hi! " + state["foo"]}

builder = StateGraph(ParentState)
builder.add_node("node_1", node_1)
builder.add_node("node_2", subgraph)
builder.add_edge(START, "node_1")
builder.add_edge("node_1", "node_2")
graph = builder.compile()

for chunk in graph.stream(
    {"foo": "foo"},
    stream_mode="updates",
    # Set subgraphs=True to stream outputs from subgraphs
    subgraphs=True,  # [!code highlight]
):
    print(chunk)
```

```text
((), {'node_1': {'foo': 'hi! foo'}})
(('node_2:dfddc4ba-c3c5-6887-5012-a243b5b377c2',), {'subgraph_node_1': {'bar': 'bar'}})
(('node_2:dfddc4ba-c3c5-6887-5012-a243b5b377c2',), {'subgraph_node_2': {'foo': 'hi! foobar'}})
((), {'node_2': {'foo': 'hi! foobar'}})
```

**Note**: 노드 업데이트뿐 아니라 네임스페이스가 함께 들어오기 때문에, 현재 어떤 그래프(또는 서브그래프)에서 스트리밍되는지 구분할 수 있다.

### Debugging

`debug` 스트리밍 모드는 그래프 실행 동안 가능한 한 많은 정보를 스트리밍한다. 출력에는 노드 이름과 전체 상태가 포함된다.

```python
for chunk in graph.stream(
    {"topic": "ice cream"},
    stream_mode="debug",  # [!code highlight]
):
    print(chunk)
```

## LLM tokens

`messages` 스트리밍 모드는 그래프 어느 위치에서든(노드, 도구, 서브그래프, task 포함) LLM 출력 토큰을 **토큰 단위(token by token)**로 스트리밍할 수 있다.

`messages` 모드의 스트리밍 출력은 `(message_chunk, metadata)` 튜플이다.

* `message_chunk`: LLM이 내보낸 토큰 또는 메시지 조각이다.
* `metadata`: 그래프 노드, LLM 호출 등에 대한 정보를 담은 딕셔너리이다.

> LLM이 LangChain 통합(integration)으로 제공되지 않는 경우에는 `custom` 모드로도 스트리밍이 가능하다. 자세한 내용은 Use with any LLM 섹션을 참고하면 된다.

> Warning
> **Manual config required for async in Python < 3.11**
> Python < 3.11 환경에서 async 코드를 사용할 때는 `ainvoke()`에 `RunnableConfig`를 명시적으로 전달해야 정상적인 스트리밍이 활성화된다. 자세한 내용은 Async with Python < 3.11 섹션을 참고하거나 Python 3.11+로 업그레이드하면 된다.

```python
from dataclasses import dataclass

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START


@dataclass
class MyState:
    topic: str
    joke: str = ""


model = init_chat_model(model="gpt-4.1-mini")

def call_model(state: MyState):
    """Call the LLM to generate a joke about a topic"""
    # Note that message events are emitted even when the LLM is run using .invoke rather than .stream
    model_response = model.invoke(  # [!code highlight]
        [
            {"role": "user", "content": f"Generate a joke about {state.topic}"}
        ]
    )
    return {"joke": model_response.content}

graph = (
    StateGraph(MyState)
    .add_node(call_model)
    .add_edge(START, "call_model")
    .compile()
)

# The "messages" stream mode returns an iterator of tuples (message_chunk, metadata)
# where message_chunk is the token streamed by the LLM and metadata is a dictionary
# with information about the graph node where the LLM was called and other information
for message_chunk, metadata in graph.stream(
    {"topic": "ice cream"},
    stream_mode="messages",  # [!code highlight]
):
    if message_chunk.content:
        print(message_chunk.content, end="|", flush=True)
```

#### Filter by LLM invocation

LLM 호출에 `tags`를 붙이면, 스트리밍된 토큰을 특정 LLM 호출 단위로 필터링할 수 있다.

```python
from langchain.chat_models import init_chat_model

# model_1 is tagged with "joke"
model_1 = init_chat_model(model="gpt-4.1-mini", tags=['joke'])
# model_2 is tagged with "poem"
model_2 = init_chat_model(model="gpt-4.1-mini", tags=['poem'])

graph = ... # define a graph that uses these LLMs

# The stream_mode is set to "messages" to stream LLM tokens
# The metadata contains information about the LLM invocation, including the tags
async for msg, metadata in graph.astream(
    {"topic": "cats"},
    stream_mode="messages",  # [!code highlight]
):
    # Filter the streamed tokens by the tags field in the metadata to only include
    # the tokens from the LLM invocation with the "joke" tag
    if metadata["tags"] == ["joke"]:
        print(msg.content, end="|", flush=True)
```

#### Extended example: filtering by tags

```python
from typing import TypedDict

from langchain.chat_models import init_chat_model
from langgraph.graph import START, StateGraph

# The joke_model is tagged with "joke"
joke_model = init_chat_model(model="gpt-4.1-mini", tags=["joke"])
# The poem_model is tagged with "poem"
poem_model = init_chat_model(model="gpt-4.1-mini", tags=["poem"])


class State(TypedDict):
      topic: str
      joke: str
      poem: str


async def call_model(state, config):
      topic = state["topic"]
      print("Writing joke...")
      # Note: Passing the config through explicitly is required for python < 3.11
      # Since context var support wasn't added before then: https://docs.python.org/3/library/asyncio-task.html#creating-tasks
      # The config is passed through explicitly to ensure the context vars are propagated correctly
      # This is required for Python < 3.11 when using async code. Please see the async section for more details
      joke_response = await joke_model.ainvoke(
            [{"role": "user", "content": f"Write a joke about {topic}"}],
            config,
      )
      print("\n\nWriting poem...")
      poem_response = await poem_model.ainvoke(
            [{"role": "user", "content": f"Write a short poem about {topic}"}],
            config,
      )
      return {"joke": joke_response.content, "poem": poem_response.content}


graph = (
      StateGraph(State)
      .add_node(call_model)
      .add_edge(START, "call_model")
      .compile()
)

# The stream_mode is set to "messages" to stream LLM tokens
# The metadata contains information about the LLM invocation, including the tags
async for msg, metadata in graph.astream(
      {"topic": "cats"},
      stream_mode="messages",
):
    if metadata["tags"] == ["joke"]:
        print(msg.content, end="|", flush=True)
```

#### Filter by node

특정 노드에서만 토큰을 스트리밍하려면 `stream_mode="messages"`로 받은 후, 메타데이터의 `langgraph_node` 필드로 필터링하면 된다.

```python
# The "messages" stream mode returns a tuple of (message_chunk, metadata)
# where message_chunk is the token streamed by the LLM and metadata is a dictionary
# with information about the graph node where the LLM was called and other information
for msg, metadata in graph.stream(
    inputs,
    stream_mode="messages",  # [!code highlight]
):
    # Filter the streamed tokens by the langgraph_node field in the metadata
    # to only include the tokens from the specified node
    if msg.content and metadata["langgraph_node"] == "some_node_name":
        ...
```

#### Extended example: streaming LLM tokens from specific nodes

```python
from typing import TypedDict
from langgraph.graph import START, StateGraph
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4.1-mini")


class State(TypedDict):
      topic: str
      joke: str
      poem: str


def write_joke(state: State):
      topic = state["topic"]
      joke_response = model.invoke(
            [{"role": "user", "content": f"Write a joke about {topic}"}]
      )
      return {"joke": joke_response.content}


def write_poem(state: State):
      topic = state["topic"]
      poem_response = model.invoke(
            [{"role": "user", "content": f"Write a short poem about {topic}"}]
      )
      return {"poem": poem_response.content}


graph = (
      StateGraph(State)
      .add_node(write_joke)
      .add_node(write_poem)
      # write both the joke and the poem concurrently
      .add_edge(START, "write_joke")
      .add_edge(START, "write_poem")
      .compile()
)

# The "messages" stream mode returns a tuple of (message_chunk, metadata)
# where message_chunk is the token streamed by the LLM and metadata is a dictionary
# with information about the graph node where the LLM was called and other information
for msg, metadata in graph.stream(
    {"topic": "cats"},
    stream_mode="messages",  # [!code highlight]
):
    # Filter the streamed tokens by the langgraph_node field in the metadata
    # to only include the tokens from the write_poem node
    if msg.content and metadata["langgraph_node"] == "write_poem":
        print(msg.content, end="|", flush=True)
```

## Stream custom data

LangGraph 노드 또는 도구(tool) 내부에서 **사용자 정의(custom) 데이터**를 스트리밍하려면 다음 단계를 따르면 된다.

1. `get_stream_writer`를 사용하여 stream writer에 접근하고 커스텀 데이터를 emit한다.
2. `.stream()` 또는 `.astream()` 호출 시 `stream_mode="custom"`을 설정하여 스트림에서 커스텀 데이터를 수신한다. 여러 모드를 조합할 수 있지만(예: `["updates", "custom"]`), 최소 하나는 반드시 `"custom"`이어야 한다.

> Warning
> **No get_stream_writer in async for Python < 3.11**
> Python < 3.11에서 async 코드로 실행할 경우 `get_stream_writer`는 동작하지 않는다.
> 대신 노드/도구 시그니처에 `writer` 파라미터를 추가하고, 이를 수동으로 전달해야 한다.
> 사용 예시는 Async with Python < 3.11 섹션을 참고하면 된다.

### node

```python
from typing import TypedDict
from langgraph.config import get_stream_writer
from langgraph.graph import StateGraph, START

class State(TypedDict):
    query: str
    answer: str

def node(state: State):
    # Get the stream writer to send custom data
    writer = get_stream_writer()
    # Emit a custom key-value pair (e.g., progress update)
    writer({"custom_key": "Generating custom data inside node"})
    return {"answer": "some data"}

graph = (
    StateGraph(State)
    .add_node(node)
    .add_edge(START, "node")
    .compile()
)

inputs = {"query": "example"}

# Set stream_mode="custom" to receive the custom data in the stream
for chunk in graph.stream(inputs, stream_mode="custom"):
    print(chunk)
```

### tool

```python
from langchain.tools import tool
from langgraph.config import get_stream_writer

@tool
def query_database(query: str) -> str:
    """Query the database."""
    # Access the stream writer to send custom data
    writer = get_stream_writer()  # [!code highlight]
    # Emit a custom key-value pair (e.g., progress update)
    writer({"data": "Retrieved 0/100 records", "type": "progress"})  # [!code highlight]
    # perform query
    # Emit another custom key-value pair
    writer({"data": "Retrieved 100/100 records", "type": "progress"})
    return "some-answer"


graph = ... # define a graph that uses this tool

# Set stream_mode="custom" to receive the custom data in the stream
for chunk in graph.stream(inputs, stream_mode="custom"):
    print(chunk)
```

## Use with any LLM

`stream_mode="custom"`을 사용하면 LangChain 채팅 모델 인터페이스를 구현하지 않은 **어떤 LLM API**와도 스트리밍을 연결할 수 있다.

즉, 원시(raw) LLM 클라이언트나 자체 스트리밍 인터페이스를 제공하는 외부 서비스를 붙일 수 있으며, LangGraph는 커스텀 셋업에 유연하게 대응할 수 있다.

```python
from langgraph.config import get_stream_writer

def call_arbitrary_model(state):
    """Example node that calls an arbitrary model and streams the output"""
    # Get the stream writer to send custom data
    writer = get_stream_writer()  # [!code highlight]
    # Assume you have a streaming client that yields chunks
    # Generate LLM tokens using your custom streaming client
    for chunk in your_custom_streaming_client(state["topic"]):
        # Use the writer to send custom data to the stream
        writer({"custom_llm_chunk": chunk})  # [!code highlight]
    return {"result": "completed"}

graph = (
    StateGraph(State)
    .add_node(call_arbitrary_model)
    # Add other nodes and edges as needed
    .compile()
)
# Set stream_mode="custom" to receive the custom data in the stream
for chunk in graph.stream(
    {"topic": "cats"},
    stream_mode="custom",  # [!code highlight]

):
    # The chunk will contain the custom data streamed from the llm
    print(chunk)
```

#### Extended example: streaming arbitrary chat model

```python
import operator
import json

from typing import TypedDict
from typing_extensions import Annotated
from langgraph.graph import StateGraph, START

from openai import AsyncOpenAI

openai_client = AsyncOpenAI()
model_name = "gpt-4.1-mini"


async def stream_tokens(model_name: str, messages: list[dict]):
    response = await openai_client.chat.completions.create(
        messages=messages, model=model_name, stream=True
    )
    role = None
    async for chunk in response:
        delta = chunk.choices[0].delta

        if delta.role is not None:
            role = delta.role

        if delta.content:
            yield {"role": role, "content": delta.content}


# this is our tool
async def get_items(place: str) -> str:
    """Use this tool to list items one might find in a place you're asked about."""
    writer = get_stream_writer()
    response = ""
    async for msg_chunk in stream_tokens(
        model_name,
        [
            {
                "role": "user",
                "content": (
                    "Can you tell me what kind of items "
                    f"i might find in the following place: '{place}'. "
                    "List at least 3 such items separating them by a comma. "
                    "And include a brief description of each item."
                ),
            }
        ],
    ):
        response += msg_chunk["content"]
        writer(msg_chunk)

    return response


class State(TypedDict):
    messages: Annotated[list[dict], operator.add]


# this is the tool-calling graph node
async def call_tool(state: State):
    ai_message = state["messages"][-1]
    tool_call = ai_message["tool_calls"][-1]

    function_name = tool_call["function"]["name"]
    if function_name != "get_items":
        raise ValueError(f"Tool {function_name} not supported")

    function_arguments = tool_call["function"]["arguments"]
    arguments = json.loads(function_arguments)

    function_response = await get_items(**arguments)
    tool_message = {
        "tool_call_id": tool_call["id"],
        "role": "tool",
        "name": function_name,
        "content": function_response,
    }
    return {"messages": [tool_message]}


graph = (
    StateGraph(State)
    .add_node(call_tool)
    .add_edge(START, "call_tool")
    .compile()
)
```

Let's invoke the graph with an AIMessage that includes a tool call:

```python
inputs = {
    "messages": [
        {
            "content": None,
            "role": "assistant",
            "tool_calls": [
                {
                    "id": "1",
                    "function": {
                        "arguments": '{"place":"bedroom"}',
                        "name": "get_items",
                    },
                    "type": "function",
                }
            ],
        }
    ]
}

async for chunk in graph.astream(
    inputs,
    stream_mode="custom",
):
    print(chunk["content"], end="|", flush=True)
```

## Disable streaming for specific chat models

스트리밍을 지원하는 모델과 지원하지 않는 모델을 혼용하는 애플리케이션에서는, 스트리밍을 지원하지 않는 모델에 대해 명시적으로 스트리밍을 비활성화해야 할 수 있다.

이때 모델 초기화 시 `streaming=False`를 설정한다.

### init_chat_model

```python
from langchain.chat_models import init_chat_model

model = init_chat_model(
    "claude-sonnet-4-5-20250929",
    # Set streaming=False to disable streaming for the chat model
    streaming=False  # [!code highlight]
)
```

### Chat model interface

```python
from langchain_openai import ChatOpenAI

# Set streaming=False to disable streaming for the chat model
model = ChatOpenAI(model="o1-preview", streaming=False)
```

> Note
> 모든 채팅 모델 통합이 `streaming` 파라미터를 지원하는 것은 아니다. 해당 파라미터를 지원하지 않는 모델이라면 `disable_streaming=True`를 사용하면 된다. 이 파라미터는 베이스 클래스 기준으로 모든 채팅 모델에서 사용 가능하다.

### Async with Python < 3.11

Python < 3.11에서는 `asyncio.create_task`가 `context` 파라미터를 지원하지 않는다. 이로 인해 LangGraph의 컨텍스트 자동 전파가 제한되며, 스트리밍 메커니즘에도 다음 두 가지 영향이 발생한다.

1. async LLM 호출(예: `ainvoke()`)에 `RunnableConfig`를 반드시 명시적으로 전달해야 한다. 콜백이 자동으로 전파되지 않기 때문이다.
2. async 노드 또는 도구에서 `get_stream_writer`를 사용할 수 없다. 대신 함수 인자로 `writer`를 직접 받아야 한다.

#### Extended example: async LLM call with manual config

```python
from typing import TypedDict
from langgraph.graph import START, StateGraph
from langchain.chat_models import init_chat_model

model = init_chat_model(model="gpt-4.1-mini")

class State(TypedDict):
    topic: str
    joke: str

# Accept config as an argument in the async node function
async def call_model(state, config):
    topic = state["topic"]
    print("Generating joke...")
    # Pass config to model.ainvoke() to ensure proper context propagation
    joke_response = await model.ainvoke(  # [!code highlight]
        [{"role": "user", "content": f"Write a joke about {topic}"}],
        config,
    )
    return {"joke": joke_response.content}

graph = (
    StateGraph(State)
    .add_node(call_model)
    .add_edge(START, "call_model")
    .compile()
)

# Set stream_mode="messages" to stream LLM tokens
async for chunk, metadata in graph.astream(
    {"topic": "ice cream"},
    stream_mode="messages",  # [!code highlight]
):
    if chunk.content:
        print(chunk.content, end="|", flush=True)
```

#### Extended example: async custom streaming with stream writer

```python
from typing import TypedDict
from langgraph.types import StreamWriter

class State(TypedDict):
      topic: str
      joke: str

# Add writer as an argument in the function signature of the async node or tool
# LangGraph will automatically pass the stream writer to the function
async def generate_joke(state: State, writer: StreamWriter):  # [!code highlight]
      writer({"custom_key": "Streaming custom data while generating a joke"})
      return {"joke": f"This is a joke about {state['topic']}"}

graph = (
      StateGraph(State)
      .add_node(generate_joke)
      .add_edge(START, "generate_joke")
      .compile()
)

# Set stream_mode="custom" to receive the custom data in the stream  # [!code highlight]
async for chunk in graph.astream(
      {"topic": "ice cream"},
      stream_mode="custom",
):
      print(chunk)
```
