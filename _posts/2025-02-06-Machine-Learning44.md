---
title: "특강: PyTorch 기초 - 텐서와 기본 연산"
author: mminzy22
date: 2025-02-06 21:00:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, PyTorch, TIL]
description: "PyTorch의 기본 개념과 텐서를 활용한 연산"
pin: false
math: true
---


## 1. PyTorch 설치

PyTorch를 사용하려면 먼저 설치해야 합니다. 아래 명령어를 실행하여 PyTorch와 관련 라이브러리를 설치합니다.

```bash
!pip install torch torchvision torchaudio  # Jupyter Notebook에서는 !pip 사용 가능, 터미널에서는 ! 없이 실행
```

추가적으로 데이터 분석과 시각화를 위해 필요한 라이브러리도 설치합니다.

```bash
!pip install tqdm jupyter jupyterlab scikit-learn scikit-image tensorboard torchmetrics matplotlib pandas
```

## 2. 텐서(Tensor)란?

텐서는 데이터를 저장하는 다차원 배열로, PyTorch에서 기본적으로 사용되는 데이터 구조입니다. 아래는 텐서의 기본 개념입니다.

- **스칼라(Scalar)**: 단일 값 (0차원 텐서)
- **벡터(Vector)**: 1차원 텐서 (예: `[1, 2, 3, 4]`)
- **행렬(Matrix)**: 2차원 텐서 (예: `[[1, 2, 3], [4, 5, 6]]`)
- **3차원 텐서**: `[[[1,2], [2,3]]]`
- **4차원 텐서**: `[[[[1,2,.....]]]]`

## 3. 텐서 생성

PyTorch에서 텐서를 생성하는 방법은 여러 가지가 있습니다.

### 3.1 기본 텐서 생성

```python
import torch

# 1차원 텐서 (벡터)
tensor = torch.tensor([1, 2, 3, 4])
# TIP: dtype=torch.float32 등의 옵션을 추가하면 데이터 타입을 명확히 설정할 수 있습니다.
print(tensor)
```

### 3.2 스칼라 (0차원 텐서)

```python
scalar = torch.tensor(4)
print(scalar)
print(scalar.dim())  # 차원 출력
print(scalar.item()) # 파이썬 숫자로 변환
```

### 3.3 벡터 (1차원 텐서)

```python
vector = torch.tensor([3, 6, 9])
print(vector)
print(vector.dim())
print(vector.shape)
```

### 3.4 행렬 (2차원 텐서)

```python
matrix = torch.tensor([[1, 2], [3, 4]])
print(matrix)
print(matrix.dim())
print(matrix.shape)
```

### 3.5 3차원 텐서

```python
tensor_3d = torch.tensor([
    [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    [[10, 11, 12], [13, 14, 15], [16, 17, 18]]
])
print(tensor_3d)
print(tensor_3d.dim())
print(tensor_3d.shape)
```

### 3.6 넘파이(Numpy) 변환

```python
import numpy as np
np_array = np.array([1, 2, 3])
tensor_from_np = torch.from_numpy(np_array)
print(tensor_from_np)
```

반대로 텐서를 넘파이 배열로 변환할 수도 있습니다.

```python
np_from_tensor = tensor_from_np.numpy()
print(np_from_tensor)
```

## 4. 랜덤 텐서 생성

PyTorch는 다양한 방식으로 랜덤 텐서를 생성할 수 있습니다.

```python
# 0과 1 사이의 난수를 가지는 텐서
torch.manual_seed(42)  # TIP: 재현 가능한 난수 생성을 위해 seed 설정
random_tensor = torch.rand(3, 4)
print(random_tensor)

# 평균 0, 표준편차 1을 따르는 정규분포 난수를 가지는 텐서
random_normal_tensor = torch.randn(3, 4)
print(random_normal_tensor)
```

## 5. 특정 값으로 채운 텐서

```python
# 0으로 채운 텐서
zeros_tensor = torch.zeros(3, 4)
print(zeros_tensor)

# 1로 채운 텐서
ones_tensor = torch.ones(3, 4)
print(ones_tensor)

# 특정 값으로 채운 텐서
filled_tensor = torch.full((3, 4), 7)
print(filled_tensor)
```

## 6. 텐서 연산

### 6.1 기본 연산

```python
tensor = torch.tensor([1, 2, 3])
print(tensor + 10)  # 요소별 덧셈
print(torch.add(tensor, 10))

print(tensor - 5)  # 요소별 뺄셈
print(torch.sub(tensor, 5))

print(tensor * 3)  # 요소별 곱셈
```

### 6.2 행렬 연산

```python
A = torch.tensor([
    [1, 2],
    [3, 4]
])
B = torch.tensor([
    [5, 6],
    [7, 8]
])

# 요소별 곱셈
C = A * B  # 요소별 곱셈 (Hadamard product)
# TIP: 행렬 곱셈을 원할 경우 torch.matmul(A, B) 또는 A @ B 사용
print(C)

# 행렬 곱셈
D = A @ B
print(D)
```

## 마무리
PyTorch를 활용하면 강력한 수학 연산을 수행할 수 있으며, 딥러닝 모델을 개발하는 데 유용합니다.

