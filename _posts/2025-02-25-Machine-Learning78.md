---
title: "LangChain과 API 및 외부 서비스 연동 - part.7"
author: mminzy22
date: 2025-02-25 20:30:00 +0900
categories: [LangChain]
tags: [Bootcamp, Python, Machine Learning, LangChain, AI, TIL]
description: "LangChain을 활용하여 REST API 및 외부 서비스와 연동하는 방법을 소개합니다."
pin: false
math: true
---


## 1. LangChain과 API 연동 개요

LangChain은 **REST API 및 다양한 외부 서비스**와 연동하여 실시간 데이터 검색, 정보 제공, 자동화 시스템을 구축하는 데 활용할 수 있습니다. API 연동을 통해 LLM이 실시간 데이터를 활용하여 보다 정확하고 유용한 답변을 생성할 수 있습니다.

### API 연동의 주요 활용 사례

| 활용 사례 | 설명 |
|-----------|--------------------------------------------------|
| **날씨 정보 제공** | OpenWeather API 연동하여 실시간 기상 정보 제공 |
| **금융 데이터 조회** | 주식 가격 및 암호화폐 시세 가져오기 (Yahoo Finance 등) |
| **번역 및 자연어 처리** | DeepL API, Google Translate API 활용 |
| **문서 및 데이터 분석** | PDF 및 CSV 데이터 처리 후 API 호출 |

LangChain과 API를 연동하면 단순한 질문-응답을 넘어, 실시간 데이터 활용이 필요한 챗봇이나 자동화 시스템을 개발할 수 있습니다.

---

## 2. LangChain에서 REST API 호출하기

LangChain은 `requests` 라이브러리 또는 `Tool` 클래스를 활용하여 외부 API를 호출할 수 있습니다. 이를 통해 다양한 데이터 소스를 활용하여 AI의 응답을 개선할 수 있습니다.

### 2.1 기본적인 REST API 호출 예제

아래 예제는 OpenWeather API를 활용하여 특정 도시의 날씨 정보를 가져오는 코드입니다.

```python
import requests

def fetch_weather(city):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid=YOUR_API_KEY"
    response = requests.get(url)
    return response.json()

print(fetch_weather("Seoul"))
```

이 함수는 OpenWeather API에서 특정 도시의 날씨 정보를 JSON 형식으로 반환합니다.


---

## 3. LangChain Tool을 사용한 API 연동

LangChain에서는 `Tool` 클래스를 활용하여 API를 쉽게 연동할 수 있습니다. 이를 사용하면 API 호출을 LangChain의 에이전트가 직접 실행할 수 있습니다.

### 3.1 LangChain Tool을 이용한 날씨 API 연동

```python
from langchain.tools import Tool
import requests

def weather_api(city: str):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid=YOUR_API_KEY"
    response = requests.get(url)
    return response.json()["weather"][0]["description"]

weather_tool = Tool(
    name="WeatherAPI",
    func=weather_api,
    description="도시 이름을 입력하면 현재 날씨를 반환합니다."
)

print(weather_tool.run("Seoul"))
```

이제 `weather_tool`을 LangChain의 에이전트와 결합하여 사용할 수도 있습니다.

---

## 4. OpenAI API와 LangChain 결합

LangChain은 OpenAI API를 활용하여 강력한 언어 모델 기반 AI 시스템을 구축할 수 있습니다.

### 4.1 OpenAI API 호출 예제

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model_name="gpt-4o-mini")
response = llm.invoke("LangChain과 API 연동 방법을 설명해줘.")
print(response)
```

이 코드는 LangChain을 통해 OpenAI의 GPT 모델을 활용하는 방법을 보여줍니다.

---

## 5. LangChain과 외부 서비스 연결하기

LangChain을 활용하여 다양한 외부 서비스와 쉽게 연동할 수 있습니다.

### 5.1 Google Translate API 활용

Google Translate API를 활용하여 번역 기능을 LangChain과 연동할 수 있습니다.

```python
from googletrans import Translator

translator = Translator()
result = translator.translate("Hello, how are you?", dest="ko")
print(result.text)  # "안녕하세요, 어떻게 지내세요?"
```


### 5.2 주식 및 금융 데이터 API 활용 (Yahoo Finance)

```python
import yfinance as yf

def fetch_stock_price(ticker):
    stock = yf.Ticker(ticker)
    return stock.history(period="1d").iloc[-1]["Close"]

print(fetch_stock_price("AAPL"))  # 애플 주식 가격 출력
```

이 방식으로 LangChain을 금융 데이터 분석 시스템과 연결할 수 있습니다.

---

## 6. API 응답을 LangChain 프롬프트에 활용

LangChain의 LLM을 활용하여 API 데이터를 프롬프트에 삽입하고, 보다 풍부한 응답을 생성할 수 있습니다.

### 6.1 날씨 정보를 활용한 LangChain 프롬프트 생성

```python
from langchain_core.prompts import ChatPromptTemplate

weather_data = weather_api("Seoul")

prompt = ChatPromptTemplate.from_messages([
    ("system", "너는 기상 전문가야. 사용자에게 실시간 날씨 정보를 제공해."),
    ("human", f"현재 서울의 날씨는 {weather_data} 입니다. 이에 대한 분석을 제공해줘."),
])

messages = prompt.format_messages()
response = llm.invoke(messages)
print(response)
```

이렇게 하면 API 데이터를 LangChain의 LLM과 결합하여 더욱 정교한 응답을 생성할 수 있습니다.

---

## 7. 결론

LangChain을 활용하면 API 데이터를 AI 모델과 결합하여 더욱 정교한 시스템을 구축할 수 있습니다.

- **REST API 연동**: OpenWeather, Yahoo Finance, Google Translate 등 다양한 API와 연결 가능.
- **LangChain Tool 활용**: API를 Tool로 등록하여 자동화된 AI 응답 제공.
- **OpenAI API와의 결합**: LLM과 API 데이터를 함께 활용하여 강력한 응답 생성.
- **실시간 데이터 활용**: 금융 데이터, 날씨 정보 등 실시간 데이터를 활용한 AI 구축 가능.

