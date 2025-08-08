---
title: "딥러닝과 인공 신경망: 텐서플로를 활용한 패션 MNIST 분류"
author: mminzy22
date: 2024-12-19 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "텐서플로와 케라스를 활용하여 패션 MNIST 데이터셋을 분류하는 딥러닝 모델을 구축하고 평가하는 방법을 다룹니다."
pin: false
---



### 딥러닝과 인공 신경망 이해하기

딥러닝은 인공 신경망(Artificial Neural Network)을 기반으로 데이터 패턴을 학습하고 복잡한 문제를 해결하는 기술입니다. 인공 신경망은 입력 데이터를 받아 처리하여 원하는 출력값을 도출하는 구조로, 다음과 같은 주요 구성 요소로 이루어져 있습니다:

1. **입력층(Input Layer):** 데이터가 신경망에 전달되는 시작점.
2. **은닉층(Hidden Layer):** 데이터를 처리하고 학습하는 핵심 층으로, 여러 개의 층으로 구성될 수 있습니다.
3. **출력층(Output Layer):** 최종 결과를 출력하는 층으로, 예측값을 제공합니다.


### 패션 MNIST 데이터셋 소개

**패션 MNIST 데이터셋**은 10종류의 패션 아이템(예: 티셔츠, 바지, 스니커즈 등)으로 구성된 이미지 데이터셋입니다. 각 이미지는 크기가 28x28 픽셀인 흑백 이미지입니다.

#### 데이터셋 불러오기

```python
from tensorflow import keras

(train_input, train_target), (test_input, test_target) = keras.datasets.fashion_mnist.load_data()
```

`keras.datasets.fashion_mnist.load_data()` 함수는 훈련 데이터와 테스트 데이터를 나누어 반환합니다. 각각 입력 데이터와 타깃값으로 구성되어 있습니다.

#### 데이터 크기 확인

```python
print(train_input.shape, train_target.shape)
print(test_input.shape, test_target.shape)
```

출력 결과:

```python
(60000, 28, 28) (60000,)
(10000, 28, 28) (10000,)
```

- **훈련 데이터:** 60,000개의 28x28 크기 이미지.
- **테스트 데이터:** 10,000개의 28x28 크기 이미지.

#### 데이터 시각화

훈련 데이터에서 10개의 샘플 이미지를 시각화해봅니다:

```python
import matplotlib.pyplot as plt

fig, axs = plt.subplots(1, 10, figsize=(10, 10))
for i in range(10):
    axs[i].imshow(train_input[i], cmap='gray_r')
    axs[i].axis('off')
plt.show()
```

#### 레이블 확인

```python
print([train_target[i] for i in range(10)])
```

출력 결과:

```python
[9, 0, 0, 3, 0, 2, 7, 2, 5, 5]
```

타깃값은 0부터 9까지의 숫자 레이블로 구성되어 있습니다.


### 데이터 정규화 및 변환

신경망 모델을 효율적으로 훈련시키기 위해 데이터를 정규화하고 1차원 배열로 변환합니다:

```python
train_scaled = train_input / 255.0
train_scaled = train_scaled.reshape(-1, 28 * 28)
```

이 과정에서 모든 픽셀 값을 0과 1 사이로 정규화하고, 28x28 배열을 784 픽셀의 1차원 배열로 펼칩니다.

#### 변환 후 데이터 크기 확인

```python
print(train_scaled.shape)
```

출력 결과:

```python
(60000, 784)
```


### 로지스틱 회귀 모델로 분류

로지스틱 회귀 모델을 사용해 데이터를 분류해보겠습니다.

#### 확률적 경사 하강법(SGD)으로 학습

```python
from sklearn.model_selection import cross_validate
from sklearn.linear_model import SGDClassifier

sc = SGDClassifier(loss='log_loss', max_iter=5, random_state=42)
scores = cross_validate(sc, train_scaled, train_target, n_jobs=-1)

print(np.mean(scores['test_score']))
```

출력 결과:

```python
0.8194166666666666
```

최대 반복 횟수(`max_iter`)를 늘리면 성능이 약간 향상될 수 있습니다.


### 인공 신경망 모델 구축

#### 데이터 분리

딥러닝에서는 검증 세트를 별도로 분리하여 모델 성능을 평가합니다:

```python
from sklearn.model_selection import train_test_split

train_scaled, val_scaled, train_target, val_target = train_test_split(
    train_scaled, train_target, test_size=0.2, random_state=42)
```

#### 신경망 구조 정의

케라스를 사용해 밀집층(Dense Layer)을 정의합니다:

```python
from tensorflow import keras

dense = keras.layers.Dense(10, activation='softmax', input_shape=(784,))
model = keras.Sequential([dense])
```

- **뉴런 개수:** 10개 (10종류의 패션 아이템 분류)
- **활성화 함수:** `softmax` (다중 클래스 확률 출력)
- **입력 크기:** 784 (28x28 이미지 펼친 형태)

#### 모델 컴파일

손실 함수와 평가 지표를 설정합니다:

```python
model.compile(loss='sparse_categorical_crossentropy', metrics=['accuracy'])
```

- **손실 함수:** `sparse_categorical_crossentropy` (정수형 타깃값에 사용)
- **평가지표:** 정확도(accuracy)

#### 모델 훈련

```python
model.fit(train_scaled, train_target, epochs=5)
```

출력 예시:

```python
Epoch 1/5
1500/1500 - 5s - loss: 0.7853 - accuracy: 0.7370
Epoch 2/5
1500/1500 - 3s - loss: 0.4845 - accuracy: 0.8346
...
```

#### 검증 세트 평가

```python
model.evaluate(val_scaled, val_target)
```

출력 예시:

```python
[0.4364, 0.8462]
```

- **손실 값:** 0.4364
- **정확도:** 84.62%


### 결론

이번 실습에서는 딥러닝 라이브러리인 텐서플로와 케라스를 사용해 패션 MNIST 데이터셋을 처리하고, 간단한 신경망 모델로 분류 문제를 해결해 보았습니다. 신경망 모델은 훈련과 검증에서 각각 약 85%의 정확도를 달성하며, 딥러닝의 강력함을 확인할 수 있었습니다.

앞으로는 더 복잡한 신경망 구조와 다양한 딥러닝 기법을 적용하여 성능을 향상시킬 수 있습니다.

