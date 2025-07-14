---
title: "pre-commit으로 코드 관리 자동화"
author: mminzy22
date: 2025-07-13 21:00:00 +0900
categories: [Development]
tags: [TIL, pre-commit, 코드 품질, 자동화]
description: "pre-commit 도구를 사용해 Git 커밋 시 자동으로 코드 포맷팅, 린트, 불필요한 공백 제거 등 다양한 검사를 적용하는 방법"
pin: false
mermaid: true
---


## pre-commit이란?

pre-commit은 Git hook을 관리해주는 도구로, **커밋 시점에서 코드 품질 검사를 자동으로 수행**하도록 도와줍니다. 코드 스타일 오류나 포맷 문제, 린트 경고 등을 커밋 전에 잡아내어 코드 리뷰어가 아키텍처나 설계에 집중할 수 있게 해 줍니다.

### pre-commit을 쓰는 이유

* 커밋 전 자동 검사로 코드 품질 보장
* 반복적인 스타일 지적 감소
* 프로젝트 간 공통된 hook 설정 재사용 가능
* 다양한 언어/도구 지원 (Python, Node, Ruby 등)

처음에는 각 프로젝트에서 Bash 스크립트를 복사해 쓰던 것을, **공유 가능한 설정 파일**로 관리할 수 있도록 만든 것이 pre-commit입니다.

---

## 기본 설치 방법

pre-commit은 Python 기반 도구이므로 pip로 설치가 가능합니다.

```bash
pip install pre-commit
```

Python 프로젝트라면 `requirements.txt`나 `requirements-dev.txt`에 추가해 관리하는 것을 권장합니다.

또는, 파이썬 zipapp으로 독립적인 실행 파일을 사용할 수도 있습니다.

* Github Releases에서 `.pyz` 파일 다운로드
* 실행 시: `python pre-commit-#.#.#.pyz ...`

---

## 프로젝트에 적용하는 단계별 가이드

### ① pre-commit 설치 확인

```bash
pre-commit --version
# 예시 출력: pre-commit 4.2.0
```

---

### ② 설정 파일 작성하기

프로젝트 루트에 `.pre-commit-config.yaml` 파일을 생성합니다. 아래는 대표적인 예시입니다.

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v2.3.0
    hooks:
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
  - repo: https://github.com/psf/black
    rev: 22.10.0
    hooks:
      - id: black
```

> 다양한 린터나 포맷터의 공식 pre-commit hook 저장소를 지정할 수 있습니다.

---

### ③ Git hook 스크립트 설치하기

```bash
pre-commit install
```

실행 결과:

```
pre-commit installed at .git/hooks/pre-commit
```

- 이제부터 `git commit` 할 때마다 자동으로 설정된 hook이 실행됩니다.

---

### ④ 전체 파일에 한 번 적용하기 (권장)

처음 도입할 때는 기존 코드에도 모두 적용해보는 게 좋습니다.

```bash
pre-commit run --all-files
```

예시 로그:

```
Check Yaml.......................................Passed
Fix End of Files.................................Passed
Trim Trailing Whitespace.........................Failed
- hook id: trailing-whitespace
Files were modified by this hook. Additional output:
Fixing sample.py
black.............................................Passed
```

> 수정이 필요한 파일은 hook이 자동으로 고쳐줍니다.

---

## 자주 쓰는 명령어

| 명령어                          | 설명                                    |
| ---------------------------- | ------------------------------------- |
| `pre-commit install`         | 현재 저장소에 Git hook 설치                   |
| `pre-commit uninstall`       | pre-commit hook 제거                    |
| `pre-commit run`             | 현재 staged 된 파일에 대해서만 실행               |
| `pre-commit run --all-files` | 모든 파일에 대해 실행 (초기 적용시 추천)              |
| `pre-commit autoupdate`      | .pre-commit-config.yaml의 hook 버전 업데이트 |

---

## `.pre-commit-config.yaml` 구조 설명

`.pre-commit-config.yaml`는 다음과 같은 구조를 가집니다.

### repos

* hook을 제공하는 저장소 URL
* rev: 특정 태그/커밋 해시
* hooks: 사용할 hook id 목록

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.2.0
    hooks:
      - id: trailing-whitespace
```

### 기본 옵션

* `default_language_version`: 언어별 기본 버전 지정

```yaml
default_language_version:
  python: python3.8
```

* `default_stages`: hook을 적용할 git hook 단계 지정

```yaml
default_stages: [pre-commit, pre-push]
```

* `exclude`, `files`: 적용할/제외할 파일 패턴 지정 (정규표현식)

```yaml
exclude: '^docs/'
files: '\.py$'
```

* `fail_fast`: true이면 실패 시 즉시 멈춤

```yaml
fail_fast: true
```

---

## 로컬(프로젝트 전용) hook 만들기

프로젝트 내에서만 쓸 간단한 스크립트도 hook으로 추가할 수 있습니다.

```yaml
repos:
  - repo: local
    hooks:
      - id: check-requirements
        name: check requirements files
        entry: python -m scripts.check_requirements --compare
        language: system
        files: ^requirements.*\.txt$
```

* repo를 `local`로 하면 현재 프로젝트 내 경로에서 스크립트 실행
* language: system/script/docker\_image 등 다양한 방식 지원

---

## 자주 쓰는 hook 예시

* trailing-whitespace: 모든 라인의 불필요한 공백 제거
* end-of-file-fixer: 마지막 줄 개행 보장
* check-yaml: YAML 문법 검사
* black: Python 코드 포맷팅
* flake8: Python 린트
* prettier: JS/HTML/CSS 포맷터

---

## pre-commit을 CI에서 사용하기

CI에서도 pre-commit을 돌려서 일관성 보장을 할 수 있습니다.

```bash
pre-commit run --all-files
```

GitHub Actions 예시:

```yaml
- name: Run pre-commit
  uses: pre-commit/action@v3.0.0
```

> pre-commit.ci 서비스도 지원하며 PR에 자동으로 수정 커밋을 추가하는 기능이 있습니다.

---

## 유용한 옵션

* 특정 hook만 실행하기:

```bash
pre-commit run flake8
```

* 특정 파일만 검사하기:

```bash
pre-commit run --files path/to/file.py
```

* 특정 브랜치 범위에서 변경된 파일만 검사:

```bash
pre-commit run --from-ref origin/main --to-ref HEAD
```

* hook 캐시 정리:

```bash
pre-commit clean
pre-commit gc
```

---

## 마무리

- pre-commit은 다양한 언어와 툴을 지원하는 **멀티랭귀지 pre-commit hook 관리자**입니다.
- 설정 한 번으로 팀 전체 코드 스타일과 품질을 자동화할 수 있습니다.
- CI/CD에 쉽게 통합해 린트나 포맷을 강제할 수 있습니다.
