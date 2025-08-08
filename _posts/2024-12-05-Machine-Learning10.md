---
title: "ML: 피처 선택 (Feature Selection)"
author: mminzy22
date: 2024-12-05 10:09:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "상관 분석과 차원 축소(PCA)를 활용한 피처 선택 기법"
pin: false
---



피처 선택은 데이터 분석과 머신러닝 모델링에서 중요한 단계로, 모델의 성능을 향상시키고 계산 비용을 줄이는 데 기여합니다. 이번 글에서는 **상관 분석**과 **차원 축소(PCA)**를 활용한 피처 선택 기법을 살펴보겠습니다.


#### 피처 선택의 중요성

피처 선택은 데이터의 특징(Feature) 중 중요한 정보만 골라내는 과정입니다.  
- **장점:**  
  1. 모델 성능 향상: 불필요한 특징 제거로 학습 효율성 증가.  
  2. 계산 시간 절약: 데이터 크기를 줄여 처리 속도 향상.  
  3. 과적합 방지: 노이즈나 상관성이 낮은 피처 제거.  

**활용 사례**
- 의료 데이터에서 특정 병의 원인에 대한 주요 특징 추출.  
- 전자상거래에서 고객 구매 행동에 영향을 주는 주요 변수 선택.  


#### 1. 상관 분석 (Correlation Analysis)

상관 분석은 데이터의 두 변수 간 관계를 측정하여 피처 선택에 활용합니다.  
- **상관 계수:** 두 변수 간 선형 관계의 강도를 나타내는 값(-1 ~ 1).  
  - 1: 완전 양의 상관관계  
  - 0: 상관 없음  
  - -1: 완전 음의 상관관계  
- **활용:**  
  - 강한 상관관계를 가진 변수 선택.  
  - 높은 상관관계를 가진 변수들 중 하나만 선택하여 다중공선성(multicollinearity) 문제 방지.  

**예제: 상관 행렬 계산 및 시각화**
```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# 샘플 데이터
data = {
    'Feature1': [1, 2, 3, 4, 5],
    'Feature2': [2, 4, 6, 8, 10],
    'Feature3': [1, 1, 2, 2, 3],
    'Target': [10, 20, 30, 40, 50]
}
df = pd.DataFrame(data)

# 상관 계수 계산
correlation_matrix = df.corr()
print(correlation_matrix)

# 히트맵 시각화
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm')
plt.title('Correlation Matrix')
plt.show()
```


#### 2. 차원 축소 (Principal Component Analysis, PCA)

차원 축소는 고차원 데이터를 저차원으로 변환하여 데이터의 요약 정보를 보존하면서 분석을 용이하게 만드는 기법입니다.  
- **PCA의 원리:**  
  데이터를 선형 변환하여 분산(Variance)을 최대화하는 축(Principal Components)을 찾아 데이터를 투영.  
- **장점:**  
  - 데이터의 주요 패턴을 보존하며 차원 축소.  
  - 계산 효율성 증가와 시각화 용이.  
- **활용:**  
  - 이미지 데이터에서 주요 패턴 추출.  
  - 고차원 금융 데이터 분석.

**예제: PCA를 사용한 차원 축소**
```python
from sklearn.decomposition import PCA
from sklearn.datasets import load_iris
import pandas as pd

# 데이터 로드
iris = load_iris()
X = iris.data

# PCA 적용 (2차원으로 축소)
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)

# 결과 출력
print(f"Explained Variance Ratio: {pca.explained_variance_ratio_}")

# 시각화
import matplotlib.pyplot as plt

plt.scatter(X_pca[:, 0], X_pca[:, 1], c=iris.target, cmap='viridis', edgecolor='k')
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.title('PCA Visualization')
plt.colorbar()
plt.show()
```

**PCA 적용 후 데이터 설명**
- **Explained Variance Ratio:**  
  각 주성분(Principal Component)이 전체 데이터 변동성을 얼마나 설명하는지 나타냄.  
- **데이터 시각화:**  
  2차원으로 축소된 데이터를 통해 주요 패턴과 클러스터 확인 가능.  


#### 상관 분석 vs 차원 축소

| **기법**             | **상관 분석**                          | **차원 축소 (PCA)**                     |
|----------------------|----------------------------------------|------------------------------------------|
| **목적**             | 변수 간의 관계를 측정                  | 데이터를 저차원으로 변환                  |
| **결과**             | 상관 계수 기반으로 변수 선택            | 새로운 주성분(Principal Components) 생성 |
| **활용 사례**         | 다중공선성 제거, 변수 중요도 평가        | 시각화, 데이터 패턴 탐지                 |


#### 정리

- **상관 분석:**  
  변수 간 상관관계를 기반으로 중요한 피처를 선택하고 다중공선성을 줄이는 데 효과적입니다.  
- **차원 축소(PCA):**  
  데이터를 저차원으로 변환하여 주요 패턴을 보존하고 계산 효율성을 높이는 데 유용합니다.  

> **다음 글 예고:**  
> 머신러닝에서 데이터를 더 잘 활용하기 위한 **"피처 생성"**에 대해 알아보겠습니다!
