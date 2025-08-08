---
title: "결정 트리와 로지스틱 회귀를 활용한 와인 분류"
author: mminzy22
date: 2024-12-12 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "로지스틱 회귀를 통해 와인 데이터를 분류한 후, 결정 트리를 활용하여 학습 성능을 비교하고 이를 시각화"
pin: false
---



결정 트리는 데이터를 분류하고 예측하는 데 직관적이고 강력한 도구입니다. 이번 글에서는 로지스틱 회귀를 통해 와인 데이터를 분류한 후, 결정 트리를 활용하여 학습 성능을 비교하고 이를 시각화해 보겠습니다.

#### 1. 로지스틱 회귀로 와인 분류하기

우선 데이터를 준비합니다.
```python
import pandas as pd

wine = pd.read_csv('https://bit.ly/wine_csv_data')
```

데이터를 제대로 읽어 들였는지 `head()` 메서드로 처음 5개의 샘플을 확인합니다.
```python
wine.head()
```
출력:

|  | alcohol | sugar | pH   | class |
|---|---------|-------|------|-------|
| 0 | 9.4     | 1.9   | 3.51 | 0.0   |
| 1 | 9.8     | 2.6   | 3.20 | 0.0   |
| 2 | 9.8     | 2.3   | 3.26 | 0.0   |
| 3 | 9.8     | 1.9   | 3.16 | 0.0   |
| 4 | 9.4     | 1.9   | 3.51 | 0.0   |

여기서 `alcohol`, `sugar`, `pH`는 특성을 나타내고, `class`는 타깃값입니다. `class` 값이 0이면 레드 와인, 1이면 화이트 와인입니다.

#### 2. 데이터 프레임 요약 정보 확인하기
데이터 프레임의 구조와 결측치를 확인하기 위해 `info()` 메서드를 사용합니다.
```python
wine.info()
```
출력:
```plaintext
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 6497 entries, 0 to 6496
Data columns (total 4 columns):
 #   Column   Non-Null Count  Dtype  
---  ------   --------------  -----  
 0   alcohol  6497 non-null   float64
 1   sugar    6497 non-null   float64
 2   pH       6497 non-null   float64
 3   class    6497 non-null   float64
dtypes: float64(4)
memory usage: 203.2 KB
```
총 6,497개의 샘플이 있으며, 결측값은 없습니다. 모든 열이 실수형 데이터(`float64`)입니다.

#### 3. 데이터 통계 정보 확인하기
데이터의 분포를 살펴보기 위해 `describe()` 메서드를 사용합니다.
```python
wine.describe()
```
출력:

|        | alcohol  | sugar    | pH     | class  |
|--------|----------|----------|--------|--------|
| count  | 6497.000 | 6497.000 | 6497.000 | 6497.000 |
| mean   | 10.4918  | 5.4432   | 3.2185 | 0.7539 |
| std    | 1.1927   | 4.7578   | 0.1608 | 0.4308 |
| min    | 8.0000   | 0.6000   | 2.7200 | 0.0000 |
| max    | 14.9000  | 65.8000  | 4.0100 | 1.0000 |

알코올 도수, 당도, pH의 값이 스케일이 다르므로 이를 표준화해야 합니다.

#### 4. 데이터 분리 및 표준화
데이터를 넘파이 배열로 변환한 뒤, 훈련 세트와 테스트 세트로 나눕니다.
```python
from sklearn.model_selection import train_test_split

data = wine[['alcohol', 'sugar', 'pH']].to_numpy()
target = wine['class'].to_numpy()

train_input, test_input, train_target, test_target = train_test_split(
    data, target, test_size=0.2, random_state=42)
```
이후, `StandardScaler`를 사용해 데이터를 표준화합니다.
```python
from sklearn.preprocessing import StandardScaler

ss = StandardScaler()
ss.fit(train_input)

train_scaled = ss.transform(train_input)
test_scaled = ss.transform(test_input)
```

#### 5. 로지스틱 회귀 모델 훈련
표준화된 데이터를 이용해 로지스틱 회귀 모델을 훈련합니다.
```python
from sklearn.linear_model import LogisticRegression

lr = LogisticRegression()
lr.fit(train_scaled, train_target)

print(lr.score(train_scaled, train_target))
print(lr.score(test_scaled, test_target))
```
출력:
```plaintext
0.7808
0.7777
```
훈련 세트와 테스트 세트 점수가 낮아 모델이 다소 과소적합된 상태입니다.

#### 6. 결정 트리 모델 훈련
결정 트리를 사용해 학습하고 성능을 평가합니다.
```python
from sklearn.tree import DecisionTreeClassifier

dt = DecisionTreeClassifier(random_state=42)
dt.fit(train_scaled, train_target)

print(dt.score(train_scaled, train_target))
print(dt.score(test_scaled, test_target))
```
출력:
```plaintext
0.9969
0.8592
```
결정 트리는 훈련 세트에서 높은 성능을 보이지만, 테스트 세트에서 과대적합된 경향이 있습니다.

#### 7. 결정 트리 시각화
결정 트리를 시각화해 이해를 돕습니다.
```python
import matplotlib.pyplot as plt
from sklearn.tree import plot_tree

plt.figure(figsize=(10, 7))
plot_tree(dt, filled=True, feature_names=['alcohol', 'sugar', 'pH'])
plt.show()
```

#### 8. 가지치기
결정 트리의 과대적합 문제를 해결하기 위해 트리의 최대 깊이를 제한합니다.
```python
dt = DecisionTreeClassifier(max_depth=3, random_state=42)
dt.fit(train_scaled, train_target)

print(dt.score(train_scaled, train_target))
print(dt.score(test_scaled, test_target))
```
출력:
```plaintext
0.8455
0.8415
```
트리의 깊이를 제한함으로써 과대적합을 줄이고 더 일반화된 모델을 만들 수 있습니다.

#### 9. 특성 중요도 분석
결정 트리 모델의 `feature_importances_` 속성을 사용해 특성 중요도를 확인합니다.
```python
print(dt.feature_importances_)
```
출력:
```plaintext
[0.123 0.869 0.008]
```
당도가 가장 중요한 특성임을 알 수 있습니다.

### 결론
결정 트리는 데이터를 설명하고 예측하는 데 유용하며, 특성 중요도를 분석할 수 있는 강력한 도구입니다. 하지만 과대적합 문제를 방지하기 위해 가지치기와 같은 기술을 활용해야 합니다. 위의 내용을 통해 결정 트리와 로지스틱 회귀의 차이를 이해하고, 데이터에 따라 적절한 모델을 선택할 수 있는 능력을 기를 수 있기를 바랍니다.

