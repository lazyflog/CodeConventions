---
name: rn-plan
description: |
  코드 작성 없이 계획만 빠르게 받는다. 탐색용.
  사용법: /rn-plan "<기능 설명>"
---

# RN 계획 단계만 실행

사용자 요청: $ARGUMENTS

`/rn-build`의 Stage 1~2만 실행한다. 구현/PR/리뷰 단계로 자동
진행하지 않는다. 계획이 충분히 검토된 뒤 사용자가 직접
`/rn-build`를 호출하거나 `@craftsman`을 명시적으로 호출.

## 실행 순서

1. `.claude/workspace/` 디렉토리 준비
2. @architect 호출 — `$ARGUMENTS` 전달
3. plan.md 작성 확인
4. @auditor 호출
5. verification.md 작성 확인

## 종료 메시지

```
✅ 계획 단계 완료
📄 .claude/workspace/plan.md
📄 .claude/workspace/verification.md

판정: <PASS / FAIL>

다음 행동:
- 계획에 만족하면 `/rn-build "<같은 요청>"`으로 풀 파이프라인 실행
  (계획은 갱신되니 이때 다시 작성됨)
- 또는 계획을 수동으로 다듬은 뒤 @craftsman을 직접 호출
```
