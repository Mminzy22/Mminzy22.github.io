---
title: "ML: 강화 학습 개요"
author: mminzy22
date: 2024-12-05 10:13:00 +0900
categories: [Machine Learning]
tags: [Bootcamp, Python, Machine Learning, TIL]
description: "강화 학습의 기본 원리와 주요 알고리즘"
pin: false
---



강화 학습(Reinforcement Learning)은 에이전트(Agent)가 환경(Environment)과 상호작용하며 보상(Reward)을 최대화하는 방향으로 학습하는 머신러닝 기법입니다. 이번 글에서는 강화 학습의 **기본 원리**와 **주요 알고리즘**을 살펴보겠습니다.


#### 1. 강화 학습의 기본 원리

강화 학습은 문제를 해결하기 위해 다음과 같은 구성 요소를 기반으로 작동합니다.

**1) 주요 구성 요소**
- **에이전트(Agent):** 환경에서 행동(행위)을 수행하는 학습자.
- **환경(Environment):** 에이전트가 상호작용하는 세계.
- **행동(Action):** 에이전트가 환경에 대해 수행할 수 있는 선택.
- **상태(State):** 현재 환경의 상태를 나타내는 정보.
- **보상(Reward):** 특정 행동에 대해 에이전트가 받는 피드백.
- **정책(Policy):** 에이전트가 상태에 따라 행동을 선택하는 전략.
- **가치 함수(Value Function):** 각 상태의 장기적인 기대 보상을 예측하는 함수.

**2) 강화 학습의 과정**
1. 에이전트는 현재 상태에서 행동을 선택합니다.
2. 선택한 행동의 결과로 환경이 변화하고, 새로운 상태와 보상을 반환합니다.
3. 에이전트는 보상과 새로운 상태를 기반으로 정책을 업데이트합니다.
4. 이 과정을 반복하며, 에이전트는 최적의 정책을 학습합니다.

**강화 학습의 목표**
- **보상 최대화:** 장기적으로 누적 보상(Return)을 최대화하는 정책을 학습.


#### 2. 주요 알고리즘

강화 학습의 주요 알고리즘은 크게 **값 기반 학습**, **정책 기반 학습**, 그리고 **심층 강화 학습**으로 나뉩니다.


**(1) 값 기반 학습 (Value-Based Learning)**

값 기반 학습은 상태-행동의 가치를 학습하여 최적의 행동을 선택합니다. 대표적인 알고리즘은 **Q-Learning**입니다.

- **Q-Learning:**  
  상태-행동 쌍(State-Action Pair)에 대해 기대 보상을 학습합니다.  
  $$ Q(s, a) = Q(s, a) + \alpha \left[ r + \gamma \max_{a'} Q(s', a') - Q(s, a) \right] $$  
  - \\( Q(s, a) \\): 상태 \\( s \\)에서 행동 \\( a \\)를 선택했을 때의 기대 보상.  
  - \\( \alpha \\): 학습률.  
  - \\( \gamma \\): 할인율.  

**Q-Learning 구현 예제**
```python
import numpy as np

# 환경 정의
n_states = 5
n_actions = 2
Q = np.zeros((n_states, n_actions))

# 파라미터
alpha = 0.1  # 학습률
gamma = 0.9  # 할인율
epsilon = 0.1  # 탐험률

# Q-Learning 업데이트 함수
def update_Q(state, action, reward, next_state):
    max_next_Q = np.max(Q[next_state])
    Q[state, action] = Q[state, action] + alpha * (reward + gamma * max_next_Q - Q[state, action])

print("Q-Table after initialization:", Q)
```


**(2) 정책 기반 학습 (Policy-Based Learning)**

정책 기반 학습은 행동을 직접적으로 학습하며, 상태와 행동 간 확률 분포를 최적화합니다.

- **REINFORCE:**  
  확률적 정책을 사용하는 정책 경사 하강법 알고리즘.  
  $$ \theta = \theta + \alpha \nabla_\theta \log \pi_\theta (a \| s) R $$  
  - \\( \pi_\theta(a \| s) \\): 상태 \\( s \\)에서 행동 \\( a \\)를 선택할 확률.

**정책 기반 학습의 장점**
- 연속적인 행동 공간에서도 적용 가능.
- 고차원 상태에서 효율적.


**(3) 심층 강화 학습 (Deep Reinforcement Learning)**

심층 강화 학습은 심층 신경망(Deep Neural Networks)을 활용하여 강화 학습 문제를 해결합니다.

- **DQN (Deep Q-Network):**  
  Q-Learning에 딥러닝을 결합한 알고리즘으로, Q-값을 예측하기 위해 신경망을 사용.

**DQN의 특징**
- 대규모 상태 공간에서 효과적.
- 경험 재현(Replay Buffer)과 타깃 네트워크(Target Network)를 활용하여 안정적 학습.

**DQN 구현 예제 (구조)**
```python
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense

# DQN 모델 정의
model = Sequential([
    Dense(24, input_dim=4, activation='relu'),
    Dense(24, activation='relu'),
    Dense(2, activation='linear')  # 행동 공간의 크기
])
model.compile(optimizer='adam', loss='mse')
```


#### 강화 학습의 활용 사례

1. **게임 플레이:**  
   - 예: 알파고, 강화 학습을 통한 게임 최적화.
2. **로봇 공학:**  
   - 예: 로봇팔의 움직임 최적화, 자율주행.
3. **추천 시스템:**  
   - 예: 사용자 행동 기반의 맞춤형 추천.


#### 정리

- **기본 원리:** 강화 학습은 환경과의 상호작용을 통해 최적의 정책을 학습하며, 보상을 최대화하는 데 초점을 둡니다.
- **주요 알고리즘:** 값 기반(Q-Learning), 정책 기반(REINFORCE), 심층 강화 학습(DQN) 등.
- **활용:** 게임, 로봇, 추천 시스템 등 다양한 분야에서 강력한 성능을 발휘.

> **다음 글 예고:**  
> 강화 학습을 더 깊이 이해하기 위해 **"심층 강화 학습의 세부 원리와 응용"**을 다룰 예정입니다!
