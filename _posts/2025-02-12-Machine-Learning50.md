---
title: "지도학습: 주택 가격 예측 모델 구축 (과제 해설)"
author: mminzy22
date: 2025-02-12 19:00:00 +0900
categories: [Machine Learning, 과제]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "Python과 Scikit-learn을 활용하여 보스턴 주택 데이터셋의 가격을 예측하는 머신러닝 모델을 구축합니다. 데이터 전처리, 선형 회귀, 의사결정나무, 랜덤 포레스트, 앙상블 기법, 하이퍼파라미터 튜닝을 포함한 상세 가이드를 제공합니다."
pin: false
---


### [과제 1번: 지도학습](https://mminzy22.github.io/posts/Machine-Learning36/)

#### 주제: 주택 가격 예측 모델 구축
- 주어진 [주택 데이터셋]({{ site.baseurl }}/assets/downloads/housingdata.csv)을 사용하여 주택 가격을 예측하는 회귀 모델을 구축한다.

<details>
<summary><strong>컬럼별 설명</strong></summary>
   <ol>
      <li>CRIM: 타운별 1인당 범죄율.</li>
      <li>ZN: 25,000 평방피트 이상의 주거 구역 비율.</li>
      <li>INDUS: 비소매 상업 지역 비율.</li>
      <li>CHAS: 찰스강 인접 여부 (1: 강과 접함, 0: 접하지 않음).</li>
      <li>NOX: 대기 중 일산화질소 농도 (0.1 단위).</li>
      <li>RM: 주택 1가구당 평균 방 개수.</li>
      <li>AGE: 1940년 이전에 건설된 주택 비율.</li>
      <li>DIS: 5개의 보스턴 고용 중심지까지의 가중 거리.</li>
      <li>RAD: 고속도로 접근성 지수.</li>
      <li>TAX: 10,000달러당 재산세율.</li>
      <li>PTRATIO: 타운별 학생-교사 비율.</li>
      <li>B: 흑인 비율 (1000(Bk - 0.63)^2, 여기서 Bk는 흑인 인구 비율).</li>
      <li>LSTAT: 하위 계층 인구 비율.</li>
      <li>MEDV: 주택의 중앙값 (단위: $1000).</li>
   </ol>
</details>

<details>
<summary><strong>과제 가이드</strong></summary>
   <ul>
      <li>데이터셋 탐색 및 전처리:
         <ul>
            <li>결측치 처리</li>
            <li>이상치 탐지 및 제거</li>
            <li>특징 선택</li>
         </ul>
      </li>
      <li>여러 회귀 모델 비교:
         <ul>
            <li>선형 회귀</li>
            <li>의사결정나무</li>
            <li>랜덤 포레스트 등</li>
         </ul>
      </li>
      <li>모델 성능 평가:
         <ul>
            <li>지표를 사용하여 모델 성능을 비교합니다.
               <ul>
                  <li>Mean Absolute Error (MAE): 예측값과 실제값의 절대 오차의 평균.</li>
                  <li>Mean Squared Error (MSE): 예측값과 실제값의 제곱 오차의 평균.</li>
                  <li>R² Score: 모델이 데이터의 변동성을 얼마나 설명하는지 나타내는 지표.</li>
               </ul>
            </li>
         </ul>
      </li>
      <li>결과 분석:
         <ul>
            <li>각 모델의 성능을 비교하고 최적의 모델을 선택하여 결과를 시각화합니다.
               <ul>
                  <li>시각화: 성능 지표를 막대 그래프로 시각화하여 쉽게 비교할 수 있도록 합니다. matplotlib 또는 seaborn을 사용하여 막대 그래프를 그립니다.</li>
               </ul>
            </li>
         </ul>
      </li>
   </ul>
</details>

<details>
<summary><strong>도전 과제 가이드</strong></summary>
   <ul>
      <li>모델 앙상블 ⭐⭐⭐⭐⭐
         <ul>
            <li>여러 모델의 예측 결과를 결합하여 성능을 향상시키는 앙상블 기법(예: 배깅, 부스팅)을 적용합니다.</li>
            <li>각 모델의 예측을 평균내거나 가중치를 부여하여 최종 예측을 생성합니다.</li>
         </ul>
      </li>
      <li>하이퍼파라미터 튜닝 ⭐⭐⭐⭐
         <ul>
            <li>Grid Search 또는 Random Search 기법을 이용해 모델의 하이퍼파라미터를 최적화합니다.</li>
         </ul>
      </li>
      <li>시간적 요소 추가 ⭐⭐⭐
         <ul>
            <li>주택 데이터셋에 시간적 요소(예: 계절적 변화, 경제 지표 등)를 추가하여 모델의 예측력을 높입니다.</li>
         </ul>
      </li>
   </ul>
</details>


## 데이터 가져오기

### Google Colab에서 데이터 업로드
Google Colab 환경에서 파일을 직접 업로드하려면 `files` 모듈을 활용할 수 있습니다. 다음 코드를 실행하면 업로드 창이 나타나며, 파일을 선택하여 업로드할 수 있습니다.

```python
from google.colab import files
uploaded = files.upload()
```

업로드한 파일을 `pandas`를 사용하여 불러올 수 있습니다.

### 데이터 로드 및 확인

`pandas` 라이브러리를 활용하여 데이터를 로드하고, 데이터의 기본적인 정보를 확인합니다.

```python
import pandas as pd

# 데이터 로드
file_path = '/content/housingdata.csv'
data = pd.read_csv(file_path)

# 데이터 정보 확인
data.info()
data.head()
```

## 탐색적 데이터 분석(EDA)

### 기초 통계 분석

기초 통계를 확인하여 데이터의 분포와 특성을 파악합니다.

```python
import matplotlib.pyplot as plt

print(data.describe())
```

### 데이터 분포 시각화

각 변수의 분포를 확인하기 위해 히스토그램을 그립니다.

```python
data.hist(bins=20, figsize=(20,15))
plt.suptitle('Feature Distributions', fontsize=15)
plt.tight_layout()
plt.show()
```

### 상관관계 분석

각 특성 간의 상관관계를 분석하여 중요한 변수를 찾습니다.

```python
import seaborn as sns

corr_matrix = data.corr()
plt.figure(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation Heatmap')
plt.show()

# 목표 변수(MEDV)와 가장 높은 상관관계를 가진 변수 찾기
high_corr_features = corr_matrix['MEDV'].sort_values(ascending=False).head(6)
print(high_corr_features)
```

### 주요 변수와 목표 변수 간의 관계 시각화

상관관계가 높은 주요 변수를 선택하여 산점도 그래프를 생성합니다.

```python
important_features = high_corr_features.index[1:]
plt.figure(figsize=(15, 10))
for i, col in enumerate(important_features, 1):
    plt.subplot(2, 3, i)
    plt.scatter(data[col], data['MEDV'])
    plt.title(f'{col} vs. MEDV')
    plt.xlabel(col)
    plt.ylabel('MEDV')
plt.tight_layout()
plt.show()
```

### 이상치 탐색

박스플롯을 이용해 이상치를 확인합니다.

```python
plt.figure(figsize=(15, 10))
for i, col in enumerate(data.columns[:-1], 1):
    plt.subplot(3, 5, i)
    sns.boxplot(data[col])
    plt.title(f'Boxplot of {col}')
plt.tight_layout()
plt.show()
```

### 범주형 데이터 분포 확인

특정 범주형 변수(`CHAS`)의 분포를 확인합니다.

```python
chas_counts = data['CHAS'].value_counts()
plt.figure(figsize=(8, 5))
sns.barplot(x=chas_counts.index, y=chas_counts.values)
plt.xlabel('CHAS')
plt.ylabel('Count')
plt.title('Distribution of CHAS')
plt.show()
```

## 데이터 전처리

### 결측값 처리

결측값을 확인하고, 수치형 변수는 중앙값으로 대체합니다.

```python
for col in data.columns:
    if data[col].isnull().sum() > 0:
        if data[col].dtype in ['float64', 'int64']:
            data[col].fillna(data[col].median(), inplace=True)

print(data.isnull().sum())
```

### 이상치 처리

사분위수를 이용해 이상치를 제거합니다.

```python
def remove_outliers_iqr(df, column):
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]

for col in data.columns[:-1]:
    if data[col].dtype in ['float64', 'int64']:
        data = remove_outliers_iqr(data, col)

print(data.shape)
```

### 데이터 스케일링

모델 학습을 위해 데이터 스케일링을 적용합니다.

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X = data.drop('MEDV', axis=1)
y = data['MEDV']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

## 머신러닝 모델 학습 및 평가

### 모델 생성 및 학습

#### 선형 회귀와 의사결정나무 모델을 학습시킵니다.

```python
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

models = {
    'Linear Regression': LinearRegression(),
    'Decision Tree': DecisionTreeRegressor(random_state=42)
}

results = {}
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    results[name] = {'MSE': mse, 'MAE': mae, 'R2': r2}

print(results)
```

#### 앙상블 학습

앙상블 기법을 활용하여 여러 모델을 조합하여 성능을 향상시킵니다.

```python
from sklearn.ensemble import BaggingRegressor, GradientBoostingRegressor, RandomForestRegressor

ensemble_models = {
    "Bagging Regressor": BaggingRegressor(estimator=LinearRegression(), random_state=42),
    "Gradient Boosting Regressor": GradientBoostingRegressor(random_state=42),
    "Random Forest Regressor": RandomForestRegressor(random_state=42)
}
```

#### 하이퍼파라미터 튜닝

최적의 모델을 찾기 위해 GridSearchCV를 활용합니다.

```python
from sklearn.model_selection import GridSearchCV

# 랜덤 포레스트 최적화
rf_grid = GridSearchCV(RandomForestRegressor(random_state=42), rf_params, cv=3, scoring="neg_mean_squared_error")
rf_grid.fit(X_train_scaled, y_train)
```

#### 시간 개념 추가하기

건축 연도를 계산하여 새로운 특성을 추가합니다.

```python
base_year = 1978
data['BUILD_YEAR'] = base_year - data['AGE']
data['DECADE_BUILT'] = (data['BUILD_YEAR'] // 10) * 10
data.head()
```
