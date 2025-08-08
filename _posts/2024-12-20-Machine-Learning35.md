---
title: "심층 신경망 구현 및 학습: 패션 MNIST 데이터셋 사례"
author: mminzy22
date: 2024-12-20 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "패션 MNIST 데이터셋을 사용하여 심층 신경망을 구현하고 학습하는 과정을 다룹니다."
pin: false
---



### **패션 MNIST 데이터셋 준비**
패션 MNIST 데이터셋은 딥러닝 모델 학습의 대표적인 실습용 데이터셋입니다. 이를 사용하여 심층 신경망 모델을 구현해보겠습니다.

#### **데이터셋 로드**
케라스 API를 사용하여 데이터셋을 불러옵니다:

```python
from tensorflow import keras

(train_input, train_target), (test_input, test_target) = keras.datasets.fashion_mnist.load_data()
```

#### **데이터 전처리**
이미지 픽셀값(0~255)을 0~1 사이로 스케일링하고, 이미지를 1차원 배열로 변환합니다:

```python
from sklearn.model_selection import train_test_split

train_scaled = train_input / 255.0
train_scaled = train_scaled.reshape(-1, 28 * 28)

train_scaled, val_scaled, train_target, val_target = train_test_split(
    train_scaled, train_target, test_size=0.2, random_state=42)
```

### **심층 신경망 설계**
심층 신경망은 은닉층과 출력층으로 구성됩니다. 각 층에 활성화 함수를 적용하여 비선형 변환을 수행합니다.

#### **Dense 층 구성**
1. 은닉층:
   - 100개의 뉴런
   - 활성화 함수: `sigmoid`
2. 출력층:
   - 10개의 뉴런 (클래스 개수와 동일)
   - 활성화 함수: `softmax`

```python
dense1 = keras.layers.Dense(100, activation='sigmoid', input_shape=(784,))
dense2 = keras.layers.Dense(10, activation='softmax')
```

#### **Sequential 모델 생성**
`Sequential` 클래스를 사용하여 심층 신경망을 구성합니다:

```python
model = keras.Sequential([dense1, dense2])
```

#### **모델 요약**
모델 구조를 확인하려면 `summary()` 메서드를 사용합니다:

```python
model.summary()
```
출력 예시:

```
Model: "sequential"
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━┓
┃ Layer (type)                         ┃ Output Shape                ┃         Param # ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━┩
│ dense (Dense)                        │ (None, 100)                 │          78,500 │
├──────────────────────────────────────┼─────────────────────────────┼─────────────────┤
│ dense_1 (Dense)                      │ (None, 10)                  │           1,010 │
└──────────────────────────────────────┴─────────────────────────────┴─────────────────┘
 Total params: 79,510 (310.59 KB)
 Trainable params: 79,510 (310.59 KB)
 Non-trainable params: 0 (0.00 B)
```

### **모델 컴파일 및 훈련**

```python
model.compile(loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(train_scaled, train_target, epochs=5)
```

출력 예시:

```
Epoch 1/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 7s 3ms/step - accuracy: 0.7525 - loss: 0.7720
Epoch 2/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 7s 2ms/step - accuracy: 0.8463 - loss: 0.4270
Epoch 3/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 5s 2ms/step - accuracy: 0.8604 - loss: 0.3857
Epoch 4/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 4s 2ms/step - accuracy: 0.8696 - loss: 0.3600
Epoch 5/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 5s 2ms/step - accuracy: 0.8759 - loss: 0.3410
<keras.src.callbacks.history.History at 0x7ba27907a9b0>
```

### **활성화 함수 변경**
#### **ReLU 활성화 함수 사용**
ReLU(Rectified Linear Unit)는 학습 속도를 개선하고, 깊은 신경망에서 좋은 성능을 보입니다.

#### **Flatten 층 추가**
28x28 크기의 2D 데이터를 1D로 변환하는 `Flatten` 클래스를 사용합니다:

```python
model = keras.Sequential()
model.add(keras.layers.Flatten(input_shape=(28, 28)))
model.add(keras.layers.Dense(100, activation='relu'))
model.add(keras.layers.Dense(10, activation='softmax'))
```

### **옵티마이저 사용**
#### **옵티마이저의 역할**
옵티마이저는 신경망 학습의 핵심 요소로, 다양한 알고리즘이 제공됩니다.

1. 기본 옵티마이저:

   ```python
   model.compile(optimizer='sgd', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
   ```

2. RMSprop:

   ```python
   rmsprop = keras.optimizers.RMSprop()
   model.compile(optimizer=rmsprop, loss='sparse_categorical_crossentropy', metrics=['accuracy'])
   ```

3. Adam:

   ```python
   model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
   ```

Adam 옵티마이저로 학습한 모델은 높은 정확도를 달성할 수 있습니다:

```
Epoch 1/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 4s 2ms/step - accuracy: 0.7691 - loss: 0.6706
Epoch 2/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 3s 2ms/step - accuracy: 0.8515 - loss: 0.4134
Epoch 3/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 3s 2ms/step - accuracy: 0.8691 - loss: 0.3618
Epoch 4/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 3s 2ms/step - accuracy: 0.8793 - loss: 0.3302
Epoch 5/5
1500/1500 ━━━━━━━━━━━━━━━━━━━━ 3s 2ms/step - accuracy: 0.8873 - loss: 0.3088
<keras.src.callbacks.history.History at 0x7ba27fcccfa0>
```

### **결론**
심층 신경망은 층의 구성, 활성화 함수, 옵티마이저 등 다양한 요소를 조합하여 구현할 수 있습니다. 패션 MNIST 데이터를 사용한 이번 학습은 신경망의 구조와 훈련 과정을 이해하는 데 유익한 실습 사례입니다.

