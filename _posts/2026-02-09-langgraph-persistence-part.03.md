---
title: "LangGraph Persistence - part.03"
author: mminzy22
date: 2026-02-09 10:57:00 +0900
categories: ["LangChain","LangGraph"]
tags: ["TIL","LangChain","LangGraph","AI","LLM"]
description: "LangGraph의 checkpointer 라이브러리 구성, BaseCheckpointSaver 인터페이스, serializer(pickle/encryption) 옵션, 그리고 persistence로 가능한 기능(HITL/Memory/Time travel/Fault-tolerance)을 정리"
pin: false
mermaid: true
math: true
media_subpath: /assets/img/langgraph
---


## Checkpointer libraries


LangGraph의 checkpointing은 내부적으로 [`BaseCheckpointSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.base.BaseCheckpointSaver) 인터페이스를 따르는 **checkpointer 객체**로 구현된다. LangGraph는 여러 가지 checkpointer 구현체를 제공하며, 각각은 **별도 설치 가능한 라이브러리** 형태로 제공된다.

- `langgraph-checkpoint`
    - checkpointer saver의 기본 인터페이스([`BaseCheckpointSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.base.BaseCheckpointSaver))와 직렬화/역직렬화 인터페이스([`SerializerProtocol`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.base.SerializerProtocol))를 포함한다.
    - 실험용 in-memory 구현체([`InMemorySaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.memory.InMemorySaver))를 포함한다.
    - LangGraph 기본 포함 패키지이다.
- `langgraph-checkpoint-sqlite`
    - SQLite 기반 구현체이다.
    - [`SqliteSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.sqlite.SqliteSaver) / [`AsyncSqliteSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.sqlite.aio.AsyncSqliteSaver)
    - 로컬 워크플로/실험에 적합하며 별도 설치가 필요하다.
- `langgraph-checkpoint-postgres`
    - Postgres 기반의 고급 checkpointer이다.
    - [`PostgresSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.postgres.PostgresSaver) / [`AsyncPostgresSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.postgres.aio.AsyncPostgresSaver)
    - LangSmith에서 사용되며, 프로덕션에 적합하다. 별도 설치가 필요하다.
- `langgraph-checkpoint-cosmosdb`
    - Azure Cosmos DB 기반 구현체이다.
    - (@[`CosmosDBSaver`] / @[`AsyncCosmosDBSaver`])
    - Azure 환경에서 프로덕션 사용에 적합하며, sync/async 모두 지원한다. 별도 설치가 필요하다.

---


### Checkpointer interface


각 checkpointer는 [`BaseCheckpointSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.base.BaseCheckpointSaver) 인터페이스를 구현하며, 기본적으로 아래 메서드들을 제공한다.

- `.put`
    - 체크포인트를 config 및 metadata와 함께 저장한다.
- `.put_writes`
    - 특정 체크포인트에 연결된 중간 writes를 저장한다.
    - 문서에서는 이를 [pending writes](https://chatgpt.com/g/g-p-675e67ec6b248191a4a8bd199146e68a-beulrogeu/c/6970ce64-84f8-8320-b7c7-2afc0c96d487#pending-writes)와 연결해 설명한다.
- `.get_tuple`
    - 주어진 config(`thread_id`, `checkpoint_id`)에 대해 checkpoint tuple을 조회한다.
    - `graph.get_state()` 호출 시 `StateSnapshot`을 구성하는 데 사용된다.
- `.list`
    - 주어진 config 및 필터 조건에 맞는 체크포인트 목록을 조회한다.
    - `graph.get_state_history()`의 상태 히스토리를 구성하는 데 사용된다.

비동기 실행(`.ainvoke`, `.astream`, `.abatch`)을 사용하는 경우에는 위 메서드들의 async 버전이 사용된다.

- `.aput`, `.aput_writes`, `.aget_tuple`, `.alist`
> 비동기로 그래프를 실행하려면 [`InMemorySaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.memory.InMemorySaver) 또는 SQLite/Postgres checkpointer의 async 버전인 [`AsyncSqliteSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.sqlite.aio.AsyncSqliteSaver), [`AsyncPostgresSaver`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.postgres.aio.AsyncPostgresSaver)를 사용할 수 있다.
>
> {: .prompt-tip }
>
>

---


### Serializer


checkpointer가 그래프 상태를 저장할 때는 state channel의 값을 **직렬화(serialization)** 해야 한다. 이를 위해 serializer 객체를 사용한다.


`langgraph_checkpoint`는 serializer 구현을 위한 [protocol](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.base.SerializerProtocol)을 정의하고, 기본 구현체로 [`JsonPlusSerializer`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.jsonplus.JsonPlusSerializer)를 제공한다.


`JsonPlusSerializer`는 내부적으로 ormsgpack과 JSON을 사용하며, LangChain/LangGraph primitive, datetime, enum 등 다양한 타입을 처리하도록 설계되어 있다.


### Serialization with `pickle`


기본 serializer인 [`JsonPlusSerializer`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.jsonplus.JsonPlusSerializer)는 ormsgpack/JSON 기반이므로, 모든 타입을 항상 처리할 수 있는 것은 아니다.


예를 들어 Pandas dataframe처럼 msgpack encoder가 지원하지 않는 타입이 있을 수 있다. 이런 경우 `pickle_fallback=True` 옵션으로 pickle을 fallback으로 사용할 수 있다.


```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer

# ... Define the graph ...
graph.compile(
    checkpointer=InMemorySaver(serde=JsonPlusSerializer(pickle_fallback=True))
)
```


### Encryption


checkpointer는 저장되는 state 전체를 **암호화(encryption)** 할 수도 있다. 이를 위해 `serde` 인자에 [`EncryptedSerializer`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.encrypted.EncryptedSerializer) 인스턴스를 전달한다.


가장 간단한 방법은 [`from_pycryptodome_aes`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.encrypted.EncryptedSerializer.from_pycryptodome_aes)로 생성하는 것이다. 이 방식은 환경 변수 `LANGGRAPH_AES_KEY`에서 AES 키를 읽거나, `key` 인자를 직접 받을 수 있다.


SQLite checkpointer 예시:


```python
import sqlite3

from langgraph.checkpoint.serde.encrypted import EncryptedSerializer
from langgraph.checkpoint.sqlite import SqliteSaver

serde = EncryptedSerializer.from_pycryptodome_aes()  # reads LANGGRAPH_AES_KEY
checkpointer = SqliteSaver(sqlite3.connect("checkpoint.db"), serde=serde)
```


Postgres checkpointer 예시:


```python
from langgraph.checkpoint.serde.encrypted import EncryptedSerializer
from langgraph.checkpoint.postgres import PostgresSaver

serde = EncryptedSerializer.from_pycryptodome_aes()
checkpointer = PostgresSaver.from_conn_string("postgresql://...", serde=serde)
checkpointer.setup()
```


LangSmith에서 실행할 때는 `LANGGRAPH_AES_KEY`가 존재하면 암호화가 자동으로 활성화되므로, **환경 변수만 제공하면 되는 경우**가 있다.


또한 다른 암호화 스킴이 필요하다면 [`CipherProtocol`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.base.CipherProtocol)을 구현한 뒤 [`EncryptedSerializer`](https://reference.langchain.com/python/langgraph/checkpoints/#langgraph.checkpoint.serde.encrypted.EncryptedSerializer)에 주입하는 방식으로 확장할 수 있다.


---


## Capabilities


checkpointer 기반 persistence는 단순히 상태를 저장하는 것에서 끝나지 않는다. thread에 쌓인 checkpoint를 활용하면 다음과 같은 기능들이 가능해진다.


### Human-in-the-loop


checkpointer는 [human-in-the-loop 워크플로](https://chatgpt.com/oss/python/langgraph/interrupts)를 가능하게 한다.

- 사람은 그래프의 state를 조회/검토할 수 있다.
- 필요 시 실행을 interrupt(중단)할 수 있다.
- 승인/수정 후 같은 thread에서 resume(재개)할 수 있다.

HITL에서는 사람이 개입하는 시점의 state를 보고 판단해야 하므로, **임의 시점의 state 조회**와 **업데이트 후 재개**를 위해 checkpointer가 필요하다. 구체 예시는 how-to guides를 참고하면 된다.


### Memory


checkpointer는 상호작용 사이의 ["memory"](https://chatgpt.com/oss/python/concepts/memory)도 제공한다.


대화처럼 반복적인 상호작용에서, 후속 메시지를 같은 thread로 보내면 이전 state가 유지된다. 즉, thread 단위로 “대화 기억”을 가져갈 수 있다. 대화 메모리의 추가/관리 방법은 [Add memory](https://chatgpt.com/oss/python/langgraph/add-memory)를 참고하면 된다.


### Time travel


checkpointer는 ["time travel"](https://chatgpt.com/oss/python/langgraph/use-time-travel)을 가능하게 한다.

- 과거 실행을 replay해서 특정 스텝을 리뷰/디버깅할 수 있다.
- 임의 checkpoint에서 state를 fork하여 다른 경로를 탐색할 수 있다.

즉, 동일한 thread에서 **히스토리 기반 재현과 분기 실험**이 가능해진다.


### Fault-tolerance


checkpointing은 장애 허용(fault-tolerance)과 오류 복구에도 사용된다.

- 특정 superstep에서 노드가 실패하면, 마지막으로 성공한 스텝에서 재시작할 수 있다.
- superstep 진행 중 일부 노드는 성공하고 일부 노드는 실패할 수 있는데, LangGraph는 성공한 노드들의 checkpoint write를 **pending writes**로 저장한다.
- 이후 해당 superstep에서 재개(resume)할 때, 성공했던 노드를 다시 실행하지 않도록 돕는다.

### Pending writes


그래프 노드가 어떤 superstep에서 실행 중 실패하면, 같은 superstep에서 이미 성공한 다른 노드들의 writes를 LangGraph가 pending writes로 저장한다.


이렇게 저장된 pending writes 덕분에, 동일 superstep을 재개할 때 **성공 노드를 재실행하지 않고** 실패 노드만 복구하는 형태의 실행이 가능해진다.

