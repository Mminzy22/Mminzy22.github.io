---
title: "k-평균 알고리즘을 활용한 과일 사진 자동 군집화"
author: mminzy22
date: 2024-12-17 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "k-평균 알고리즘을 사용하여 과일 사진을 자동으로 군집화하는 방법을 학습합니다."
pin: false
---



오늘은 비지도 학습의 대표적인 알고리즘인 **k-평균(k-means)** 알고리즘을 활용해 과일 사진을 자동으로 군집화하는 과정을 학습했습니다. k-평균은 비슷한 데이터 샘플을 그룹으로 묶는 데 탁월한 알고리즘으로, 타깃 레이블 없이도 데이터를 구조화할 수 있는 강력한 도구입니다. 아래는 k-평균 알고리즘의 개념, 작동 원리, 그리고 실제 예제를 통한 실습 내용을 자세히 정리한 내용입니다.


### 1. k-평균 알고리즘 소개

**k-평균 알고리즘**은 데이터를 k개의 클러스터로 나누는 비지도 학습 알고리즘입니다. 이 알고리즘은 아래 단계를 반복하여 최적의 클러스터를 찾습니다:

1. **무작위 클러스터 중심 지정**  
   - 데이터 공간에서 k개의 클러스터 중심을 임의로 설정합니다.

2. **클러스터 할당**  
   - 각 데이터 샘플에서 가장 가까운 클러스터 중심을 찾아 해당 클러스터에 할당합니다.

3. **클러스터 중심 갱신**  
   - 클러스터에 속한 데이터 샘플들의 평균값을 계산하여 클러스터 중심을 갱신합니다.

4. **중심 고정 여부 확인**  
   - 클러스터 중심이 더 이상 변화하지 않으면 알고리즘을 종료합니다.


### 2. 데이터 준비

#### (1) 데이터 다운로드 및 로드
먼저 과일 사진 데이터를 다운로드하고 이를 로드해 준비합니다. 데이터는 `.npy` 형식의 파일로 제공됩니다.

```bash
!wget https://bit.ly/fruits_300_data -O fruits_300.npy
```

로드된 데이터를 NumPy 배열로 읽습니다:

```python
import numpy as np

fruits = np.load('fruits_300.npy')
```

#### (2) 데이터 구조 변경
k-평균 알고리즘은 2차원 데이터 형태에서 작동하므로, 원래 3차원 배열 데이터를 2차원 배열로 변환합니다.

```python
fruits_2d = fruits.reshape(-1, 100*100)
```


### 3. k-평균 알고리즘 적용

#### (1) 모델 생성 및 학습
사이킷런의 `KMeans` 클래스를 사용하여 k-평균 알고리즘을 적용합니다. 클러스터 개수는 3으로 설정합니다.

```python
from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, random_state=42)
km.fit(fruits_2d)
```

#### (2) 군집 결과 확인
군집 결과는 `labels_` 속성에 저장되며, 각 샘플이 어떤 클러스터에 속하는지 나타냅니다.

```python
print(km.labels_)
```

#### (3) 각 클러스터의 샘플 개수
군집된 각 클러스터의 샘플 개수는 `np.unique`를 사용해 확인할 수 있습니다.

```python
print(np.unique(km.labels_, return_counts=True))
```


### 4. 시각화: 각 클러스터의 이미지 확인

#### (1) 유틸리티 함수 정의
군집된 결과를 시각화하기 위해 이미지를 그려주는 함수를 작성합니다.

```python
import matplotlib.pyplot as plt

def draw_fruits(arr, ratio=1):
    n = len(arr)
    rows = int(np.ceil(n / 10))
    cols = n if rows == 1 else 10
    fig, axs = plt.subplots(rows, cols, figsize=(cols * ratio, rows * ratio), squeeze=False)
    for i in range(rows):
        for j in range(cols):
            if i * 10 + j < n:
                axs[i, j].imshow(arr[i * 10 + j], cmap='gray_r')
            axs[i, j].axis('off')
    plt.show()
```

#### (2) 각 클러스터 시각화
클러스터 레이블별로 이미지를 출력해 각 클러스터의 특성을 확인합니다.

```python
draw_fruits(fruits[km.labels_ == 0])  # 레이블 0
draw_fruits(fruits[km.labels_ == 1])  # 레이블 1
draw_fruits(fruits[km.labels_ == 2])  # 레이블 2
```

결과:
- **레이블 0**: 대부분 파인애플, 일부 사과와 바나나 포함  
- **레이블 1**: 모두 바나나  
- **레이블 2**: 모두 사과  


### 5. 클러스터 중심 확인

`cluster_centers_` 속성은 k-평균 알고리즘이 학습한 클러스터 중심을 반환합니다. 이를 시각화하려면 2차원 데이터 형태를 원래 이미지 형태로 변환해야 합니다.

```python
draw_fruits(km.cluster_centers_.reshape(-1, 100, 100), ratio=3)
```


### 6. k 값 선택: 엘보우 방법

적절한 클러스터 개수를 찾기 위해 엘보우 방법을 사용합니다. 이너셔(inertia)는 클러스터 내 데이터 밀집도를 나타내며, 클러스터 개수에 따라 변합니다.

```python
inertia = []
for k in range(2, 7):
    km = KMeans(n_clusters=k, random_state=42)
    km.fit(fruits_2d)
    inertia.append(km.inertia_)

plt.plot(range(2, 7), inertia)
plt.xlabel('k')
plt.ylabel('inertia')
plt.show()
```

**결과 해석**:  
- 그래프에서 k=3에서 기울기가 약간 완만해지는 지점이 보입니다. 이 지점이 최적의 k 값으로 추정됩니다.


### 7. 결론

k-평균 알고리즘은 타깃 데이터 없이도 비슷한 샘플들을 잘 그룹화할 수 있음을 확인했습니다. 특히 이미지를 클러스터링하고 군집 중심을 시각화함으로써 데이터의 특징을 보다 명확히 이해할 수 있었습니다.  
또한, 엘보우 방법을 통해 클러스터 개수를 선택하는 과정에서 k-평균 알고리즘의 실전 활용 가능성을 배웠습니다.

