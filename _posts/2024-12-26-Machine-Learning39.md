---
title: "고객 세분화 분석(데이터 조회 및 전처리)"
author: mminzy22
date: 2024-12-26 10:00:00 +0900
categories: [Machine Learning, 과제]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "고객 데이터를 분석하여 비슷한 행동을 보이는 그룹을 식별하고, 다양한 클러스터링 기법을 비교합니다."
pin: false
---



### 과제 2번: 비지도학습

#### 주제: 고객 세분화 분석
- [고객 데이터셋]({{ site.baseurl }}/assets/downloads/Mall_Customers.csv)을 사용하여 비슷한 행동을 보이는 고객 그룹을 식별합니다.

<details>
<summary><strong>컬럼별 설명</strong></summary>
   <ol>
      <li>CustomerID: 각 고객을 고유하게 식별할 수 있는 ID입니다.</li>
      <li>Gender: 고객의 성별입니다. (예: "Male" 또는 "Female")</li>
      <li>Age: 고객의 나이를 나타냅니다.</li>
      <li>Annual Income (k$): 고객의 연간 수입을 1,000달러 단위로 나타냅니다.</li>
      <li>Spending Score (1-100): 고객의 쇼핑 점수로, 1부터 100 사이의 값입니다. 고객의 소비 습관이나 충성도를 평가하는 데 사용됩니다.</li>
   </ol>
</details>

<details>
<summary><strong>과제 가이드</strong></summary>
   <ul>
      <li>데이터셋 탐색 및 전처리:
         <ul>
            <li>결측치 처리</li>
            <li>스케일링
               <ul>
                  <li>데이터의 스케일을 조정하기 위해 표준화(Standardization) 또는 정규화(Normalization)를 수행합니다</li>
               </ul>
            </li>
         </ul>
      </li>
      <li>클러스터링 기법 적용:
         <ul>
            <li>K-means</li>
            <li>계층적 군집화</li>
            <li>DBSCAN 등의 알고리즘</li>
         </ul>
      </li>
      <li>최적의 클러스터 수 결정:
         <ul>
            <li>엘보우 방법 또는 실루엣 점수를 사용하여 최적의 클러스터 수를 찾습니다.</li>
         </ul>
      </li>
      <li>결과 시각화: 
         <ul>
            <li>클러스터링 결과를 2D 또는 3D로 시각화하여 고객 세분화 결과를 분석합니다.
               <ul>
                  <li>시각화: matplotlib 또는 seaborn을 사용하여 클러스터를 색상으로 구분하여 시각화합니다. 2D 플롯을 사용하여 각 클러스터를 다른 색으로 표현합니다.</li>
               </ul>
            </li>
         </ul>
      </li>
   </ul>
</details>

<details>
<summary><strong>도전 과제 가이드</strong></summary>
   <ul>
      <li>다양한 클러스터링 기법 비교 ⭐⭐⭐⭐
         <ul>
            <li>DBSCAN 외에 Gaussian Mixture Model(GMM)와 같은 다른 클러스터링 기법을 적용하고 성능을 비교합니다.</li>
         </ul>
      </li>
      <li>고객 행동 예측 모델 구축 ⭐⭐⭐⭐⭐
         <ul>
            <li>클러스터링 결과를 바탕으로 특정 클러스터에 속하는 고객의 행동을 예측하는 분류 모델을 구축합니다. 예를 들어, 구매 가능성을 예측하는 모델을 만들 수 있습니다.</li>
         </ul>
      </li>
      <li>시계열 분석⭐⭐⭐⭐
         <ul>
            <li>고객의 행동 변화를 시간에 따라 분석하여 특정 그룹의 트렌드를 시계열 데이터로 시각화합니다.</li>
         </ul>
      </li>
   </ul>
</details>

### 1. 데이터 불러오기

```python
import pandas as pd
import numpy as np

df= pd.read_csv('Mall_Customers.csv')

df
```

출력 결과

|  | **CustomerID** | **Gender** | **Age** | **Annual Income (k$)** | **Spending Score (1-100)** |
| --- | --- | --- | --- | --- | --- |
| **0** | 1 | Male | 19 | 15 | 39 |
| **1** | 2 | Male | 21 | 15 | 81 |
| **2** | 3 | Female | 20 | 16 | 6 |
| **3** | 4 | Female | 23 | 16 | 77 |
| **4** | 5 | Female | 31 | 17 | 40 |
| **...** | ... | ... | ... | ... | ... |
| **195** | 196 | Female | 35 | 120 | 79 |
| **196** | 197 | Female | 45 | 126 | 28 |
| **197** | 198 | Male | 32 | 126 | 74 |
| **198** | 199 | Male | 32 | 137 | 18 |
| **199** | 200 | Male | 30 | 137 | 83 |

200 rows × 5 columns

### 2. 데이터 정보 확인

```python
# 데이터 정보 확인
df.info() # 총 200행, 결측치 없음
print('=============================='*3)
print(df.describe())
# 총 506개 행
print('=============================='*3)
print(df.columns)
```

출력 결과

```python
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 200 entries, 0 to 199
Data columns (total 5 columns):
 #   Column                  Non-Null Count  Dtype 
---  ------                  --------------  ----- 
 0   CustomerID              200 non-null    int64 
 1   Gender                  200 non-null    object
 2   Age                     200 non-null    int64 
 3   Annual Income (k$)      200 non-null    int64 
 4   Spending Score (1-100)  200 non-null    int64 
dtypes: int64(4), object(1)
memory usage: 7.9+ KB
==========================================================================================
       CustomerID         Age  Annual Income (k$)  Spending Score (1-100)
count  200.000000  200.000000          200.000000              200.000000
mean   100.500000   38.850000           60.560000               50.200000
std     57.879185   13.969007           26.264721               25.823522
min      1.000000   18.000000           15.000000                1.000000
25%     50.750000   28.750000           41.500000               34.750000
50%    100.500000   36.000000           61.500000               50.000000
75%    150.250000   49.000000           78.000000               73.000000
max    200.000000   70.000000          137.000000               99.000000
==========================================================================================
Index(['CustomerID', 'Gender', 'Age', 'Annual Income (k$)',
       'Spending Score (1-100)'],
      dtype='object')
```

### 3. 데이터 전처리

#### 1. **컬럼 제거 및 기본 데이터 시각화**

```python
import seaborn as sns

# 분석에 사용하지 않는 컬럼 제거
data = df.drop(columns=['CustomerID'])

# 이상치 확인
sns.boxplot(data=data[['Age', 'Annual Income (k$)', 'Spending Score (1-100)']])
```

- **`sns.boxplot`**: 
  - Seaborn 라이브러리를 사용하여 박스 플롯(boxplot)을 그립니다.
  - 박스 플롯은 데이터 분포를 시각화하고 이상치(outlier)를 감지하는 데 유용합니다.
  - `data`에서 `Age`, `Annual Income (k$)`, `Spending Score (1-100)` 열의 데이터를 선택해 한 번에 박스 플롯을 시각화합니다.

- **`data = df.drop(columns=['CustomerID'])`**:
  - `CustomerID` 열은 고객 식별 목적으로만 사용되며, 데이터 분석에 유의미하지 않으므로 제거합니다.


#### 2. **원-핫 인코딩과 상세 박스 플롯**

```python
# Gender 원-핫 인코딩
data = pd.get_dummies(data, columns=['Gender'], drop_first=True)

# Age, Annual Income, Spending Score의 박스 플롯
plt.figure(figsize=(8, 4))
for i, col in enumerate(['Age', 'Annual Income (k$)', 'Spending Score (1-100)']):
    plt.subplot(1, 3, i + 1)
    sns.boxplot(data=data[col])
    plt.title(f'{col} Box Plot')
plt.tight_layout()
plt.show()
```

1. **`pd.get_dummies(data, columns=['Gender'], drop_first=True)`**:
   - **목적**: 범주형 변수인 `Gender`를 머신러닝 알고리즘이 처리할 수 있도록 숫자형 데이터로 변환합니다.
   - **설명**:
     - `Male`과 `Female`로 구성된 `Gender` 열을 0과 1로 인코딩합니다.
     - `drop_first=True`를 사용하여 첫 번째 범주(`Male`)를 기준으로 나머지 범주(`Female`)를 추가합니다.
     - 결과적으로 새로운 열 `Gender_Female`이 추가됩니다. 값은 `1`(여성) 또는 `0`(남성)을 나타냅니다.

2. **박스 플롯 시각화**:
   - 세 개의 주요 열(`Age`, `Annual Income`, `Spending Score`)에 대해 개별적으로 박스 플롯을 생성합니다.
   - `plt.subplot(1, 3, i + 1)`: 한 행에 세 개의 박스 플롯을 배치합니다.
   - **출력 결과**:
     - 각 변수에 대한 데이터 분포와 이상치를 직관적으로 확인할 수 있습니다.


#### 3. **이상치 탐지 및 제거**

```python
# 2. 이상치 탐지 (Age, Annual Income, Spending Score에만 적용)
iso = IsolationForest(contamination=0.03, random_state=42)
outliers = iso.fit_predict(data[['Age', 'Annual Income (k$)', 'Spending Score (1-100)']])
print(data[outliers != 1])
# 정상 데이터만 유지
data = data[outliers == 1]
```

1. **`IsolationForest`**:
   - **목적**: 이상치를 자동으로 감지하고 제거합니다.
   - **설명**:
     - `IsolationForest`는 앙상블 기반의 이상치 탐지 알고리즘입니다.
     - `contamination=0.03`: 데이터 중 약 3%를 이상치로 간주합니다.
     - `random_state=42`: 재현성을 보장하기 위해 난수 시드를 고정합니다.

2. **`outliers = iso.fit_predict()`**:
   - 입력 데이터(`Age`, `Annual Income`, `Spending Score`)를 기반으로 이상치를 감지합니다.
   - 반환값:
     - `1`: 정상 데이터.
     - `-1`: 이상치.

3. **`data[outliers != 1]`**:
   - 이상치로 판단된 데이터를 출력합니다.

4. **`data = data[outliers == 1]`**:
   - 이상치를 제거하고, 정상 데이터만 유지합니다.


#### 4. **데이터 표준화**

```python
# 3. 데이터 표준화
scaler = StandardScaler()
scaled_data = scaler.fit_transform(data[['Age', 'Annual Income (k$)', 'Spending Score (1-100)']])

# 기존 열 삭제 및 새로운 데이터 추가
data = data.drop(columns=['Age', 'Annual Income (k$)', 'Spending Score (1-100)'])
data[['Age', 'Annual Income (k$)', 'Spending Score (1-100)']] = scaled_data
```

1. **`StandardScaler`**:
   - **목적**: 데이터의 스케일을 표준화(평균=0, 표준편차=1)하여 변수 간의 스케일 차이를 제거합니다.
   - **설명**:
     - 수치형 변수(`Age`, `Annual Income`, `Spending Score`)를 표준화하여 머신러닝 알고리즘의 성능을 향상시킵니다.

2. **`scaler.fit_transform()`**:
   - 입력 데이터를 학습(fit)하고, 표준화된 값을 반환(transform)합니다.

3. **`data.drop()` 및 재할당**:
   - 기존 변수(`Age`, `Annual Income`, `Spending Score`)를 삭제하고, 표준화된 값을 새로 추가합니다.


#### 5. **표준화된 데이터 확인**

```python
# Age, Annual Income, Spending Score의 박스 플롯
plt.figure(figsize=(8, 4))
for i, col in enumerate(['Age', 'Annual Income (k$)', 'Spending Score (1-100)']):
    plt.subplot(1, 3, i + 1)
    sns.boxplot(data=data[col])
    plt.title(f'{col} Box Plot')
plt.tight_layout()
plt.show()
```

- 표준화된 데이터를 다시 시각화하여 이상치가 제대로 제거되었는지 확인합니다.
- 박스 플롯은 데이터가 평균=0, 표준편차=1로 표준화되었음을 보여줍니다. 


**전체 과정 요약**
1. **불필요한 열 제거**: `CustomerID` 제거.
2. **원-핫 인코딩**: `Gender`를 숫자형 데이터로 변환.
3. **이상치 탐지 및 제거**: `IsolationForest`로 이상치를 감지하고 데이터에서 제외.
4. **데이터 표준화**: `StandardScaler`로 변수 간 스케일 차이를 조정.
5. **시각화**: 박스 플롯으로 데이터 분포 및 이상치 제거 결과 확인.