#!/bin/bash
# block-npm-commands.sh
#
# Claude Code PreToolUse Hook (matcher: Bash)
# Bash 도구가 npm 명령을 실행하려 할 때 차단하고 yarn 사용을 안내.
#
# 입력: stdin으로 JSON (tool_input.command)
# 출력 규약: exit 2면 차단 + stderr 메시지를 Claude에게 피드백

set -euo pipefail

INPUT="$(cat)"

if command -v jq >/dev/null 2>&1; then
  CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
else
  CMD=$(echo "$INPUT" | grep -oP '"command"\s*:\s*"\K[^"]+' | head -1)
fi

# npm으로 시작하거나, &&/;/| 뒤에 npm이 오는 경우
if echo "$CMD" | grep -qE '(^|[\s;&|]+)npm\s+(install|i|run|test|start|build|ci|exec|update|outdated|audit)\b'; then
  echo "yarn을 사용해야 합니다. npm 명령은 이 프로젝트에서 금지입니다." >&2
  echo "" >&2
  echo "변환 가이드:" >&2
  echo "  npm install        → yarn install (또는 yarn)" >&2
  echo "  npm install <pkg>  → yarn add <pkg>" >&2
  echo "  npm install -D     → yarn add -D" >&2
  echo "  npm run <script>   → yarn <script>" >&2
  echo "  npm test           → yarn test" >&2
  echo "  npm ci             → yarn install --frozen-lockfile" >&2
  echo "" >&2
  echo "차단된 명령: $CMD" >&2
  exit 2
fi

# package-lock.json 생성 시도도 차단
if echo "$CMD" | grep -qE 'package-lock\.json'; then
  echo "package-lock.json은 이 프로젝트에서 금지입니다. yarn.lock만 사용하세요." >&2
  exit 2
fi

exit 0
