#!/bin/bash
# block-forbidden-patterns.sh
#
# Claude Code PreToolUse Hook
# Edit/Write 도구 호출 직전에 실행되어, 절대 금지 패턴이 포함된
# 변경을 차단한다.
#
# 입력: stdin으로 JSON (tool_input.file_path, tool_input.new_string 등)
# 출력 규약:
#   - exit 0: 통과 (변경 허용)
#   - exit 2: 차단 (Claude에게 stderr 메시지 피드백)
#
# 차단 대상:
#   1. Alert.alert(  — gotchas#1
#   2. : any 타입    — gotchas#2
#   3. style={{      — gotchas#3 (인라인 스타일)
#   4. npm 명령      — yarn 강제
#
# 단, 다음 파일은 예외:
#   - .claude/skills/**  (스킬 문서 자체에 패턴 인용됨)
#   - **/__tests__/**     (테스트는 일부 패턴 검사 완화)

set -euo pipefail

# stdin에서 JSON 읽기
INPUT="$(cat)"

# jq가 있으면 파싱, 없으면 grep으로 폴백
if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')
  NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // .tool_input.file_text // .tool_input.content // ""')
else
  FILE_PATH=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' | head -1)
  NEW_CONTENT=$(echo "$INPUT" | grep -oP '"new_string"\s*:\s*"\K[^"]+' | head -1)
fi

# 검사 제외 경로
case "$FILE_PATH" in
  *".claude/skills/"*) exit 0 ;;
  *"/node_modules/"*) exit 0 ;;
  *"/.git/"*) exit 0 ;;
esac

VIOLATIONS=()

# 1. Alert.alert (gotchas#1)
if echo "$NEW_CONTENT" | grep -qE 'Alert\.alert\('; then
  VIOLATIONS+=("🔴 gotchas#1: Alert.alert() 사용 금지. Zustand 팝업 스택 또는 Toast 사용.")
fi

# 2. any 타입 (gotchas#2)
# `: any` (변수/파라미터 어노테이션), `<any>` (제네릭), `as any` (단언)
if echo "$NEW_CONTENT" | grep -qE ':[[:space:]]*any\b|<any>|\bas[[:space:]]+any\b'; then
  VIOLATIONS+=("🔴 gotchas#2: any 타입 금지. unknown + 타입가드 또는 정확한 타입 사용.")
fi

# 3. 인라인 스타일 (gotchas#3) — 컴포넌트 파일만 검사
case "$FILE_PATH" in
  *.tsx|*.jsx)
    if echo "$NEW_CONTENT" | grep -qE 'style=\{\{'; then
      VIOLATIONS+=("🔴 gotchas#3: 인라인 스타일 금지. StyleSheet.create로 분리.")
    fi
    ;;
esac

# 4. npm 명령 (사용자 룰: yarn 강제)
# 문서/스크립트 파일에 npm install/run 명령이 있으면 차단
case "$FILE_PATH" in
  *.md|*.json|*.sh|*.yml|*.yaml)
    if echo "$NEW_CONTENT" | grep -qE '\bnpm (install|i|run|test|start|build|ci) '; then
      VIOLATIONS+=("🔴 패키지 매니저 규칙: npm 명령 금지. yarn 사용.")
    fi
    ;;
esac

# 5. 색상 하드코딩 (gotchas#4) — 컴포넌트/훅 파일만, colors/fonts 정의 파일 제외
case "$FILE_PATH" in
  *"/styles/colors."*|*"/styles/fonts."*) ;;
  *.tsx|*.ts)
    # CSS 컬러 hex 패턴 (3, 6, 8자리 hex)
    if echo "$NEW_CONTENT" | grep -qE "'#[0-9a-fA-F]{3,8}'|\"#[0-9a-fA-F]{3,8}\""; then
      VIOLATIONS+=("🔴 gotchas#4: 색상 하드코딩 금지. colors 객체 사용.")
    fi
    ;;
esac

# 결과
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  echo "RN 컨벤션 위반 — 변경 차단됨:" >&2
  echo "" >&2
  for v in "${VIOLATIONS[@]}"; do
    echo "  $v" >&2
  done
  echo "" >&2
  echo "파일: $FILE_PATH" >&2
  echo "수정 후 다시 시도하세요. 또는 @craftsman으로 돌아가 보일러플레이트를 참고하세요." >&2
  exit 2
fi

exit 0
