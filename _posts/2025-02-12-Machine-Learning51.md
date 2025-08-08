---
title: "비지도 학습: 고객 세분화 분석 모델 (과제 해설)"
author: mminzy22
date: 2025-02-12 20:00:00 +0900
categories: [Machine Learning, 과제]
tags: [Bootcamp, Python, Machine Learning, Unsupervised Learning, TIL]
description: "비지도 학습을 활용한 고객 세분화 분석 방법을 소개합니다. K-Means, 계층적 군집화, DBSCAN, GMM 등 다양한 클러스터링 기법을 비교하고, 데이터 전처리부터 시각화, 고객 행동 예측 모델 구축까지 자세히 설명합니다."
pin: false
---



### [과제 2번: 비지도학습](https://mminzy22.github.io/posts/Machine-Learning39/)

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

## 1. 개요
비지도 학습(Unsupervised Learning)은 데이터에 대한 명확한 레이블 없이 패턴을 찾는 머신러닝 기법이다. 대표적인 비지도 학습 알고리즘으로는 클러스터링(Clustering)과 차원 축소(Dimensionality Reduction)가 있으며, 이번 글에서는 고객 데이터를 활용하여 다양한 클러스터링 기법을 비교 분석한다.

## 2. 데이터 로드 및 탐색

우리는 **Mall Customers 데이터셋**을 활용하여 고객의 연간 소득과 소비 점수를 분석할 것이다.

```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler

# 데이터 로드
file_path = '/content/Mall_Customers.csv'
data = pd.read_csv(file_path)

# 데이터 정보 및 확인
data.info()
data.head()

# 기본 통계 요약
print(data.describe())

# 결측치 확인
print("\n결측치 확인:")
print(data.isnull().sum())
```

## 3. 데이터 시각화

### 3.1 연간 소득과 소비 점수의 관계
```python
plt.figure(figsize=(8, 6))
sns.scatterplot(x='Annual Income (k$)', y='Spending Score (1-100)', data=data)
plt.title('Scatter Plot: Annual Income vs Spending Score')
plt.xlabel('Annual Income (k$)')
plt.ylabel('Spending Score (1-100)')
plt.grid()
plt.show()
```

### 3.2 주요 변수 분포 확인
```python
variables = ['Age', 'Annual Income (k$)', 'Spending Score (1-100)']
for var in variables:
    plt.figure(figsize=(6, 4))
    sns.histplot(data[var], kde=True, bins=20)
    plt.title(f'Distribution of {var}')
    plt.xlabel(var)
    plt.ylabel('Frequency')
    plt.grid()
    plt.show()
```

### 3.3 성별 분포 확인
```python
plt.figure(figsize=(6, 4))
sns.countplot(x='Gender', data=data)
plt.title('Gender Distribution')
plt.xlabel('Gender')
plt.ylabel('Count')
plt.grid()
plt.show()
```

## 4. 변수 간 상관관계 분석

`Gender`와 `CustomerID`는 분석에 필요하지 않으므로 제거한 후 상관관계를 확인한다.

```python
# 불필요한 열 제거
data = data.drop(['Gender', 'CustomerID'], axis=1)

# 상관 행렬 시각화
plt.figure(figsize=(8, 6))
correlation_matrix = data.corr()
sns.heatmap(correlation_matrix, annot=True, fmt='.2f', cmap='coolwarm')
plt.title('Correlation Matrix')
plt.show()
```

## 5. 데이터 전처리 및 스케일링

```python
scaler = StandardScaler()
data_scaled = scaler.fit_transform(data[['Annual Income (k$)', 'Spending Score (1-100)']])
```

## 6. 클러스터링 기법 비교

### 6.1 K-Means 클러스터링
```python
from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=5, random_state=42)
data['KMeans_Cluster'] = kmeans.fit_predict(data_scaled)
```

### 6.2 계층적 군집화
```python
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.cluster.hierarchy import fcluster

linkage_matrix = linkage(data_scaled, method='ward')
dendrogram(linkage_matrix)
plt.title('Dendrogram')
plt.xlabel('Data Points')
plt.ylabel('Distance')
plt.show()

# 클러스터 개수 설정 및 분류
n_clusters = 5
data['Hierarchical_Cluster'] = fcluster(linkage_matrix, n_clusters, criterion='maxclust')
```

### 6.3 DBSCAN
```python
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.5, min_samples=5)
data['DBSCAN_Cluster'] = dbscan.fit_predict(data_scaled)
```

### 6.4 Gaussian Mixture Model(GMM)
```python
from sklearn.mixture import GaussianMixture

gmm = GaussianMixture(n_components=5, random_state=42)
data['GMM_Cluster'] = gmm.fit_predict(data_scaled)
```

## 7. 클러스터링 결과 시각화
```python
def plot_clusters(data, cluster_column, title):
    plt.figure(figsize=(8, 6))
    plt.scatter(data['Annual Income (k$)'], data['Spending Score (1-100)'], c=data[cluster_column], cmap='viridis', s=50)
    plt.title(title)
    plt.xlabel('Annual Income (k$)')
    plt.ylabel('Spending Score (1-100)')
    plt.colorbar(label='Cluster')
    plt.show()

# 시각화 실행
plot_clusters(data, 'KMeans_Cluster', 'K-Means Clustering')
plot_clusters(data, 'Hierarchical_Cluster', 'Hierarchical Clustering')
plot_clusters(data, 'DBSCAN_Cluster', 'DBSCAN Clustering')
plot_clusters(data, 'GMM_Cluster', 'Gaussian Mixture Model Clustering')
```

## 8. 고객 행동 예측 모델 구축

고객의 소비 행동을 예측하는 모델을 구축하기 위해, **Spending Score(1-100)가 60 이상**이면 구매 가능성이 높다고 가정하고, 이를 **지도 학습 분류 모델**을 통해 예측한다.

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# 데이터 로드
file_path = '/content/Mall_Customers.csv'
data = pd.read_csv(file_path)

# 필요한 열 선택 및 전처리
data_selected = data[['Age', 'Gender', 'Annual Income (k$)', 'Spending Score (1-100)']]

# 성별 인코딩
data_selected['Gender'] = LabelEncoder().fit_transform(data_selected['Gender'])  # Male: 0, Female: 1

# 구매 가능성 변수 생성
data_selected['Purchase_Ability'] = np.where(data_selected['Spending Score (1-100)'] >= 60, 1, 0)

# 데이터 분리
X = data_selected[['Age', 'Gender', 'Annual Income (k$)']]
y = data_selected['Purchase_Ability']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 데이터 스케일링
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 랜덤 포레스트 모델 학습
model = RandomForestClassifier(random_state=42)
model.fit(X_train_scaled, y_train)

# 예측 수행
y_pred_rf = model.predict(X_test)
y_prob_rf = model.predict_proba(X_test)[:, 1]

# 모델 평가 함수
def evaluate_model(y_test, y_pred, y_prob):
    return {
        "Accuracy": accuracy_score(y_test, y_pred),
        "Precision": precision_score(y_test, y_pred),
        "Recall": recall_score(y_test, y_pred),
        "F1 Score": f1_score(y_test, y_pred),
        "ROC-AUC": roc_auc_score(y_test, y_prob)
    }

# 평가 결과 출력
rf_results = evaluate_model(y_test, y_pred_rf, y_prob_rf)
print("Random Forest Model Evaluation:", rf_results)
```

### 혼동 행렬 시각화
```python
def plot_confusion_matrix(y_test, y_pred, model_name):
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['No Purchase', 'Purchase'],
                yticklabels=['No Purchase', 'Purchase'])
    plt.title(f'Confusion Matrix for {model_name}')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.show()

plot_confusion_matrix(y_test, y_pred_rf, 'Random Forest')
```

### 피처 중요도 분석
```python
importances = model.feature_importances_
features = X.columns
importance_df = pd.DataFrame({'Feature': features, 'Importance': importances}).sort_values(by='Importance', ascending=False)

# 중요도 출력 및 시각화
print("Feature Importances:\n", importance_df)
plt.figure(figsize=(8, 6))
plt.bar(importance_df['Feature'], importance_df['Importance'], color='skyblue')
plt.title('Feature Importances')
plt.xlabel('Features')
plt.ylabel('Importance')
plt.show()
```

