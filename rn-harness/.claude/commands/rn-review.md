---
name: rn-review
description: |
  기존 PR이나 현재 diff를 @mentor에게만 보내 단독 리뷰한다.
  계획 파일이 없으므로 코드 자체에서 의도를 역추론.
  사용법: /rn-review [pr_number]
---

# RN 단독 리뷰 (Mentor만)

대상: $ARGUMENTS (생략 시 현재 브랜치의 활성 PR 또는 diff)

## 사전 점검

1. GitHub MCP 연결 확인
2. `$ARGUMENTS`가 숫자(PR 번호)면 해당 PR 정보를 GitHub MCP로 조회
3. 비어있으면:
   ```bash
   gh pr view --json number,headRefName,baseRefName 2>/dev/null \
     || git diff origin/HEAD..HEAD --stat
   ```
4. 둘 다 실패하면 사용자에게 PR 번호 입력 요청

## 워크스페이스 준비

대상 PR/diff 정보로 `.claude/workspace/pr-info.json` 생성:
```json
{
  "owner": "...",
  "repo": "...",
  "number": ...,
  "url": "...",
  "branch": "...",
  "base": "..."
}
```

`plan.md`, `verification.md`, `diagnosis.json`이 없으므로
@mentor에게 다음을 명시:
- "이 PR은 하네스 파이프라인 외부에서 작성되었음"
- "계획 ↔ 구현 정합성 대신 코드 자체에서 의도를 역추론"
- "diagnostician 재검증 차원만 적용"

## 실행

@mentor 호출. 시스템 프롬프트 변경 없이 기본 mentor 모드로 동작.

## 종료 메시지

@mentor의 종료 메시지를 그대로 전달 (APPROVE / REQUEST_CHANGES / COMMENT).
