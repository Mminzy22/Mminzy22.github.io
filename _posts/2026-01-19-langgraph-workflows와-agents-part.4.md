---
title: "LangGraph Workflows와 Agents - part.4"
author: mminzy22
date: 2026-01-19 14:34:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "Evaluator-Optimizer 패턴의 개념, 사용 사례, 반복 개선 루프, LangGraph 구현 예시(Graph API/Functional API)를 정리한다."
pin: false
mermaid: true
math: true
media_subpath: /assets/img/langgraph
---


## Evaluator-Optimizer란 무엇인가


Evaluator-optimizer 워크플로우는 **한 번의 LLM 호출이 답안을 생성**하고, **다른 LLM 호출이 그 답안을 평가(evaluate)** 하는 구조이다. 평가자(evaluator) 또는 **human-in-the-loop**가 “개선이 필요하다”고 판단하면, **피드백을 생성자(generator)에게 전달**하고 다시 생성하도록 만든다. 이 과정을 **만족스러운 결과가 나올 때까지 반복(loop)** 하는 패턴이다.


정리하면 아래 흐름이다.

1. Generator가 초안 생성
2. Evaluator가 초안 평가(합격/불합격, 피드백 포함)
3. 불합격이면 피드백을 반영해 재생성
4. 합격이면 종료

![evaluator_optimizer](evaluator_optimizer.avif)


## 언제 쓰는가


Evaluator-optimizer는 **성공 기준(success criteria)이 분명하지만**, 한 번에 딱 맞는 결과가 나오기 어려워 **반복 개선이 필요한 작업**에 적합하다.


예를 들어, 서로 다른 언어 간 번역은 “의미가 동일한가”, “톤이 맞는가” 같은 기준이 있지만, 항상 완벽하게 일치하는 번역이 한 번에 나오지 않는다. 이런 경우 몇 번의 반복을 통해 같은 의미를 더 잘 맞추는 결과에 도달하는 데 이 패턴이 유용하다.


## LangGraph 예시 코드


아래 예시는 “농담(joke)”을 생성하고, 평가자가 `funny / not funny`로 채점한 다음, `not funny`이면 피드백을 제공해 다시 생성하도록 만든다. 합격이면 종료한다.


### Graph API 예시


```python
# Graph state
class State(TypedDict):
    joke: str
    topic: str
    feedback: str
    funny_or_not: str


# Schema for structured output to use in evaluation
class Feedback(BaseModel):
    grade: Literal["funny", "not funny"] = Field(
        description="Decide if the joke is funny or not.",
    )
    feedback: str = Field(
        description="If the joke is not funny, provide feedback on how to improve it.",
    )


# Augment the LLM with schema for structured output
evaluator = llm.with_structured_output(Feedback)


# Nodes
def llm_call_generator(state: State):
    """LLM generates a joke"""

    if state.get("feedback"):
        msg = llm.invoke(
            f"Write a joke about {state['topic']} but take into account the feedback: {state['feedback']}"
        )
    else:
        msg = llm.invoke(f"Write a joke about {state['topic']}")
    return {"joke": msg.content}


def llm_call_evaluator(state: State):
    """LLM evaluates the joke"""

    grade = evaluator.invoke(f"Grade the joke {state['joke']}")
    return {"funny_or_not": grade.grade, "feedback": grade.feedback}


# Conditional edge function to route back to joke generator or end based upon feedback from the evaluator
def route_joke(state: State):
    """Route back to joke generator or end based upon feedback from the evaluator"""

    if state["funny_or_not"] == "funny":
        return "Accepted"
    elif state["funny_or_not"] == "not funny":
        return "Rejected + Feedback"


# Build workflow
optimizer_builder = StateGraph(State)

# Add the nodes
optimizer_builder.add_node("llm_call_generator", llm_call_generator)
optimizer_builder.add_node("llm_call_evaluator", llm_call_evaluator)

# Add edges to connect nodes
optimizer_builder.add_edge(START, "llm_call_generator")
optimizer_builder.add_edge("llm_call_generator", "llm_call_evaluator")
optimizer_builder.add_conditional_edges(
    "llm_call_evaluator",
    route_joke,
    {  # Name returned by route_joke : Name of next node to visit
        "Accepted": END,
        "Rejected + Feedback": "llm_call_generator",
    },
)

# Compile the workflow
optimizer_workflow = optimizer_builder.compile()

# Show the workflow
display(Image(optimizer_workflow.get_graph().draw_mermaid_png()))

# Invoke
state = optimizer_workflow.invoke({"topic": "Cats"})
print(state["joke"])
```


### 코드 포인트

- `Feedback` 스키마를 `with_structured_output()`으로 붙여 **평가 결과를 구조화**한다.
- `llm_call_generator`는 `state["feedback"]`가 있으면 이를 반영해 다시 생성한다.
- `llm_call_evaluator`는 농담을 채점하고(`grade`) 불합격이면 개선 피드백을 만든다.
- `route_joke`가 `Accepted`면 종료, `Rejected + Feedback`이면 generator로 되돌린다.

### Functional API 예시


```python
# Schema for structured output to use in evaluation
class Feedback(BaseModel):
    grade: Literal["funny", "not funny"] = Field(
        description="Decide if the joke is funny or not.",
    )
    feedback: str = Field(
        description="If the joke is not funny, provide feedback on how to improve it.",
    )


# Augment the LLM with schema for structured output
evaluator = llm.with_structured_output(Feedback)


# Nodes
@task
def llm_call_generator(topic: str, feedback: Feedback):
    """LLM generates a joke"""
    if feedback:
        msg = llm.invoke(
            f"Write a joke about {topic} but take into account the feedback: {feedback}"
        )
    else:
        msg = llm.invoke(f"Write a joke about {topic}")
    return msg.content


@task
def llm_call_evaluator(joke: str):
    """LLM evaluates the joke"""
    feedback = evaluator.invoke(f"Grade the joke {joke}")
    return feedback


@entrypoint()
def optimizer_workflow(topic: str):
    feedback = None
    while True:
        joke = llm_call_generator(topic, feedback).result()
        feedback = llm_call_evaluator(joke).result()
        if feedback.grade == "funny":
            break

    return joke

# Invoke
for step in optimizer_workflow.stream("Cats", stream_mode="updates"):
    print(step)
    print("\n")
```


### 코드 포인트

- 핵심은 `while True` 루프이다.
- `feedback`를 `None`으로 시작하고, 생성 → 평가를 반복한다.
- `feedback.grade == "funny"`가 되는 순간 반복을 멈추고 최종 결과를 반환한다.
- `stream("Cats", stream_mode="updates")`로 실행 중 업데이트를 스트리밍으로 확인할 수 있다.

## 적용할 때 체크할 점

- **성공 기준을 명시적으로 만들기**: evaluator의 스키마(등급, 피드백)를 작업 목적에 맞게 구체화해야 한다.
- **무한 루프 방지**: 최대 반복 횟수, 타임아웃, 점수 임계치 같은 안전장치를 두는 편이 좋다.
- **human-in-the-loop 결합**: 자동 평가가 애매한 품질 기준(브랜드 톤, 정책 준수 등)은 중간에 사람 검토를 끼우면 안정적이다.
