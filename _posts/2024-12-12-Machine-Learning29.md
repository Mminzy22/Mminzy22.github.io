---
title: "교차 검증과 그리드 서치"
author: mminzy22
date: 2024-12-12 10:30:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "교차 검증과 그리드 서치를 통해 머신러닝 모델의 성능을 평가하고 최적의 하이퍼파라미터를 찾는 방법을 다룹니다."
pin: false
---



교차 검증과 그리드 서치는 머신러닝 모델의 과대적합이나 과소적합을 방지하고, 최적의 하이퍼파라미터를 찾기 위한 중요한 도구입니다. 이번 글에서는 이를 활용한 방법을 자세히 다뤄보겠습니다.

#### 1. 교차 검증의 필요성

테스트 세트를 사용하지 않고 모델의 성능을 평가하려면 훈련 세트를 다시 나눠 검증 세트를 생성해야 합니다. 훈련 세트의 일부를 떼어내어 검증 세트로 사용함으로써 다음과 같은 과정을 거칩니다:

1. 훈련 세트로 모델을 학습합니다.
2. 검증 세트로 모델을 평가하며, 매개변수를 조정합니다.
3. 최적의 매개변수로 훈련 세트와 검증 세트를 합쳐 모델을 재훈련한 후, 테스트 세트로 최종 평가합니다.

#### 2. 데이터 준비 및 검증 세트 생성

먼저 데이터를 불러옵니다.
```python
import pandas as pd

wine = pd.read_csv('https://bit.ly/wine_csv_data')
```

특성과 타깃을 분리합니다.
```python
data = wine[['alcohol', 'sugar', 'pH']].to_numpy()
target = wine['class'].to_numpy()
```

훈련 세트와 테스트 세트를 나눕니다.
```python
from sklearn.model_selection import train_test_split

train_input, test_input, train_target, test_target = train_test_split(
    data, target, test_size=0.2, random_state=42)
```

훈련 세트를 다시 나눠 검증 세트를 만듭니다.
```python
sub_input, val_input, sub_target, val_target = train_test_split(
    train_input, train_target, test_size=0.2, random_state=42)
```

#### 3. 모델 훈련 및 평가

결정 트리 모델을 훈련하고 평가합니다.
```python
from sklearn.tree import DecisionTreeClassifier

dt = DecisionTreeClassifier(random_state=42)
dt.fit(sub_input, sub_target)

print(dt.score(sub_input, sub_target))
print(dt.score(val_input, val_target))
```
출력:
```plaintext
0.9971
0.8644
```

훈련 세트에서 과대적합된 모델임을 확인할 수 있습니다. 이를 개선하기 위해 매개변수를 조정해야 합니다.

#### 4. 교차 검증 수행

교차 검증은 검증 세트를 나누는 과정을 여러 번 반복하여 평균 점수를 구합니다. 이를 통해 더 신뢰할 수 있는 성능 평가가 가능합니다.

```python
from sklearn.model_selection import cross_validate

scores = cross_validate(dt, train_input, train_target)
print(scores)
```
출력:
```plaintext
{'fit_time': [...], 'score_time': [...], 'test_score': [0.8692, 0.8462, 0.8768, 0.8489, 0.8354]}
```

검증 점수의 평균을 계산합니다.
```python
import numpy as np

print(np.mean(scores['test_score']))
```
출력:
```plaintext
0.8553
```

#### 5. 그리드 서치로 하이퍼파라미터 튜닝

그리드 서치는 하이퍼파라미터의 조합을 탐색하며, 교차 검증을 통해 최적의 조합을 찾습니다.

탐색할 매개변수를 설정합니다.
```python
from sklearn.model_selection import GridSearchCV

params = {'min_impurity_decrease': [0.0001, 0.0002, 0.0003, 0.0004, 0.0005]}
gs = GridSearchCV(DecisionTreeClassifier(random_state=42), params, n_jobs=-1)
```

그리드 서치를 실행합니다.
```python
gs.fit(train_input, train_target)
```

최적의 매개변수와 교차 검증 점수를 확인합니다.
```python
print(gs.best_params_)
print(np.max(gs.cv_results_['mean_test_score']))
```
출력:
```plaintext
{'min_impurity_decrease': 0.0001}
0.8682
```

#### 6. 랜덤 서치로 효율적 탐색

랜덤 서치는 그리드 서치보다 넓은 범위를 효율적으로 탐색할 수 있습니다. 랜덤 서치를 위해 확률 분포를 정의합니다.
```python
from scipy.stats import uniform, randint

params = {
    'min_impurity_decrease': uniform(0.0001, 0.001),
    'max_depth': randint(20, 50),
    'min_samples_split': randint(2, 25),
    'min_samples_leaf': randint(1, 25)
}
```

랜덤 서치를 실행합니다.
```python
from sklearn.model_selection import RandomizedSearchCV

gs = RandomizedSearchCV(DecisionTreeClassifier(random_state=42), params,
                        n_iter=100, n_jobs=-1, random_state=42)
gs.fit(train_input, train_target)
```

최적의 매개변수와 점수를 확인합니다.
```python
print(gs.best_params_)
print(np.max(gs.cv_results_['mean_test_score']))
```
출력:
```plaintext
{'max_depth': 39, 'min_impurity_decrease': 0.00034, 'min_samples_leaf': 7, 'min_samples_split': 13}
0.8695
```

#### 7. 최종 모델 평가

최적의 매개변수로 테스트 세트를 평가합니다.
```python
dt = gs.best_estimator_
print(dt.score(test_input, test_target))
```
출력:
```plaintext
0.86
```

#### 결론

교차 검증과 그리드 서치를 통해 모델의 성능을 체계적으로 평가하고 최적의 매개변수를 찾을 수 있었습니다. 랜덤 서치는 그리드 서치보다 효율적으로 넓은 범위를 탐색할 수 있어 유용한 도구입니다. 이 방법들을 활용하면 더 나은 머신러닝 모델을 구축할 수 있습니다.

