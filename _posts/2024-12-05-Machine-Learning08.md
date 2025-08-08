---
title: "ML: 분류와 회귀 문제 이해"
author: mminzy22
date: 2024-12-05 10:07:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "머신러닝의 분류와 회귀 문제를 이해하고, 주요 알고리즘(의사결정나무, KNN, SVM 등)을 살펴봅니다."
pin: false
---



머신러닝의 문제는 주로 **분류(Classification)**와 **회귀(Regression)**로 나뉩니다. 각 문제 유형은 데이터와 목표에 따라 다른 알고리즘을 사용하며, 모델링 방식도 차이가 있습니다. 이번 글에서는 분류와 회귀 문제의 차이를 이해하고, 주요 알고리즘(의사결정나무, KNN, SVM 등)을 살펴보겠습니다.


#### 분류(Classification)

**1. 정의**  
분류는 데이터를 특정 **범주(Category)**로 나누는 문제입니다.  
모델은 주어진 데이터의 특징을 학습하여 입력 데이터가 어느 범주에 속하는지 예측합니다.

**2. 특징**  
- 출력 값은 **이산적(Discrete)**입니다.  
- 예측 결과는 특정 클래스(예: 스팸/정상, 고양이/개)로 구분됩니다.  
- 확률 기반 예측 가능 (예: 클래스별 확률 제공).

**3. 활용 사례**  
- 이메일 스팸 필터링 (스팸/정상)  
- 암 진단 (양성/음성)  
- 이미지 분류 (고양이, 개, 새 등)  


#### 회귀(Regression)

**1. 정의**  
회귀는 **연속적(Continuous)**인 값을 예측하는 문제입니다.  
모델은 입력 변수와 출력 변수 간의 관계를 학습하여 숫자 값을 예측합니다.

**2. 특징**  
- 출력 값은 연속적입니다.  
- 데이터의 선형 또는 비선형 관계를 모델링합니다.  

**3. 활용 사례**  
- 주택 가격 예측 (크기, 위치 등 기반)  
- 주식 시장 예측  
- 온도 예측  


#### 분류 vs 회귀

| **특징**               | **분류(Classification)**                  | **회귀(Regression)**                      |
|------------------------|-----------------------------------------|------------------------------------------|
| **출력 값**             | 이산적 값 (클래스)                        | 연속적 값 (숫자)                          |
| **평가 지표**           | 정확도, 정밀도, 재현율, F1 점수            | 평균 제곱 오차(MSE), R²                   |
| **알고리즘 예시**       | 로지스틱 회귀, SVM, 의사결정나무 등        | 선형 회귀, 다항 회귀, 랜덤포레스트 회귀 등|


#### 주요 알고리즘 소개

머신러닝에서는 다양한 알고리즘이 분류와 회귀 문제를 해결하는 데 사용됩니다. 그중 **의사결정나무**, **KNN**, **SVM**은 널리 사용되는 강력한 알고리즘입니다.

**1. 의사결정나무 (Decision Tree)**  
- **정의:** 데이터를 기준으로 여러 분기 조건을 설정하여 의사결정을 시각적으로 표현.  
- **특징:**  
  - 직관적이고 이해하기 쉬움.  
  - 과적합(overfitting)의 위험이 있으므로 가지치기(pruning) 필요.  
- **활용:** 분류와 회귀 모두 가능.  

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_iris

# 데이터 준비
data = load_iris()
X, y = data.data, data.target

# 모델 학습
model = DecisionTreeClassifier(max_depth=3)
model.fit(X, y)

# 예측
predictions = model.predict(X)
print(predictions)
```


**2. K-최근접 이웃 (K-Nearest Neighbors, KNN)**  
- **정의:** 입력 데이터와 가장 가까운 K개의 이웃을 찾아 다수결로 분류하거나 평균으로 회귀 수행.  
- **특징:**  
  - 단순하면서도 강력한 성능.  
  - 계산량이 많아 대규모 데이터에 비효율적일 수 있음.  
- **활용:** 이미지 분류, 추천 시스템.  

```python
from sklearn.neighbors import KNeighborsClassifier

# 모델 학습
model = KNeighborsClassifier(n_neighbors=5)
model.fit(X, y)

# 예측
predictions = model.predict(X)
print(predictions)
```


**3. 서포트 벡터 머신 (Support Vector Machine, SVM)**  
- **정의:** 데이터를 고차원 공간으로 변환하여 최적의 결정 경계를 찾는 알고리즘.  
- **특징:**  
  - 분류와 회귀 모두 가능.  
  - 고차원 데이터에 강점이 있지만 대규모 데이터에는 느릴 수 있음.  
- **활용:** 텍스트 분류, 이미지 분류.  

```python
from sklearn.svm import SVC

# 모델 학습
model = SVC(kernel='linear')
model.fit(X, y)

# 예측
predictions = model.predict(X)
print(predictions)
```


#### 정리

- **분류 문제:** 데이터를 특정 범주로 나누는 문제. 대표적인 알고리즘은 의사결정나무, KNN, SVM.  
- **회귀 문제:** 연속적인 숫자 값을 예측하는 문제. 선형 회귀, 랜덤포레스트 회귀 등 활용.  
- 알고리즘 선택은 문제 유형과 데이터의 특성에 따라 결정됩니다.

> **다음 글 예고:**  
> 머신러닝 모델의 성능을 평가하기 위한 **"모델 성능 평가"** 방법에 대해 알아보겠습니다!
