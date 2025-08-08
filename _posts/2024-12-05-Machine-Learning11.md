---
title: "ML: 피처 생성 (Feature Engineering)"
author: mminzy22
date: 2024-12-05 10:10:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "새로운 변수 생성 기법과 텍스트 및 시계열 데이터 처리 방법"
pin: false
---



피처 생성은 데이터를 기반으로 새로운 변수를 만들어 모델의 성능을 향상시키는 과정입니다. 좋은 피처는 머신러닝 모델의 학습과 예측 정확도를 크게 개선할 수 있습니다. 이번 글에서는 **새로운 변수 생성 기법**과 **텍스트 및 시계열 데이터 처리** 방법을 살펴보겠습니다.


#### 피처 생성의 중요성

피처 생성은 모델링 이전 단계에서 데이터를 풍부하게 만들어, 기존 데이터로는 얻을 수 없는 새로운 인사이트를 제공하는 역할을 합니다.

**장점**
1. 모델 성능 향상: 중요한 정보를 담은 새로운 피처는 예측 성능을 높임.
2. 데이터 표현력 증가: 모델이 학습할 수 있는 정보의 범위를 확장.
3. 문제 해결 능력 강화: 복잡한 문제를 간단히 해결 가능.


#### 1. 새로운 변수 생성 기법

**1) 수학적 조합**  
기존 피처를 조합하여 새로운 피처 생성.
- 두 피처의 곱, 합, 차, 비율 등을 활용.

```python
import pandas as pd

# 예제 데이터
data = {'Feature1': [10, 20, 30], 'Feature2': [1, 2, 3]}
df = pd.DataFrame(data)

# 새로운 피처 생성
df['Sum'] = df['Feature1'] + df['Feature2']
df['Product'] = df['Feature1'] * df['Feature2']
df['Ratio'] = df['Feature1'] / df['Feature2']

print(df)
```

**2) 그룹 기반 피처 생성**  
특정 그룹별 통계량(평균, 합계 등)을 계산하여 추가.
- 예: 고객별 총 구매 금액, 월별 평균 기온.

```python
# 그룹 기반 피처 생성
df['Category'] = ['A', 'A', 'B']
grouped = df.groupby('Category')['Feature1'].mean().reset_index()
grouped.columns = ['Category', 'Category_Mean']
df = df.merge(grouped, on='Category')
print(df)
```

**3) 날짜 및 시간 피처 생성**  
날짜 데이터를 변환하여 연도, 월, 요일 등의 피처 생성.
- 예: 주문 날짜 → 요일, 분기.

```python
# 날짜 데이터 처리
df['Date'] = pd.to_datetime(['2023-01-01', '2023-02-01', '2023-03-01'])
df['Year'] = df['Date'].dt.year
df['Month'] = df['Date'].dt.month
df['Weekday'] = df['Date'].dt.day_name()

print(df)
```


#### 2. 텍스트 데이터 처리

텍스트 데이터는 비정형 데이터로, 머신러닝 모델이 이해할 수 있도록 적절히 변환해야 합니다.

**1) 텍스트 정제**
- 불필요한 문장 부호, 대소문자 변환, 불용어 제거.

```python
import re
from nltk.corpus import stopwords

# 텍스트 정제
text = "This is an Example Sentence! Stopwords like 'is' and 'an' will be removed."
text = re.sub(r'[^\w\s]', '', text).lower()  # 소문자 변환 및 특수문자 제거
stop_words = set(stopwords.words('english'))
text_cleaned = ' '.join([word for word in text.split() if word not in stop_words])

print(text_cleaned)
```

**2) 텍스트 특징 생성**
- 단어 빈도(Count Vectorizer), TF-IDF, 워드 임베딩 등을 사용하여 텍스트를 수치화.

```python
from sklearn.feature_extraction.text import CountVectorizer

# 단어 빈도 계산
texts = ["I love machine learning", "Machine learning is powerful"]
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(texts)

print(vectorizer.get_feature_names_out())
print(X.toarray())
```


#### 3. 시계열 데이터 처리

시계열 데이터는 시간적 순서가 있는 데이터로, 특수한 처리가 필요합니다.

**1) 시계열 분해**
- 데이터에서 트렌드, 계절성, 잔차를 분리하여 분석.

```python
from statsmodels.tsa.seasonal import seasonal_decompose
import numpy as np
import pandas as pd

# 예제 데이터
time = pd.date_range(start='2023-01-01', periods=100)
values = np.random.rand(100).cumsum()
ts = pd.Series(values, index=time)

# 시계열 분해
result = seasonal_decompose(ts, model='additive', period=12)
result.plot()
plt.show()
```

**2) 지연 변수 및 이동 평균 생성**
- 과거 데이터를 사용하여 현재 데이터의 특징 생성.

```python
# 이동 평균 생성
df['Value'] = [100, 200, 300, 400, 500]
df['Moving_Avg'] = df['Value'].rolling(window=2).mean()

# 지연 변수 생성
df['Lag1'] = df['Value'].shift(1)
print(df)
```


#### 정리

- **새로운 변수 생성:**  
  피처 간 조합, 그룹 통계, 날짜 데이터 처리로 중요한 정보를 도출.  
- **텍스트 데이터 처리:**  
  텍스트를 정제하고 수치화하여 머신러닝 모델에서 활용 가능.  
- **시계열 데이터 처리:**  
  시간적 특성을 반영한 지연 변수, 이동 평균, 시계열 분해를 통해 데이터 분석과 예측 성능 향상.  

> **다음 글 예고:**  
> 머신러닝에서 활용되는 **"고급 머신러닝 알고리즘"**에 대해 알아보겠습니다. 앙상블 학습, 비지도 학습, 강화 학습 등 다양한 기법을 소개합니다!
