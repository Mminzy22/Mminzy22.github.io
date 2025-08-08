---
title: "Hugging Face와 Stable Diffusion을 활용한 생성형 AI 모델 사용법"
author: mminzy22
date: 2025-02-13 19:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, Hugging Face, Stable Diffusion, NLP, AI, TIL]
description: "Hugging Face와 Stable Diffusion을 활용하여 텍스트 생성 및 이미지 생성 모델을 실제로 사용하는 방법"
pin: false
math: true
---

## 1. Hugging Face의 생성형 텍스트 모델 활용하기

### Hugging Face란?
Hugging Face는 다양한 자연어 처리(NLP) 모델을 제공하는 라이브러리로, 텍스트 생성, 번역, 요약, 질문-답변 등 다양한 작업을 수행할 수 있습니다. 대표적인 생성형 텍스트 모델로 **GPT-2**, **GPT-3** 등이 있습니다.

### GPT-2 모델을 사용하여 텍스트 생성하기
#### 1. 라이브러리 설치 및 불러오기
먼저 Hugging Face의 `transformers` 라이브러리를 설치하고, GPT-2 기반의 텍스트 생성 모델을 불러옵니다.

```bash
pip install transformers
```

```python
from transformers import pipeline

# GPT-2 기반 텍스트 생성 파이프라인 로드
generator = pipeline("text-generation", model="gpt2")

# 텍스트 생성
generated_text = generator("Once upon a time", max_length=50, num_return_sequences=1)

# 결과 출력
print(generated_text[0]['generated_text'])
```

#### 2. 코드 설명
- **pipeline**: Hugging Face의 기본 API를 사용하여 NLP 작업을 수행하는 객체입니다.
- **max_length**: 생성할 텍스트의 최대 길이를 지정합니다.
- **num_return_sequences**: 반환할 문장의 개수를 지정합니다.

이 코드를 실행하면, `"Once upon a time"`을 시작으로 이어지는 문장이 자동으로 생성됩니다.

### OpenAI GPT-4o 모델 활용하기
Hugging Face 외에도 OpenAI의 GPT 모델을 API를 통해 활용할 수 있습니다.

#### 1. 라이브러리 설치 및 API 키 설정

```bash
pip install openai
```

```python
import os
os.environ["OPENAI_API_KEY"] = "<your OpenAI API key>"
```

#### 2. GPT-4o 모델을 사용한 텍스트 생성

```python
from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
  model="gpt-4o",
  messages=[
    {"role": "system", "content": "너는 환영 인사를 하는 인공지능이야, 농담을 넣어 재미있게 해줘"},
    {"role": "user", "content": "안녕?"}  
  ]
)

print("Assistant: " + completion.choices[0].message.content)
```

#### 3. 코드 설명
- **model**: OpenAI에서 제공하는 GPT-4o 모델을 사용합니다.
- **messages**: 대화의 흐름을 설정하는 JSON 배열입니다.
- **role**: `system`은 모델의 동작을 정의하는 역할, `user`는 사용자의 입력을 나타냅니다.

이 코드를 실행하면, 사용자에게 환영 인사를 포함한 재치 있는 응답을 생성하는 챗봇을 만들 수 있습니다.


## 2. Stable Diffusion을 활용한 이미지 생성

### Stable Diffusion이란?
Stable Diffusion은 텍스트 설명을 기반으로 이미지를 생성하는 딥러닝 모델로, 사실적인 이미지를 생성하는 데 강력한 성능을 보입니다.

### Stable Diffusion 모델 로드 및 사용

#### 1. 라이브러리 설치

```bash
pip install diffusers transformers torch
```

#### 2. Stable Diffusion 모델을 사용한 이미지 생성

```python
from diffusers import StableDiffusionPipeline
import torch

# Stable Diffusion 파이프라인 로드
pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4", torch_dtype=torch.float16)
pipe = pipe.to("cuda")  # GPU 사용

# 텍스트 설명을 기반으로 이미지 생성
prompt = "A futuristic cityscape with flying cars at sunset"
image = pipe(prompt).images[0]

# 생성된 이미지 저장 및 출력
image.save("generated_image.png")
image.show()
```

#### 3. 코드 설명
- **StableDiffusionPipeline**: Stable Diffusion 모델을 로드하는 객체입니다.
- **prompt**: 이미지 생성을 위한 텍스트 설명입니다.
- **torch_dtype**: `float16`을 사용하면 메모리를 절약할 수 있습니다.
- **.to("cuda")**: GPU를 활용하여 연산 속도를 높입니다.

#### 4. 이미지 생성 조정하기
Stable Diffusion을 활용하여 더 정교한 이미지 생성을 위해 파라미터를 조정할 수 있습니다.

```python
image = pipe(prompt, guidance_scale=7.5, num_inference_steps=50).images[0]
```

- **guidance_scale**: 텍스트 설명을 이미지에 반영하는 정도를 조절합니다. 값이 높을수록 설명에 충실한 이미지가 생성됩니다.
- **num_inference_steps**: 이미지 생성 시 추론 단계를 지정합니다. 값이 클수록 이미지 품질이 높아지지만, 생성 시간이 증가합니다.


