---
title: "주택 가격 예측 모델 구축(모델 학습 및 평가)"
author: mminzy22
date: 2024-12-24 11:00:00 +0900
categories: [Machine Learning, 과제]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "주택 가격 예측 모델 구축을 위한 과제입니다. 다양한 회귀 모델을 비교하고 최적의 모델을 선택하여 성능을 평가합니다."
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


### 1. 선형 회귀 모델 평가

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_validate
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. 선형 회귀 모델 평가
lr_model = LinearRegression()
lr_model.fit(X_train_scaled, y_train)
y_pred_lr = lr_model.predict(X_test_scaled)

lr_mae = mean_absolute_error(y_test, y_pred_lr)
lr_mse = mean_squared_error(y_test, y_pred_lr)
lr_r2 = r2_score(y_test, y_pred_lr)

cv_results_lr = cross_validate(lr_model, X_train_scaled, y_train, cv=3, scoring=['neg_mean_squared_error', 'neg_mean_absolute_error', 'r2'])

print("Linear Regression Cross-Validation Results:")
print(f"Mean CV MSE: {-cv_results_lr['test_neg_mean_squared_error'].mean():.4f}")
print(f"Mean CV MAE: {-cv_results_lr['test_neg_mean_absolute_error'].mean():.4f}")
print(f"Mean CV R^2: {cv_results_lr['test_r2'].mean():.4f}")
```


#### 코드 설명

1. **라이브러리 임포트**:
   - `LinearRegression`: 선형 회귀 모델.
   - `cross_validate`: 교차 검증을 수행하여 모델의 성능을 평가.
   - `mean_absolute_error`, `mean_squared_error`, `r2_score`: 회귀 모델 평가를 위한 성능 지표.

2. **모델 학습**:
   - `lr_model = LinearRegression()`: 선형 회귀 모델 객체 생성.
   - `lr_model.fit(X_train_scaled, y_train)`:
     - 훈련 데이터를 사용해 선형 회귀 모델을 학습.

3. **예측 및 평가**:
   - `y_pred_lr = lr_model.predict(X_test_scaled)`:
     - 테스트 데이터를 사용해 예측 값을 생성.
   - 성능 평가:
     - `mean_absolute_error`: 예측 값과 실제 값의 평균 절대 오차.
     - `mean_squared_error`: 예측 값과 실제 값의 평균 제곱 오차.
     - `r2_score`: 예측 값이 실제 값에 얼마나 근접한지 나타내는 결정 계수(R²).

4. **교차 검증**:
   - `cross_validate(lr_model, X_train_scaled, y_train, cv=3, scoring=...)`:
     - 데이터를 3개로 분할(3-Fold Cross-Validation)하여 교차 검증 수행.
     - `scoring` 매개변수:
       - `'neg_mean_squared_error'`: 평균 제곱 오차(MSE)의 음수 값.
       - `'neg_mean_absolute_error'`: 평균 절대 오차(MAE)의 음수 값.
       - `'r2'`: 결정 계수(R²).
   - 결과를 딕셔너리(`cv_results_lr`)로 반환하며, 각 폴드의 점수가 포함됩니다.

5. **결과 출력**:
   - 교차 검증 결과의 평균값을 계산하고 출력:
     - `test_neg_mean_squared_error`: 각 폴드의 MSE.
     - `test_neg_mean_absolute_error`: 각 폴드의 MAE.
     - `test_r2`: 각 폴드의 R².


#### 사용 목적

1. **모델 학습**:
   - 훈련 데이터를 사용해 선형 회귀 모델을 학습시킵니다.

2. **테스트 데이터 성능 평가**:
   - 모델이 테스트 데이터에서 얼마나 잘 일반화되는지 평가하기 위해 다양한 지표(MAE, MSE, R²)를 사용합니다.

3. **교차 검증**:
   - 훈련 데이터에서 교차 검증을 통해 모델의 성능을 더 신뢰성 있게 평가.
   - 데이터 분할에 따라 성능이 달라질 수 있는 것을 보완합니다.


#### 매개변수 설명

1. **`LinearRegression` 기본 매개변수**:
   - `fit_intercept=True`: 절편(Intercept)을 계산 여부. 기본값은 `True`.
   - `normalize=False`: 데이터를 표준화할지 여부. 표준화는 이미 `StandardScaler`로 처리했으므로 여기서는 `False`.

2. **`cross_validate` 매개변수**:
   - `cv=3`: 교차 검증 폴드의 개수.
   - `scoring`: 평가 지표를 지정하며, 여기서는 MSE, MAE, R²를 포함.


#### 사용 시 주의사항

1. **데이터 전처리 필요**:
   - 선형 회귀 모델은 특성 간 크기의 차이에 민감하므로, 데이터 표준화(스케일링)가 필요합니다.

2. **오버피팅 방지**:
   - 교차 검증은 데이터 분할에 따른 성능 변동을 줄이고, 모델의 일반화 능력을 평가하는 데 유용합니다.

3. **해석 가능성**:
   - 선형 회귀는 해석 가능성이 높은 모델로, 특성과 타겟 간의 선형 관계를 이해하는 데 유리합니다.


#### 활용 상황

1. **성능 평가**:
   - 모델의 테스트 데이터 성능을 다양한 지표로 평가할 때.
   - 예측 정확도를 평가하고 모델의 적합성을 판단.

2. **교차 검증**:
   - 훈련 데이터 내에서 모델 성능을 더 안정적으로 평가하기 위해.

3. **모델 비교**:
   - 다른 모델(예: 랜덤 포레스트, 그래디언트 부스팅)과 성능을 비교하기 위해 선형 회귀를 기준 모델로 사용.


#### 교차 검증 결과의 해석
- **MSE (Mean Squared Error)**:
  - 값이 낮을수록 모델의 예측이 실제 값에 가깝습니다.
  - 크기가 클 경우, 예측 오차가 크다는 것을 의미합니다.
- **MAE (Mean Absolute Error)**:
  - 평균 절대 오차로, 예측 값이 실제 값에서 얼마나 떨어져 있는지의 평균.
- **R² (결정 계수)**:
  - 값이 1에 가까울수록 모델의 예측이 실제 데이터를 잘 설명.

### 2. 랜덤 포레스트 하이퍼파라미터 튜닝 및 평가

```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GridSearchCV

# 2. 랜덤 포레스트 하이퍼파라미터 튜닝 및 평가 (GridSearchCV)
rf_param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [5, 10, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

rf_grid_search = GridSearchCV(
    estimator=RandomForestRegressor(random_state=42),
    param_grid=rf_param_grid,
    scoring='neg_mean_squared_error',
    cv=3,
    verbose=2,
    n_jobs=-1
)

rf_grid_search.fit(X_train_scaled, y_train)
print("Best parameters for RandomForest: ", rf_grid_search.best_params_)
print("Best score for RandomForest: ", -rf_grid_search.best_score_)
```


#### 코드 설명

1. **라이브러리 임포트**:
   - `RandomForestRegressor`: 랜덤 포레스트 회귀 모델.
   - `GridSearchCV`: 하이퍼파라미터 조합을 탐색하는 Grid Search 도구.

2. **하이퍼파라미터 그리드 정의**:
   - `rf_param_grid`:
     - `n_estimators`: 트리 개수. 트리가 많을수록 성능이 향상될 가능성이 있지만 계산 비용 증가.
     - `max_depth`: 트리의 최대 깊이. 너무 깊으면 과적합(overfitting) 가능성이 높아짐.
     - `min_samples_split`: 노드를 분할하기 위한 최소 샘플 수.
     - `min_samples_leaf`: 리프 노드가 가지는 최소 샘플 수.

3. **GridSearchCV 설정**:
   - `estimator=RandomForestRegressor(random_state=42)`:
     - 랜덤 포레스트 회귀 모델을 기본 추정기로 사용.
   - `param_grid=rf_param_grid`:
     - 그리드 탐색을 위한 하이퍼파라미터 조합.
   - `scoring='neg_mean_squared_error'`:
     - 모델의 성능 평가 지표로 MSE(Mean Squared Error)의 음수를 사용.
   - `cv=3`:
     - 3-Fold Cross Validation을 수행하여 각 조합의 평균 성능 평가.
   - `verbose=2`:
     - 검색 진행 상황을 자세히 출력.
   - `n_jobs=-1`:
     - 모든 CPU 코어를 사용하여 병렬 처리.

4. **Grid Search 실행**:
   - `rf_grid_search.fit(X_train_scaled, y_train)`:
     - 훈련 데이터를 사용해 하이퍼파라미터 탐색 및 교차 검증 수행.

5. **최적 하이퍼파라미터 출력**:
   - `rf_grid_search.best_params_`:
     - 가장 성능이 좋은 하이퍼파라미터 조합을 출력.
   - `rf_grid_search.best_score_`:
     - 최적의 하이퍼파라미터 조합에 대한 교차 검증 점수(MSE 음수값)를 출력.


#### 사용 목적

1. **하이퍼파라미터 튜닝**:
   - 랜덤 포레스트 모델의 성능을 최적화하기 위해, 주요 하이퍼파라미터를 탐색합니다.

2. **교차 검증**:
   - 여러 데이터 분할에서 모델의 성능을 검증하여 일반화 성능을 평가.

3. **최적화된 모델 선택**:
   - Grid Search를 통해 가장 성능이 좋은 하이퍼파라미터 조합을 찾아, 최적의 랜덤 포레스트 모델을 생성합니다.


#### 활용 사례

1. **하이퍼파라미터 선택이 어려울 때**:
   - 여러 하이퍼파라미터 조합을 탐색하여 최적의 값을 자동으로 선택.

2. **모델 성능 비교**:
   - 최적화된 랜덤 포레스트 모델을 다른 알고리즘(예: 선형 회귀, 그래디언트 부스팅)과 비교.

3. **복잡한 데이터에 대한 모델링**:
   - 랜덤 포레스트는 비선형 데이터와 복잡한 상호작용이 있는 데이터에서도 성능이 뛰어납니다.


#### 매개변수 설명

1. **`RandomForestRegressor` 주요 매개변수**:
   - `n_estimators`: 트리의 개수. 클수록 성능은 좋아지지만 계산량 증가.
   - `max_depth`: 트리의 최대 깊이. 너무 깊으면 과적합 위험.
   - `min_samples_split`: 노드를 분할하기 위한 최소 샘플 수. 값이 크면 과적합 방지.
   - `min_samples_leaf`: 리프 노드의 최소 샘플 수. 리프 노드가 너무 작으면 과적합 위험.

2. **`GridSearchCV` 주요 매개변수**:
   - `param_grid`: 탐색할 하이퍼파라미터 조합.
   - `scoring`: 모델 성능 평가 지표.
   - `cv`: 교차 검증 폴드 수. 값이 클수록 안정적인 평가가 가능하지만 계산 비용 증가.
   - `n_jobs`: 병렬 처리에 사용할 CPU 코어 수.


#### 사용 시 주의사항

1. **탐색 범위 설정**:
   - 하이퍼파라미터 탐색 범위(`rf_param_grid`)를 너무 넓게 설정하면 계산 비용이 크게 증가합니다. 적절한 탐색 범위를 설정해야 합니다.

2. **데이터 크기와 CV 설정**:
   - 데이터가 작으면 `cv` 값을 줄여 계산 비용을 줄일 수 있습니다.
   - 데이터가 크다면 `cv` 값을 늘려 더 정확한 검증을 할 수 있습니다.

3. **병렬 처리**:
   - `n_jobs=-1`로 설정하면 모든 CPU를 사용하므로 실행 환경에 따라 CPU 과부하가 발생할 수 있습니다.


#### 활용 상황

1. **하이퍼파라미터 튜닝만 수행**:
   ```python
   rf_grid_search.fit(X_train_scaled, y_train)
   print(rf_grid_search.best_params_)
   ```
   - 하이퍼파라미터 조합과 최적의 조합 확인.

2. **최적화된 모델로 테스트 데이터 평가**:
   ```python
   best_rf_model = rf_grid_search.best_estimator_
   y_pred = best_rf_model.predict(X_test_scaled)
   ```
   - 최적의 하이퍼파라미터로 훈련된 모델을 사용해 테스트 데이터 평가.

3. **다른 알고리즘과 성능 비교**:
   - 선형 회귀, 그래디언트 부스팅 등과 함께 사용해 성능 비교.


### 3. 그래디언트 부스팅 하이퍼파라미터 튜닝 및 평가

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import uniform, randint

# 3. 그래디언트 부스팅 하이퍼파라미터 튜닝 및 평가 (RandomizedSearchCV)
gb_param_dist = {
    'n_estimators': randint(50, 200),
    'max_depth': randint(3, 10),
    'learning_rate': uniform(0.01, 0.3),
    'subsample': uniform(0.7, 0.3)
}

gb_random_search = RandomizedSearchCV(
    estimator=GradientBoostingRegressor(random_state=42),
    param_distributions=gb_param_dist,
    n_iter=50,
    scoring='neg_mean_squared_error',
    cv=3,
    verbose=2,
    n_jobs=-1,
    random_state=42
)

gb_random_search.fit(X_train_scaled, y_train)
print("Best parameters for GradientBoosting: ", gb_random_search.best_params_)
print("Best score for GradientBoosting: ", -gb_random_search.best_score_)
```


#### 코드 설명

1. **라이브러리 임포트**:
   - `GradientBoostingRegressor`: 그래디언트 부스팅 회귀 모델.
   - `RandomizedSearchCV`: 하이퍼파라미터를 무작위로 샘플링하여 탐색하는 Randomized Search 도구.
   - `uniform`, `randint`: 확률분포를 정의하는 도구로, 하이퍼파라미터 값의 범위를 지정.

2. **하이퍼파라미터 범위 정의**:
   - `gb_param_dist`:
     - `n_estimators`: 50부터 200까지 트리 개수를 무작위로 선택.
     - `max_depth`: 3부터 10까지 트리의 최대 깊이를 무작위로 선택.
     - `learning_rate`: 0.01부터 0.3까지 학습률을 균등 분포에서 샘플링.
     - `subsample`: 0.7부터 1.0까지 데이터 샘플링 비율을 균등 분포에서 샘플링.

3. **RandomizedSearchCV 설정**:
   - `estimator=GradientBoostingRegressor(random_state=42)`:
     - 그래디언트 부스팅 모델을 기본 추정기로 사용.
   - `param_distributions=gb_param_dist`:
     - 무작위 탐색을 위한 하이퍼파라미터 분포.
   - `n_iter=50`:
     - 총 50개의 하이퍼파라미터 조합을 탐색.
   - `scoring='neg_mean_squared_error'`:
     - 성능 평가 지표로 평균 제곱 오차(MSE)의 음수 값을 사용.
   - `cv=3`:
     - 3-Fold Cross Validation으로 성능 평가.
   - `verbose=2`:
     - 검색 진행 상황을 자세히 출력.
   - `n_jobs=-1`:
     - 병렬 처리로 모든 CPU 코어를 사용.

4. **Randomized Search 실행**:
   - `gb_random_search.fit(X_train_scaled, y_train)`:
     - 훈련 데이터를 사용해 하이퍼파라미터 탐색 및 교차 검증 수행.

5. **최적 하이퍼파라미터 출력**:
   - `gb_random_search.best_params_`:
     - 최적의 하이퍼파라미터 조합.
   - `gb_random_search.best_score_`:
     - 최적의 하이퍼파라미터에서 교차 검증 점수(MSE 음수값).


#### 사용 목적

1. **하이퍼파라미터 최적화**:
   - 그래디언트 부스팅 모델의 성능을 최적화하기 위해 주요 하이퍼파라미터를 무작위로 탐색합니다.

2. **탐색 비용 감소**:
   - Grid Search보다 탐색할 조합 수를 줄여 계산 시간을 단축.

3. **모델 성능 개선**:
   - 최적화된 하이퍼파라미터를 통해 그래디언트 부스팅 모델의 예측 성능을 향상.


#### 활용 사례

1. **대규모 데이터셋**:
   - 데이터가 클 경우, Randomized Search로 탐색 비용을 줄여 최적화를 수행.

2. **하이퍼파라미터 범위가 넓을 때**:
   - 후보 값의 범위가 넓을 경우, Randomized Search를 사용해 적절한 값으로 수렴.

3. **모델 비교**:
   - 다른 알고리즘(예: 랜덤 포레스트, 선형 회귀)과 최적화된 그래디언트 부스팅 모델의 성능을 비교.


#### 매개변수 설명

1. **`GradientBoostingRegressor` 주요 매개변수**:
   - `n_estimators`: 트리의 개수. 트리가 많을수록 성능은 좋아지지만 계산량 증가.
   - `max_depth`: 트리의 최대 깊이. 깊을수록 모델이 복잡해져 과적합 위험.
   - `learning_rate`: 학습률. 작은 값은 느리지만 안정적인 학습, 큰 값은 빠르지만 불안정.
   - `subsample`: 각 트리 학습에 사용할 데이터 샘플링 비율(0~1).

2. **`RandomizedSearchCV` 주요 매개변수**:
   - `param_distributions`: 탐색할 하이퍼파라미터와 그 분포.
   - `n_iter`: 탐색할 하이퍼파라미터 조합 수.
   - `scoring`: 성능 평가 지표.
   - `cv`: 교차 검증 폴드 수.


#### 사용 시 주의사항

1. **탐색 범위의 적절성**:
   - 너무 넓은 범위를 설정하면 탐색에 많은 시간이 소요됩니다.
   - 적절한 값 범위를 설정해 효율적인 탐색이 필요.

2. **데이터 크기와 CV 설정**:
   - 데이터가 클 경우, `cv` 값을 줄여 계산 시간을 단축하거나 샘플링된 데이터를 사용.

3. **병렬 처리 주의**:
   - `n_jobs=-1`로 설정하면 모든 CPU 코어를 사용하므로 환경에 따라 과부하가 발생할 수 있습니다.


#### 활용 상황

1. **탐색만 수행**:
   ```python
   gb_random_search.fit(X_train_scaled, y_train)
   print(gb_random_search.best_params_)
   ```
   - 최적의 하이퍼파라미터 확인.

2. **최적화된 모델 평가**:
   ```python
   best_gb_model = gb_random_search.best_estimator_
   y_pred = best_gb_model.predict(X_test_scaled)
   ```
   - 최적의 하이퍼파라미터로 훈련된 모델을 테스트 데이터에 적용.

3. **모델 성능 비교**:
   - 다른 알고리즘(예: 랜덤 포레스트, 선형 회귀)과 그래디언트 부스팅 성능 비교.

### 4. 최적화된 모델 평가

```python
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 최적화된 모델 평가
final_models = {
    "LinearRegression": lr_model,
    "RandomForest": rf_grid_search.best_estimator_,
    "GradientBoosting": gb_random_search.best_estimator_
}

results = {}
for name, model in final_models.items():
    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    results[name] = {"MAE": mae, "MSE": mse, "R^2": r2}

# 결과 저장
results_df = pd.DataFrame(results)
print(results_df)
```


#### 코드 설명

1. **라이브러리 임포트**:
   - `LinearRegression`, `RandomForestRegressor`, `GradientBoostingRegressor`: 평가할 세 가지 모델.
   - `mean_absolute_error`, `mean_squared_error`, `r2_score`: 모델의 성능을 평가하기 위한 주요 지표.

2. **최적화된 모델 설정**:
   - `final_models`:
     - 선형 회귀(`lr_model`), 최적화된 랜덤 포레스트(`rf_grid_search.best_estimator_`), 최적화된 그래디언트 부스팅(`gb_random_search.best_estimator_`)을 평가 대상 모델로 설정.

3. **모델 예측 및 성능 평가**:
   - 각 모델에 대해 테스트 데이터(`X_test_scaled`)로 예측 수행:
     - `y_pred = model.predict(X_test_scaled)`: 테스트 데이터 예측 값.
     - 성능 평가:
       - `mean_absolute_error(y_test, y_pred)`: 평균 절대 오차(MAE).
       - `mean_squared_error(y_test, y_pred)`: 평균 제곱 오차(MSE).
       - `r2_score(y_test, y_pred)`: 결정 계수(R²).

4. **결과 저장**:
   - `results` 딕셔너리에 각 모델의 평가 결과(MAE, MSE, R²)를 저장.
   - Pandas 데이터프레임으로 변환하여 결과를 출력.


#### 사용 목적

1. **최적화된 모델 성능 평가**:
   - 하이퍼파라미터 튜닝으로 얻어진 최적의 모델과 선형 회귀 모델의 성능을 비교합니다.

2. **모델 성능 비교**:
   - 다양한 모델의 예측 정확도와 일반화 성능을 비교하여 최적의 모델을 선택합니다.

3. **다양한 지표로 평가**:
   - MAE, MSE, R² 등 서로 다른 성능 지표를 사용해 모델의 강점과 약점을 평가.


#### 활용 사례

1. **모델 성능 비교**:
   - 여러 머신러닝 모델을 동일한 데이터셋에서 평가하고, 최적의 모델을 선택.

2. **모델 선택**:
   - 테스트 데이터 성능이 가장 좋은 모델을 실무나 배포에 사용할 최종 모델로 선정.

3. **실험 결과 분석**:
   - 모델별 성능 차이를 분석해 모델 선택 기준을 수립.


#### 성능 지표 설명

1. **Mean Absolute Error (MAE)**:
   - 예측 값과 실제 값 간의 절대 오차의 평균.
   - 값이 낮을수록 모델의 예측이 정확함.

2. **Mean Squared Error (MSE)**:
   - 예측 값과 실제 값 간의 제곱 오차의 평균.
   - 값이 낮을수록 모델의 예측이 정확하며, 큰 오차에 더 민감.

3. **R² (결정 계수)**:
   - 모델이 데이터를 얼마나 잘 설명하는지를 나타냄.
   - 1에 가까울수록 예측이 정확하며, 음수일 경우 모델이 데이터를 제대로 설명하지 못함.


#### 사용 시 주의사항

1. **데이터 분리 유지**:
   - 테스트 데이터는 학습에 사용하지 않은 데이터를 사용해야 합니다.

2. **지표 선택**:
   - MSE는 큰 오차에 민감하므로, 데이터의 특성에 따라 MAE, MSE, R² 중 적합한 지표를 선택해야 합니다.

3. **스케일링 일관성**:
   - 모델 학습 및 평가 시, 테스트 데이터에 동일한 스케일링을 적용해야 합니다.


#### 활용 상황

1. **결과 출력**:
   ```python
   print(results_df)
   ```
   - 각 모델의 성능 지표를 데이터프레임 형태로 확인.

2. **최적 모델 선택**:
   ```python
   best_model = max(results.items(), key=lambda x: x[1]['R^2'])
   print("Best Model:", best_model)
   ```
   - R² 기준으로 최적 모델 선택.

3. **실험 결과 저장**:
   - 결과를 CSV 파일로 저장하여 모델 성능 기록.
     ```python
     results_df.to_csv("model_performance.csv", index=False)
     ```


### 5. 결과 시각화

```python
import matplotlib.pyplot as plt

results_df.plot(kind='bar', figsize=(10, 6))
plt.title("Model Performance Comparison")
plt.xlabel("Metrics")
plt.ylabel("Values")
plt.legend(title="Models")
plt.xticks(rotation=0)
plt.show()
```


#### 코드 설명

1. **라이브러리 임포트**:
   - `matplotlib.pyplot`: 데이터 시각화를 위한 라이브러리.

2. **데이터 시각화**:
   - `results_df.plot(kind='bar', figsize=(10, 6))`:
     - `results_df`: 이전 단계에서 저장된 모델 성능 결과(DataFrame).
     - `kind='bar'`: 막대 그래프 형식으로 출력.
     - `figsize=(10, 6)`: 그래프 크기를 가로 10, 세로 6으로 설정.

3. **그래프 제목 및 축 레이블 설정**:
   - `plt.title("Model Performance Comparison")`: 그래프 제목.
   - `plt.xlabel("Metrics")`: x축 레이블.
   - `plt.ylabel("Values")`: y축 레이블.

4. **범례 및 축 설정**:
   - `plt.legend(title="Models")`: 모델 이름을 범례로 추가.
   - `plt.xticks(rotation=0)`:
     - x축의 레이블 각도를 0도로 설정하여 가독성 향상.

5. **그래프 표시**:
   - `plt.show()`: 그래프를 출력.


#### 사용 목적

1. **모델 성능 비교**:
   - 각 모델의 성능 지표(MAE, MSE, R²)를 시각적으로 비교하여 어느 모델이 더 적합한지 쉽게 판단.

2. **결과 해석 용이**:
   - 텍스트나 숫자 형태보다 시각적 그래프를 통해 성능 차이를 직관적으로 확인.


#### 활용 사례

1. **모델 비교**:
   - 여러 모델의 성능 지표를 한눈에 비교하고, 최적의 모델을 선택.

2. **보고서 작성**:
   - 모델 성능 결과를 시각적으로 표현하여 분석 보고서나 프레젠테이션 자료에 활용.

3. **하이퍼파라미터 튜닝 효과 확인**:
   - 하이퍼파라미터 튜닝 전후의 성능 변화를 비교.


#### 결과 해석

1. **성능 지표**:
   - `MAE`, `MSE`가 낮을수록, `R²`가 높을수록 모델이 더 적합.

2. **모델 간 성능 차이**:
   - 그래프에서 막대의 높이로 모델 간 성능 차이를 직관적으로 확인.

3. **지표 간 균형 평가**:
   - 한 모델이 특정 지표에서만 뛰어나고 다른 지표에서는 그렇지 않다면, 전반적인 균형을 고려해 모델 선택.


#### 사용 시 주의사항

1. **데이터프레임 형식 유지**:
   - `results_df`가 제대로 구성되어 있어야 합니다. 열 이름과 데이터 형식이 올바른지 확인 필요.

2. **지표 스케일**:
   - MSE와 MAE는 값의 크기가 다를 수 있으므로, 필요에 따라 로그 스케일이나 별도의 그래프를 사용할 수도 있습니다.

3. **모델 이름 가독성**:
   - 모델 이름이 너무 길거나 많을 경우, 범례나 x축 레이블의 가독성을 확인하고 조정.


#### 확장 예시

1. **여러 성능 지표를 별도로 시각화**:
   ```python
   results_df.T.plot(kind='bar', figsize=(12, 7))
   plt.title("Model Comparison by Metrics")
   plt.xlabel("Models")
   plt.ylabel("Values")
   plt.legend(title="Metrics")
   plt.xticks(rotation=45)
   plt.show()
   ```
   - 성능 지표를 기준으로 각 모델의 성능을 비교.

2. **특정 지표 강조**:
   ```python
   results_df.loc["R^2"].plot(kind='bar', color='skyblue', figsize=(10, 6))
   plt.title("R² Score Comparison")
   plt.xlabel("Models")
   plt.ylabel("R² Score")
   plt.xticks(rotation=0)
   plt.show()
   ```
   - R² 지표를 강조하여 시각화.
