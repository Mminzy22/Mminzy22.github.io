---
title: "ML: 고급 머신러닝 알고리즘: 앙상블 학습"
author: mminzy22
date: 2024-12-05 10:11:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "앙상블 학습의 배깅(Bagging)과 부스팅(Boosting), 그리고 대표적인 알고리즘인 랜덤포레스트(Random Forest), XGBoost, LightGBM"
pin: false
---



앙상블 학습(Ensemble Learning)은 여러 개의 머신러닝 모델을 결합하여 더 나은 성능을 얻는 기법입니다. 개별 모델보다 더 강력한 예측력을 제공하며, 머신러닝에서 자주 사용되는 고급 기법입니다. 이번 글에서는 앙상블 학습의 **배깅(Bagging)**과 **부스팅(Boosting)**, 그리고 대표적인 알고리즘인 **랜덤포레스트(Random Forest)**, **XGBoost**, **LightGBM**을 소개합니다.


#### 앙상블 학습이란?

앙상블 학습은 여러 모델을 조합하여 단일 모델보다 더 나은 성능을 달성하는 방법입니다.

**앙상블 학습의 장점**
- **강건성(Robustness):** 개별 모델의 약점을 상쇄하여 안정적인 예측 제공.
- **일반화 성능 향상:** 데이터의 다양한 패턴을 학습하여 과적합 방지.
- **유연성:** 분류와 회귀 문제 모두에 사용 가능.

앙상블 학습은 크게 **배깅(Bagging)**과 **부스팅(Boosting)**으로 나뉩니다.


#### 1. 배깅 (Bagging)

배깅은 데이터의 서브셋을 랜덤하게 선택해 각각 독립적인 모델을 학습시키고, 결과를 평균(회귀) 또는 다수결(분류)로 결합하는 기법입니다.

**특징**
- 각 모델은 서로 독립적으로 학습.
- 과적합 방지 효과.
- 주요 알고리즘: **랜덤포레스트(Random Forest)**

**랜덤포레스트(Random Forest)**
- 여러 개의 의사결정나무를 생성하여 예측 결과를 결합.
- 데이터의 일부와 특징의 일부를 랜덤하게 선택하여 학습(특성 랜덤 샘플링).
- 노이즈에 강하고, 성능이 안정적.

**랜덤포레스트 구현 예제**
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

# 데이터 준비
data = load_iris()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 랜덤포레스트 모델 학습
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 예측 및 평가
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy}")
```


#### 2. 부스팅 (Boosting)

부스팅은 이전 모델의 오차를 보완하도록 새로운 모델을 순차적으로 학습시키는 방법입니다.

**특징**
- 각 모델은 이전 모델의 약점을 보완.
- 과적합 가능성이 있으므로 하이퍼파라미터 튜닝이 중요.
- 주요 알고리즘: **XGBoost, LightGBM**


**XGBoost (Extreme Gradient Boosting)**
- 성능과 효율성을 모두 고려한 강력한 부스팅 알고리즘.
- Gradient Boosting 기반으로 빠른 학습 속도와 과적합 방지를 제공.
- L1, L2 정규화를 통해 규제 기능 포함.

**XGBoost 구현 예제**
```python
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score

# 모델 학습
model = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
model.fit(X_train, y_train)

# 예측 및 평가
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"XGBoost Accuracy: {accuracy}")
```


**LightGBM (Light Gradient Boosting Machine)**
- XGBoost와 유사하지만, 대규모 데이터와 높은 차원의 데이터를 빠르게 처리하는 데 특화.
- Leaf-wise 트리 성장 전략 사용으로 학습 효율성 증가.

**LightGBM 구현 예제**
```python
from lightgbm import LGBMClassifier

# 모델 학습
model = LGBMClassifier(n_estimators=100, learning_rate=0.1, max_depth=-1, random_state=42)
model.fit(X_train, y_train)

# 예측 및 평가
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"LightGBM Accuracy: {accuracy}")
```


#### 배깅 vs 부스팅

| **특징**          | **배깅**                             | **부스팅**                          |
|-------------------|-------------------------------------|------------------------------------|
| **학습 방식**      | 각 모델 독립적으로 학습                | 이전 모델의 오차를 보완하도록 순차 학습 |
| **대표 알고리즘**   | 랜덤포레스트                         | XGBoost, LightGBM                 |
| **과적합 위험**     | 낮음                                | 있음 (적절한 규제가 필요)            |
| **사용 사례**       | 노이즈가 많은 데이터                 | 성능이 중요한 대회나 모델 최적화       |


#### 정리

- **배깅:** 독립적으로 학습한 모델의 결합으로 안정성과 강건성을 제공. 랜덤포레스트가 대표적인 예.
- **부스팅:** 이전 모델의 오차를 보완하며 순차적으로 학습. XGBoost와 LightGBM이 대표적인 알고리즘.

앙상블 학습은 모델의 성능을 극대화하는 데 매우 유용하며, 배깅과 부스팅의 조합으로 다양한 문제를 해결할 수 있습니다.

> **다음 글 예고:**  
> 머신러닝의 또 다른 유형인 **"비지도 학습"**과 그 대표 알고리즘인 K-Means, DBSCAN 등에 대해 알아보겠습니다!
