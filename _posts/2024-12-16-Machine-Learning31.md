---
title: "흑백 사진 분류를 위한 비지도 학습과 군집 알고리즘 이해하기"
author: mminzy22
date: 2024-12-16 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "비지도 학습과 군집화 알고리즘을 사용하여 흑백 과일 사진 데이터를 분석하고 분류하는 방법을 배웁니다."
pin: false
---



### 비지도 학습이란 무엇인가요?
비지도 학습은 머신러닝의 한 종류로, 타깃(정답)이 없는 데이터를 학습하는 방식입니다. 데이터 간의 숨겨진 패턴이나 구조를 찾는 데 주로 사용되며, 군집화(Clustering)는 비지도 학습의 대표적인 예입니다.

이번 글에서는 흑백 과일 사진 데이터를 사용해 군집화 작업을 진행하며, 비슷한 사진들을 그룹으로 나누는 방법을 알아보겠습니다.


### 과일 사진 데이터 준비하기
먼저 과일 사진 데이터를 다운로드하고 로드해봅시다.

```python
!wget https://bit.ly/fruits_300_data -O fruits_300.npy
```

데이터를 로드하려면 `numpy`와 `matplotlib` 패키지를 사용해야 합니다.

```python
import numpy as np
import matplotlib.pyplot as plt

# 데이터 로드
fruits = np.load('fruits_300.npy')
```

이제 배열의 크기를 확인해보겠습니다.

```python
print(fruits.shape)
```

출력 결과:

```
(300, 100, 100)
```

- 첫 번째 차원(300)은 샘플의 개수입니다.
- 두 번째(100)와 세 번째(100) 차원은 이미지의 높이와 너비입니다. 즉, 각 이미지의 크기는 100\*100 픽셀입니다.


### 이미지 데이터 탐색하기
배열의 첫 번째 샘플을 출력해보겠습니다.

```python
print(fruits[0, 0, :])
```

출력 결과는 다음과 같습니다:

```
[  1   1   1   1   1   ...  88  89  90  91  92]
```

여기서 숫자는 픽셀 값을 나타내며, 흑백 사진이므로 값의 범위는 0에서 255까지입니다.

이 값을 이미지로 시각화하면 더 이해하기 쉬워집니다. `matplotlib`의 `imshow()` 함수를 사용해봅시다.

```python
plt.imshow(fruits[0], cmap='gray')
plt.show()
```

출력된 이미지는 사과 사진입니다. 밝은 부분은 높은 픽셀 값(255에 가까움), 어두운 부분은 낮은 픽셀 값(0에 가까움)을 의미합니다.


### 다른 과일 사진 출력하기
데이터에는 사과, 바나나, 파인애플 사진이 각각 100장씩 포함되어 있습니다. 다음 코드로 바나나와 파인애플 이미지를 출력해보겠습니다.

```python
fig, axs = plt.subplots(1, 2)
axs[0].imshow(fruits[100], cmap='gray')
axs[1].imshow(fruits[200], cmap='gray')
plt.show()
```

출력 결과:
- 첫 번째 이미지는 바나나
- 두 번째 이미지는 파인애플입니다.

`subplots()`를 사용하면 여러 이미지를 배열처럼 쌓아 표시할 수 있습니다.


### 데이터를 배열로 나누기
과일 데이터를 사과, 바나나, 파인애플로 나눠 각각의 배열을 만들겠습니다. 이미지를 100\*100 크기에서 10,000 픽셀 크기의 1차원 배열로 변환하면 계산이 더 편리해집니다.

```python
apple = fruits[0:100].reshape(-1, 100*100)
pineapple = fruits[100:200].reshape(-1, 100*100)
banana = fruits[200:300].reshape(-1, 100*100)
```

이제 각 배열의 크기를 확인해봅니다:

```python
print(apple.shape)
```

출력 결과:

```
(100, 10000)
```


### 과일 데이터의 픽셀 평균값 비교하기
#### 샘플별 픽셀 평균값 계산
각 과일 배열의 샘플별 픽셀 평균값을 계산해봅시다.

```python
print(apple.mean(axis=1))
```

출력 결과는 사과 100개 샘플의 평균값을 보여줍니다. 히스토그램으로 시각화하면 평균값 분포를 한눈에 볼 수 있습니다.

```python
plt.hist(np.mean(apple, axis=1), alpha=0.8)
plt.hist(np.mean(pineapple, axis=1), alpha=0.8)
plt.hist(np.mean(banana, axis=1), alpha=0.8)
plt.legend(['apple', 'pineapple', 'banana'])
plt.show()
```

#### 결과 분석
- 바나나 사진의 평균값은 낮은 편(약 40)입니다.
- 사과와 파인애플은 평균값이 유사하게 90~100 사이에 분포합니다.


### 픽셀별 평균값 시각화하기
모든 샘플의 픽셀별 평균값을 계산하여 시각화해봅시다.

```python
apple_mean = np.mean(apple, axis=0).reshape(100, 100)
pineapple_mean = np.mean(pineapple, axis=0).reshape(100, 100)
banana_mean = np.mean(banana, axis=0).reshape(100, 100)

fig, axs = plt.subplots(1, 3, figsize=(20, 5))
axs[0].imshow(apple_mean, cmap='gray_r')
axs[1].imshow(pineapple_mean, cmap='gray_r')
axs[2].imshow(banana_mean, cmap='gray_r')
plt.show()
```

각 과일의 대표 이미지를 확인할 수 있습니다.


### 평균값과 가장 가까운 사진 찾기
사과의 평균 이미지와 가장 가까운 사진 100장을 찾아 출력해보겠습니다.

```python
abs_diff = np.abs(fruits - apple_mean)
abs_mean = np.mean(abs_diff, axis=(1, 2))
apple_index = np.argsort(abs_mean)[:100]

fig, axs = plt.subplots(10, 10, figsize=(10, 10))
for i in range(10):
    for j in range(10):
        axs[i, j].imshow(fruits[apple_index[i*10 + j]], cmap='gray_r')
        axs[i, j].axis('off')
plt.show()
```

출력 결과:
- 선택된 100개의 사진은 모두 사과로 보입니다.


### 결론: 군집 알고리즘의 이해
이번 실습에서는 흑백 사진의 픽셀 값을 분석하여 비슷한 사진끼리 모으는 군집화를 수행했습니다. 이러한 작업은 비지도 학습의 대표적인 응용 사례입니다. 군집화 알고리즘으로 만든 그룹을 **클러스터(Cluster)**라고 부르며, 데이터의 숨겨진 구조를 이해하는 데 유용합니다.

