---
title: "LangGraph Interrupts 정리: pause/resume로 Human-in-the-Loop 구현하기 part.01"
author: mminzy22
date: 2026-02-10 11:35:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph의 interrupt()로 그래프 실행을 중단하고 Command로 재개하는 방법을, Rules of interrupts 섹션 전까지 정리"
pin: false
mermaid: true
math: true
media_subpath: /assets/img/langgraph
---


# Interrupts

Interrupts는 그래프 실행을 특정 지점에서 일시 중지(pause)하고, 외부 입력을 기다렸다가 이어서 계속 실행(resume)할 수 있게 해주는 기능이다. 이로 인해 실행을 계속하기 위해 사람의 확인/수정/승인이 필요한 human-in-the-loop 패턴을 구현할 수 있다. 인터럽트가 트리거되면 LangGraph는 [persistence](https://mminzy22.github.io/posts/langgraph-persistence-part.01/) 레이어를 통해 그래프 상태를 저장하고, 재개(resume) 신호가 올 때까지 무기한 대기한다.

Interrupts는 그래프 노드 코드 어디에서든 `interrupt()` 함수를 호출하는 방식으로 동작한다. 이 함수는 JSON 직렬화 가능한(any JSON-serializable) 값을 입력으로 받으며, 이 값은 호출자(caller)에게 노출된다. 이후 실행을 재개할 준비가 되면, `Command`로 그래프를 다시 호출(invoke)하며, 그때의 resume 값이 노드 내부에서 `interrupt()` 호출의 반환값이 된다.

정적 브레이크포인트(static breakpoint)가 “노드 실행 전/후” 같은 고정된 지점에서 멈추는 것과 달리, interrupts는 **동적(dynamic)** 기능이다. 코드 어디든 둘 수 있고, 애플리케이션 로직에 따라 조건부로도 걸 수 있다.

다음은 interrupts를 이해하는 핵심 포인트이다.

* **Checkpointing keeps your place:** checkpointer가 그래프 상태를 정확히 기록하므로, 오류 상태일 때도 포함해 나중에 다시 이어서 실행할 수 있다.
* **`thread_id` is your pointer:** `config={"configurable": {"thread_id": ...}}`로 어떤 상태를 불러올지(checkpoint를 어디서 재개할지) 지정한다.
* **Interrupt payloads surface as `__interrupt__`:** `interrupt()`에 넘긴 값은 호출자 결과의 `__interrupt__` 필드로 돌아오므로, 그래프가 무엇을 기다리는지 알 수 있다.

선택하는 `thread_id`는 사실상 영속 커서(persistent cursor) 역할을 한다. 같은 `thread_id`를 재사용하면 동일 체크포인트를 이어서 재개하고, 새로운 값을 쓰면 빈 상태의 새 스레드(thread)가 시작된다.

## Pause using `interrupt`

[`interrupt`](https://reference.langchain.com/python/langgraph/types/#langgraph.types.interrupt) 함수는 그래프 실행을 일시 중단하고, 호출자에게 값을 반환한다. 노드 내부에서 `interrupt`를 호출하면 LangGraph는 현재 그래프 상태를 저장하고, 재개 입력이 들어올 때까지 대기한다.

`interrupt`를 사용하기 위해 필요한 조건은 다음과 같다.

1. 그래프 상태를 저장할 **checkpointer**가 필요하다(프로덕션에서는 durable checkpointer를 사용하는 것이 권장이다).
2. 어떤 상태에서 재개할지 결정하기 위해 config에 **thread ID**가 필요하다.
3. 멈추고 싶은 지점에서 `interrupt()`를 호출해야 하며, payload는 **JSON-serializable**이어야 한다.

```python
from langgraph.types import interrupt

def approval_node(state: State):
    # 실행을 멈추고 승인 여부를 묻는다
    approved = interrupt("Do you approve this action?")

    # 재개 시 Command(resume=...)에 넣은 값이 여기서 반환된다
    return {"approved": approved}
```

`interrupt`를 호출하면 내부적으로 다음 일이 일어난다.

1. `interrupt`가 호출된 정확한 지점에서 **그래프 실행이 중단**된다.
2. 재개를 위해 checkpointer가 **상태(state)를 저장**한다. 프로덕션에서는 DB 등에 저장되는 persistent checkpointer를 사용하는 것이 바람직하다.
3. `interrupt()`에 전달한 값은 호출자 측 결과의 `__interrupt__` 아래로 **반환**된다. 이 값은 문자열/객체/배열 등 어떤 JSON-serializable 값이라도 가능하다.
4. 그래프는 **무기한 대기**한다.
5. 이후 재개 시 제공된 응답이 노드로 다시 들어와 `interrupt()` 호출의 **반환값**이 된다.

## Resuming interrupts

인터럽트로 실행이 멈춘 뒤에는, `resume` 값을 담은 `Command`로 그래프를 다시 호출하여 재개한다. resume 값은 `interrupt` 호출로 되돌아가 노드가 외부 입력을 받은 상태로 실행을 계속한다.

```python
from langgraph.types import Command

# 최초 실행 - interrupt에 걸려 일시 중지됨
# thread_id는 영속 커서 역할 (프로덕션에서는 안정적인 ID를 저장)
config = {"configurable": {"thread_id": "thread-1"}}
result = graph.invoke({"input": "data"}, config=config)

# 무엇이 인터럽트됐는지 확인
# __interrupt__에는 interrupt()에 넘긴 payload가 담긴다
print(result["__interrupt__"])
# > [Interrupt(value='Do you approve this action?')]

# 사람의 응답으로 재개
# resume payload가 노드 내부 interrupt()의 반환값이 된다
graph.invoke(Command(resume=True), config=config)
```

재개(resume) 관련 핵심 포인트는 다음과 같다.

* 재개 시에는 인터럽트가 발생했을 때 사용했던 **같은 thread ID**를 반드시 써야 한다.
* `Command(resume=...)`에 넣은 값이, 노드 내부의 `interrupt()` 호출의 반환값이 된다.
* 재개되면 노드는 `interrupt`가 호출된 지점에서 한 줄씩 이어지는 것이 아니라, **`interrupt`가 호출된 노드의 시작점부터 다시 실행**된다. 따라서 `interrupt` 이전의 코드는 다시 실행된다.
* resume 값은 어떤 JSON-serializable 값이라도 가능하다.

## Common patterns

Interrupts가 열어주는 핵심은 “실행을 멈추고 외부 입력을 기다리는 능력”이다. 이 능력은 다음과 같은 다양한 사용 사례에 유용하다.

* [Approval workflows](#approve-or-reject): 중요한 액션(API 호출, DB 변경, 금융 트랜잭션 등) 실행 전에 멈추고 승인 여부를 받는 패턴이다.
* [Review and edit](#review-and-edit-state): LLM 출력이나 tool call을 사람이 검토/수정한 뒤에 계속 진행하는 패턴이다.
* [Interrupting tool calls](#interrupts-in-tools): tool 실행 직전에 멈춰 tool call 내용을 검토/수정하는 패턴이다.
* [Validating human input](#validating-human-input): 다음 단계로 넘어가기 전에 사람 입력값을 검증하고, 잘못되면 다시 입력을 받는 패턴이다.

### Stream with human-in-the-loop (HITL) interrupts

human-in-the-loop 워크플로우로 인터랙티브 에이전트를 만들 때는, 메세지 토큰 스트리밍과 노드 업데이트 스트리밍을 동시에 흘려주면 사용자에게 실시간 피드백을 제공할 수 있다.

`subgraphs=True`(서브그래프가 있는 경우)와 함께 여러 스트림 모드(`"messages"`, `"updates"`)를 사용하면 다음이 가능해진다.

* AI 응답을 생성되는 즉시 실시간으로 스트리밍한다.
* 그래프가 인터럽트를 만났는지 감지한다.
* 사용자 입력을 받고 그래프를 자연스럽게 재개한다.

```python
async for metadata, mode, chunk in graph.astream(
    initial_input,
    stream_mode=["messages", "updates"],
    subgraphs=True,
    config=config
):
    if mode == "messages":
        # 스트리밍 메시지 처리
        msg, _ = chunk
        if isinstance(msg, AIMessageChunk) and msg.content:
            # 실시간으로 콘텐츠 표시
            display_streaming_content(msg.content)
    
    elif mode == "updates":
        # 인터럽트 여부 확인
        if "__interrupt__" in chunk:
            # 스트리밍 표시 중단
            interrupt_info = chunk["__interrupt__"][0].value
            
            # 사용자 입력 처리
            user_response = get_user_input(interrupt_info)
            
            # 갱신된 입력으로 그래프 재개
            initial_input = Command(resume=user_response)
            break
        
        else:
            # 노드 전환 추적
            current_node = list(chunk.keys())[0]
```

위 예시에서 눈여겨볼 포인트는 다음과 같다.

* `stream_mode=["messages", "updates"]`: 메세지 토큰과 그래프 상태 업데이트를 동시에 스트리밍한다.
* `subgraphs=True`: 중첩 그래프에서 인터럽트를 감지하려면 필요하다.
* `"__interrupt__"` 감지: 사람 입력이 필요한 시점을 의미한다.
* `Command(resume=...)`: 사용자 입력으로 그래프 실행을 재개한다.

### Approve or reject

인터럽트의 대표적인 사용법은, 중요한 액션 직전에 멈추고 승인 여부를 묻는 것이다. 예를 들어 API 호출, DB 변경, 중요한 의사결정 등을 실행하기 전에 사람에게 물어볼 수 있다.

```python
from typing import Literal
from langgraph.types import interrupt, Command

def approval_node(state: State) -> Command[Literal["proceed", "cancel"]]:
    # 실행 일시 중지; payload는 result["__interrupt__"]에 노출됨
    is_approved = interrupt({
        "question": "Do you want to proceed with this action?",
        "details": state["action_details"]
    })

    # 응답에 따라 분기
    if is_approved:
        return Command(goto="proceed")  # resume payload가 제공된 뒤 실행됨
    else:
        return Command(goto="cancel")
```

재개할 때는 `true`면 승인, `false`면 거절로 처리할 수 있다.

```python
# 승인할 때
graph.invoke(Command(resume=True), config=config)

# 거절할 때
graph.invoke(Command(resume=False), config=config)
```

#### Full example

```python
from typing import Literal, Optional, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt


class ApprovalState(TypedDict):
    action_details: str
    status: Optional[Literal["pending", "approved", "rejected"]]


def approval_node(state: ApprovalState) -> Command[Literal["proceed", "cancel"]]:
    # 호출자가 UI에 표시할 수 있도록 상세 정보 노출
    decision = interrupt({
        "question": "Approve this action?",
        "details": state["action_details"],
    })

    # 재개 후 적절한 노드로 분기
    return Command(goto="proceed" if decision else "cancel")


def proceed_node(state: ApprovalState):
    return {"status": "approved"}


def cancel_node(state: ApprovalState):
    return {"status": "rejected"}


builder = StateGraph(ApprovalState)
builder.add_node("approval", approval_node)
builder.add_node("proceed", proceed_node)
builder.add_node("cancel", cancel_node)
builder.add_edge(START, "approval")
builder.add_edge("proceed", END)
builder.add_edge("cancel", END)

# 프로덕션에서는 더 영속적인 checkpointer 사용 권장
checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "approval-123"}}
initial = graph.invoke(
    {"action_details": "Transfer $500", "status": "pending"},
    config=config,
)
print(initial["__interrupt__"])  # -> [Interrupt(value={'question': ..., 'details': ...})]

# 결정으로 재개; True면 proceed, False면 cancel로 분기
resumed = graph.invoke(Command(resume=True), config=config)
print(resumed["status"])  # -> "approved"
```

### Review and edit state

그래프 상태의 일부를 사람이 검토하고 수정한 뒤에 진행하고 싶을 때가 있다. LLM 출력 교정, 누락 정보 추가, 사소한 수정 등의 용도로 유용하다.

```python
from langgraph.types import interrupt

def review_node(state: State):
    # 실행을 멈추고 검토할 현재 콘텐츠 표시 (result["__interrupt__"]에 노출됨)
    edited_content = interrupt({
        "instruction": "Review and edit this content",
        "content": state["generated_text"]
    })

    # 편집된 내용으로 상태 갱신
    return {"generated_text": edited_content}
```

재개 시에는 편집된 콘텐츠를 `resume` 값으로 넘기면 된다.

```python
graph.invoke(
    Command(resume="The edited and improved text"),  # 이 값이 interrupt()의 반환값이 됨
    config=config
)
```

#### Full example

```python
import sqlite3
from typing import TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt


class ReviewState(TypedDict):
    generated_text: str


def review_node(state: ReviewState):
    # 검토자에게 생성된 콘텐츠 편집 요청
    updated = interrupt({
        "instruction": "Review and edit this content",
        "content": state["generated_text"],
    })
    return {"generated_text": updated}


builder = StateGraph(ReviewState)
builder.add_node("review", review_node)
builder.add_edge(START, "review")
builder.add_edge("review", END)

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "review-42"}}
initial = graph.invoke({"generated_text": "Initial draft"}, config=config)
print(initial["__interrupt__"])  # -> [Interrupt(value={'instruction': ..., 'content': ...})]

# 검토자가 편집한 텍스트로 재개
final_state = graph.invoke(
    Command(resume="Improved draft after review"),
    config=config,
)
print(final_state["generated_text"])  # -> "Improved draft after review"
```

### Interrupts in tools

인터럽트는 tool 함수 내부에도 직접 넣을 수 있다. 이렇게 하면 도구가 호출될 때마다 승인/검토를 위해 멈추도록 만들 수 있고, 실행 전에 tool call을 사람이 수정하는 것도 가능해진다.

먼저 `interrupt`를 사용하는 tool을 정의한다.

```python
from langchain.tools import tool
from langgraph.types import interrupt

@tool
def send_email(to: str, subject: str, body: str):
    """Send an email to a recipient."""

    # 전송 전 일시 중지; payload는 result["__interrupt__"]에 노출됨
    response = interrupt({
        "action": "send_email",
        "to": to,
        "subject": subject,
        "body": body,
        "message": "Approve sending this email?"
    })

    if response.get("action") == "approve":
        # 재개 시 전달한 값으로 실행 전 입력을 덮어쓸 수 있음
        final_to = response.get("to", to)
        final_subject = response.get("subject", subject)
        final_body = response.get("body", body)
        return f"Email sent to {final_to} with subject '{final_subject}'"
    return "Email cancelled by user"
```

이 접근은 승인 로직을 도구(tool) 자체에 붙여 재사용성을 높이는 데 유용하다. LLM이 자연스럽게 도구를 호출하더라도, 도구가 실행되기 전에 interrupt가 걸려 승인/수정/취소를 할 수 있게 된다.

#### Full example

```python
import sqlite3
from typing import TypedDict

from langchain.tools import tool
from langchain_anthropic import ChatAnthropic
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt


class AgentState(TypedDict):
    messages: list[dict]


@tool
def send_email(to: str, subject: str, body: str):
    """Send an email to a recipient."""

    # 전송 전 일시 중지; payload는 result["__interrupt__"]에 노출됨
    response = interrupt({
        "action": "send_email",
        "to": to,
        "subject": subject,
        "body": body,
        "message": "Approve sending this email?",
    })

    if response.get("action") == "approve":
        final_to = response.get("to", to)
        final_subject = response.get("subject", subject)
        final_body = response.get("body", body)

        # 실제 이메일 전송 (여기에 구현)
        print(f"[send_email] to={final_to} subject={final_subject} body={final_body}")
        return f"Email sent to {final_to}"

    return "Email cancelled by user"


model = ChatAnthropic(model="claude-sonnet-4-5-20250929").bind_tools([send_email])


def agent_node(state: AgentState):
    # LLM이 도구 호출을 결정할 수 있음; interrupt가 전송 전에 일시 중지
    result = model.invoke(state["messages"])
    return {"messages": state["messages"] + [result]}


builder = StateGraph(AgentState)
builder.add_node("agent", agent_node)
builder.add_edge(START, "agent")
builder.add_edge("agent", END)

checkpointer = SqliteSaver(sqlite3.connect("tool-approval.db"))
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "email-workflow"}}
initial = graph.invoke(
    {
        "messages": [
            {"role": "user", "content": "Send an email to alice@example.com about the meeting"}
        ]
    },
    config=config,
)
print(initial["__interrupt__"])  # -> [Interrupt(value={'action': 'send_email', ...})]

# 승인 및 (선택) 수정된 인자로 재개
resumed = graph.invoke(
    Command(resume={"action": "approve", "subject": "Updated subject"}),
    config=config,
)
print(resumed["messages"][-1])  # -> Tool result returned by send_email
```

### Validating human input

사람 입력을 검증하고, 유효하지 않으면 다시 물어봐야 하는 경우가 있다. 이런 패턴은 루프 안에서 `interrupt`를 여러 번 호출하는 방식으로 구현할 수 있다.

```python
from langgraph.types import interrupt

def get_age_node(state: State):
    prompt = "What is your age?"

    while True:
        answer = interrupt(prompt)  # payload는 result["__interrupt__"]에 노출됨

        # 입력 검증
        if isinstance(answer, int) and answer > 0:
            # 유효한 입력 - 계속 진행
            break
        else:
            # 잘못된 입력 - 더 구체적인 프롬프트로 다시 질문
            prompt = f"'{answer}' is not a valid age. Please enter a positive number."

    return {"age": answer}
```

유효하지 않은 입력으로 재개할 때마다 더 명확한 프롬프트로 다시 묻게 된다. 유효한 입력이 들어오면 노드가 완료되고 그래프는 다음으로 진행한다.

#### Full example

```python
import sqlite3
from typing import TypedDict

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt


class FormState(TypedDict):
    age: int | None


def get_age_node(state: FormState):
    prompt = "What is your age?"

    while True:
        answer = interrupt(prompt)  # payload는 result["__interrupt__"]에 노출됨

        if isinstance(answer, int) and answer > 0:
            return {"age": answer}

        prompt = f"'{answer}' is not a valid age. Please enter a positive number."


builder = StateGraph(FormState)
builder.add_node("collect_age", get_age_node)
builder.add_edge(START, "collect_age")
builder.add_edge("collect_age", END)

checkpointer = SqliteSaver(sqlite3.connect("forms.db"))
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "form-1"}}
first = graph.invoke({"age": None}, config=config)
print(first["__interrupt__"])  # -> [Interrupt(value='What is your age?', ...)]

# 잘못된 데이터로 재개하면 노드가 다시 질문함
retry = graph.invoke(Command(resume="thirty"), config=config)
print(retry["__interrupt__"])  # -> [Interrupt(value="'thirty' is not a valid age...", ...)]

# 유효한 데이터로 재개하면 루프가 끝나고 상태가 갱신됨
final = graph.invoke(Command(resume=30), config=config)
print(final["age"])  # -> 30
```
