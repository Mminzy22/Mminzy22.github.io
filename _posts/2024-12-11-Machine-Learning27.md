---
title: "확률적 경사 하강법 (Stochastic Gradient Descent, SGD)"
author: mminzy22
date: 2024-12-11 11:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "확률적 경사 하강법(SGD)의 개념과 다양한 경사 하강법의 종류, 손실 함수, 에포크와 조기 종료, 그리고 실제 예제를 통해 SGD의 사용 방법"
pin: false
---



확률적 경사 하강법(SGD)은 점진적 학습(온라인 학습)의 대표적인 알고리즘으로, 이전 모델을 버리지 않고 새로운 데이터로 학습을 계속할 수 있는 방식입니다. 이를 통해 기존 모델을 유지하면서도 새로운 정보를 반영하여 성능을 개선할 수 있습니다. 이 알고리즘은 경사 하강법을 변형한 방식으로, 훈련 세트에서 샘플을 하나씩 사용하여 손실 함수를 최적화합니다.

### 1. 경사 하강법의 종류

#### 1.1 확률적 경사 하강법 (SGD)
- 훈련 세트에서 랜덤하게 하나의 샘플을 선택하여 손실 함수의 경사를 따라 조금씩 이동합니다.
- 전체 샘플을 사용하면 다시 훈련 세트를 반복하며 최적화를 진행합니다.

#### 1.2 미니배치 경사 하강법
- 샘플을 여러 개씩 묶어서 경사 하강법을 수행합니다.
- 성능과 자원 사용의 균형을 맞출 수 있는 방식입니다.

#### 1.3 배치 경사 하강법
- 한 번 경사로를 따라 이동하기 위해 전체 샘플을 사용합니다.
- 가장 안정적이지만, 자원을 많이 사용하며 데이터가 큰 경우 사용이 어려울 수 있습니다.

### 2. 손실 함수와 비용 함수

- **손실 함수**: 샘플 하나에 대한 손실을 측정하며, 미분 가능해야 합니다. 손실 함수가 미분 가능해야 하는 이유는, 경사 하강법이 손실 함수의 기울기(미분값)를 기반으로 최적화 방향을 결정하기 때문입니다. 미분 불가능한 함수는 최적화 과정에서 기울기를 계산할 수 없어 경사 하강법의 적용이 어렵습니다.
- **비용 함수**: 훈련 세트의 모든 샘플에 대한 손실 함수 값의 합입니다.
- **로지스틱 손실 함수**: 이진 분류에서 사용되며, 모델의 예측과 실제 값의 차이를 측정합니다.
- **크로스엔트로피 손실 함수**: 다중 분류에서 사용됩니다.
- **평균 제곱 오차 (MSE)**: 회귀 문제에서 주로 사용되며, 예측값과 실제 값의 제곱 오차를 평균한 값입니다.

### 3. 에포크와 조기 종료

- **에포크**: 전체 훈련 세트를 한 번 사용하는 과정입니다.
- **조기 종료**: 과대적합을 방지하기 위해 과대적합이 시작하기 전에 훈련을 멈추는 방식입니다. 이를 적용하려면 훈련 과정 중 테스트 세트의 성능을 지속적으로 평가하고, 일정 에포크 동안 성능이 향상되지 않을 경우 훈련을 중단하는 조건을 설정합니다. 예를 들어, `scikit-learn`의 `early_stopping` 옵션을 활성화하면 조기 종료를 자동으로 구현할 수 있습니다.

### 4. 확률적 경사 하강법 사용 예제

#### 4.1 데이터 준비
이 단계에서는 데이터를 불러오고 입력값과 타깃값으로 나눕니다. `pandas` 라이브러리를 사용하여 데이터를 로드하며, 입력 데이터는 생선의 특성 값(Weight, Length, Diagonal, Height, Width)이고, 타깃 데이터는 생선의 종류(Species)입니다.
```python
import pandas as pd

fish = pd.read_csv('https://bit.ly/fish_csv_data')
fish_input = fish[['Weight', 'Length', 'Diagonal', 'Height', 'Width']].to_numpy()
fish_target = fish['Species'].to_numpy()
```

#### 4.2 데이터 분할과 전처리
여기서는 데이터를 훈련 세트와 테스트 세트로 나눕니다. 그런 다음, 특성을 표준화하여 모델 학습에 적합한 형태로 변환합니다. 표준화는 평균을 0, 표준 편차를 1로 맞추는 과정으로, 학습 속도를 높이고 안정성을 제공합니다.
```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

train_input, test_input, train_target, test_target = train_test_split(
    fish_input, fish_target, random_state=42)

ss = StandardScaler()
ss.fit(train_input)
train_scaled = ss.transform(train_input)
test_scaled = ss.transform(test_input)
```

#### 4.3 SGD 분류 모델 생성
이 단계에서는 SGDClassifier를 생성하고 데이터를 학습시킵니다. `loss='log_loss'`는 로지스틱 손실 함수를 사용하며, `max_iter=10`은 10번의 에포크를 수행하도록 설정합니다.
```python
from sklearn.linear_model import SGDClassifier

sc = SGDClassifier(loss='log_loss', max_iter=10, random_state=42)
sc.fit(train_scaled, train_target)

print(sc.score(train_scaled, train_target))
print(sc.score(test_scaled, test_target))
```
출력:
```
0.773109243697479
0.775
```
이 출력은 각각 훈련 세트와 테스트 세트에 대한 모델의 정확도를 나타냅니다. 0.773은 훈련 세트에서 약 77.3%의 정확도를, 0.775는 테스트 세트에서 약 77.5%의 정확도를 의미합니다.

#### 4.4 모델 추가 학습
학습한 모델에 새로운 데이터를 추가로 학습시킬 수 있습니다. `partial_fit` 메서드는 기존 학습 내용을 유지하면서 새로운 데이터를 학습합니다.
```python
sc.partial_fit(train_scaled, train_target)

print(sc.score(train_scaled, train_target))
print(sc.score(test_scaled, test_target))
```
출력:
```
0.8151260504201681
0.85
```
이 출력은 모델이 추가 학습을 통해 정확도가 향상되었음을 보여줍니다.

#### 4.5 에포크별 정확도 그래프
300번의 에포크 동안 훈련을 진행하며, 훈련 세트와 테스트 세트의 정확도를 기록하고 이를 시각화합니다. 그래프를 통해 과소적합이나 과대적합 여부를 확인할 수 있습니다.
```python
import numpy as np
import matplotlib.pyplot as plt

sc = SGDClassifier(loss='log_loss', random_state=42)
train_score = []
test_score = []
classes = np.unique(train_target)

for _ in range(300):
    sc.partial_fit(train_scaled, train_target, classes=classes)
    train_score.append(sc.score(train_scaled, train_target))
    test_score.append(sc.score(test_scaled, test_target))

plt.plot(train_score)
plt.plot(test_score)
plt.xlabel('epoch')
plt.ylabel('accuracy')
plt.show()
```

#### 4.6 최적 에포크로 모델 훈련
에포크 분석 결과를 바탕으로 최적의 반복 횟수를 설정하여 모델을 다시 학습시킵니다. 이 경우 `max_iter=100`으로 설정하여 최적화합니다.
```python
sc = SGDClassifier(loss='log_loss', max_iter=100, tol=None, random_state=42)
sc.fit(train_scaled, train_target)

print(sc.score(train_scaled, train_target))
print(sc.score(test_scaled, test_target))
```
출력:
```
0.957983193277311
0.925
```
이 출력은 최적의 에포크 설정 후 훈련 세트와 테스트 세트에서 높은 정확도를 달성했음을 보여줍니다.

### 5. 기타 손실 함수

- **힌지 손실**: 서포트 벡터 머신(SVM)에서 사용하는 손실 함수입니다.
- **기타 손실 함수**: 다양한 머신러닝 알고리즘에 맞춰 다양한 손실 함수를 제공합니다.

```python
sc = SGDClassifier(loss='hinge', max_iter=100, tol=None, random_state=42)
sc.fit(train_scaled, train_target)

print(sc.score(train_scaled, train_target))
print(sc.score(test_scaled, test_target))
```
출력:
```
0.9495798319327731
0.925
```

### 6. 마무리

확률적 경사 하강법은 효율적이고 유연한 머신러닝 알고리즘으로, 데이터 크기와 계산 자원에 따라 적절한 경사 하강법(배치, 미니배치, 확률적)을 선택하여 사용할 수 있습니다. 배치 경사 하강법은 안정적이지만 자원이 많이 소모되며, 미니배치 경사 하강법은 자원 효율과 안정성을 적절히 균형 있게 제공합니다. 확률적 경사 하강법은 학습 속도가 빠르고 자원 소모가 적은 장점이 있지만, 결과가 불안정할 수 있다는 단점이 있습니다.

적절한 손실 함수와 에포크 수를 선택하고 조기 종료를 통해 과대적합을 방지하면, 확률적 경사 하강법은 매우 효과적으로 활용될 수 있습니다. 특히, 데이터 크기가 크거나 실시간 학습이 필요한 경우에 유용합니다.

#### 요약
- **SGDClassifier**는 다양한 손실 함수와 규제 옵션을 제공하여 여러 문제에 적합하게 사용할 수 있습니다.
- 손실 함수의 선택은 문제 유형(분류, 회귀 등)에 따라 달라집니다.
- 에포크 수와 조기 종료는 모델의 성능과 일반화에 중요한 영향을 미칩니다.
- 학습 과정에서 성능 평가를 통해 과소적합과 과대적합을 피하도록 주의해야 합니다.
