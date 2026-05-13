---
name: rn-build
description: |
  RN 신규 기능을 6단계 하네스로 처리한다.
  사용법: /rn-build "<기능 설명>"
---

# RN 풀 파이프라인 빌드

사용자 요청: $ARGUMENTS

## 사전 점검

1. `.claude/workspace/` 디렉토리가 없으면 생성한다.
2. 이전 실행 산출물이 남아있으면 사용자에게 확인 후 삭제:
   - `plan.md`, `verification.md`, `diagnosis.json`, `pr.md`, `pr-info.json`, `review.md`, `changed-files.txt`

3. GitHub MCP 서버 연결 확인:
   ```bash
   claude mcp list | grep github
   ```
   연결되지 않았으면 사용자에게 README의 설치 가이드 안내 후 중단.

4. yarn 사용 가능 확인:
   ```bash
   yarn --version
   ```

## 파이프라인 실행

다음 순서로 서브에이전트를 호출한다. 각 단계 완료 후 사용자에게
한 줄로 진행 상황을 보고하고, 단계 산출물을 짧게 요약한 뒤 다음 단계로
진행한다.

### Step 1: 계획
@architect 호출 — 사용자 요청 `$ARGUMENTS` 전달.
완료 후 `.claude/workspace/plan.md` 존재 확인.

### Step 2: 계획 검증
@auditor 호출.
- `verification.md`에서 판정 확인.
- **PASS**: Step 3으로 진행.
- **FAIL**: BLOCKER를 요약해 사용자에게 보고. 자동 재시도 1회 — @architect를
  재호출해 plan.md를 갱신하게 한 뒤 @auditor 재호출.
  2회째도 FAIL이면 사용자에게 수동 개입 요청 후 중단.

### Step 3: 구현
@craftsman 호출.
- 완료 후 `changed-files.txt` 존재 확인.
- 중단 메시지(계획에 없는 결정 필요)가 나오면 사용자에게 보고 후
  Step 1로 회귀.

### Step 4: 정적 분석
@diagnostician 호출.
- `diagnosis.json`의 `summary.blockers` 확인.
- **0**: Step 5로 진행.
- **>0**: @craftsman 재호출하여 violations 해결. 그 후 Step 4 재실행.
  최대 2회 시도. 2회 후에도 BLOCKER가 남으면 사용자에게 수동 개입 요청.

### Step 5: PR 생성
@reporter 호출.
- `pr-info.json` 존재 + PR URL 확인.
- GitHub MCP 호출 실패 시 사용자에게 PAT 권한 확인 안내.

### Step 6: 최종 리뷰
@mentor 호출.
- `review.md`의 판정 확인.
- **APPROVE**: 완료 안내.
- **REQUEST_CHANGES**: @craftsman 재호출 → Step 4부터 재실행 (최대 1회).
- **COMMENT**: 사용자 판단 요청.

## 진행 상황 보고 형식

각 단계 사이에 정확히 다음 형식으로 한 줄 보고:

```
✅ Stage N (<이름>) 완료 — <한 줄 요약>
```

예시:
```
✅ Stage 1 (계획) 완료 — 5개 레이어 영향, React Query + Zustand persist 결정
✅ Stage 2 (검증) 완료 — PASS, WARNING 2건
✅ Stage 3 (구현) 완료 — 8개 파일 생성, lint/typecheck/test 통과
✅ Stage 4 (분석) 완료 — BLOCKER 0, WARNING 3
✅ Stage 5 (PR) 완료 — #123 (draft) 생성
✅ Stage 6 (리뷰) 완료 — APPROVE, 라인 코멘트 4건

🎉 파이프라인 완료
🔗 https://github.com/owner/repo/pull/123
```

## 자동 회귀 정책 요약

| 단계 | 실패 시 | 재시도 한도 |
|---|---|---|
| Stage 2 FAIL | Stage 1 → 2 재실행 | 1회 |
| Stage 3 중단 | Stage 1 → 2 → 3 재실행 | 1회 |
| Stage 4 BLOCKER | Stage 3 → 4 재실행 | 2회 |
| Stage 6 REQUEST_CHANGES | Stage 3 → 4 → 5(기존 PR push) → 6 | 1회 |

한도 초과 시 사용자 수동 개입 요청.

## 비용 안내

이 파이프라인은 Opus 2회 + Sonnet 3회 + Haiku 1회 호출.
평균 세션 비용 약 $3~$8 예상. 단순 작업은 `/rn-build`를 쓰지 말고
직접 처리하라.
