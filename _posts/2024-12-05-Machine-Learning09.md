---
title: "ML: 모델 성능 평가"
author: mminzy22
date: 2024-12-05 10:08:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "평가 지표(정확도, 정밀도, 재현율, F1 점수)와 혼동 행렬(Confusion Matrix)의 개념과 활용 방법"
pin: false
---



머신러닝 모델의 성능을 평가하는 과정은 모델의 정확성과 신뢰성을 보장하는 데 필수적입니다. 이번 글에서는 **평가 지표(정확도, 정밀도, 재현율, F1 점수)**와 **혼동 행렬(Confusion Matrix)**의 개념과 활용 방법을 알아보겠습니다.


#### 평가 지표 (Metrics)

머신러닝 모델의 성능을 측정하기 위해 다양한 평가 지표가 사용됩니다. 특히 분류 문제에서는 정확도, 정밀도, 재현율, F1 점수와 같은 지표가 중요합니다.

**1. 정확도 (Accuracy)**  
- **정의:**  
  전체 예측 중에서 올바르게 예측된 비율.  
  $$ \text{Accuracy} = \frac{\text{정확한 예측 수}}{\text{전체 데이터 수}} $$  
- **적용:**  
  클래스 불균형이 없는 데이터셋에서 유용.  
- **예제:**  
  암 진단에서 양성과 음성이 거의 동일한 비율일 때 적합.

```python
from sklearn.metrics import accuracy_score

y_true = [0, 1, 1, 0, 1]  # 실제 값
y_pred = [0, 1, 1, 0, 0]  # 예측 값

accuracy = accuracy_score(y_true, y_pred)
print(f"Accuracy: {accuracy}")
```


**2. 정밀도 (Precision)**  
- **정의:**  
  모델이 양성으로 예측한 값 중 실제로 양성인 비율.  
  $$ \text{Precision} = \frac{\text{True Positive}}{\text{True Positive} + \text{False Positive}} $$  
- **적용:**  
  False Positive(거짓 긍정)을 최소화해야 하는 상황에서 유용.  
  - 예: 스팸 메일 필터링 (정상 메일을 스팸으로 분류하지 않도록).

```python
from sklearn.metrics import precision_score

precision = precision_score(y_true, y_pred)
print(f"Precision: {precision}")
```


**3. 재현율 (Recall)**  
- **정의:**  
  실제 양성 데이터 중에서 모델이 양성으로 정확히 예측한 비율.  
  $$ \text{Recall} = \frac{\text{True Positive}}{\text{True Positive} + \text{False Negative}} $$  
- **적용:**  
  False Negative(거짓 부정)을 최소화해야 하는 상황에서 유용.  
  - 예: 암 진단 (암 환자를 놓치지 않도록).

```python
from sklearn.metrics import recall_score

recall = recall_score(y_true, y_pred)
print(f"Recall: {recall}")
```


**4. F1 점수 (F1 Score)**  
- **정의:**  
  정밀도와 재현율의 조화를 측정한 값.  
  $$ F1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} $$  
- **적용:**  
  정밀도와 재현율 사이의 균형이 중요한 문제에서 유용.  

```python
from sklearn.metrics import f1_score

f1 = f1_score(y_true, y_pred)
print(f"F1 Score: {f1}")
```


#### 혼동 행렬 (Confusion Matrix)

**1. 정의**  
혼동 행렬은 모델의 예측 결과를 요약하여, 성능을 직관적으로 이해할 수 있도록 돕는 도구입니다.

|                | **실제 양성** | **실제 음성** |
|----------------|---------------|---------------|
| **예측 양성**  | True Positive (TP) | False Positive (FP) |
| **예측 음성**  | False Negative (FN) | True Negative (TN) |

- **True Positive (TP):** 양성 데이터를 정확히 양성으로 예측한 수.  
- **False Positive (FP):** 음성 데이터를 잘못 양성으로 예측한 수.  
- **False Negative (FN):** 양성 데이터를 잘못 음성으로 예측한 수.  
- **True Negative (TN):** 음성 데이터를 정확히 음성으로 예측한 수.

**2. 활용**
- 모델의 강점과 약점을 시각적으로 확인 가능.
- 평가 지표 계산의 기초 데이터 제공.

```python
from sklearn.metrics import confusion_matrix

conf_matrix = confusion_matrix(y_true, y_pred)
print(f"Confusion Matrix:\n{conf_matrix}")
```

**3. 시각화 예제**
```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=['Negative', 'Positive'], yticklabels=['Negative', 'Positive'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()
```


#### 정리

- **평가 지표:**  
  - **정확도(Accuracy):** 전체적으로 얼마나 잘 맞췄는지 평가.  
  - **정밀도(Precision):** 양성 예측의 정확성을 측정.  
  - **재현율(Recall):** 실제 양성을 얼마나 잘 찾아냈는지 평가.  
  - **F1 점수:** 정밀도와 재현율 간의 균형 평가.

- **혼동 행렬:**  
  예측 결과를 시각화하고 모델의 성능을 직관적으로 이해하는 데 필수적.

> **다음 글 예고:**  
> 머신러닝의 중요한 과정인 **"피처 엔지니어링"**에 대해 알아보겠습니다!
