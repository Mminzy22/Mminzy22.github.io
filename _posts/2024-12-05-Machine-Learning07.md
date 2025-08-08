---
title: "ML: 선형 회귀와 로지스틱 회귀"
author: mminzy22
date: 2024-12-05 10:06:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "머신러닝에서 선형 회귀와 로지스틱 회귀의 기본 개념, 구현 방법, 활용 사례를 다룹니다."
pin: false
---



머신러닝에서 회귀 분석은 데이터를 기반으로 예측 모델을 만드는 데 핵심적인 기법입니다. 이번 글에서는 **선형 회귀(Linear Regression)**와 **로지스틱 회귀(Logistic Regression)**의 기본 개념과 구현 방법, 그리고 활용 사례를 살펴보겠습니다.


#### 선형 회귀 (Linear Regression)

**1. 기본 개념**  
선형 회귀는 **입력 변수(X)**와 **출력 변수(y)** 간의 선형 관계를 모델링하는 기법입니다.  
- **목표:**  
  데이터에 가장 적합한 직선을 찾고, 이를 통해 연속적인 값을 예측.  
- **수식:**  
  $$ y = \beta_0 + \beta_1X + \epsilon $$  
  - \\( y \\): 예측값  
  - \\( \beta_0 \\): 절편  
  - \\( \beta_1 \\): 기울기 (계수)  
  - \\( \epsilon \\): 오차(Residual)

**2. 활용 사례**  
- 주택 가격 예측 (크기, 위치 등 입력 변수 기반)  
- 매출 예측 (광고비와 매출 간 관계 모델링)

**3. 구현 예제**  
Python의 `scikit-learn` 라이브러리를 사용하여 선형 회귀를 구현할 수 있습니다.

```python
from sklearn.linear_model import LinearRegression
import numpy as np
import matplotlib.pyplot as plt

# 데이터 생성
X = np.array([1, 2, 3, 4, 5]).reshape(-1, 1)
y = np.array([2.1, 4.3, 6.2, 8.5, 10.3])

# 선형 회귀 모델 학습
model = LinearRegression()
model.fit(X, y)

# 예측 및 시각화
y_pred = model.predict(X)
plt.scatter(X, y, color='blue', label='Data')
plt.plot(X, y_pred, color='red', label='Prediction')
plt.title('Linear Regression Example')
plt.legend()
plt.show()

print(f"Intercept: {model.intercept_}, Coefficients: {model.coef_}")
```


#### 로지스틱 회귀 (Logistic Regression)

**1. 기본 개념**  
로지스틱 회귀는 **범주형 변수(0, 1 등)**를 예측하는 데 사용되는 기법입니다.  
- **목표:**  
  입력 변수와 출력 변수 간의 관계를 모델링하여 특정 사건이 발생할 확률을 예측.  
- **수식:**  
  $$ P(y=1|X) = \frac{1}{1 + e^{-(\beta_0 + \beta_1X)}} $$  
  - \\( P(y=1\|X) \\): 사건이 발생할 확률  
  - \\( e \\): 자연 상수  
  - \\( \beta_0, \beta_1 \\): 모델 파라미터  

**2. 활용 사례**  
- 이메일 스팸 필터링 (스팸 여부 분류)  
- 의료 데이터 분석 (질병 유무 예측)

**3. 구현 예제**  
`scikit-learn`을 사용하여 로지스틱 회귀를 간단히 구현할 수 있습니다.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris
import numpy as np

# 데이터 로드 및 준비
data = load_iris()
X = data.data[:, :2]  # 첫 두 개의 특징 사용
y = (data.target == 0).astype(int)  # 'setosa' 클래스만 분류

# 로지스틱 회귀 모델 학습
model = LogisticRegression()
model.fit(X, y)

# 예측
predictions = model.predict(X)
probabilities = model.predict_proba(X)

print(f"Predictions: {predictions}")
print(f"Probabilities: {probabilities[:5]}")
```


#### 선형 회귀 vs 로지스틱 회귀

| **특징**               | **선형 회귀**                            | **로지스틱 회귀**                         |
|------------------------|-----------------------------------------|------------------------------------------|
| **출력 값**             | 연속적인 값 예측                         | 범주형 값 예측 (확률 기반)                 |
| **활용 분야**           | 주택 가격, 매출 예측 등                  | 분류 문제 (스팸, 질병 예측 등)             |
| **수학적 기초**         | 선형 함수 기반                          | 시그모이드 함수 기반                      |
| **평가 지표**           | 평균 제곱 오차(MSE), R²                  | 정확도, 정밀도, 재현율, F1 점수            |


#### 정리

- **선형 회귀:**  
  데이터를 직선으로 모델링하여 연속적인 값을 예측.  
  예: 주택 가격 예측, 매출 예측.  
- **로지스틱 회귀:**  
  확률 기반의 분류 모델로 특정 사건의 발생 여부를 예측.  
  예: 이메일 스팸 여부, 질병 진단.  

> **다음 글 예고:**  
> 머신러닝의 **"분류와 회귀 문제 이해"**를 다루며 주요 알고리즘을 소개하겠습니다!
