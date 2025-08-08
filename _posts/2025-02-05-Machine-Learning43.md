---
title: "GitHub 오픈소스를 활용한 AI 프로젝트 시작하기"
author: mminzy22
date: 2025-02-05 16:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, GitHub, Deep Learning, PyTorch, API, Transformers, TIL]
description: "GitHub의 오픈소스 프로젝트를 활용하여 다양한 AI 프로젝트를 시작하는 방법 소개"
pin: false
math: true
---


## GitHub와 오픈소스란?

### GitHub란?
GitHub는 코드 저장소이자 협업 플랫폼으로, 전 세계 개발자들이 코드와 아이디어를 공유하고 함께 프로젝트를 진행하는 공간입니다. 이를 통해 개발자들은 보다 효율적으로 협업할 수 있습니다.

### 오픈소스란?
오픈소스는 소스 코드가 공개된 소프트웨어를 의미합니다. 누구나 해당 코드를 보고, 수정하고, 배포할 수 있습니다. 대표적인 오픈소스 프로젝트로는 **리눅스(Linux)**와 **파이썬(Python)**이 있습니다.


## 다양한 AI 프로젝트 소개

GitHub에는 다양한 AI 프로젝트가 존재하며, 다음과 같은 흥미로운 AI 프로젝트들을 활용해볼 수 있습니다.

### 1. DeepArt - AI로 그림 그리기
DeepArt는 딥러닝을 이용해 이미지를 예술 작품처럼 변환하는 프로젝트입니다. 사진을 바탕으로 유명 화가의 스타일을 적용할 수 있습니다.

**활용:** 자신의 사진을 Monet, Van Gogh 스타일로 변환하여 예술적 감각을 뽐낼 수 있습니다.

### 2. OpenAI Gym - 강화학습으로 게임 만들기
OpenAI Gym은 강화학습을 연구하고 개발할 수 있는 라이브러리입니다. 다양한 환경에서 AI 에이전트를 훈련시킬 수 있습니다.

**활용:** 간단한 게임을 만들고, AI가 스스로 게임을 배우고 플레이하도록 설정할 수 있습니다.

### 3. Mozilla Common Voice - 음성 인식 데이터셋 구축하기
Mozilla Common Voice 프로젝트는 AI 음성 인식을 위한 방대한 데이터셋을 구축하는 것을 목표로 합니다.

**활용:** GitHub에서 프로젝트를 클론하고, 자신만의 음성 인식 모델을 훈련시킬 수 있습니다.

### 4. Scikit-learn - 머신러닝 라이브러리
Scikit-learn은 파이썬 기반의 머신러닝 라이브러리로, 다양한 머신러닝 알고리즘을 손쉽게 구현할 수 있도록 도와줍니다.

**활용:** 고객 데이터 분석, 예측 모델 제작 등 다양한 비즈니스 문제를 해결할 수 있습니다.

### 5. Hugging Face Transformers - 자연어 처리 프로젝트
Hugging Face의 Transformers 라이브러리는 최신 NLP 모델(BERT, GPT 등)을 쉽게 활용할 수 있도록 도와줍니다.

**활용:** 텍스트 생성, 번역, 감정 분석 등 다양한 NLP 작업을 수행할 수 있습니다.


## GitHub에서 AI 프로젝트 클론하기

GitHub에서 AI 프로젝트를 클론하는 방법을 알아보겠습니다.

1. **프로젝트 찾기**
   - GitHub에서 "awesome-*" 키워드로 검색하면 다양한 추천 목록을 확인할 수 있습니다.

2. **클론(Clone)**
   - 프로젝트 페이지에서 "Code" 버튼을 클릭하고, 주소를 복사한 후 터미널에서 다음 명령어를 실행합니다.
   ```bash
   git clone [주소]
   ```

3. **실행**
   - 클론한 프로젝트를 자신의 컴퓨터에서 실행하고 필요에 따라 수정하거나 개선할 수 있습니다.

### GitHub의 기여 문화
GitHub에서는 "포크(Fork)하고 별(Starring) 주기"라는 문화가 있습니다. 포크는 다른 사람의 프로젝트를 자신의 저장소로 가져와 수정하는 것이고, 별은 프로젝트를 북마크하는 기능입니다. 이를 통해 오픈소스 커뮤니티가 더욱 활성화됩니다.


## API를 활용한 AI 프로젝트

### API란?
API(Application Programming Interface)는 프로그램 간에 데이터를 주고받을 수 있도록 도와주는 인터페이스입니다. 예를 들어, 음성 인식 기능이 필요한 경우 해당 API에 요청을 보내면 결과를 반환해 줍니다.

### AI API 활용 방법
다음은 AI API를 활용할 수 있는 몇 가지 예제입니다.

1. **ChatGPT API**
   - OpenAI에서 제공하는 텍스트 생성 API로, 자연스러운 응답을 생성할 수 있습니다.

2. **Google Cloud Speech-to-Text API**
   - 음성을 텍스트로 변환해주는 API로, 음성 기반 검색 엔진 등에 활용할 수 있습니다.

3. **Google Vision AI**
   - 이미지 및 비디오 데이터를 분석하는 API로, 얼굴 인식, 객체 탐지 등의 기능을 제공합니다.

4. **DeepL API**
   - 자연스러운 번역을 제공하는 API로, 다국어 서비스 개발에 활용할 수 있습니다.

### API 활용의 장점과 단점

**장점**
- 복잡한 AI 모델을 직접 구현할 필요 없이 쉽게 활용 가능
- 빠른 프로토타입 개발 가능
- 다양한 API를 결합하여 확장성 확보 가능

**단점**
- 사용량에 따라 비용이 발생할 수 있음
- API 제공자가 서비스를 중단하면 문제가 발생할 수 있음


## PyTorch로 Transformer 모델 구현하기

### PyTorch란?
PyTorch는 Facebook AI Research에서 개발한 딥러닝 프레임워크로, 유연한 API와 쉬운 사용법 덕분에 많은 연구자와 개발자들이 사용하고 있습니다.

### Transformer 모델이란?
Transformer는 자연어 처리(NLP)에서 뛰어난 성능을 보이는 모델로, Self-Attention 메커니즘을 활용하여 문맥을 이해하는 강력한 성능을 가지고 있습니다.

### PyTorch로 Transformer 모델 구현하기

```python
import torch
import torch.nn as nn
from torch.nn import Transformer

model = Transformer(d_model=512, nhead=8, num_encoder_layers=6, num_decoder_layers=6)
```

#### 코드 설명
**1. import 문**

```python
import torch
import torch.nn as nn
from torch.nn import Transformer
```

- `torch`: PyTorch의 핵심 라이브러리. 텐서 연산 및 다양한 딥러닝 기능 제공.
- `torch.nn as nn`: 신경망 관련 모듈을 포함하는 `torch.nn`을 `nn`이라는 별칭으로 가져옴.
- `from torch.nn import Transformer`: PyTorch의 `Transformer` 클래스를 직접 임포트하여 사용.

**2. Transformer 모델 생성**

```python
model = Transformer(d_model=512, nhead=8, num_encoder_layers=6, num_decoder_layers=6)
```

2.1. `Transformer`란?
트랜스포머(Transformer)는 자연어 처리(NLP)에서 자주 사용되는 모델로, 기존의 RNN/LSTM과 달리 **Self-Attention 메커니즘**을 사용하여 병렬 연산이 가능하도록 설계되었습니다. 이 모델은 번역, 텍스트 요약 등 다양한 NLP 작업에 사용됩니다.

PyTorch에서 제공하는 `Transformer` 클래스는 트랜스포머 아키텍처를 직접 구현할 수 있도록 해줍니다.

**2.2. 하이퍼파라미터 설명**
트랜스포머 모델을 생성할 때 사용한 주요 하이퍼파라미터를 살펴보겠습니다.

**1) `d_model=512`**
- **임베딩 차원 수**입니다.
- 입력 단어가 벡터로 변환될 때, 각 단어는 512 차원의 벡터로 표현됩니다.
- 일반적으로 `d_model`이 클수록 모델이 더 풍부한 표현을 학습할 수 있지만, 계산 비용도 증가합니다.
- **예제:** `d_model=512`이면, 하나의 단어는 길이 512짜리 벡터로 표현됨.

**2) `nhead=8`**
- **Multi-Head Attention에서 사용할 헤드(head)의 개수**입니다.
- 트랜스포머는 `Multi-Head Self-Attention`을 사용하여 서로 다른 부분의 정보를 병렬적으로 학습할 수 있도록 합니다.
- `nhead=8`이면, 8개의 서로 다른 attention 메커니즘이 독립적으로 동작한 후 최종적으로 결합됩니다.

**3) `num_encoder_layers=6`**
- **인코더 레이어 개수**입니다.
- 트랜스포머의 인코더(Encoder) 부분에는 여러 개의 층(layer)이 포함되는데, 이 코드에서는 6개(`num_encoder_layers=6`)의 인코더 층을 사용합니다.
- 일반적인 트랜스포머 기반 모델(예: BERT, GPT)에서도 6~12개 정도의 인코더 레이어를 사용합니다.

**4) `num_decoder_layers=6`**
- **디코더 레이어 개수**입니다.
- 트랜스포머의 디코더(Decoder) 부분에도 여러 개의 층(layer)이 포함되는데, 이 코드에서는 6개(`num_decoder_layers=6`)의 디코더 층을 사용합니다.
- 인코더가 입력을 처리한 후, 디코더는 이를 바탕으로 출력을 생성하는 역할을 합니다.

### 모델 학습 준비 및 학습 진행

```python
optimizer = torch.optim.Adam(model.parameters(), lr=0.0001)
criterion = nn.CrossEntropyLoss()

for epoch in range(10):  # 10번 반복
    optimizer.zero_grad()  # 기존의 gradient 초기화
    output = model(src, tgt)  # 모델 예측
    loss = criterion(output, tgt_labels)  # 손실 계산
    loss.backward()  # 역전파 (gradient 계산)
    optimizer.step()  # 가중치 업데이트
```

#### 코드 설명
**1. Optimizer(최적화 알고리즘) 설정**

```python
optimizer = torch.optim.Adam(model.parameters(), lr=0.0001)
```

**(1) `torch.optim.Adam`**
- `Adam`(Adaptive Moment Estimation)은 딥러닝에서 자주 사용되는 최적화 알고리즘입니다.
- `SGD`(Stochastic Gradient Descent)보다 학습 속도가 빠르고, 모멘텀(momentum)과 적응형 학습률(adaptive learning rate)을 적용하여 가중치를 업데이트합니다.
- 트랜스포머 모델은 일반적으로 Adam을 많이 사용합니다.

**(2) `model.parameters()`**
- `model.parameters()`는 모델의 **학습 가능한 파라미터(가중치와 편향)**를 가져옵니다.
- `optimizer`가 이 파라미터들을 조정하면서 손실을 최소화하는 방향으로 업데이트할 수 있도록 설정됩니다.

**(3) `lr=0.0001` (Learning Rate)**
- 학습률(learning rate, `lr`)은 한 번의 업데이트에서 얼마나 크게 가중치를 조정할지를 결정합니다.
- 값이 너무 크면 학습이 불안정해지고, 너무 작으면 학습이 매우 느려질 수 있습니다.
- 일반적으로 트랜스포머 모델에서는 **0.0001~0.0005** 정도의 작은 학습률을 사용합니다.


**2. Loss Function(손실 함수) 설정**

```python
criterion = nn.CrossEntropyLoss()
```

**(1) `nn.CrossEntropyLoss()`**
- **다중 클래스 분류(multi-class classification)에서 사용되는 손실 함수**입니다.
- 트랜스포머 모델은 일반적으로 시퀀스 데이터를 다루기 때문에, `CrossEntropyLoss`를 사용하여 예측값과 실제값 간의 차이를 계산합니다.
- 내부적으로 **Softmax 활성화 함수**와 **Negative Log-Likelihood Loss (NLL Loss)**를 포함하고 있습니다.

**왜 CrossEntropyLoss를 사용할까?**
- 트랜스포머 모델은 기계 번역 등의 작업에서 출력을 단어 단위로 예측합니다.
- 예를 들어, 모델이 `[25648, 364, 98, 172, 5]` 같은 로짓(logit)을 출력하면, `Softmax`를 적용해 확률 분포로 변환하고, `CrossEntropyLoss`를 이용해 정답과 비교하여 손실을 계산합니다.


**3. Training Loop(훈련 루프)**

```python
for epoch in range(10):
```

- **총 10번(`epoch=10`)의 학습을 수행합니다.**
- 에포크(epoch)란 **모든 훈련 데이터를 한 번 학습하는 과정**을 의미합니다.
- 트랜스포머 모델은 일반적으로 많은 데이터가 필요하기 때문에, 10 에포크는 실제로는 부족할 수 있습니다.


**4. Gradient 초기화**

```python
optimizer.zero_grad()
```

- **기존의 기울기(gradient)를 초기화**하는 과정입니다.
- PyTorch의 `backward()`는 **기울기를 누적(accumulate)하는 방식**으로 동작하므로, 기존의 기울기를 지우고 새롭게 업데이트해야 합니다.
- 그렇지 않으면 이전 에포크에서 계산된 기울기가 계속 누적되어 학습이 이상하게 진행됩니다.


**5. Forward Pass(순전파)**

```python
output = model(src, tgt)
```

- 모델에 입력 데이터를 넣고 예측값(`output`)을 얻습니다.
- `src`: **소스 문장(input sentence)**. 예를 들어, 영어 문장.
- `tgt`: **타겟 문장(target sentence)**. 예를 들어, 번역된 프랑스어 문장.
- 트랜스포머 모델은 **소스 문장 → 디코더를 통해 타겟 문장을 생성**하는 구조입니다.


**6. Loss 계산**

```python
loss = criterion(output, tgt_labels)
```

- `output`: 모델의 예측값 (shape: `[batch_size, seq_length, vocab_size]`)
- `tgt_labels`: 정답(ground truth) 레이블 (shape: `[batch_size, seq_length]`)
- `criterion(output, tgt_labels)`를 호출하면, `CrossEntropyLoss`가 예측값과 정답을 비교하여 손실(loss)을 계산합니다.

**CrossEntropyLoss의 작동 방식**
1. 모델의 `output`은 원래 로짓(logit) 형태로 출력됩니다.
2. 내부적으로 `Softmax`가 적용되어 확률값으로 변환됩니다.
3. 변환된 확률값과 `tgt_labels`(실제값)를 비교하여 손실을 계산합니다.


**7. Backward Pass(역전파)**

```python
loss.backward()
```

- 역전파(backpropagation)를 수행하여 **손실에 대한 기울기(gradient)를 계산**합니다.
- 이 과정에서는 자동 미분(Autograd)을 사용하여 각 파라미터에 대해 손실이 어떻게 변화하는지를 계산합니다.


**8. Optimizer Step(가중치 업데이트)**

```python
optimizer.step()
```

- `loss.backward()`를 통해 계산된 **기울기를 바탕으로 모델의 가중치를 업데이트**합니다.
- `Adam` 옵티마이저가 가중치를 업데이트하면서 손실을 줄이는 방향으로 모델을 학습시킵니다.


### 사전 학습된 모델 활용하기
Hugging Face의 Transformers 라이브러리를 활용하면 사전 학습된 모델을 쉽게 사용할 수 있습니다.

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# GPT-2 모델 및 토크나이저 로드
model = GPT2LMHeadModel.from_pretrained("gpt2")
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# 입력 문장
input_text = "Once upon a time"
input_ids = tokenizer.encode(input_text, return_tensors='pt')

# 텍스트 생성
output = model.generate(input_ids, max_length=50, num_return_sequences=1)

# 출력 변환
print(tokenizer.decode(output[0], skip_special_tokens=True))
```

#### 코드 설명
**1. `transformers` 라이브러리 임포트**

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer
```

- `GPT2LMHeadModel`: GPT-2 언어 모델을 불러와서 텍스트 생성을 수행하는 클래스입니다.
- `GPT2Tokenizer`: GPT-2 모델에 맞는 토크나이저로, 문장을 토큰(token)으로 변환하는 역할을 합니다.

**Hugging Face의 `transformers` 라이브러리**
- 사전 학습된 **트랜스포머 모델**을 쉽게 불러와서 사용할 수 있도록 제공하는 라이브러리.
- BERT, GPT-2, T5 등의 다양한 모델을 지원.


**2. GPT-2 모델과 토크나이저 로드**

```python
model = GPT2LMHeadModel.from_pretrained("gpt2")
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
```

- `from_pretrained("gpt2")`: **사전 학습된 GPT-2 모델과 토크나이저를 다운로드하고 불러옴**.
- `GPT2LMHeadModel`은 **텍스트 생성을 위한 언어 모델**.
- `GPT2Tokenizer`는 **입력 문장을 GPT-2 모델이 이해할 수 있도록 토큰화(tokenization)하는 역할**.

**사전 학습된 모델을 불러오는 방식**
- `from_pretrained("gpt2")`를 실행하면, 모델이 **Hugging Face의 서버에서 다운로드**됩니다.
- 이후 캐시에 저장되어 이후에는 다운로드 없이 사용 가능.


**3. 입력 텍스트를 모델이 이해할 수 있도록 변환**

```python
input_text = "Once upon a time"
input_ids = tokenizer.encode(input_text, return_tensors='pt')
```

**(1) `tokenizer.encode(input_text, return_tensors='pt')`**
- 입력 텍스트 `"Once upon a time"`을 GPT-2 모델이 이해할 수 있도록 **토큰으로 변환**합니다.
- `return_tensors='pt'`: PyTorch 텐서(`torch.Tensor`) 형태로 변환.
  - `GPT2LMHeadModel`은 PyTorch 모델이므로 PyTorch 텐서를 사용해야 함.

**(2) 토큰화 예제**

```python
tokenizer.encode("Once upon a time")
# 출력 예시: [3597, 21046, 257, 1128]
```

- `"Once upon a time"` → `[3597, 21046, 257, 1128]`
- 이 숫자들은 **GPT-2의 단어 사전(vocabulary)에 매핑된 정수 토큰**을 의미합니다.


**4. 모델을 사용하여 텍스트 생성**

```python
output = model.generate(input_ids, max_length=50, num_return_sequences=1)
```

- `model.generate(...)`: **입력된 문장을 기반으로 텍스트를 확장**합니다.
- `max_length=50`: **최대 50개의 토큰**을 생성하도록 설정.
- `num_return_sequences=1`: **한 개의 문장(시퀀스)**을 생성.

**트랜스포머 모델의 `generate()` 메서드**
- GPT-2는 **언어 생성 모델**이므로 다음 단어를 예측하며 텍스트를 생성합니다.
- `generate()`는 `input_ids`를 받아 **다음 단어를 반복적으로 예측하여 문장을 완성**.

🔹 **다양한 생성 옵션**
- `do_sample=True`: 샘플링을 사용하여 다양한 결과를 생성.
- `temperature=0.7`: 온도를 낮추면 더 확정적인 결과, 높이면 더 창의적인 결과.
- `top_k=50`: 확률이 높은 50개의 단어 중에서 샘플링.
- `top_p=0.95`: 누적 확률이 95% 이하인 단어들만 샘플링.


**5. 생성된 토큰을 다시 텍스트로 변환**

```python
print(tokenizer.decode(output[0], skip_special_tokens=True))
```

**(1) `tokenizer.decode(output[0])`**
- 생성된 토큰을 다시 사람이 읽을 수 있는 텍스트로 변환합니다.
- `skip_special_tokens=True`: GPT-2가 생성하는 `<|endoftext|>` 같은 특수 토큰을 제거.

**(2) 예제 출력**

```python
Once upon a time, there was a young girl who lived in a small village. She loved to read books
```

- 모델은 `"Once upon a time"`이라는 문장을 기반으로 이야기의 다음 내용을 생성합니다.


**6. 코드 실행 과정 요약**
1. `GPT2LMHeadModel`과 `GPT2Tokenizer`를 불러와서 사용 준비.
2. `"Once upon a time"`을 **토큰화**하여 숫자 벡터로 변환.
3. `model.generate()`를 사용하여 **문장을 확장**.
4. **생성된 토큰을 다시 문자열로 변환**하여 출력.


### Transformer 모델 구현 시 문제점과 극복 방법

#### 문제점
**대형 모델의 학습이 어렵습니다.**

1. 데이터 및 컴퓨팅 자원의 한계
   - **`Transformer`** 모델은 방대한 데이터를 필요로 하며, 학습에 많은 시간이 걸립니다.
   - 일반적으로 **수십 GB 이상의 GPU 메모리**가 필요하며, 학습에는 몇 주가 걸릴 수도 있습니다.

2. 모델 크기와 메모리 사용량
   - 모델이 커질수록 **메모리 사용량이 기하급수적으로 증가**합니다.
   - 개인이 보유한 일반적인 컴퓨터나 단일 GPU로는 대형 모델을 학습시키기가 어렵습니다.


**복잡한 모델을 직접 구현하기 어렵습니다.**

1. 구현의 어려움
   - **`Transformer`** 같은 모델은 구조가 복잡하여 처음부터 직접 구현하려면 **많은 지식과 경험이 필요**합니다.
   - 특히, **`Self-Attention`**, **`Multi-Head Attention`**, **`Feed-Forward Networks`** 등의 개념을 잘 이해해야 합니다.

2. 하이퍼파라미터 튜닝
   - 학습률, 모델 크기, 레이어 수 등 **다양한 하이퍼파라미터를 조절해야 하며**, 이를 최적화하는 과정에서 많은 시행착오가 필요합니다.
   - 최적의 설정을 찾기 위해 **수많은 실험과 시간이 요구됩니다.**


**사전 학습된 모델을 활용하는 데에도 한계가 있습니다.**

1. 맞춤화의 어려움
   - 사전 학습된 모델은 특정 데이터나 작업에 대해 학습된 상태이기 때문에, **다른 작업에 맞추려면 추가적인 미세 조정(Fine-Tuning)이 필요**합니다.

2. 비용 문제
   - 미세 조정(Fine-Tuning)이나 추가 학습을 하려면 **고성능 클라우드 서비스 또는 다수의 GPU가 필요**하며, 이는 **비용이 많이 발생**할 수 있습니다.

#### 극복 방법
**1. 클라우드 서비스 활용**
   - **Google Colab**, **AWS**, **Azure**, **Lambda Labs** 등의 **클라우드 GPU 서비스를 활용**하면 개인 컴퓨터의 한계를 극복할 수 있습니다.
   - 무료 또는 저렴한 비용으로 강력한 GPU 자원을 사용할 수 있습니다.

**2. 사전 학습된 모델 적극 활용**
   - **Hugging Face의 `Transformers` 라이브러리**나 **`PyTorch Hub`**에서 제공하는 사전 학습된 모델을 활용하면, **처음부터 직접 구현하지 않아도 됩니다**.
   - 필요에 따라 **일부 파라미터만 미세 조정(Fine-Tuning)** 하여 자신만의 모델을 만들 수 있습니다.

**3. 경량화된 모델 사용**
   - **`DistilBERT`**, **`TinyBERT`**, **`ALBERT`** 등의 경량화된 모델을 활용하면, **대형 모델의 성능을 유지하면서도 자원 소모를 줄일 수 있습니다**.


## 결론
GitHub의 오픈소스 AI 프로젝트를 활용하면 다양한 AI 모델을 쉽게 실험하고 개선할 수 있습니다. 또한, API와 PyTorch 같은 도구를 사용하면 복잡한 AI 모델을 직접 구현하지 않아도 됩니다.
