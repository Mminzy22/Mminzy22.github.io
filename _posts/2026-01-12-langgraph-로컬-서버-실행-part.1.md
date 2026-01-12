---
title: "LangGraph 로컬 서버 실행 - part.1"
author: mminzy22
date: 2026-01-12 21:01:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph 공식 문서의 Run a local server 가이드를 기반으로, 로컬에서 Agent Server를 실행하고 Studio와 API로 테스트하는 과정 정리"
pin: false
mermaid: true
math: true
---


## 개요


이 글에서는 **LangGraph 애플리케이션을 로컬 환경에서 실행하는 방법**을 정리한다. LangGraph는 에이전트를 단순한 코드 수준에서 끝내지 않고, **Agent Server** 형태로 실행해 UI와 API를 통해 테스트하고 디버깅할 수 있는 구조를 제공한다.


로컬 서버 실행은 다음과 같은 상황에서 특히 유용하다.

- 에이전트 로직을 빠르게 반복 개발하고 싶을 때
- Studio UI를 통해 실행 흐름과 상태 변화를 시각적으로 확인하고 싶을 때
- 실제 배포 전에 API 인터페이스를 미리 검증하고 싶을 때

---


## 사전 준비 사항


시작하기 전에 다음 항목이 필요하다.

- **LangSmith API 키**
    - LangGraph의 Agent Server와 Studio는 LangSmith와 연동된다.
    - 무료 계정으로도 API 키 발급이 가능하다.

또한 Python **3.11 이상**이 요구된다.


---


## 1. LangGraph CLI 설치


LangGraph 애플리케이션을 생성하고 실행하기 위해 전용 CLI를 설치한다.


```bash
# Python >= 3.11
pip install -U "langgraph-cli[inmem]"
```


`[inmem]` 옵션은 **인메모리 모드**로 서버를 실행하기 위한 의존성을 포함한다. 이는 로컬 개발 및 테스트에 적합한 구성이다.


---


## 2. LangGraph 앱 생성


CLI를 사용해 새로운 LangGraph 프로젝트를 생성한다. 공식에서 제공하는 템플릿은 **단일 노드 그래프** 구조를 예제로 제공하며, 이후 자유롭게 확장할 수 있다.


```bash
langgraph new path/to/your/app --template new-langgraph-project-python
```


이 명령은 프로젝트 구조, 기본 설정, 예제 그래프를 포함한 스캐폴딩을 자동으로 생성한다.

> 템플릿을 지정하지 않고 langgraph new를 실행하면, 선택 가능한 템플릿 목록이 인터랙티브 메뉴로 제공된다.

---


## 3. 의존성 설치


생성된 프로젝트 디렉터리로 이동한 뒤, 로컬 변경 사항이 서버에 바로 반영되도록 **editable 모드**로 의존성을 설치한다.


```bash
cd path/to/your/app
pip install -e .
```


이 방식은 코드 수정 후 재설치 없이도 바로 테스트할 수 있어 개발 생산성을 높여준다.


---


## 4. `.env` 파일 설정


프로젝트 루트에는 `.env.example` 파일이 포함되어 있다. 이를 참고해 `.env` 파일을 생성하고 필요한 값을 채운다.


```bash
LANGSMITH_API_KEY=lsv2...
```


이 API 키는 로컬 Agent Server를 **LangSmith Studio와 연결**하는 데 사용된다.


---


## 5. Agent Server 실행


다음 명령어로 LangGraph Agent Server를 로컬에서 실행한다.


```bash
langgraph dev
```


정상적으로 실행되면 다음과 같은 정보가 출력된다.

- 로컬 API 서버 주소
- Studio UI 접속 URL
- OpenAPI 기반 API 문서 URL

이 모드는 **인메모리 실행 방식**으로, 서버를 재시작하면 상태가 초기화된다. 개발·테스트 용도로 적합하며, 운영 환경에서는 영속 스토리지를 사용하는 배포 구성이 필요하다.


---


## 6. Studio에서 애플리케이션 테스트


출력된 Studio URL에 접속하면 **LangGraph Studio**에서 로컬 Agent Server에 연결된다. Studio는 다음 기능을 제공한다.

- 그래프 구조 시각화
- 에이전트 실행 단계별 상태 확인
- 입력 메시지에 대한 실시간 상호작용

서버 주소나 포트를 변경한 경우에는 Studio URL의 `baseUrl` 쿼리 파라미터를 수정해 연결할 수 있다.

> Safari 브라우저에서는 localhost 연결에 제한이 있으므로, langgraph dev --tunnel 옵션을 사용해 안전한 터널을 생성하는 것이 권장된다.

---


## 7. API 테스트


로컬에서 실행 중인 Agent Server는 SDK 또는 REST API를 통해 직접 호출할 수 있다.


### Python SDK (비동기)


```python
from langgraph_sdk import get_client
import asyncio

client = get_client(url="http://localhost:2024")

async def main():
    async for chunk in client.runs.stream(
        None,
        "agent",
        input={
            "messages": [{
                "role": "human",
                "content": "What is LangGraph?",
            }],
        },
    ):
        print(chunk.event, chunk.data)

asyncio.run(main())
```


### Python SDK (동기)


```python
from langgraph_sdk import get_sync_client

client = get_sync_client(url="http://localhost:2024")

for chunk in client.runs.stream(
    None,
    "agent",
    input={
        "messages": [{
            "role": "human",
            "content": "What is LangGraph?",
        }],
    },
    stream_mode="messages-tuple",
):
    print(chunk.event, chunk.data)
```


### REST API


```bash
curl -X POST "http://localhost:2024/runs/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "agent",
    "input": {
      "messages": [{"role": "human", "content": "What is LangGraph?"}]
    },
    "stream_mode": "messages-tuple"
  }'
```


이 단계에서는 **서버 실행 → SDK/REST 호출 → 스트리밍 응답 처리**라는 전체 흐름을 확인할 수 있다.

