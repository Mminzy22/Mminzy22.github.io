---
title: "트리 앙상블 (Tree Ensemble)"
author: mminzy22
date: 2024-12-13 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "다양한 트리 앙상블 알고리즘(Random Forest, Extra Trees, Gradient Boosting, HistGradientBoosting, XGBoost, LightGBM)을 활용하여 와인 데이터셋을 분석하고, 각 모델의 성능을 비교합니다. 교차 검증, 특성 중요도 분석, OOB 점수 등을 통해 모델을 평가하고, 하이퍼파라미터 조정을 통해 성능을 향상시키는 방법"
pin: false
---



### 1. 데이터 준비
이번 학습에서는 와인 데이터셋을 활용하여 트리 앙상블 모델을 실습했습니다. 먼저 데이터를 준비하고 학습용/테스트용으로 분리했습니다.

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

wine = pd.read_csv('https://bit.ly/wine_csv_data')

data = wine[['alcohol', 'sugar', 'pH']].to_numpy()
target = wine['class'].to_numpy()

train_input, test_input, train_target, test_target = train_test_split(
    data, target, test_size=0.2, random_state=42
)
```

- `train_test_split`를 사용해 데이터를 80:20 비율로 분리했습니다.
- 입력 데이터(`alcohol`, `sugar`, `pH`)와 타겟 데이터(`class`)를 나누었습니다.


### 2. 랜덤 포레스트 (Random Forest)
랜덤 포레스트는 다수의 결정 트리를 학습하여 예측 성능을 높이는 앙상블 모델입니다.

#### 2.1 교차 검증
```python
from sklearn.model_selection import cross_validate
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_jobs=-1, random_state=42)
scores = cross_validate(rf, train_input, train_target, return_train_score=True, n_jobs=-1)

print(np.mean(scores['train_score']), np.mean(scores['test_score']))
```
- 교차 검증 결과, 훈련 점수와 테스트 점수를 확인해 모델의 과대적합 여부를 판단했습니다.

#### 2.2 특성 중요도 확인
```python
rf.fit(train_input, train_target)
print(rf.feature_importances_)
```
- 랜덤 포레스트 모델 학습 후, 각 특성이 모델에 기여하는 중요도를 출력했습니다.

#### 2.3 OOB 샘플 활용
```python
rf = RandomForestClassifier(oob_score=True, n_jobs=-1, random_state=42)
rf.fit(train_input, train_target)
print(rf.oob_score_)
```
- OOB(Out-Of-Bag) 샘플 점수를 출력해 추가적인 검증 데이터를 활용했습니다.


### 3. 엑스트라 트리 (Extra Trees)
엑스트라 트리는 랜덤 포레스트와 유사하지만, 분할을 무작위로 선택하는 특징이 있습니다.

```python
from sklearn.ensemble import ExtraTreesClassifier

et = ExtraTreesClassifier(n_jobs=-1, random_state=42)
scores = cross_validate(et, train_input, train_target, return_train_score=True, n_jobs=-1)

print(np.mean(scores['train_score']), np.mean(scores['test_score']))

et.fit(train_input, train_target)
print(et.feature_importances_)
```
- 훈련 및 테스트 점수를 확인하고 특성 중요도를 출력했습니다.


### 4. 그래디언트 부스팅 (Gradient Boosting)
그래디언트 부스팅은 순차적으로 약한 학습기를 추가하며 성능을 높이는 앙상블 기법입니다.

#### 4.1 기본 설정
```python
from sklearn.ensemble import GradientBoostingClassifier

gb = GradientBoostingClassifier(random_state=42)
scores = cross_validate(gb, train_input, train_target, return_train_score=True, n_jobs=-1)

print(np.mean(scores['train_score']), np.mean(scores['test_score']))
```

#### 4.2 하이퍼파라미터 조정
```python
gb = GradientBoostingClassifier(n_estimators=500, learning_rate=0.2, random_state=42)
scores = cross_validate(gb, train_input, train_target, return_train_score=True, n_jobs=-1)

print(np.mean(scores['train_score']), np.mean(scores['test_score']))
```
- 학습률(`learning_rate`)와 트리 개수(`n_estimators`)를 조정해 모델의 성능을 확인했습니다.

#### 4.3 특성 중요도
```python
gb.fit(train_input, train_target)
print(gb.feature_importances_)
```


### 5. 히스토그램 기반 그래디언트 부스팅 (HistGradientBoosting)
히스토그램 기반 그래디언트 부스팅은 연속형 데이터를 구간으로 나누어 빠르고 효율적으로 학습하는 알고리즘입니다.

```python
from sklearn.ensemble import HistGradientBoostingClassifier

hgb = HistGradientBoostingClassifier(random_state=42)
scores = cross_validate(hgb, train_input, train_target, return_train_score=True, n_jobs=-1)

print(np.mean(scores['train_score']), np.mean(scores['test_score']))
```

#### 5.1 Permutation Importance
```python
from sklearn.inspection import permutation_importance

hgb.fit(train_input, train_target)
result = permutation_importance(hgb, train_input, train_target, n_repeats=10, random_state=42, n_jobs=-1)
print(result.importances_mean)

result = permutation_importance(hgb, test_input, test_target, n_repeats=10, random_state=42, n_jobs=-1)
print(result.importances_mean)
```
- `permutation_importance`를 사용해 각 특성의 중요도를 분석했습니다.

#### 5.2 최종 평가
```python
hgb.score(test_input, test_target)
```
- 테스트 세트를 이용해 최종 성능을 평가했습니다.


### 6. 기타 부스팅 모델
#### 6.1 XGBoost
```python
from xgboost import XGBClassifier

xgb = XGBClassifier(tree_method='hist', random_state=42)
scores = cross_validate(xgb, train_input, train_target, return_train_score=True, n_jobs=-1)

print(np.mean(scores['train_score']), np.mean(scores['test_score']))
```

#### 6.2 LightGBM
```python
from lightgbm import LGBMClassifier

lgb = LGBMClassifier(random_state=42)
scores = cross_validate(lgb, train_input, train_target, return_train_score=True, n_jobs=-1)

print(np.mean(scores['train_score']), np.mean(scores['test_score']))
```


### 요약
이번 학습에서는 트리 앙상블의 다양한 알고리즘(Random Forest, Extra Trees, Gradient Boosting, HistGradientBoosting, XGBoost, LightGBM)을 실습하며 각 모델의 특성과 성능을 비교해 보았습니다. 특성 중요도 분석과 OOB 점수, 교차 검증 등을 활용해 모델을 평가하고, 하이퍼파라미터를 조정해 성능을 향상시킬 수 있음을 배웠습니다.

