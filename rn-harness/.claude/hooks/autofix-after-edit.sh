#!/bin/bash
# autofix-after-edit.sh
#
# Claude Code PostToolUse Hook (matcher: Edit|Write)
# 파일 편집 직후 ESLint 자동 수정과 Prettier 포맷팅을 실행.
# 실패해도 차단하지 않음 (exit 0 항상).
#
# 입력: stdin으로 JSON (tool_input.file_path)

set +e  # 에러가 나도 진행

INPUT="$(cat)"

if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')
else
  FILE_PATH=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' | head -1)
fi

# 빈 경로면 종료
[ -z "$FILE_PATH" ] && exit 0

# 검사 대상 확장자만
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

# 검사 제외 경로
case "$FILE_PATH" in
  *"/node_modules/"*|*"/.claude/"*|*"/build/"*|*"/dist/"*) exit 0 ;;
esac

# yarn lint:fix 가능 여부 확인 (package.json에 스크립트 존재 + node_modules 존재)
if [ ! -d node_modules ]; then
  exit 0
fi

# 해당 파일만 lint:fix
yarn lint --fix "$FILE_PATH" 2>/dev/null
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
  echo "ℹ️ ESLint가 자동 수정할 수 없는 문제를 발견했습니다: $FILE_PATH" >&2
  echo "   다음 단계에서 @diagnostician이 분석합니다." >&2
fi

exit 0
