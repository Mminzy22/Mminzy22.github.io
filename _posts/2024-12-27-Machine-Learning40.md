---
title: "고객 세분화 분석(클러스터링 기법 비교 및 시각화)"
author: mminzy22
date: 2024-12-27 10:00:00 +0900
categories: [Machine Learning, 과제]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "고객 세분화 분석을 통해 다양한 클러스터링 기법(KMeans, 계층적 군집화, DBSCAN, GMM)을 비교하고 최적의 클러스터 수를 결정합니다. 실루엣 점수와 엘보우 방법을 사용하여 성능을 평가하고, 결과를 시각화합니다."
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

### 1. 다양한 클러스터링 기법 비교 및 최적의 클러스터 수 결정

다양한 클러스터링 알고리즘(KMeans, Hierarchical Clustering, GMM, DBSCAN)에 대해 최적의 클러스터 수 및 매개변수를 찾고, 각 알고리즘의 성능을 비교합니다. 이를 위해 실루엣 점수(Silhouette Score)와 엘보우 방법을 사용합니다.


#### 1. **실루엣 점수 저장용 딕셔너리 초기화**

```python
silhouette_scores = {
  "KMeans": {},
  "Hierarchical Clustering": {},
  "GMM": {},
  "DBSCAN": {}  # (eps, min_samples) 조합을 키로 사용
}
wcss = []  # KMeans의 WCSS 값을 저장
```

- **`silhouette_scores`**: 각 클러스터링 알고리즘의 결과와 관련된 실루엣 점수를 저장하기 위한 딕셔너리입니다.
  - `KMeans`, `Hierarchical Clustering`, `GMM`: 클러스터 수 `k`를 키로 사용.
  - `DBSCAN`: `(eps, min_samples)` 조합을 키로 사용.
- **`wcss`**: KMeans 알고리즘의 엘보우 방법에 사용할 `WCSS(Within-Cluster Sum of Squares)` 값을 저장합니다.


#### 2. **KMeans, Hierarchical Clustering, GMM 실루엣 점수 및 WCSS 계산**

```python
for k in range(2, 11):
  # KMeans
  km = KMeans(n_clusters=k, random_state=42)
  silhouette_scores["KMeans"][k] = silhouette_score(data, km.fit_predict(data))
  wcss.append(km.inertia_)

  # Hierarchical Clustering
  hc = AgglomerativeClustering(n_clusters=k)
  silhouette_scores["Hierarchical Clustering"][k] = silhouette_score(data, hc.fit_predict(data))

  # GMM
  gmm = GaussianMixture(n_components=k, random_state=42)
  silhouette_scores["GMM"][k] = silhouette_score(data, gmm.fit_predict(data))

  print(f"k={k}, KMeans={silhouette_scores['KMeans'][k]}, Hierarchical={silhouette_scores['Hierarchical Clustering'][k]}, GMM={silhouette_scores['GMM'][k]}")
```

1. **`range(2, 11)`**:
   - 클러스터 수(`k`)를 2부터 10까지 변경하며 실험을 진행합니다.
   - 최소 2개의 클러스터가 필요하므로 `k=1`은 제외합니다.

2. **`KMeans`**:
   - `km.fit_predict(data)`: 데이터를 클러스터링하고 클러스터 레이블을 반환합니다.
   - **`silhouette_score`**: 클러스터링 결과의 품질을 평가하며, 값이 클수록 클러스터링이 더 잘 이루어졌음을 의미합니다.
   - `km.inertia_`: 클러스터 내 거리의 합(WCSS)을 계산하여 엘보우 방법에 사용됩니다.

3. **`Hierarchical Clustering`**:
   - `AgglomerativeClustering`: 계층적 클러스터링을 수행하며, `n_clusters`로 클러스터 수를 설정합니다.
   - **실루엣 점수 계산**은 KMeans와 동일합니다.

4. **`GMM (Gaussian Mixture Model)`**:
   - `GaussianMixture(n_components=k)`: GMM으로 `k`개의 혼합 분포를 모델링합니다.
   - **실루엣 점수 계산**은 위와 동일합니다.


#### 3. **DBSCAN 클러스터링 및 실루엣 점수 계산**

```python
eps_values = [0.5, 0.6, 0.7]
min_samples_values = [6, 7, 8]

for eps in eps_values:
  for min_samples in min_samples_values:
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)
    data['Cluster_DBSCAN'] = dbscan.fit_predict(data[['Age', 'Annual Income (k$)', 'Spending Score (1-100)', 'Gender_Male']])
    
    # 노이즈 제거
    labels = data['Cluster_DBSCAN']
    if len(set(labels)) > 1:
      non_noise_data = data[labels != -1]
      non_noise_labels = labels[labels != -1]
      score = silhouette_score(non_noise_data[['Age', 'Annual Income (k$)', 'Spending Score (1-100)', 'Gender_Male']], non_noise_labels)
      dbscan_scores[(eps, min_samples)] = score
      silhouette_scores["DBSCAN"][(eps, min_samples)] = score
      print(f"eps={eps}, min_samples={min_samples}, Silhouette Score={score:.4f}")
    else:
      print(f"eps={eps}, min_samples={min_samples}, insufficient clusters.")
```

- **DBSCAN 파라미터 조합**:
  - `eps_values`: 클러스터링 반경.
  - `min_samples_values`: 클러스터를 형성하기 위한 최소 데이터 포인트 개수.
  
- **노이즈 처리**:
  - DBSCAN은 클러스터에 속하지 않는 노이즈 데이터를 `-1`로 레이블링합니다.
  - `labels != -1`: 노이즈 데이터를 제외한 데이터로 실루엣 점수를 계산합니다.


#### 4. **최적 클러스터 수 및 매개변수 선택**

```python
best_k = {}
for method in ["KMeans", "Hierarchical Clustering", "GMM"]:
  scores = silhouette_scores[method]
  best_k[method] = max(scores, key=scores.get)

if silhouette_scores["DBSCAN"]:
  best_dbscan_params = max(silhouette_scores["DBSCAN"], key=silhouette_scores["DBSCAN"].get)
  best_k["DBSCAN"] = best_dbscan_params
```

- **`best_k`**: 각 알고리즘에서 가장 높은 실루엣 점수를 가지는 클러스터 수 또는 DBSCAN 파라미터 조합을 저장합니다.


#### 5. **시각화**

**5.1 엘보우 방법 시각화 (KMeans)**

```python
plt.figure(figsize=(8, 4))
plt.plot(range(2, 11), wcss, marker='o')
plt.title('Elbow Method for KMeans')
plt.xlabel('Number of Clusters (k)')
plt.ylabel('WCSS (Within-Cluster Sum of Squares)')
plt.grid()
plt.show()
```

- X축: 클러스터 수.
- Y축: WCSS.
- 엘보우 포인트(급격히 감소가 완화되는 지점)를 찾아 최적의 클러스터 수를 결정합니다.

**5.2 실루엣 점수 시각화**

```python
plt.figure(figsize=(10, 6))
for method, scores in silhouette_scores.items():
    if method != "DBSCAN":
        plt.plot(scores.keys(), scores.values(), label=method, marker='o')

dbscan_x = [f"{eps}-{min_samples}" for eps, min_samples in silhouette_scores["DBSCAN"].keys()]
dbscan_y = silhouette_scores["DBSCAN"].values()
plt.plot(dbscan_x, dbscan_y, label="DBSCAN", marker='x', linestyle='--')

plt.title('Silhouette Scores for Different Clustering Methods')
plt.xlabel('Number of Clusters (k) or DBSCAN Params (eps-min_samples)')
plt.ylabel('Silhouette Score')
plt.legend()
plt.grid()
plt.xticks(rotation=45)
plt.show()
```

- **각 알고리즘의 실루엣 점수**를 비교하여 최적의 클러스터링 결과를 판단합니다.
- DBSCAN의 경우, `eps-min_samples` 조합으로 결과를 시각화합니다.


#### 전체 요약
1. **KMeans, Hierarchical Clustering, GMM**:
   - `k=2~10`에 대해 실루엣 점수와 WCSS를 계산.
   - 최적의 클러스터 수를 선택.

2. **DBSCAN**:
   - 다양한 `eps`와 `min_samples` 조합에 대해 실루엣 점수를 계산.
   - 최적의 조합을 선택.

3. **시각화**:
   - KMeans의 엘보우 방법과 모든 알고리즘의 실루엣 점수를 시각화하여 결과를 비교.

### 2. 결과 시각화

클러스터링 결과를 최적화된 매개변수를 사용해 다시 수행하고, 성능(실루엣 점수)을 평가하며, 결과를 시각화합니다.


#### 1. KMeans 클러스터링

```python
kmeans = KMeans(n_clusters=best_k['KMeans'], random_state=42)
kmeans_labels = kmeans.fit_predict(data)
kmeans_score = silhouette_score(data, kmeans_labels)
cluster_centers = kmeans.cluster_centers_
```

1. **KMeans 객체 생성**:
   - `n_clusters=best_k['KMeans']`: 최적 클러스터 수(`best_k['KMeans']`)를 사용해 KMeans 알고리즘을 설정합니다.
   - `random_state=42`: 재현 가능한 결과를 보장합니다.

2. **클러스터링 수행**:
   - `fit_predict(data)`: 데이터를 클러스터링하고 각 데이터 포인트의 클러스터 레이블을 반환합니다.
   - 결과는 `kmeans_labels`에 저장됩니다.

3. **실루엣 점수 계산**:
   - `silhouette_score(data, kmeans_labels)`: 클러스터링 결과의 품질을 평가합니다.
   - 실루엣 점수가 높을수록 클러스터 간 거리가 크고 클러스터 내부가 밀집되어 있음을 의미합니다.

4. **클러스터 중심**:
   - `kmeans.cluster_centers_`: 각 클러스터의 중심 좌표를 반환합니다.


**시각화 - 2D Scatter Plot**

```python
plt.figure(figsize=(8, 6))
plt.scatter(data['Annual Income (k$)'], data['Spending Score (1-100)'], 
            c=kmeans_labels, cmap='viridis', s=50, alpha=0.7, label='Cluster Data')
plt.scatter(cluster_centers[:, 1], cluster_centers[:, 2], 
            c='red', marker='X', s=200, label='Cluster Centers')
plt.title('KMeans Clustering')
plt.xlabel('Annual Income (k$)')
plt.ylabel('Spending Score (1-100)')
plt.legend()
plt.grid(True)
plt.show()
```

- **데이터 점**:
  - `plt.scatter`: 각 데이터 포인트를 클러스터 레이블에 따라 색상(`c=kmeans_labels`)으로 구분해 산점도를 그립니다.
  - `cmap='viridis'`: 클러스터 색상을 지정합니다.
  - `alpha=0.7`: 점의 투명도를 설정합니다.

- **클러스터 중심**:
  - `cluster_centers[:, 1]`, `cluster_centers[:, 2]`: 클러스터 중심 좌표를 산점도로 표시합니다.
  - 빨간색(`c='red'`) X 마커(`marker='X'`)로 표시됩니다.


**시각화 - 3D Scatter Plot**

```python
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
scatter = ax.scatter(data['Age'], data['Annual Income (k$)'], data['Spending Score (1-100)'], 
                      c=kmeans_labels, cmap='viridis', s=50)
ax.set_title('3D KMeans Clustering')
ax.set_xlabel('Age')
ax.set_ylabel('Annual Income (k$)')
ax.set_zlabel('Spending Score (1-100)')
plt.colorbar(scatter, label='Cluster Label')
plt.show()
```

- **3D 클러스터링 결과 시각화**:
  - `projection='3d'`: 3D 플롯을 생성합니다.
  - `ax.scatter`: 3D 공간에서 데이터를 클러스터 레이블(`c=kmeans_labels`)에 따라 시각화합니다.
  - 축 설정:
    - `set_xlabel`, `set_ylabel`, `set_zlabel`: 각각 X, Y, Z 축 이름을 설정합니다.


#### 2. 계층적 군집화

```python
hc = AgglomerativeClustering(n_clusters=best_k['Hierarchical Clustering'])
hc_labels = hc.fit_predict(data)
hc_score = silhouette_score(data, hc_labels)
print(f"계층적 군집화 실루엣 스코어 = {hc_score}")
```

1. **계층적 군집화 객체 생성**:
   - `AgglomerativeClustering(n_clusters=best_k['Hierarchical Clustering'])`: 최적 클러스터 수를 설정해 계층적 군집화를 수행합니다.

2. **클러스터링 수행**:
   - `fit_predict(data)`: 데이터를 클러스터링하고 레이블을 반환합니다.

3. **실루엣 점수 계산**:
   - `silhouette_score(data, hc_labels)`: 클러스터링 품질을 평가합니다.


###$ 3. DBSCAN 클러스터링

```python
dbscan = DBSCAN(eps=best_dbscan_params[0], min_samples=best_dbscan_params[1])
dbscan_labels = dbscan.fit_predict(data)
```

1. **DBSCAN 객체 생성**:
   - `eps=best_dbscan_params[0]`: 최적 반경(`eps`) 설정.
   - `min_samples=best_dbscan_params[1]`: 최적 최소 샘플 수(`min_samples`) 설정.

2. **클러스터링 수행**:
   - `fit_predict(data)`: 데이터를 클러스터링하고 레이블을 반환합니다.
   - 레이블:
     - `-1`: 노이즈 데이터.
     - `0, 1, ...`: 클러스터 레이블.

**노이즈 데이터 제거 및 실루엣 점수 계산**

```python
non_noise_data = data[dbscan_labels != -1]
non_noise_labels = dbscan_labels[dbscan_labels != -1]
dbscan_score = silhouette_score(non_noise_data, non_noise_labels)
```

- **노이즈 제거**:
  - `dbscan_labels != -1`: 노이즈로 분류된 데이터를 제외합니다.

- **실루엣 점수 계산**:
  - 노이즈 제거된 데이터(`non_noise_data`)를 기반으로 실루엣 점수를 계산합니다.

**데이터 손실 비율**

```python
noise_points = len(data[dbscan_labels == -1])
loss_ratio = noise_points / total_data_points
print(f"DBSCAN 데이터 손실 비율: {loss_ratio:.2%}")
```

- **데이터 손실 비율**:
  - 전체 데이터 중 노이즈 데이터가 차지하는 비율을 계산합니다.


#### 4. GMM (Gaussian Mixture Model)

```python
gmm = GaussianMixture(n_components=best_k['GMM'], random_state=42)
gmm_labels = gmm.fit_predict(data)
gmm_score = silhouette_score(data, gmm_labels)
print(f"GMM 실루엣 스코어 = {gmm_score}")
```

1. **GMM 객체 생성**:
   - `n_components=best_k['GMM']`: 최적 클러스터 수를 설정합니다.
   - `random_state=42`: 결과 재현성을 보장합니다.

2. **클러스터링 수행**:
   - `fit_predict(data)`: 데이터를 클러스터링하고 레이블을 반환합니다.

3. **실루엣 점수 계산**:
   - `silhouette_score(data, gmm_labels)`: GMM 클러스터링 결과의 품질을 평가합니다.


**출력 예시**

```text
KMeans 실루엣 스코어 = 0.6123
계층적 군집화 실루엣 스코어 = 0.5985
DBSCAN 실루엣 스코어 (without noise) = 0.4872
DBSCAN 데이터 손실 비율: 12.50%
GMM 실루엣 스코어 = 0.6054
```

#### 전체 요약
1. **KMeans**: 최적 클러스터 수와 실루엣 점수를 계산하고, 2D 및 3D로 결과를 시각화.
2. **계층적 군집화**: 최적 클러스터 수에 따른 실루엣 점수를 계산.
3. **DBSCAN**: 노이즈 데이터를 제거하고 실루엣 점수와 데이터 손실 비율을 계산.
4. **GMM**: 최적 클러스터 수에 따른 실루엣 점수를 계산.
