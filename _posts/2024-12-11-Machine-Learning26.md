---
title: "로지스틱 회귀: 럭키백 확률 계산 및 K-최근접 이웃 분류기"
author: mminzy22
date: 2024-12-11 10:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "로지스틱 회귀와 K-최근접 이웃 분류기를 사용하여 생선 데이터를 분석하고 분류하는 방법을 다룹니다. 데이터 준비, 모델 훈련 및 평가, 확률 예측 등의 과정을 포함합니다."
pin: false
---



로지스틱 회귀는 이름과 달리 분류 모델로, 선형 방정식을 기반으로 클래스 확률을 예측하는 알고리즘입니다. 이 알고리즘은 시그모이드 함수나 소프트맥스 함수를 활용하여 이진 분류 및 다중 분류를 수행할 수 있습니다.


### 데이터 준비

1. **데이터 로드**
   데이터를 로드하기 위해 `pandas` 라이브러리를 사용합니다. 데이터는 다양한 생선의 정보를 포함하고 있으며, 각 생선의 무게, 길이, 높이 등의 특성이 기록되어 있습니다.
   ```python
   import pandas as pd

   fish = pd.read_csv('https://bit.ly/fish_csv_data')
   fish.head()
   ```
   위 코드를 실행하면 생선 데이터의 상위 5개 행이 출력됩니다. 데이터를 통해 입력 데이터와 타깃 데이터를 구성할 수 있습니다.

2. **종류 추출**
   데이터의 `Species` 열에 포함된 고유한 생선 종류를 확인합니다. 이는 모델의 타깃 클래스가 됩니다.
   ```python
   print(pd.unique(fish['Species']))
   ```
   결과적으로 데이터셋에는 총 7개의 생선 종류가 포함되어 있습니다:
   `['Bream', 'Roach', 'Whitefish', 'Parkki', 'Perch', 'Pike', 'Smelt']`

3. **타깃 데이터와 입력 데이터 분리**
   생선의 특성(무게, 길이 등)을 입력 데이터로, 생선의 종류를 타깃 데이터로 설정합니다.
   ```python
   fish_input = fish[['Weight', 'Length', 'Diagonal', 'Height', 'Width']].to_numpy()
   fish_target = fish['Species'].to_numpy()
   ```
   이 과정으로 데이터를 넘파이 배열 형태로 변환해 머신러닝 모델에 적합한 형식으로 준비합니다.

4. **훈련 세트와 테스트 세트 분리**
   데이터를 학습용과 검증용으로 나눠 과적합을 방지합니다.
   ```python
   from sklearn.model_selection import train_test_split

   train_input, test_input, train_target, test_target = train_test_split(
       fish_input, fish_target, random_state=42)
   ```
   `random_state=42`는 재현성을 위해 사용됩니다.

5. **데이터 표준화**
   데이터의 스케일 차이를 줄이기 위해 표준화를 수행합니다. 이는 KNN과 같은 거리 기반 알고리즘에서 특히 중요합니다.
   ```python
   from sklearn.preprocessing import StandardScaler

   ss = StandardScaler()
   ss.fit(train_input)
   train_scaled = ss.transform(train_input)
   test_scaled = ss.transform(test_input)
   ```
   표준화를 통해 데이터의 평균을 0, 표준 편차를 1로 맞춥니다.

### K-최근접 이웃 분류기

6. **모델 훈련 및 평가**
   K-최근접 이웃(KNN) 분류기를 사용하여 모델을 훈련하고 정확도를 평가합니다. 여기서 `n_neighbors=3`은 3개의 최근접 이웃을 참조하여 분류를 수행하도록 설정합니다.
   ```python
   from sklearn.neighbors import KNeighborsClassifier

   kn = KNeighborsClassifier(n_neighbors=3)
   kn.fit(train_scaled, train_target)

   print(kn.score(train_scaled, train_target))
   print(kn.score(test_scaled, test_target))
   ```
   훈련 세트와 테스트 세트의 정확도를 출력하여 모델 성능을 평가합니다. 결과는 다음과 같습니다:
   - 훈련 세트 정확도: `0.8908`
   - 테스트 세트 정확도: `0.85`

7. **클래스 확률 예측**
   KNN 모델은 클래스별 확률을 예측할 수 있습니다. 테스트 세트의 상위 5개 샘플에 대한 확률을 확인합니다.
   ```python
   import numpy as np

   proba = kn.predict_proba(test_scaled[:5])
   print(np.round(proba, decimals=4))
   ```
   출력된 확률은 각 클래스에 대한 예측 확률을 나타내며, 가장 높은 확률의 클래스가 최종 예측이 됩니다.

8. **최근접 이웃 확인**
   특정 샘플의 최근접 이웃을 확인하여 예측 확률이 올바른지 검증합니다. 예를 들어, 테스트 데이터의 네 번째 샘플에 대해 확인하면 다음과 같은 결과를 얻습니다.
   ```python
   distances, indexes = kn.kneighbors(test_scaled[3:4])
   print(train_target[indexes])
   ```
   ```python
   [['Roach', 'Perch', 'Perch']]
   ```
   이 샘플의 최근접 이웃은 `Roach` 1개와 `Perch` 2개로 구성되어 있으므로 `Perch`의 확률이 2/3(66.67%)로 가장 높게 계산됩니다.


### 시그모이드 함수
로지스틱 회귀에서 시그모이드 함수는 선형 방정식의 출력을 0과 1 사이의 값으로 변환합니다. 이는 확률로 해석할 수 있으며, 이진 분류 문제에 적합합니다.

```python
import numpy as np
import matplotlib.pyplot as plt

z = np.arange(-5, 5, 0.1)
phi = 1 / (1 + np.exp(-z))

plt.plot(z, phi)
plt.xlabel('z')
plt.ylabel('$\phi(z)$')
plt.show()
```

### 모델 훈련

1. **이진 분류**
   특정 클래스(예: `Bream`과 `Smelt`)만 포함하도록 데이터를 필터링하고, 로지스틱 회귀 모델을 훈련합니다.
   ```python
   from sklearn.linear_model import LogisticRegression

   lr = LogisticRegression()
   lr.fit(train_bream_smelt, target_bream_smelt)
   ```

2. **다중 분류**
   데이터셋 전체를 사용해 다중 분류를 수행합니다. 반복 횟수(`max_iter`)와 규제 강도(`C`)를 설정하여 학습합니다.
   ```python
   lr = LogisticRegression(C=20, max_iter=1000)
   lr.fit(train_scaled, train_target)

   print(lr.score(train_scaled, train_target))
   print(lr.score(test_scaled, test_target))
   ```
   훈련 세트와 테스트 세트 정확도는 각각 `93.28%`와 `92.5%`입니다.

3. **확률 출력**
   소프트맥스 함수를 사용해 각 클래스에 대한 확률을 계산합니다.
   ```python
   from scipy.special import softmax

   decision = lr.decision_function(test_scaled[:5])
   proba = softmax(decision, axis=1)
   print(np.round(proba, decimals=3))
   ```
   각 샘플의 클래스별 확률이 출력됩니다. 가장 높은 확률의 클래스가 모델의 예측 결과가 됩니다.


### 핵심 요약

1. **로지스틱 회귀**
   - 선형 방정식을 기반으로 확률 계산.
   - 이진 분류: 시그모이드 함수 사용.
   - 다중 분류: 소프트맥스 함수 사용.

2. **핵심 패키지와 함수**
   - `LogisticRegression`: 모델 생성 및 훈련.
   - `predict_proba()`: 클래스별 확률 반환.
   - `decision_function()`: 선형 방정식 출력 계산.

3. **시그모이드 및 소프트맥스**
   - 시그모이드 함수는 0~1 사이 값을 생성.
   - 소프트맥스 함수는 다중 분류에서 클래스 확률을 계산.

