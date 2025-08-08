---
title: "AI 활용 vs 연구: 차이점과 실무 적용법"
author: mminzy22
date: 2025-02-04 19:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, AI활용, HuggingFace, TIL]
description: "AI 활용과 연구의 차이점. 그리고 API 및 사전 학습 모델, 파이썬 패키지 관리, 허깅페이스를 활용하는 방법"
pin: false
math: true
---


## AI 활용과 연구의 개념

인공지능(AI)은 다양한 방식으로 사용될 수 있으며, AI를 다루는 방법은 크게 두 가지로 나뉩니다: **AI 활용**과 **AI 연구**입니다. 이 두 개념은 비슷해 보이지만 목적과 접근 방식이 상당히 다릅니다.

### AI 연구
AI 연구는 새로운 알고리즘을 개발하거나, 기존 알고리즘을 개선하여 AI의 성능을 높이는 것을 목표로 합니다. 연구자들은 보통 다음과 같은 일들을 수행합니다:

- AI 모델의 성능을 향상시키기 위한 새로운 방법론 개발
- 데이터 학습 방식을 개선하는 알고리즘 연구
- AI 모델의 효율성을 높이기 위한 최적화 기법 개발
- 수학적 이론과 머신러닝 개념을 활용하여 AI를 발전시키는 연구

#### AI 연구 예시
- 새로운 음성 인식 알고리즘 개발
- 딥러닝 모델의 학습 속도를 높이는 최적화 기법 연구
- 강화 학습을 이용한 자율주행 시스템 개선

### AI 활용
반면, AI 활용은 연구보다는 실무적인 접근 방식으로, 이미 만들어진 AI 모델이나 API를 활용하여 특정 문제를 해결하는 것을 목표로 합니다. 연구처럼 AI의 내부 알고리즘을 변경하거나 새로 만드는 것이 아니라, 기존의 AI 기술을 응용하는 데 초점을 맞춥니다.

#### AI 활용 예시
- 음성 인식 AI를 활용한 챗봇 개발
- 자연어 처리(NLP) API를 사용한 자동 번역 시스템 구축
- 사전 학습된 모델을 이용해 얼굴 인식 시스템 개발

## API 및 사전 학습 모델의 활용

### API(Application Programming Interface)란?
API는 개발자가 복잡한 AI 기능을 쉽게 사용할 수 있도록 제공되는 인터페이스입니다. 이를 활용하면 직접 AI 모델을 개발하지 않고도 AI 기능을 손쉽게 적용할 수 있습니다.

#### API 예시
- **Google Vision API**: 이미지를 분석하고 객체를 인식하는 기능 제공
- **OpenAI GPT API**: 텍스트 생성 및 자연어 처리 기능 제공
- **IBM Watson API**: 음성 인식, 번역, 데이터 분석 기능 제공

### 사전 학습 모델(Pre-trained Model)이란?
사전 학습 모델은 방대한 데이터로 미리 학습된 AI 모델입니다. 이를 활용하면 데이터 학습 과정을 생략하고 바로 예측 및 분류 작업을 수행할 수 있습니다.

#### 사전 학습 모델 예시
- **GPT 시리즈**: 자연어 처리(NLP)에서 텍스트 생성, 번역, 요약 등을 수행할 수 있는 모델
- **YOLO(You Only Look Once)**: 실시간 객체 탐지를 수행하는 모델
- **BERT(Bidirectional Encoder Representations from Transformers)**: 자연어 이해 및 질의응답 모델

## 인공지능의 개념을 이해해야 하는 이유
AI를 활용할 때 반드시 기초적인 개념을 이해해야 하는 이유는 다음과 같습니다:

### 1. 기초 개념 이해
AI가 어떻게 작동하는지 알면, 문제 해결에 적절한 도구나 모델을 선택하는 데 도움이 됩니다.

**예시**: 회귀와 분류 문제를 이해하면 각각에 맞는 AI 모델을 선택하고 적절히 활용할 수 있습니다.

### 2. AI의 한계 인식
AI는 만능이 아닙니다. 기초 개념을 이해하면 AI가 갖는 한계를 알고 현실적인 기대를 설정할 수 있습니다.

**예시**: AI 기반 자동 번역 시스템이 완벽하지 않다는 점을 이해하고, 이를 보완할 방법을 고민할 수 있습니다.

### 3. 결과 해석 능력
AI의 예측 결과를 올바르게 해석할 수 있어야 합니다. 단순히 AI의 결과를 신뢰하는 것이 아니라, 그 결과가 의미하는 바를 정확히 분석하고 적용할 수 있어야 합니다.

**예시**: AI 모델이 출력한 데이터의 신뢰성을 평가하여 오류를 방지할 수 있습니다.

## 파이썬 패키지 관리 및 가상환경 설정

### 패키지란?
패키지는 여러 모듈을 묶어놓은 디렉토리입니다. 예를 들어, `pandas`, `numpy`, `Django` 같은 라이브러리들이 패키지입니다.

### `pip` 패키지 관리

```bash
pip install 패키지명
pip install 패키지명==버전번호
pip list
```

### Conda 및 venv 가상환경 설정
#### Conda 가상환경 설정

```bash
conda create --name 환경이름
conda activate 환경이름
conda deactivate
conda env remove -n 환경이름
```

#### venv 가상환경 설정

```bash
python -m venv 환경이름
source 환경이름/bin/activate  # Mac/Linux
환경이름/Scripts/activate  # Windows
deactivate
```

### `requirements.txt` 및 `environment.yml` 활용

```bash
pip freeze > requirements.txt
pip install -r requirements.txt
conda env export --from-history > environment.yml
conda env create -f environment.yml
```

## 허깅페이스(Hugging Face)

### 허깅페이스란?
Hugging Face는 자연어 처리(NLP)를 중심으로 다양한 AI 모델을 제공하는 플랫폼입니다.

#### 특징
- **Transformers 라이브러리**: 최신 NLP 모델 사용 가능
- **Model Hub**: 수천 개의 사전 학습된 모델 제공
- **오픈소스 커뮤니티**: 전 세계 개발자가 협력하여 발전

### 허깅페이스의 장점과 단점
#### 장점
- 쉬운 접근성
- 다양한 모델 제공
- 오픈소스 지원
#### 단점
- 높은 컴퓨팅 리소스 요구
- 초보자에게 다소 까다로울 수 있는 초기 설정 과정, 하지만 기본적인 사용법은 매우 직관적이며 쉽게 배울 수 있음

### 허깅페이스 활용 예시

```bash
conda activate 환경이름
pip install transformers
```

GPT 모델을 사용하여 텍스트를 생성하거나 번역하는 등의 작업을 쉽게 수행할 수 있습니다.

