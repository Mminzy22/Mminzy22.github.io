---
title: "Hugging Face의 Transformers 라이브러리로 NLP 모델 활용하기"
author: mminzy22
date: 2025-02-07 20:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, Hugging Face, Transformers, Deep Learning, AI, TIL]
description: "Hugging Face의 Transformers 라이브러리를 활용해 BERT, GPT-2, RoBERTa 등 다양한 NLP 모델을 쉽게 사용하는 방법"
pin: false
math: true
---


## 1. Transformers 라이브러리란?

Hugging Face의 **`Transformers`** 라이브러리는 다양한 자연어 처리(NLP) 모델을 쉽게 사용할 수 있도록 지원하는 오픈소스 라이브러리입니다. 이 라이브러리를 활용하면 최신 NLP 모델들을 간편하게 불러와 텍스트 생성, 감성 분석, 번역 등의 작업을 수행할 수 있습니다.

## 2. 실습 전 준비하기

본격적인 실습을 진행하기 전에 필요한 설정을 먼저 완료해야 합니다.

### 가상 환경 활성화

```bash
conda activate 환경이름
```

### Transformers 라이브러리 버전 낮추기

```bash
pip install transformers==4.37.0
```

### Python 경고 메시지 숨기기

```python
import warnings
warnings.filterwarnings('ignore')
```

## 3. 다양한 NLP 모델 활용하기

### 1. GPT-2로 텍스트 생성하기

`GPT-2`는 OpenAI에서 개발한 언어 생성 모델로, 문장을 생성하거나 이어지는 텍스트를 예측하는 데 뛰어난 성능을 발휘합니다.

```python
from transformers import pipeline

# GPT-2 기반 텍스트 생성 파이프라인 로드
generator = pipeline("text-generation", model="gpt2")

# 텍스트 생성
result = generator("Once upon a time", max_length=50, num_return_sequences=1)
print(result)
```

#### 코드 설명

```python
from transformers import pipeline
```

- **`transformers` 라이브러리**는 자연어 처리(NLP) 모델을 쉽게 사용할 수 있도록 도와주는 라이브러리입니다.
- `pipeline` 함수는 사전 훈련된 모델을 간단하게 로드하고 사용할 수 있도록 합니다.

```python
generator = pipeline("text-generation", model="gpt2")
```

- `"text-generation"`은 **텍스트 생성(task)** 을 수행하는 모델을 불러오겠다는 의미입니다.
- `model="gpt2"`는 OpenAI의 **GPT-2 모델**을 사용하겠다는 뜻입니다.
- 이 코드가 실행되면, **사전 훈련된 GPT-2 모델**이 자동으로 다운로드됩니다(한 번 다운로드하면 이후에는 캐시에서 사용).

```python
result = generator("Once upon a time", max_length=50, num_return_sequences=1)
```

- `generator()` 함수를 사용하여 **텍스트를 생성**합니다.
- `"Once upon a time"`: 입력 프롬프트(시작 문장) → 이 문장에서 이어지는 문장을 예측하여 생성합니다.
- `max_length=50`: **최대 50 토큰** 길이까지 텍스트를 생성합니다.
- `num_return_sequences=1`: **1개의 문장만 생성**하도록 설정합니다.

```python
print(result)
```

- 결과를 출력합니다. `result`는 리스트 형식이며, 생성된 문장이 포함된 사전(dictionary) 형태로 반환됩니다.


### 2. 간단한 감성어 분석

감성 분석(Sentiment Analysis)은 텍스트가 긍정적인지, 부정적인지를 판단하는 작업입니다.

```python
from transformers import pipeline

# 감정 분석 파이프라인 로드
sentiment_analysis = pipeline("sentiment-analysis")
result = sentiment_analysis("I love using Hugging Face!")
print(result)
```

#### 코드 설명

```python
sentiment_analysis = pipeline("sentiment-analysis")
```

- `"sentiment-analysis"`: 감성 분석을 수행하는 모델을 불러오겠다는 의미입니다.
- 기본적으로 **DistilBERT 기반 감성 분석 모델**(`distilbert-base-uncased-finetuned-sst-2-english`)이 로드됩니다.
- 이 모델은 문장이 **긍정(positive)인지 부정(negative)인지** 분류하는 역할을 합니다.

```python
result = sentiment_analysis("I love using Hugging Face!")
```

- `"I love using Hugging Face!"`라는 문장을 감성 분석기에 입력합니다.
- 모델이 해당 문장의 감정을 분석하여 **긍정(positive) 또는 부정(negative)** 을 판단합니다.

```python
print(result)
```

- 감성 분석 결과를 출력합니다.
- `result`는 **리스트 형식**으로 반환되며, 내부에 **라벨(label)과 확률(score)이 포함된 딕셔너리(dictionary)** 가 들어 있습니다.

**다른 예제 실행**
1) 부정적인 문장 입력:

```python
result = sentiment_analysis("I hate waiting in long lines.")
print(result)
```

출력 예:

```python
[{'label': 'NEGATIVE', 'score': 0.9985}]
```

이처럼 부정적인 문장을 입력하면 `"NEGATIVE"`로 분류됩니다.

2) 중립적인 문장 입력:

```python
result = sentiment_analysis("I am feeling okay today.")
print(result)
```

출력 예:

```python
[{'label': 'POSITIVE', 'score': 0.65}]
```

- 이 모델은 긍정/부정만 분류하기 때문에, 중립적인 문장도 긍정/부정으로 분류될 수 있습니다.
- `"POSITIVE"`로 분류되었지만 신뢰도(`score`)가 상대적으로 낮은 것을 볼 수 있습니다.


### 3. RoBERTa를 활용한 감정 분석

`RoBERTa`는 `BERT` 모델을 최적화한 버전으로, 텍스트 분류 및 감성 분석에서 뛰어난 성능을 보입니다.

```python
from transformers import pipeline

# RoBERTa 기반 감정 분석 파이프라인 로드
classifier = pipeline("sentiment-analysis", model="roberta-base")

# 감정 분석 실행
result = classifier("This product is amazing!")
print(result)  # [{'label': 'POSITIVE', 'score': 0.9998}]
```

#### 코드 설명

```python
from transformers import pipeline
```

- `transformers` 라이브러리는 **사전 훈련된 NLP 모델**을 쉽게 사용할 수 있도록 도와줍니다.
- `pipeline` 함수는 특정 **작업(Task)** 에 맞는 모델을 불러올 수 있도록 지원합니다.

```python
classifier = pipeline("sentiment-analysis", model="roberta-base")
```

- `"sentiment-analysis"`: **감성 분석(Sentiment Analysis)** 을 수행하는 모델을 불러오겠다는 의미입니다.
- `model="roberta-base"`: OpenAI가 개발한 `RoBERTa` 모델의 **기본(base) 버전**을 사용합니다.
  - RoBERTa는 **BERT 모델을 개선한 버전**으로, 더 많은 데이터를 사용해 학습하고, 성능이 향상된 모델입니다.
  - 하지만 **"roberta-base"는 감성 분석을 위해 학습된 모델이 아니므로**, 이 코드는 감성 분석에 최적화된 모델이 아닙니다.
  - 감성 분석을 정확히 수행하려면 `"cardiffnlp/twitter-roberta-base-sentiment"` 같은 감성 분석에 특화된 RoBERTa 모델을 사용하는 것이 더 좋습니다.

```python
result = classifier("This product is amazing!")
```

- `"This product is amazing!"` (이 제품은 정말 놀라워요!)라는 문장을 감성 분석기에 입력합니다.
- RoBERTa 모델이 해당 문장의 감정을 분석하여 **긍정(positive) 또는 부정(negative)** 으로 분류합니다.

```python
print(result)
```

- 감성 분석 결과를 출력합니다.
- `result`는 **리스트 형태**로 반환되며, 내부에 **감정 라벨(label)과 신뢰도(score)** 가 포함된 딕셔너리(dictionary) 형태로 되어 있습니다.


**감성 분석에 특화된 RoBERTa 모델 사용**
기본 `roberta-base` 모델은 일반적인 텍스트 처리를 위한 모델이며, 감성 분석에 특화되지 않았습니다.  
감성 분석에 최적화된 RoBERTa 모델을 사용하려면 다음과 같이 바꿀 수 있습니다.

```python
classifier = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")
```

이 모델은 감성 분석을 위해 트위터 데이터로 학습된 `RoBERTa` 모델이며, 긍정/부정뿐만 아니라 **중립(Neutral) 감정도 예측할 수 있습니다.**

## 4. BERT 바로 사용이 어려운 이유

`BERT`는 사전 학습된 언어 모델로, 기본적으로 텍스트 분류와 같은 작업을 수행하려면 **파인튜닝(Fine-tuning)**이 필요합니다. BERT의 기본 모델은 일반적인 언어 모델링만 학습되어 있기 때문에, 추가적인 훈련이 없으면 적절한 예측을 하지 못할 가능성이 큽니다.

## 5. 실습 진행하기

### 1. Word2Vec 기법 사용하기

Word2Vec은 단어 간의 유사도를 계산하는 대표적인 임베딩 기법입니다.

```python
# gensim 라이브러리 설치 (명령어는 터미널에서 실행해야 함)
pip install gensim

# 필요한 라이브러리 불러오기
from gensim.models import Word2Vec  # Word2Vec 모델을 사용하기 위한 라이브러리
from gensim.utils import simple_preprocess  # 문장을 단어 리스트로 변환하는 함수
from scipy.spatial.distance import cosine  # 코사인 거리 계산을 위한 함수

# 예시 문장 입력 (Word2Vec 모델을 학습할 문장 데이터)
sentences = [
    "The quick brown fox jumps over the lazy dog",
    "I love playing with my pet dog",
    "The dog barks at the stranger",
    "The cat sleeps on the sofa",
]

# 문장을 단어 단위로 변환 (토큰화: 문장을 소문자로 변환하고 불필요한 기호를 제거한 단어 리스트로 변환)
processed = [simple_preprocess(sentence) for sentence in sentences]

# Word2Vec 모델 학습
model = Word2Vec(
    sentences=processed,  # 학습할 문장 데이터
    vector_size=5,  # 각 단어를 5차원 벡터로 변환
    window=5,  # 한 단어를 기준으로 앞뒤 5개의 단어까지 고려
    min_count=1,  # 최소 1번 이상 등장한 단어만 학습에 사용
    sg=0  # CBOW(Continuous Bag of Words) 방식 사용 (sg=1이면 Skip-gram 방식)
)

# 'dog' 단어의 임베딩 벡터 확인
dog = model.wv['dog']
# 'cat' 단어의 임베딩 벡터 확인
cat = model.wv['cat']

# 두 단어 간의 코사인 유사도 계산 (값이 1에 가까울수록 유사한 단어)
sim = 1 - cosine(dog, cat)

# 유사도 출력
print(f"Cosine similarity between 'dog' and 'cat': {sim:.4f}")
```

### 2. BERT 기반의 문장 임베딩 비교하기

BERT를 활용해 문장 간의 의미적 유사도를 비교할 수 있습니다.

```python
# 필요한 라이브러리 불러오기
from transformers import BertModel, BertTokenizer  # BERT 모델과 토크나이저 로드
import torch  # PyTorch 사용
from scipy.spatial.distance import cosine  # 코사인 거리 계산 함수

# BERT 모델 및 토크나이저 로드
model_name = "bert-base-uncased"  # 사전 훈련된 BERT 모델 이름
tokenizer = BertTokenizer.from_pretrained(model_name)  # 토크나이저 로드 (BERT에 맞게 토큰화)
model = BertModel.from_pretrained(model_name)  # 사전 훈련된 BERT 모델 로드

# 비교할 문장 입력 (유사도 비교할 두 개의 문장)
sentences = [
    "The quick brown fox jumps over the lazy dog",
    "A fast brown fox leaps over a sleepy dog"
]

# 문장 토큰화 및 입력 텐서 생성
input1 = tokenizer(sentences[0], return_tensors='pt')  # 첫 번째 문장을 BERT 입력 형식으로 변환
input2 = tokenizer(sentences[1], return_tensors='pt')  # 두 번째 문장을 BERT 입력 형식으로 변환

# 모델을 사용하여 문장 임베딩(벡터) 생성
with torch.no_grad():  # 그래디언트 계산을 비활성화하여 메모리 절약 (학습이 아니라 추론이므로 필요 없음)
    output1 = model(**input1)  # 첫 번째 문장의 BERT 출력
    output2 = model(**input2)  # 두 번째 문장의 BERT 출력

# 평균 풀링을 통한 문장 벡터 생성
# BERT의 `last_hidden_state`는 각 토큰의 임베딩을 반환하므로, 평균을 내어 문장 벡터로 변환
embedding1 = output1.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()  # 첫 번째 문장 벡터
embedding2 = output2.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()  # 두 번째 문장 벡터

# 코사인 유사도 계산 (1에 가까울수록 유사한 의미)
similarity = 1 - cosine(embedding1, embedding2)

# 결과 출력
print(f"Cosine similarity between the two sentences: {similarity:.4f}")
```

#### 코드 설명
1. BERT 모델 및 토크나이저 로드
    - `"bert-base-uncased"` 사전 훈련된 BERT 모델과 토크나이저를 불러옴.
2. 입력 문장을 BERT가 처리할 수 있도록 변환
    - `tokenizer(sentences[0], return_tensors='pt')` → 문장을 토큰화하고 PyTorch 텐서로 변환.
3. BERT를 사용하여 문장 벡터 생성
    - `model(**input1)` → 문장의 토큰 벡터(단어별 임베딩)를 생성.
    - `last_hidden_state.mean(dim=1)` → 모든 단어 벡터의 평균을 구해 하나의 문장 벡터 를 생성.
4. 코사인 유사도를 사용하여 두 문장의 의미적 유사성 비교
    - 코사인 유사도는 값이 `1`에 가까울수록 유사한 의미를 가짐.

### 3. 번역 모델 활용하기

#### M2M100 모델을 이용한 번역

```python
# 필요한 라이브러리 불러오기
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer  # M2M100 번역 모델과 토크나이저 로드

# 모델 및 토크나이저 로드 (Facebook의 M2M100 모델 사용)
model_name = "facebook/m2m100_418M"  # 다국어 번역을 위한 사전 훈련된 모델
tokenizer = M2M100Tokenizer.from_pretrained(model_name)  # 토크나이저 로드
model = M2M100ForConditionalGeneration.from_pretrained(model_name)  # 번역 모델 로드

# 번역할 문장 정의 (영어 문장을 다른 언어로 번역)
sentence = "The quick brown fox jumps over the lazy dog"

# 입력 문장을 토큰화 (BERT 등의 모델처럼 텍스트를 숫자로 변환)
tokenizer.src_lang = "en"  # 원본 문장이 영어(en)임을 설정
encoded_sentence = tokenizer(sentence, return_tensors="pt")  # 토큰화하여 PyTorch 텐서로 변환

# 번역 실행 (M2M100 모델을 사용하여 문장을 생성)
generated_tokens = model.generate(**encoded_sentence)  # 번역된 문장의 토큰을 생성

# 번역된 토큰을 실제 텍스트로 변환
translated_text = tokenizer.decode(generated_tokens[0], skip_special_tokens=True)

# 번역된 문장 출력
print(f"Translated text: {translated_text}")
```

#### 코드 설명
1. **Facebook의 M2M100 모델 및 토크나이저 로드**
   - `"facebook/m2m100_418M"`은 다국어 번역을 지원하는 사전 훈련된 모델.
   - M2M100은 **100개 이상의 언어를 상호 번역**할 수 있음.

2. **입력 문장을 토큰화**
   - `tokenizer.src_lang = "en"` → 원본 문장이 영어임을 설정.
   - `tokenizer(sentence, return_tensors="pt")` → 문장을 **BERT 스타일의 토큰화** 후 PyTorch 텐서로 변환.

3. **번역 실행**
   - `model.generate(**encoded_sentence)` → 번역된 문장의 **토큰(숫자 형태의 데이터) 생성**.

4. **번역된 결과를 디코딩**
   - `tokenizer.decode(generated_tokens[0], skip_special_tokens=True)`
   - 생성된 토큰을 **문자열(텍스트)로 변환**.


이처럼 **Hugging Face의 Transformers 라이브러리**를 활용하면 최신 NLP 모델을 쉽게 사용할 수 있습니다. 각 모델은 특정 작업에 최적화되어 있으며, **텍스트 생성, 감성 분석, 번역, 문장 임베딩 등 다양한 자연어 처리 기능**을 효율적으로 수행할 수 있습니다.

