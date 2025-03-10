---
title: "특강: 딥러닝. 퍼셉트론에서 RNN까지"
author: mminzy22
date: 2025-02-03 20:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, Deep Learning, 퍼셉트론, MLP, DNN, RNN, TIL]
description: "딥러닝의 기본 개념을 뉴런에서 시작해 퍼셉트론, 다층 퍼셉트론(MLP), DNN, RNN까지 살펴보기. XOR 문제 해결부터 순환 신경망(RNN)의 등장까지, 인공지능의 발전 과정"
pin: false
math: true
---


## 01. 뉴런 (Neuron)

### 뉴런의 구조

1. **수상돌기(Dendrite)**: 여러 갈래로 뻗어 있는 가지 같은 구조로, 다른 뉴런으로부터 신호를 받는 역할을 한다.
2. **신경세포체(Cell Body)**: 뉴런의 본체로서 정보를 처리하는 역할을 한다.
3. **축삭(Axon)**: 신경세포체에서 나온 긴 구조로, 다른 뉴런에게 신호를 전달한다.
    - 여러 자극값들의 합이 일정 기준(Threshold)을 넘어서면 다음 뉴런에게 전달되며, 기준을 넘지 못하면 소멸한다.


### 퍼셉트론(Perceptron): 뉴런을 모방한 인공지능의 첫걸음

퍼셉트론은 1958년 프랭크 로젠블랫(Frank Rosenblatt)에 의해 고안된 초기 인공지능 모델이다. 뉴런의 동작을 수학적으로 모델링한 퍼셉트론은 아래와 같은 가설식으로 표현된다.

#### 퍼셉트론 가설식

$$ H(x) = wx + b $$

- **w (가중치, Weight)**: 입력 신호의 중요도를 조절하는 값. 중요한 신호일수록 더 높은 가중치를 가진다.
- **x (입력 값, Input)**: 퍼셉트론이 처리하는 각 신호 값.
- **b (바이어스, Bias)**: 임계값(Threshold) 역할을 하며, 신호의 총합에 영향을 미친다.
- **wx + b**: 입력 신호의 가중치와 입력값을 곱한 후 합산한 값.

### 퍼셉트론의 동작 과정

1. **입력 신호 수집**: 여러 입력 값을 받아들이고, 각 입력 값에는 가중치가 부여된다.
2. **가중치와 입력 값의 곱**: 각 입력 신호에 가중치를 곱하여 중요도를 반영한다.
3. **합산**: 모든 신호의 가중치를 곱한 후 더한다.
4. **임계값 비교 및 출력 결정**: 합산된 값이 임계값을 초과하면 뉴런이 활성화되고, 그렇지 않으면 비활성화된다.


## 퍼셉트론 검증: AND, OR 연산

퍼셉트론은 간단한 논리 연산(AND, OR 등)을 수행할 수 있다.

| 입력 | 입력 | AND 연산 결과 | OR 연산 결과 |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 |

퍼셉트론을 사용하면 AND, OR 연산은 쉽게 구현할 수 있지만, XOR 연산을 수행하는 것은 불가능하다.


## 퍼셉트론의 한계: XOR 연산 문제

퍼셉트론은 선형 분리가 가능한 문제(AND, OR 등)만 해결할 수 있지만, XOR과 같은 선형 분리가 불가능한 문제를 해결할 수 없다. 단순 퍼셉트론은 하나의 직선으로 두 클래스를 나눌 수 없기 때문에 XOR 문제를 해결하기 어렵다.

### 해결책: 다층 퍼셉트론 (MLP, Multi-Layer Perceptron)

XOR 문제를 해결하기 위해 다층 퍼셉트론(MLP)이 등장했다. MLP는 입력층(Input Layer), 은닉층(Hidden Layer), 출력층(Output Layer)으로 구성된 신경망이다.

- 다층 퍼셉트론에서는 중간에 은닉층을 추가하여 비선형성을 학습할 수 있다.
- XOR 문제를 해결하기 위해 두 개 이상의 뉴런을 사용하여 데이터를 적절하게 분류할 수 있다.

### 다층 퍼셉트론과 딥러닝의 시작

다층 퍼셉트론(MLP)의 개념이 발전하면서 딥러닝(Deep Learning)의 기반이 마련되었다. 이후 신경망의 깊이가 깊어지고 복잡한 문제를 해결할 수 있는 모델들이 등장하였다.


## DNN (Deep Neural Network) - 학습 능력과 문제 해결력의 향상

DNN(심층 신경망)은 여러 개의 은닉층을 포함한 신경망으로, 복잡한 연산과 고차원 문제를 해결할 수 있도록 설계되었다.

### DNN의 특징

- 복잡한 패턴을 학습할 수 있다.
- 이미지, 음성, 자연어 등 다양한 데이터를 처리할 수 있다.
- 기존 신경망보다 높은 성능을 보인다.

하지만 DNN은 순차적인 데이터(예: 시계열 데이터, 텍스트 데이터)를 처리하는 데 한계가 있었다.


## RNN (Recurrent Neural Network): 시퀀스 데이터를 위한 신경망

### RNN의 특징

- 연속적인 데이터(시퀀스)를 다룰 수 있도록 설계된 신경망.
- 시간의 흐름을 고려하여 이전 상태를 기억하면서 다음 상태를 예측하는 구조.

### RNN과 DNN의 차이

| 특징 | DNN (일반 신경망) | RNN (순환 신경망) |
|---|---|---|
| 데이터 형태 | 독립적인 입력값 | 연속적인 입력값 (시퀀스) |
| 시간적 관계 | 고려하지 않음 | 이전 상태를 기억하여 반영 |
| 적용 분야 | 이미지, 정적인 데이터 | 문장, 음성, 시계열 데이터 |

### RNN의 동작 원리

1. 입력값을 받아 현재 상태를 계산한다.
2. 이전 상태를 저장하여 다음 단계에서 사용한다.
3. 반복적으로 순환하면서 정보를 전달한다.

### RNN의 활용 분야

- 음성 인식 (Speech Recognition)
- 기계 번역 (Machine Translation)
- 챗봇 (Chatbot)
- 자동 완성 (Text Prediction)
- 작곡, 시, 대본 작성 (Creative AI)


## RNN의 한계: 장기 의존성 문제 (Long-Term Dependency)

RNN은 단기 의존성(Short-Term Dependency)에는 효과적이지만, 긴 문장이나 긴 시퀀스를 다룰 때 정보가 점점 희석되는 문제가 발생한다. 이는 **기울기 소실(Vanishing Gradient)** 문제로 인해 네트워크가 장기적인 정보를 학습하기 어렵기 때문이다.

이러한 한계를 해결하기 위해 **LSTM (Long Short-Term Memory)**, **GRU (Gated Recurrent Unit)** 같은 고급 RNN 구조가 개발되었다.


## 마무리

- 뉴런에서 시작된 퍼셉트론은 AND, OR 연산을 수행할 수 있지만 XOR 문제를 해결하지 못했다.
- 다층 퍼셉트론(MLP)이 등장하며 딥러닝의 기초가 형성되었다.
- DNN을 통해 복잡한 문제를 해결할 수 있었지만, 시퀀스 데이터를 다루기 어려웠다.
- RNN이 등장하면서 연속적인 데이터를 다룰 수 있게 되었지만, 장기 기억이 어렵다는 문제가 존재했다.
- 이러한 문제를 해결하기 위해 LSTM, GRU 등 더욱 발전된 모델들이 등장하였다.

딥러닝의 발전은 계속해서 진행 중이며, 현재는 트랜스포머(Transformer) 기반의 모델이 큰 인기를 끌고 있다.
