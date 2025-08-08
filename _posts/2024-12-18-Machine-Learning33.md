---
title: "차원 축소와 PCA(주성분 분석) 이해하기"
author: mminzy22
date: 2024-12-18 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "머신러닝에서 차원 축소와 주성분 분석(PCA)에 대해 설명하고, 이를 Python 코드로 구현하는 방법을 다룹니다."
pin: false
---



### 1. 차원과 차원 축소란?
머신러닝에서 데이터가 가진 속성은 특성이라고 불립니다. 특성의 개수를 차원이라고도 표현하며, 예를 들어 10,000개의 특성이 있는 데이터는 10,000차원 공간에 존재합니다. 이처럼 차원이 많아지면 데이터 저장 공간이 커지고 모델 훈련 시 과대적합의 위험이 높아질 수 있습니다.

차원 축소는 데이터를 가장 잘 나타내는 일부 특성을 선택하거나 변환하여 차원을 줄이는 과정입니다. 이를 통해 데이터 크기를 줄이고, 훈련 속도 및 지도 학습 모델의 성능을 향상시킬 수 있습니다. 또한, 줄어든 차원을 기반으로 데이터를 복원할 수도 있습니다.

이번 글에서는 대표적인 차원 축소 알고리즘인 주성분 분석(PCA)에 대해 자세히 알아보겠습니다.

### 2. 주성분 분석(PCA) 개념
PCA는 데이터의 분산이 큰 방향(즉, 데이터를 가장 잘 표현하는 방향)을 찾는 알고리즘입니다. 데이터에서 분산이 가장 큰 방향을 벡터(주성분)로 나타내며, 이 벡터는 원본 데이터의 특성을 기반으로 합니다.

1. **주성분**: 데이터 분포를 가장 잘 표현하는 방향 벡터.
2. **특징**: 첫 번째 주성분은 분산이 가장 큰 방향이고, 두 번째 주성분은 첫 번째에 수직이며 그다음으로 분산이 큰 방향입니다.
3. **차원 축소**: 주성분을 기반으로 데이터를 투영하여 특성 개수를 줄입니다.

### 3. PCA를 사용한 차원 축소 구현

#### 데이터 준비

```python
!wget https://bit.ly/fruits_300_data -O fruits_300.npy
import numpy as np

fruits = np.load('fruits_300.npy')
fruits_2d = fruits.reshape(-1, 100*100)  # 데이터 차원을 (300, 10000)으로 변환
```

#### PCA로 주성분 찾기
사이킷런의 `PCA` 클래스를 사용하여 주성분을 찾습니다.

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=50)  # 주성분 개수 설정
pca.fit(fruits_2d)
```

주성분 확인:

```python
print(pca.components_.shape)  # 출력: (50, 10000)
```
`pca.components_`는 50개의 주성분 벡터를 포함합니다.

#### 주성분 시각화
주성분 벡터를 이미지로 출력합니다.

```python
import matplotlib.pyplot as plt

def draw_fruits(arr, ratio=1):
    n = len(arr)
    rows = int(np.ceil(n / 10))
    cols = n if rows < 2 else 10
    fig, axs = plt.subplots(rows, cols, figsize=(cols * ratio, rows * ratio), squeeze=False)
    for i in range(rows):
        for j in range(cols):
            if i * 10 + j < n:
                axs[i, j].imshow(arr[i * 10 + j], cmap='gray_r')
            axs[i, j].axis('off')
    plt.show()

draw_fruits(pca.components_.reshape(-1, 100, 100))
```

#### 데이터 차원 축소
`transform()` 메서드를 사용해 데이터를 50개의 주성분으로 변환합니다.

```python
fruits_pca = pca.transform(fruits_2d)
print(fruits_pca.shape)  # 출력: (300, 50)
```
데이터 크기가 (300, 10000)에서 (300, 50)으로 축소되었습니다.

#### 데이터 복원
축소된 데이터를 원본 크기로 복원합니다.

```python
fruits_inverse = pca.inverse_transform(fruits_pca)
print(fruits_inverse.shape)  # 출력: (300, 10000)

fruits_reconstruct = fruits_inverse.reshape(-1, 100, 100)
for start in [0, 100, 200]:
    draw_fruits(fruits_reconstruct[start:start+100])
```
복원된 데이터는 원본과 유사하지만 약간의 손실이 발생할 수 있습니다.

#### 설명된 분산
각 주성분이 원본 데이터의 분산을 얼마나 잘 나타내는지 확인합니다.

```python
print(np.sum(pca.explained_variance_ratio_))  # 출력: 0.9215 (92%의 분산 유지)

plt.plot(pca.explained_variance_ratio_)
plt.show()
```
그래프를 통해 적절한 주성분 개수를 결정할 수 있습니다.

### 4. 차원 축소 데이터로 지도 학습 수행

#### 로지스틱 회귀 모델 적용
축소된 데이터로 모델을 훈련해 원본 데이터와 비교합니다.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_validate

lr = LogisticRegression()
target = np.array([0] * 100 + [1] * 100 + [2] * 100)

# 원본 데이터 사용
scores = cross_validate(lr, fruits_2d, target)
print(np.mean(scores['test_score']))  # 출력: 0.9966
print(np.mean(scores['fit_time']))  # 출력: 약 1초

# 차원 축소 데이터 사용
scores = cross_validate(lr, fruits_pca, target)
print(np.mean(scores['test_score']))  # 출력: 0.9966
print(np.mean(scores['fit_time']))  # 출력: 약 0.02초
```
차원 축소 데이터는 훈련 시간이 크게 단축되면서도 성능이 유지되었습니다.

#### 주성분 비율로 설정
특정 분산 비율만 유지하도록 주성분 개수를 자동 설정할 수도 있습니다.

```python
pca = PCA(n_components=0.5)  # 50% 분산 유지
pca.fit(fruits_2d)
print(pca.n_components_)  # 출력: 2
```

#### 2D 데이터 시각화
2차원으로 축소된 데이터를 시각화합니다.

```python
from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, random_state=42)
km.fit(fruits_pca)

for label in range(3):
    data = fruits_pca[km.labels_ == label]
    plt.scatter(data[:, 0], data[:, 1])
plt.legend(['pineapple', 'banana', 'apple'])
plt.show()
```
클러스터 간 경계를 시각적으로 확인할 수 있습니다.

### 5. 결론
PCA를 활용한 차원 축소는 데이터의 크기를 줄이면서도 원본 데이터를 잘 표현하고, 모델 훈련 속도를 높이는 데 매우 유용합니다. 또한, 차원이 낮아지면 데이터 시각화가 가능해지고, 모델의 과대적합 위험도 줄어듭니다. PCA는 머신러닝에서 데이터 전처리 및 차원 축소 작업에 강력한 도구로 활용됩니다.

