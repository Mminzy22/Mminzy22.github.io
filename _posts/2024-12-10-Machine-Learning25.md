---
title: "특성 공학과 규제: 머신러닝 모델의 숨은 비법"
author: mminzy22
date: 2024-12-10 11:30:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "특성 공학으로 데이터를 확장하고, 릿지와 라쏘 규제를 활용하여 모델 성능을 최적화하는 과정"
pin: false
---



모델 성능을 높이고 과대적합(Overfitting)을 방지하려면 어떻게 해야 할까요? 머신러닝에서 **특성 공학**과 **규제**는 이를 해결하는 강력한 도구입니다. 이번 글에서는 특성 공학으로 데이터를 확장하고, 릿지와 라쏘 규제를 활용하여 모델 성능을 최적화하는 과정을 차근차근 알아보겠습니다.


### **1. 데이터 준비**

머신러닝은 데이터로부터 출발합니다. 이번 예제에서는 물고기 데이터를 활용해 목표값(무게)을 예측하는 모델을 만들어 보겠습니다.

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# 데이터 준비
df = pd.read_csv('https://bit.ly/perch_csv_data')
perch_full = df.to_numpy()
perch_weight = np.array([5.9, 32.0, 40.0, ... , 1000.0])

# 데이터 분리
train_input, test_input, train_target, test_target = train_test_split(perch_full, perch_weight, random_state=42)
```

> **Tip:** `train_test_split`은 데이터를 랜덤하게 학습용과 테스트용으로 나눠줍니다. `random_state=42`를 설정하면 항상 동일한 결과를 얻을 수 있습니다.


### **2. 특성 공학: Polynomial Features**

특성 공학은 단순한 데이터를 확장해 모델이 더 복잡한 패턴을 학습할 수 있도록 돕습니다. **Polynomial Features(다항식 특성)**은 특성 간의 곱과 제곱을 추가해 비선형 관계를 표현합니다.

```python
from sklearn.preprocessing import PolynomialFeatures

# 다항식 변환기
poly = PolynomialFeatures(include_bias=False)
poly.fit(train_input)

# 데이터 변환
train_poly = poly.transform(train_input)
test_poly = poly.transform(test_input)

print("생성된 특성 이름:", poly.get_feature_names_out())
```

> **결과:** 특성 간 곱과 제곱이 추가되어 데이터가 확장되었습니다. 이를 통해 선형 모델로도 곡선 형태의 관계를 학습할 수 있습니다.


### **3. 다중 회귀 모델 훈련**

이제 데이터를 학습시키기 위해 **다중 회귀 모델**을 사용해 봅시다. 다중 회귀는 여러 특성을 동시에 고려하여 목표값을 예측하는 선형 모델입니다.

```python
from sklearn.linear_model import LinearRegression

# 모델 학습
lr = LinearRegression()
lr.fit(train_poly, train_target)

# 성능 평가
print("훈련 점수:", lr.score(train_poly, train_target))
print("테스트 점수:", lr.score(test_poly, test_target))
```

#### **과대적합 문제**
- 다항식 차수를 높이면 훈련 점수는 완벽해지지만, 테스트 점수가 떨어질 수 있습니다.
- 이를 해결하려면 **규제(Regularization)**가 필요합니다.


### **4. 규제란?**

규제는 모델이 너무 복잡해지는 것을 방지하는 기법입니다. 주로 사용하는 방법은 **릿지(Ridge)**와 **라쏘(Lasso)**입니다.


#### **(1) 릿지 회귀: L2 규제**

릿지 회귀는 가중치의 크기를 줄여 모든 특성을 유지하면서 모델을 단순화합니다.

```python
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

# 데이터 스케일링
scaler = StandardScaler()
train_scaled = scaler.fit_transform(train_poly)
test_scaled = scaler.transform(test_poly)

# 릿지 모델 학습
ridge = Ridge(alpha=1)
ridge.fit(train_scaled, train_target)

# 성능 평가
print("릿지 훈련 점수:", ridge.score(train_scaled, train_target))
print("릿지 테스트 점수:", ridge.score(test_scaled, test_target))
```

#### **특징:**
- 모든 특성을 유지하면서 가중치를 줄여 모델 안정성을 높입니다.
- 특성이 많은 데이터에서 효과적입니다.


#### **(2) 라쏘 회귀: L1 규제**

라쏘 회귀는 불필요한 특성의 가중치를 0으로 만들어 중요한 특성만 남깁니다.

```python
from sklearn.linear_model import Lasso

# 라쏘 모델 학습
lasso = Lasso(alpha=0.1, max_iter=10000)
lasso.fit(train_scaled, train_target)

# 성능 평가
print("라쏘 훈련 점수:", lasso.score(train_scaled, train_target))
print("라쏘 테스트 점수:", lasso.score(test_scaled, test_target))

# 중요하지 않은 특성 확인
print("0이 된 가중치 수:", np.sum(lasso.coef_ == 0))
```

#### **특징:**
- 중요하지 않은 특성을 제거해 모델을 간단히 만듭니다.
- 특성이 적거나 데이터가 충분한 경우에 적합합니다.


### **5. 릿지 vs 라쏘 비교**

릿지와 라쏘를 다양한 규제 강도(\\(\alpha\\))로 비교해 봅시다.

```python
import matplotlib.pyplot as plt

alpha_list = [0.001, 0.01, 0.1, 1, 10, 100]

ridge_train_scores, ridge_test_scores = [], []
lasso_train_scores, lasso_test_scores = [], []

for alpha in alpha_list:
    # 릿지
    ridge = Ridge(alpha=alpha)
    ridge.fit(train_scaled, train_target)
    ridge_train_scores.append(ridge.score(train_scaled, train_target))
    ridge_test_scores.append(ridge.score(test_scaled, test_target))
    
    # 라쏘
    lasso = Lasso(alpha=alpha, max_iter=10000)
    lasso.fit(train_scaled, train_target)
    lasso_train_scores.append(lasso.score(train_scaled, train_target))
    lasso_test_scores.append(lasso.score(test_scaled, test_target))

# 결과 시각화
plt.figure(figsize=(10, 6))
plt.plot(np.log10(alpha_list), ridge_train_scores, label="릿지 훈련 점수", marker='o')
plt.plot(np.log10(alpha_list), ridge_test_scores, label="릿지 테스트 점수", marker='o')
plt.plot(np.log10(alpha_list), lasso_train_scores, label="라쏘 훈련 점수", linestyle='--', marker='x')
plt.plot(np.log10(alpha_list), lasso_test_scores, label="라쏘 테스트 점수", linestyle='--', marker='x')
plt.xlabel("log10(alpha)")
plt.ylabel("R^2 점수")
plt.legend()
plt.grid()
plt.title("릿지 vs 라쏘 성능 비교")
plt.show()
```


### **결론**

- **릿지 모델**은 안정적으로 모든 특성을 활용하며 과대적합을 방지합니다.
- **라쏘 모델**은 중요하지 않은 특성을 제거하여 간단한 모델을 제공합니다.

> **Tip:** 릿지는 특성이 많고 모든 정보를 활용해야 할 때 적합하며, 라쏘는 불필요한 특성이 많은 경우 효과적입니다.

머신러닝 모델을 튜닝할 때, 데이터와 목적에 맞는 규제 기법을 선택해 보세요!