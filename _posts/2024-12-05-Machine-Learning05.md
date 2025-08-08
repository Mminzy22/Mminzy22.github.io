---
title: "ML: 데이터 전처리"
author: mminzy22
date: 2024-12-05 10:04:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "머신러닝 모델의 성능을 최적화하기 위해 필수적인 데이터 전처리 기법에 대해 다룹니다. 결측값 처리, 이상치 탐지와 처리, 데이터 정규화와 표준화, 데이터 분할 방법을 자세히 설명합니다."
pin: false
---



데이터 전처리는 머신러닝에서 필수적인 단계로, 데이터의 품질을 개선하고 모델의 성능을 최적화하는 데 중요한 역할을 합니다. 이번 글에서는 데이터 전처리의 핵심 기법인 **결측값 처리**, **이상치 탐지와 처리**, **데이터 정규화와 표준화**, **데이터 분할**에 대해 알아보겠습니다.


#### 결측값 처리 (Missing Data Handling)

**결측값이란?**  
결측값은 데이터셋에서 누락된 값을 의미하며, 이를 적절히 처리하지 않으면 모델의 학습과 예측 성능에 부정적인 영향을 미칠 수 있습니다.

**1. 결측값 제거**
- **행 제거:** 결측값이 포함된 행 삭제
- **열 제거:** 결측값이 많은 열 삭제

```python
# 결측값이 포함된 행 제거
df_dropped_rows = df.dropna()

# 결측값이 포함된 열 제거
df_dropped_cols = df.dropna(axis=1)
```

**2. 결측값 대체**
- **고정값 대체:** 결측값을 0, 평균, 중앙값 등으로 대체
- **최빈값 대체:** 범주형 데이터의 경우 최빈값으로 대체

```python
# 결측값을 평균으로 대체
df_filled_mean = df.fillna(df.mean())

# 결측값을 최빈값으로 대체
df_filled_mode = df.fillna(df.mode().iloc[0])
```

**3. 결측값 예측**
- 머신러닝 모델을 사용해 결측값을 예측하고 대체

```python
from sklearn.linear_model import LinearRegression

# 결측값이 있는 열과 없는 열 분리
df_with_na = df[df['column_with_na'].isnull()]
df_without_na = df[df['column_with_na'].notnull()]

# 모델 학습
model = LinearRegression()
model.fit(df_without_na[['feature1', 'feature2']], df_without_na['column_with_na'])

# 결측값 예측 및 대체
predicted_values = model.predict(df_with_na[['feature1', 'feature2']])
df.loc[df['column_with_na'].isnull(), 'column_with_na'] = predicted_values
```


#### 이상치 탐지와 처리 (Outlier Detection and Handling)

**이상치란?**  
이상치는 데이터셋에서 다른 데이터와 동떨어진 값을 의미하며, 모델의 학습을 왜곡할 수 있습니다.

**1. 이상치 탐지**
- **IQR(Interquartile Range) 방법:** 사분위수를 이용한 이상치 탐지

```python
# IQR 계산
Q1 = df['column_name'].quantile(0.25)
Q3 = df['column_name'].quantile(0.75)
IQR = Q3 - Q1

# 이상치 경계
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# 이상치 확인
outliers = df[(df['column_name'] < lower_bound) | (df['column_name'] > upper_bound)]
```

**2. 이상치 처리**
- **제거:** 이상치를 데이터셋에서 제거
- **대체:** 이상치를 평균값이나 중간값으로 대체
- **변환:** 이상치를 범위 내 값으로 변환

```python
# 이상치를 평균값으로 대체
mean_value = df['column_name'].mean()
df['column_name'] = df['column_name'].apply(lambda x: mean_value if x < lower_bound or x > upper_bound else x)
```


#### 데이터 정규화와 표준화

**정규화(Normalization)**  
데이터를 [0, 1] 범위로 변환하여 스케일을 조정하는 기법.

```python
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler()
normalized_data = scaler.fit_transform(df)
```

**표준화(Standardization)**  
데이터를 평균 0, 분산 1로 변환하여 정규 분포를 따르게 만드는 기법.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
standardized_data = scaler.fit_transform(df)
```


#### 데이터 분할 (Data Splitting)

**데이터 분할이란?**  
데이터를 학습, 검증, 테스트용으로 나누어 모델의 성능을 정확히 평가하는 과정.

**1. 데이터 분할 비율**
- 일반적으로 8:1:1 또는 7:2:1 비율로 나눔
  - **학습 데이터(Training Set):** 모델 학습에 사용
  - **검증 데이터(Validation Set):** 하이퍼파라미터 튜닝 및 과적합 방지
  - **테스트 데이터(Test Set):** 최종 모델 성능 평가

**2. 데이터 분할 방법**
- **랜덤 분할:** 데이터셋을 무작위로 나누기
- **Stratified 분할:** 클래스 비율을 유지하면서 나누기 (분류 문제에서 유용)

```python
from sklearn.model_selection import train_test_split

# 데이터 분할
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```


#### 정리

데이터 전처리는 모델 성능을 최적화하고 신뢰성을 높이기 위한 필수 단계입니다.
- **결측값 처리:** 데이터를 보완하거나 대체하여 품질 향상
- **이상치 처리:** 데이터의 왜곡을 방지
- **정규화와 표준화:** 데이터 스케일을 조정하여 효율적인 학습 가능
- **데이터 분할:** 학습, 검증, 테스트 단계에서 모델 성능 평가

> **다음 글 예고:**  
> 데이터 전처리 이후, **"데이터 시각화"**를 통해 데이터를 이해하는 방법에 대해 알아보겠습니다!
