---
title: "Hugging Face 모델의 사전 학습과 파인 튜닝"
author: mminzy22
date: 2025-02-07 20:30:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, Hugging Face, Transformers, Deep Learning, AI, TIL]
description: "Hugging Face 모델의 사전 학습(Pre-training)과 파인 튜닝(Fine-tuning)의 개념을 배우고, IMDb 데이터셋을 활용해 BERT 모델을 파인 튜닝하는 방법"
pin: false
math: true
---


## 1. 사전 학습(Pre-training)

### 사전 학습이란?

**사전 학습(Pre-training)**은 대규모 텍스트 데이터셋을 사용해 모델이 일반적인 언어 이해 능력을 학습하는 과정입니다. 이 단계에서는 특정 작업(예: 번역, 감정 분석 등)에 맞춘 학습이 아닌, 언어의 패턴과 구조를 학습하는 것이 목적입니다.

### 사전 학습의 특징

1. **대규모 데이터셋 사용**
   - 인터넷에서 수집한 방대한 텍스트 데이터로 학습
   - 예: **`BERT`**는 수십억 개의 문장으로 학습됨

2. **일반적인 언어 이해**
   - 단어 의미, 문장 구조, 문맥을 학습

3. **작업 비특화**
   - 특정 작업이 아닌, 언어의 전반적인 특징을 학습

### 사전 학습의 목적

사전 학습을 통해 모델은 다양한 텍스트에서 언어의 기본적인 규칙을 배우고, 특정 작업에 빠르게 적응할 수 있는 기반을 다집니다. Hugging Face에서 제공하는 대부분의 모델은 이 단계를 완료한 상태로 제공됩니다.

### 예시: BERT의 사전 학습

**BERT**는 두 가지 주요 학습 과정을 수행합니다.

1. **Masked Language Modeling (MLM)**
   - 문장의 일부 단어를 마스킹한 후 이를 예측하도록 학습
   - 문맥을 양방향으로 이해하는 능력 강화

2. **Next Sentence Prediction (NSP)**
   - 두 문장이 연속된 문장인지 예측하는 작업
   - 문장 간의 관계를 학습


## 2. 파인 튜닝(Fine-tuning)

### 파인 튜닝이란?

**파인 튜닝(Fine-tuning)**은 사전 학습된 모델을 특정 작업에 맞게 추가 학습하는 과정입니다. 예를 들어, **`BERT`** 모델을 감정 분석에 사용하려면, 기존 가중치를 유지하면서 감정 분석 작업에 맞게 모델을 조정합니다.

### 파인 튜닝의 특징

1. **작업 특화**
   - 특정 작업(예: 텍스트 분류, 번역, 질의 응답 등)에 맞춰 최적화

2. **사전 학습 가중치 활용**
   - 기존의 언어 이해 능력을 바탕으로 새로운 작업에 적응

3. **적은 데이터로도 가능**
   - 사전 학습 덕분에 적은 데이터로도 효과적인 학습 가능

### 파인 튜닝의 목적

사전 학습된 모델을 특정 작업에서 최상의 성능을 발휘하도록 조정하는 과정입니다. Hugging Face의 모델들은 대부분 이 과정을 거쳐 다양한 애플리케이션에 활용됩니다.


## 3. IMDb 데이터셋을 활용한 BERT 파인 튜닝 실습

### 1. 필요한 라이브러리 설치 및 임포트

```bash
pip install transformers datasets torch accelerate -U
```

#### **각 패키지 설명**
```bash
pip install transformers datasets torch accelerate -U
```

- `pip install` → 패키지를 설치하는 명령어.
- `-U` → 이미 설치된 패키지가 있으면 최신 버전으로 **업그레이드(Upgrade)**.

**설치되는 패키지**
1. **`transformers`**  
   - Hugging Face의 **사전 훈련된 NLP 모델**(BERT, GPT, RoBERTa 등)을 쉽게 사용할 수 있도록 도와주는 라이브러리.
   - 텍스트 생성, 번역, 감성 분석, 질의응답 등 다양한 작업을 수행 가능.

2. **`datasets`**  
   - Hugging Face의 **데이터셋 라이브러리**로, 다양한 공개 데이터셋을 손쉽게 로드하고 활용할 수 있음.
   - 예제: `load_dataset("imdb")` → IMDB 영화 리뷰 데이터셋 로드.

3. **`torch`**  
   - **PyTorch** 라이브러리. 머신러닝 및 딥러닝 모델을 만들고 학습할 때 사용.
   - BERT, GPT 등의 모델을 사용할 때 PyTorch 기반으로 동작함.

4. **`accelerate`**  
   - 모델 훈련과 추론을 **GPU(멀티 GPU 포함), TPU 등에서 최적화하여 실행**할 수 있도록 도와주는 Hugging Face 라이브러리.
   - `transformers`와 `torch`를 함께 사용할 때 속도를 향상시키는 데 도움을 줌.


```python
# 필요한 라이브러리 불러오기
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments  
# - BertTokenizer: BERT 모델에서 사용할 토크나이저 (문장을 토큰으로 변환)
# - BertForSequenceClassification: 문장 분류(예: 감성 분석)를 위한 BERT 모델
# - Trainer: 모델 훈련을 간편하게 할 수 있도록 도와주는 Hugging Face의 훈련 클래스
# - TrainingArguments: 모델 학습을 위한 하이퍼파라미터 및 설정을 정의하는 클래스

from datasets import load_dataset  
# - Hugging Face의 `datasets` 라이브러리를 사용하여 다양한 공개 데이터셋을 쉽게 로드할 수 있음

import torch  
# - PyTorch 라이브러리: 딥러닝 모델을 만들고 학습 및 실행할 때 사용
# - BERT 모델은 PyTorch 기반으로 실행되며, GPU 가속을 활용할 수 있음
```

### 2. IMDb 데이터셋 로드

```python
# IMDb 데이터셋 로드
# Hugging Face의 `datasets` 라이브러리를 사용하여 IMDb 영화 리뷰 데이터셋을 불러옵니다.
# IMDb 데이터셋은 감성 분석(Sentiment Analysis)에 자주 사용되며,
# 긍정(positive) 또는 부정(negative)으로 레이블이 지정된 영화 리뷰를 포함하고 있습니다.
dataset = load_dataset("imdb")

# 훈련 및 테스트 데이터셋 분리

# 1. `dataset['train']`: IMDb 데이터셋에서 훈련 데이터(train) 부분을 가져옵니다.
# 2. `.shuffle(seed=42)`: 데이터를 랜덤하게 섞어 학습 시 특정 순서에 의존하지 않도록 합니다.
#    - `seed=42`를 설정하면 매번 실행할 때마다 같은 순서로 섞이도록 보장합니다 (재현성 확보).
# 3. `.select(range(1000))`: 훈련 데이터에서 처음 1000개의 샘플만 선택하여 사용할 수 있도록 합니다.
#    - 전체 데이터셋이 크기 때문에, 빠른 실험을 위해 일부 샘플만 선택하는 경우 유용합니다.
train_dataset = dataset['train'].shuffle(seed=42).select(range(1000))  # 1000개 샘플 선택

# 1. `dataset['test']`: IMDb 데이터셋에서 테스트 데이터(test) 부분을 가져옵니다.
# 2. `.shuffle(seed=42)`: 테스트 데이터도 랜덤하게 섞어 다양한 경우를 테스트할 수 있도록 합니다.
# 3. `.select(range(500))`: 테스트 데이터에서 처음 500개의 샘플만 선택하여 평가용으로 사용합니다.
test_dataset = dataset['test'].shuffle(seed=42).select(range(500))  # 500개 샘플 선택
```

### 3. 데이터 전처리 및 토크나이저 적용

```python
# BERT 토크나이저 로드
# "bert-base-uncased"는 소문자화(uncased)된 영어 BERT 모델을 의미합니다.
# 이 토크나이저는 입력된 텍스트를 BERT 모델이 이해할 수 있도록 토큰화합니다.
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
# ->BERT 모델이 학습할 수 있도록 텍스트를 숫자로 변환하는 토크나이저 로드.

# 토크나이저를 적용하는 함수 정의
def tokenize_function(examples):
    # 'text' 키를 가진 데이터셋의 문장을 BERT의 입력 형식으로 변환합니다.
    return tokenizer(
        examples['text'],       # 데이터셋에서 'text' 필드를 가져와 토큰화
        padding="max_length",   # 모든 샘플을 최대 길이까지 패딩 (길이를 맞춰주기 위함)
        truncation=True         # 문장이 너무 길 경우 최대 길이에 맞춰 자름 (truncation)
    )

# 훈련 데이터셋에 토크나이저 적용
# `map()` 함수는 데이터셋의 모든 샘플에 `tokenize_function()`을 적용합니다.
# `batched=True` 옵션을 사용하면 여러 샘플을 한 번에 변환하여 속도를 향상시킬 수 있습니다.
train_dataset = train_dataset.map(tokenize_function, batched=True)

# 테스트 데이터셋에도 동일한 토크나이징 적용
test_dataset = test_dataset.map(tokenize_function, batched=True)

# PyTorch 텐서 형식으로 변환 (모델 입력에 맞게 변환)
# 'input_ids': 토큰화된 문장의 ID 값
# 'attention_mask': 패딩된 부분을 무시하도록 하는 마스크
# 'label': 해당 샘플의 정답 라벨 (긍정/부정 등)
train_dataset.set_format(type='torch', columns=['input_ids', 'attention_mask', 'label'])
test_dataset.set_format(type='torch', columns=['input_ids', 'attention_mask', 'label'])
```

### 4. BERT 모델 로드 및 파인 튜닝

```python
# BERT 모델 로드
# 'bert-base-uncased' 사전 훈련된 BERT 모델을 불러옵니다.
# `BertForSequenceClassification`은 문장 분류(예: 감성 분석, 스팸 탐지 등)에 특화된 BERT 모델입니다.
# `num_labels=2`는 이 모델이 **이진 분류(예: 긍정/부정)** 를 수행하도록 설정합니다.
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)

# 훈련 인자(Training Arguments) 설정
training_args = TrainingArguments(
    output_dir='./results',       # 모델의 체크포인트(훈련 중간 저장 파일)를 저장할 디렉터리
    num_train_epochs=3,           # 총 3번(3 epochs) 데이터셋을 학습 (훈련 데이터셋을 3회 반복)
    per_device_train_batch_size=8, # 학습 배치 크기 (각 GPU 또는 CPU에서 한 번에 처리할 샘플 개수)
    per_device_eval_batch_size=8,  # 평가 배치 크기 (모델 평가 시 한 번에 처리할 샘플 개수)
    evaluation_strategy="epoch",  # 매 epoch(1회 학습 완료)마다 평가 실행
    save_steps=10_000,            # 10,000 스텝마다 모델 체크포인트 저장
    save_total_limit=2,           # 저장할 체크포인트 개수 제한 (최신 2개만 유지)
)

# 트레이너(Trainer) 설정
trainer = Trainer(
    model=model,                # 훈련할 모델 (BERT)
    args=training_args,         # 위에서 정의한 훈련 인자 적용
    train_dataset=train_dataset, # 훈련 데이터셋
    eval_dataset=test_dataset,  # 평가 데이터셋
)

# 모델 훈련 시작
trainer.train()

# 모델 평가 실행 (테스트 데이터셋으로 성능 평가)
trainer.evaluate()
```

### 5. 모델 평가 및 결과 확인

```python
# 필요한 라이브러리 불러오기
import numpy as np  # 배열 연산을 위한 NumPy
from sklearn.metrics import accuracy_score  # 정확도(Accuracy) 계산 함수

# 평가 지표(Accuracy) 계산 함수 정의
def compute_metrics(p):
    preds = np.argmax(p.predictions, axis=1)  # 모델이 예측한 값 중 가장 높은 확률을 가진 클래스를 선택
    labels = p.label_ids  # 실제 정답 레이블
    acc = accuracy_score(labels, preds)  # 정확도 계산 (정확히 맞춘 개수 / 전체 개수)
    return {'accuracy': acc}  # 결과를 딕셔너리 형태로 반환

# Trainer 객체에 평가 지표 함수 추가
trainer.compute_metrics = compute_metrics

# 모델 평가 실행 (테스트 데이터셋을 이용하여 성능 측정)
eval_result = trainer.evaluate()

# 평가 결과에서 정확도 출력
print(f"Accuracy: {eval_result['eval_accuracy']:.4f}")  # 소수점 4자리까지 출력
```


## 4. 사전 학습 vs 파인 튜닝 요약

| 구분 | 사전 학습(Pre-training) | 파인 튜닝(Fine-tuning) |
|------|------------------|------------------|
| 목적 | 언어의 일반적인 특징 학습 | 특정 작업에 최적화 |
| 데이터 | 대규모 텍스트 데이터 | 특정 작업에 맞는 데이터 |
| 학습 방식 | 언어 모델링(MLM, NSP) | 특정 태스크에 대한 미세 조정 |
| Hugging Face 모델 | `bert-base-uncased` 등 | `bert-base-uncased` + 감정 분석 태스크 |


## 5. 결론

### **사전 학습(Pre-training) vs. 파인 튜닝(Fine-tuning) 요약**

| 개념 | 사전 학습 (Pre-training) | 파인 튜닝 (Fine-tuning) |
|------|-----------------|----------------|
| **정의** | 대량의 일반 텍스트 데이터로 모델을 학습하는 과정 | 특정 작업(감성 분석, 문장 분류 등)에 맞춰 추가 학습하는 과정 |
| **목적** | 언어의 일반적인 패턴과 의미를 학습 | 특정 도메인 또는 특정 태스크에서 성능을 높이기 위함 |
| **데이터** | 대규모 비지도 학습 데이터 (책, 위키백과, 웹 문서 등) | 레이블이 있는 태스크별 데이터셋 (IMDB 감성 분석, 뉴스 분류 등) |
| **학습 방식** | 언어 모델링 (Masked Language Model, Next Sentence Prediction 등) | 기존 모델을 가져와 추가 학습 (Supervised Learning) |
| **예제 모델** | BERT, GPT, RoBERTa, T5 등 | 사전 학습된 BERT → 감성 분석, 질의응답 모델로 튜닝 |
| **계산 비용** | 매우 큼 (수주~수개월, 강력한 GPU 필요) | 상대적으로 적음 (몇 시간~몇 일) |
| **결과** | 범용적인 언어 이해 능력 | 특정 태스크에 최적화된 모델 |

이 두 단계를 거쳐 최신 NLP 모델이 높은 성능을 발휘할 수 있습니다. 사전 학습된 모델을 활용하고, 파인 튜닝을 통해 특정 작업에 최적화하면 훨씬 더 빠르고 효율적으로 AI 모델을 만들 수 있습니다.

