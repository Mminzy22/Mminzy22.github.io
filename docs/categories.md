# 카테고리 구조

2026-10-30에 최상위 카테고리를 22개에서 9개 주제 영역으로 통합했다. (커밋 `a6776fe`)

## 구조

| 최상위 | 하위 |
|---|---|
| **AI** | Machine Learning · Deep Learning · LangChain · LangGraph · CrewAI |
| **Backend** | Django · DRF · Celery · Web · Java · Spring |
| **Python** | Pandas · NumPy (하위 없이 바로 넣어도 됨) |
| **Data** | SQL · SQLD · Airflow · Druid · Kafka |
| **Cloud** | AWS · Database (하위 없이 바로 넣어도 됨) |
| **DevOps** | GitHub Actions · Docker · Git · Linux |
| **CS** | 자료구조 · 운영체제 · 네트워크 · 보안 · 아키텍처 |
| **프로젝트** | AInfo · Kickytime · Streamlit |
| **WIL** | — |

## 글 쓸 때 규칙

1. 카테고리는 `[최상위, 하위]` 두 개만 쓴다. Notion의 "카테고리"에는 **최상위를 먼저** 넣는다. 넣은 순서가 곧 계층이다.
2. 최상위는 위 9개 중에서만 고른다. 새 기술은 최상위를 만들지 않고 하위로 추가한다. (예: Kubernetes → `DevOps › Kubernetes`)
3. 하위가 애매하거나 관계를 남기고 싶으면 태그로 보완한다. (예: LangGraph 글에 `LangChain` 태그)
4. 시리즈 이름은 카테고리가 아니라 태그로 붙인다. (예: `SAA`, `서비스 가이드`)
