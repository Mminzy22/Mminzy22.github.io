---
title: "ML: 인공신경망의 기본 개념"
author: mminzy22
date: 2024-12-05 10:16:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "뉴런, 활성화 함수, 가중치의 역할과 역전파 알고리즘을 통한 인공신경망의 기본 원리"
pin: false
---



인공신경망(Artificial Neural Network, ANN)은 인간의 뇌에서 영감을 받아 데이터를 학습하고 예측하는 딥러닝의 핵심 개념입니다. 이번 글에서는 **뉴런, 활성화 함수, 가중치의 역할**과 **역전파 알고리즘**을 통해 인공신경망의 기본 원리를 살펴보겠습니다.


#### 1. 인공신경망의 구성 요소

인공신경망은 다음과 같은 기본 구성 요소로 이루어져 있습니다.

**1) 뉴런 (Neuron)**  
뉴런은 입력 값을 받아 계산을 수행하고, 결과를 다음 층으로 전달하는 역할을 합니다.  
- **입력 값:** \\( x_1, x_2, \dots, x_n \\)  
- **가중치:** \\( w_1, w_2, \dots, w_n \\)  
- **바이어스:** \\( b \\), 출력값 조정을 위한 상수.  
- **출력 값:** \\( y \\), 뉴런의 계산 결과.  

뉴런의 계산은 다음과 같이 이루어집니다:  
$$ z = \sum_{i=1}^{n} w_i \cdot x_i + b $$  
$$ y = \text{Activation}(z) $$  


**2) 활성화 함수 (Activation Function)**  
활성화 함수는 뉴런의 출력 값을 비선형 변환하여 모델이 복잡한 패턴을 학습할 수 있도록 합니다.  

**대표적인 활성화 함수**
- **ReLU (Rectified Linear Unit):**  
  $$ \text{ReLU}(z) = \max(0, z) $$  
  - 장점: 계산 효율성이 높고, 기울기 소실(Vanishing Gradient) 문제를 완화.  

- **Sigmoid:**  
  $$ \text{Sigmoid}(z) = \frac{1}{1 + e^{-z}} $$  
  - 출력 값이 [0, 1] 범위에 있어 확률값으로 사용.  

- **Tanh (Hyperbolic Tangent):**  
  $$ \text{Tanh}(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}} $$  
  - 출력 범위가 [-1, 1]로 중심화된 데이터에 적합.  

```python
import numpy as np

# 활성화 함수 구현
def relu(z):
    return np.maximum(0, z)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def tanh(z):
    return np.tanh(z)
```


**3) 가중치의 역할**  
가중치(Weights)는 뉴런 간 연결의 강도를 나타냅니다.  
- 모델은 학습 과정에서 가중치를 조정하여 입력과 출력 간의 관계를 학습합니다.  
- 초기값 설정이 학습의 효율성과 성능에 중요한 영향을 미칩니다.


#### 2. 역전파 알고리즘 (Backpropagation)

역전파 알고리즘은 인공신경망이 학습하는 데 사용되는 핵심 기술입니다.  
- **목표:** 모델의 출력과 실제 값 사이의 오차를 최소화하기 위해 가중치를 조정.  
- **방법:** 오차를 출력층에서 입력층으로 전파하며 각 가중치에 대한 기울기(Gradient) 계산.

**역전파 과정**
1. **순전파 (Forward Propagation):**  
   입력 값을 통해 출력 값을 계산.
2. **오차 계산:**  
   손실 함수(Loss Function)를 사용하여 출력 값과 실제 값 간의 오차 계산.  
   $$ L = \frac{1}{2} (y - \hat{y})^2 $$
3. **오차 역전파 (Backward Propagation):**  
   체인 룰(Chain Rule)을 사용하여 각 가중치에 대한 기울기 계산.  
   $$ \frac{\partial L}{\partial w_i} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial z} \cdot \frac{\partial z}{\partial w_i} $$
4. **가중치 업데이트:**  
   경사 하강법(Gradient Descent)을 사용하여 가중치 조정.  
   $$ w_i = w_i - \eta \frac{\partial L}{\partial w_i} $$  
   - \\( \eta \\): 학습률(Learning Rate).

**Python 코드로 역전파 구현**
```python
import numpy as np

# 간단한 신경망 예제
def forward(x, w, b):
    z = np.dot(w, x) + b
    y = sigmoid(z)
    return y

# 역전파 계산
def backward(x, y_true, y_pred, w, b, learning_rate):
    error = y_pred - y_true
    dz = error * (y_pred * (1 - y_pred))  # Sigmoid의 미분
    dw = dz * x
    db = dz

    # 가중치와 바이어스 업데이트
    w -= learning_rate * dw
    b -= learning_rate * db

    return w, b
```


#### 인공신경망의 학습 과정 요약

1. 입력 데이터를 순전파하여 출력 값을 계산.  
2. 손실 함수를 통해 예측값과 실제값 간의 오차 계산.  
3. 역전파로 각 가중치와 바이어스에 대한 기울기를 계산.  
4. 경사 하강법을 통해 가중치와 바이어스를 업데이트.  
5. 과정을 반복하여 최적의 가중치를 학습.


#### 정리

- **뉴런:** 입력 데이터를 계산하여 다음 층으로 전달.
- **활성화 함수:** 비선형 변환을 통해 복잡한 패턴 학습 가능.
- **가중치:** 학습 과정을 통해 조정되는 모델의 핵심 매개변수.
- **역전파:** 손실을 최소화하기 위해 가중치를 조정하는 알고리즘.

> **다음 글 예고:**  
> 딥러닝 모델 구현에 필수적인 **"주요 딥러닝 라이브러리 (TensorFlow, PyTorch)"**를 소개합니다!
