---
title: "ML: 비지도 학습"
author: mminzy22
date: 2024-12-05 10:12:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "비지도 학습의 대표적인 기법인 군집화(K-Means, DBSCAN)와 차원 축소(t-SNE, UMAP)"
pin: false
---



비지도 학습(Unsupervised Learning)은 레이블 없이 데이터의 숨겨진 구조를 학습하는 머신러닝 방법입니다. 이 글에서는 비지도 학습의 대표적인 기법인 **군집화(K-Means, DBSCAN)**와 **차원 축소(t-SNE, UMAP)**를 알아보겠습니다.


#### 비지도 학습의 특징

- **레이블 없음:** 입력 데이터만 제공되고 정답(레이블)이 없음.
- **데이터 탐색:** 데이터의 구조나 패턴을 파악하여 그룹화하거나 요약.
- **활용 사례:** 
  - 고객 세분화
  - 이미지 분류
  - 데이터 시각화


#### 1. 군집화 (Clustering)

군집화는 데이터를 유사한 특성을 가진 그룹으로 묶는 작업입니다.

**(1) K-Means**
- **원리:** 데이터를 \(k\)개의 클러스터로 나누고, 각 클러스터 중심(centroid)을 반복적으로 조정하여 최적화.
- **장점:** 간단하고 빠르게 동작.
- **단점:** 클러스터 개수를 사전에 설정해야 함, 비구형 데이터에 약함.

**K-Means 구현 예제**
```python
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs

# 데이터 생성
X, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.6, random_state=42)

# K-Means 모델 학습
kmeans = KMeans(n_clusters=4, random_state=42)
y_kmeans = kmeans.fit_predict(X)

# 시각화
plt.scatter(X[:, 0], X[:, 1], c=y_kmeans, cmap='viridis')
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], s=300, c='red', marker='X')
plt.title('K-Means Clustering')
plt.show()
```


**(2) DBSCAN (Density-Based Spatial Clustering of Applications with Noise)**
- **원리:** 밀도가 높은 영역을 클러스터로 그룹화하고, 밀도가 낮은 포인트는 노이즈로 간주.
- **장점:** 비구형 데이터와 노이즈 처리에 강함.
- **단점:** 클러스터 간 밀도가 다를 경우 성능 저하.

**DBSCAN 구현 예제**
```python
from sklearn.cluster import DBSCAN
import numpy as np

# DBSCAN 모델 학습
dbscan = DBSCAN(eps=0.5, min_samples=5)
y_dbscan = dbscan.fit_predict(X)

# 시각화
plt.scatter(X[:, 0], X[:, 1], c=y_dbscan, cmap='viridis')
plt.title('DBSCAN Clustering')
plt.show()
```


#### 2. 차원 축소 (Dimensionality Reduction)

차원 축소는 고차원 데이터를 저차원으로 변환하여 데이터의 주요 패턴을 추출하는 기법입니다.

**(1) t-SNE (t-Distributed Stochastic Neighbor Embedding)**
- **원리:** 고차원 데이터 간의 유사성을 보존하면서 저차원으로 변환.
- **장점:** 데이터의 군집 구조를 시각화하는 데 유용.
- **단점:** 계산 비용이 높고, 데이터 크기가 크면 비효율적.

**t-SNE 구현 예제**
```python
from sklearn.manifold import TSNE

# t-SNE 변환
tsne = TSNE(n_components=2, random_state=42)
X_tsne = tsne.fit_transform(X)

# 시각화
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y_kmeans, cmap='viridis')
plt.title('t-SNE Visualization')
plt.show()
```


**(2) UMAP (Uniform Manifold Approximation and Projection)**
- **원리:** 데이터의 지역적 구조를 보존하며, 효율적으로 차원을 축소.
- **장점:** 속도가 빠르고, 데이터 크기에 강점.
- **단점:** 하이퍼파라미터 튜닝 필요.

**UMAP 구현 예제**
```python
import umap

# UMAP 변환
umap_model = umap.UMAP(n_neighbors=15, min_dist=0.1, random_state=42)
X_umap = umap_model.fit_transform(X)

# 시각화
plt.scatter(X_umap[:, 0], X_umap[:, 1], c=y_kmeans, cmap='viridis')
plt.title('UMAP Visualization')
plt.show()
```


#### 군집화 vs 차원 축소

| **특징**              | **군집화 (Clustering)**               | **차원 축소 (Dimensionality Reduction)**    |
|-----------------------|---------------------------------------|--------------------------------------------|
| **목적**              | 데이터를 그룹으로 묶기                 | 데이터를 저차원으로 변환                     |
| **결과물**            | 클러스터 레이블                       | 저차원 벡터                                |
| **활용 사례**          | 고객 세분화, 이미지 분류               | 데이터 시각화, 노이즈 제거                  |
| **대표 알고리즘**       | K-Means, DBSCAN                      | t-SNE, UMAP                                |


#### 정리

- **군집화:** 데이터를 유사한 특성을 가진 그룹으로 묶는 기법.
  - **K-Means:** 간단하고 빠른 군집화 알고리즘.
  - **DBSCAN:** 밀도 기반으로 클러스터링, 노이즈 처리에 강점.
- **차원 축소:** 고차원 데이터를 시각화하거나 주요 패턴을 파악하는 데 사용.
  - **t-SNE:** 데이터의 군집 구조를 시각적으로 탐색.
  - **UMAP:** 빠르고 효율적으로 차원을 축소.

> **다음 글 예고:**  
> 머신러닝의 또 다른 흥미로운 분야인 **"강화 학습"**에 대해 알아보겠습니다. 강화 학습의 기본 원리와 주요 알고리즘을 통해 환경과 상호작용하며 학습하는 방법을 탐구해보세요! 🚀
