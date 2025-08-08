---
title: "주택 가격 예측 모델 구축(스케일링 및 이상치 처리)"
author: mminzy22
date: 2024-12-24 10:00:00 +0900
categories: [Machine Learning, 과제]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "주택 가격 예측 모델 구축을 위한 데이터 전처리 및 스케일링 방법을 다룹니다."
pin: false
---



### 과제 1번: 지도학습

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


### 1. 이상치 탐지 및 처리 코드

```python
from sklearn.ensemble import IsolationForest, RandomForestRegressor

# 1. 이상치 탐지
clf = IsolationForest(contamination=0.05, random_state=42)
X_train_imputed['anomaly'] = clf.fit_predict(X_train_imputed)

# 2. 이상치와 정상 데이터 분리
outliers = X_train_imputed[X_train_imputed['anomaly'] == -1]  # 이상치 행
non_outliers = X_train_imputed[X_train_imputed['anomaly'] != -1]  # 정상 행

# 3. 이상치 대체 (훈련 데이터에서만 처리)
independent_columns = X_train.columns  # 독립 변수 이름 리스트
for col in independent_columns:
    # 현재 열(col)을 제외한 나머지 열(features)로 모델 학습
    features = [c for c in independent_columns if c != col]
    
    # RandomForestRegressor를 이용하여 대체 값 생성
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(non_outliers[features], non_outliers[col])  # 정상 데이터 기반 학습
    
    # 이상치에 대해 예측값으로 대체
    X_train_imputed.loc[outliers.index, col] = model.predict(outliers[features])

# 4. 'anomaly' 열 제거
X_train_imputed.drop(columns=['anomaly'], inplace=True)
```


#### 코드 설명

1. **이상치 탐지**:
   - `IsolationForest`를 사용하여 이상치를 탐지합니다.
   - `contamination=0.05`로 설정해 데이터의 5%를 이상치로 간주합니다.
   - 결과는 `anomaly` 열에 저장되며, 값이 `-1`인 경우 이상치, `1`인 경우 정상 데이터로 표시됩니다.

2. **이상치와 정상 데이터 분리**:
   - `outliers`: 이상치(`anomaly == -1`) 행만 포함.
   - `non_outliers`: 정상 데이터(`anomaly != -1`) 행만 포함.

3. **이상치 대체**:
   - 각 열을 독립적으로 처리하여 이상치를 대체합니다.
   - 대체 방법:
     - 정상 데이터를 기반으로 `RandomForestRegressor` 모델을 학습.
     - 학습된 모델로 이상치 행의 값을 예측하여 대체.

4. **불필요한 열 제거**:
   - 이상치 탐지에 사용된 `anomaly` 열은 처리 후 삭제하여 데이터 정리.


#### 코드 사용 시 주의사항
1. **훈련 데이터에서만 이상치 탐지 및 처리 수행**:
   - 테스트 데이터는 모델 평가에 사용되므로 이상치 처리를 수행하지 않습니다.

2. **이상치 대체 방식 선택**:
   - 이상치를 제거하지 않고 대체한 이유는 데이터 손실을 줄이기 위해서입니다. 이 방식은 데이터가 부족한 경우 특히 유용합니다.

3. **`contamination` 값 조정**:
   - 데이터의 이상치 비율에 따라 `contamination` 값을 조정해야 합니다. 예를 들어, 실제 이상치가 적으면 `contamination` 값을 줄이는 것이 좋습니다.

4. **모델 변경 가능**:
   - `RandomForestRegressor` 대신 다른 회귀 모델(예: `LinearRegression`, `GradientBoostingRegressor`)을 사용할 수도 있습니다.


#### 활용 예시
**이상치 탐지만 필요한 경우**

```python
clf = IsolationForest(contamination=0.05, random_state=42)
X_train_imputed['anomaly'] = clf.fit_predict(X_train_imputed)
print(X_train_imputed['anomaly'].value_counts())
```

**이상치 제거**

```python
X_train_cleaned = X_train_imputed[X_train_imputed['anomaly'] != -1].drop(columns=['anomaly'])
```

**이상치 대체 후 데이터 확인**

```python
print(X_train_imputed.isnull().sum())  # 결측치 여부 확인
print(X_train_imputed.describe())  # 데이터 분포 확인
```


### 2. 데이터 스케일링(표준화)

```python
from sklearn.preprocessing import StandardScaler
import pandas as pd

# 1. StandardScaler 객체 생성
scaler = StandardScaler()

# 2. 훈련 데이터에서 스케일링 기준 학습 및 변환
X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train_imputed), columns=X_train_imputed.columns)

# 3. 테스트 데이터에 동일한 스케일링 기준 적용
X_test_scaled = pd.DataFrame(scaler.transform(X_test_imputed), columns=X_test_imputed.columns)
```


#### 코드 설명

1. **스케일링 객체 생성**:
   - `scaler = StandardScaler()`:
     - Scikit-learn의 `StandardScaler`를 사용해 평균을 0, 표준 편차를 1로 데이터 스케일링.

2. **훈련 데이터 스케일링**:
   - `scaler.fit_transform(X_train_imputed)`:
     - 훈련 데이터의 평균과 표준 편차를 계산(`fit`)하고, 데이터를 변환(`transform`).
   - `pd.DataFrame(...)`:
     - Pandas 데이터프레임으로 변환하여 원래 열 이름(`X_train_imputed.columns`)을 유지.

3. **테스트 데이터 스케일링**:
   - `scaler.transform(X_test_imputed)`:
     - 훈련 데이터에서 계산된 기준(평균과 표준 편차)을 사용해 테스트 데이터를 변환.
   - 테스트 데이터는 `fit`을 하지 않고, 훈련 데이터에서 학습된 기준으로만 변환해야 데이터 누출(Data Leakage)을 방지.


#### 사용 목적

1. **특성 간 크기 차이 조정**:
   - 특성 값 범위가 매우 다를 경우, 머신러닝 모델이 특정 특성에 과도하게 의존할 수 있습니다. 스케일링을 통해 특성 값을 균일하게 조정합니다.
   - 예: 주택 데이터에서 방의 개수(정수)와 면적(제곱미터)의 값 범위가 다를 수 있습니다.

2. **모델 성능 향상**:
   - 거리 기반 모델이나 경사 하강법을 사용하는 모델에서 학습 성능을 개선합니다.


#### 주요 매개변수

1. **`fit_transform`**:
   - 훈련 데이터를 사용해 평균과 표준 편차를 계산(`fit`)하고, 데이터를 변환(`transform`).

2. **`transform`**:
   - 이미 계산된 기준을 사용해 데이터를 변환.
   - 테스트 데이터에서는 항상 `transform`만 사용해야 함.


#### 사용 시 주의사항

1. **훈련-테스트 데이터 분리**:
   - 훈련 데이터의 기준만으로 테스트 데이터를 변환해야 하며, 테스트 데이터에 대해 `fit_transform`을 수행하면 안 됩니다.

2. **결측치 처리 후 수행**:
   - 결측치가 있는 상태에서는 스케일링을 수행하지 않도록 합니다. 결측치가 있는 경우 오류가 발생하거나 결과가 왜곡될 수 있습니다.

3. **표준화가 필요 없는 모델**:
   - 트리 기반 모델(예: 의사결정 트리, 랜덤 포레스트, 그래디언트 부스팅 등)은 스케일에 민감하지 않으므로 스케일링이 필요하지 않습니다.


#### 활용 사례

1. **선형 모델**:
   - 선형 회귀, 로지스틱 회귀, 서포트 벡터 머신(SVM)과 같은 모델에서 사용.

2. **거리 기반 모델**:
   - K-최근접 이웃(KNN), K-평균(K-Means) 등의 거리 계산 모델에서 필수.

3. **신경망**:
   - 신경망 모델에서는 입력 데이터를 스케일링하지 않으면 학습 속도가 느려지거나 불안정해질 수 있습니다.


#### 추가 코드 활용 예시

**훈련 데이터에서만 스케일링 기준 학습**

```python
X_train_scaled = scaler.fit_transform(X_train_imputed)
```

**테스트 데이터 변환**

```python
X_test_scaled = scaler.transform(X_test_imputed)
```

**스케일링 후 데이터 확인**

```python
print(X_train_scaled.mean(axis=0))  # 평균 확인 (0에 가까워야 함)
print(X_train_scaled.std(axis=0))   # 표준 편차 확인 (1에 가까워야 함)
```
