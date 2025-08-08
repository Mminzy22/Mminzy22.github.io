---
title: "LangChain에서 응답 속도 최적화: Caching 활용하기"
author: mminzy22
date: 2025-02-17 19:40:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, LLM, RAG, LangChain, AI, TIL]
description: "LangChain에서 캐싱을 활용하여 LLM의 응답 속도를 최적화하는 방법을 다룹니다. 캐싱의 기본 개념부터 다양한 캐싱 방식, 적용 예제, 그리고 캐싱을 활용한 응답 속도 비교 실험까지 자세히 설명합니다."
pin: false
math: true
---


## **1. 캐싱(Caching)이란?**

캐싱(Caching)이란 자주 사용되는 데이터를 저장하여 반복적인 요청을 빠르게 처리하는 기술입니다. LangChain을 활용할 때, LLM의 응답 속도를 개선하는 가장 효과적인 방법 중 하나가 캐싱을 활용하는 것입니다.

일반적으로 LLM의 응답 속도는 모델 크기, 하드웨어 성능, 네트워크 상태 등 다양한 요인에 의해 좌우됩니다. 하지만 동일한 질문에 대해 매번 모델이 응답을 생성할 필요 없이, 이전에 생성된 응답을 저장하여 재사용하면 속도를 크게 향상시킬 수 있습니다.

## **2. 캐싱을 사용하는 이유**

### **반복된 질문에 대한 응답 속도 향상**
- 동일한 질문에 대해 모델이 매번 새로운 응답을 생성할 필요 없이, 캐시에 저장된 데이터를 반환하여 빠르게 응답할 수 있습니다.

### **API 비용 절감**
- OpenAI API를 사용하여 LangChain을 운영할 경우, API 호출 수가 증가할수록 비용이 증가합니다. 캐싱을 활용하면 같은 질문에 대한 불필요한 API 호출을 줄여 비용을 절감할 수 있습니다.

### **서버 부하 감소**
- 모델이 직접 응답을 생성하는 연산을 줄일 수 있어 서버의 부하를 줄이고, 더 많은 요청을 효율적으로 처리할 수 있습니다.

## **3. LangChain에서 캐싱 적용하기**

LangChain에서는 `set_llm_cache()` 함수를 활용하여 캐싱을 적용할 수 있습니다. 기본적으로 `InMemoryCache`를 사용하면 간단한 메모리 기반 캐싱을 구현할 수 있습니다.

### **기본적인 캐싱 적용 코드**

```python
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache
from langchain_openai import ChatOpenAI

# 캐싱 활성화
set_llm_cache(InMemoryCache())

# LLM 모델 로드
chat = ChatOpenAI(model_name="gpt-4o-mini")

# 첫 번째 호출 - 캐시에 저장되지 않은 경우
print("첫 번째 호출:")
%time response_1 = chat.invoke("일반 상대성 이론을 한마디로 설명해줘.")
print(response_1.content)

# 두 번째 호출 - 캐시에서 응답 반환
print("두 번째 호출:")
%time response_2 = chat.invoke("일반 상대성 이론을 한마디로 설명해줘.")
print(response_2.content)
```

### **결과 분석**
- 첫 번째 호출에서는 LLM이 직접 응답을 생성해야 하므로 시간이 오래 걸립니다.
- 두 번째 호출에서는 동일한 질문이므로, 모델이 직접 생성하지 않고 **캐시에서 즉시 반환**하여 응답 시간이 단축됩니다.

## **4. 캐싱 방식 비교**

LangChain에서는 다양한 캐싱 방식을 사용할 수 있습니다.

| 캐싱 방식 | 설명 | 장점 | 단점 |
|-----------|-----------------|-----------------|-----------------|
| **InMemoryCache** | 메모리에 데이터를 저장 | 빠른 속도, 설정이 간단 | 메모리 제한이 있음 |
| **SQLiteCache** | SQLite 데이터베이스에 저장 | 영구 저장 가능 | I/O 속도 이슈 발생 가능 |
| **RedisCache** | Redis를 활용한 캐싱 | 대규모 시스템에서 적합 | 추가적인 설정 필요 |

### **SQLite 캐시 적용 예제**

```python
from langchain.cache import SQLiteCache

set_llm_cache(SQLiteCache(database_path="langchain_cache.db"))
```

이렇게 설정하면, 메모리 캐시 대신 SQLite 데이터베이스를 활용하여 캐시 데이터를 저장할 수 있습니다. 따라서 시스템이 재시작되더라도 캐시 데이터가 유지됩니다.

## **5. 캐싱을 활용한 응답 속도 비교 실험**

### **응답 속도 측정 코드**

```python
import time

chat = ChatOpenAI(model_name="gpt-4o-mini")
set_llm_cache(InMemoryCache())

# 첫 번째 호출 (캐시 없음)
start_time = time.time()
chat.invoke("양자 역학을 간단히 설명해줘.")
end_time = time.time()
print(f"첫 번째 호출 시간: {end_time - start_time:.2f}초")

# 두 번째 호출 (캐시 적용)
start_time = time.time()
chat.invoke("양자 역학을 간단히 설명해줘.")
end_time = time.time()
print(f"두 번째 호출 시간: {end_time - start_time:.2f}초")
```

### **결과 예시**

```
첫 번째 호출 시간: 2.45초
두 번째 호출 시간: 0.05초
```

캐시를 적용하면 두 번째 호출에서 응답 속도가 현저히 빨라지는 것을 확인할 수 있습니다.

## **6. 캐싱 적용 시 고려할 점**

### **캐시 만료 정책 설정**
- 캐시에 저장된 응답이 너무 오래되면, 정확도가 떨어질 수 있습니다.
- Redis와 같은 고급 캐싱 솔루션을 사용할 경우, TTL(Time-To-Live)을 설정하여 일정 시간 후 자동 삭제할 수 있습니다.

### **동일 질문 여부 확인**
- 사용자의 질문이 완전히 동일해야 캐시가 적용됩니다.
- 띄어쓰기나 문장 부호 차이로 인해 캐시가 적용되지 않을 수도 있으므로, **질문 정규화(Normalization)** 과정이 필요할 수 있습니다.

### **캐싱된 데이터 보안**
- 민감한 정보를 포함한 응답이 캐싱될 경우, 보안 위험이 발생할 수 있습니다.
- 보안이 중요한 데이터는 캐싱에서 제외하는 전략이 필요합니다.

## **7. 마무리 및 요약**

| 캐싱 적용 전 | 캐싱 적용 후 |
|-------------|-------------|
| 동일한 질문을 할 때마다 LLM이 다시 응답 생성 | 기존 응답을 캐시에서 즉시 반환 |
| 응답 시간이 길어질 수 있음 | 응답 속도가 빠름 |
| API 비용 증가 | API 호출 횟수 감소로 비용 절감 |

LangChain에서 캐싱을 활용하면, **응답 속도를 최적화하고 비용을 절감**할 수 있습니다. 

