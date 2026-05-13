# RN Harness Engineering

React Native + TypeScript 프로젝트의 코드 컨벤션을 6단계 서브에이전트
파이프라인으로 강제하는 Claude Code 하네스.

각 단계마다 인격(페르소나)이 부여된 서브에이전트가 호출되고, 단계마다
적합한 모델 등급을 사용해 품질과 비용을 균형 잡는다.

---

## 📋 사전 요구사항

- **Claude Code CLI** 2.1.111 이상 (Opus 4.7 사용에 필요)
- **yarn** 1.22 이상 (`yarn --version`으로 확인)
- **Node.js** 18 이상
- **GitHub Personal Access Token** (PAT) — repo + read:org 스코프
- 본 하네스가 가정하는 RN 컨벤션 스킬 파일들이 이미
  `.claude/skills/rn-conventions/` 폴더에 배치되어 있어야 함

---

## 🚀 설치 (최초 1회)

### 1. 아카이브 압축 해제

이 압축파일을 프로젝트 루트에서 풀고, 기존 RN 컨벤션 스킬 파일을
`.claude/skills/rn-conventions/` 폴더에 배치한다.

```
프로젝트 루트/
├── CLAUDE.md                         # 압축에 포함
├── .mcp.json                         # 압축에 포함
├── .gitignore.append                 # 압축에 포함 (참고용)
├── .claude/
│   ├── settings.json                 # 압축에 포함
│   ├── agents/                       # 압축에 포함 (6개)
│   ├── commands/                     # 압축에 포함 (3개)
│   ├── hooks/                        # 압축에 포함 (3개)
│   ├── workspace/                    # 자동 생성됨
│   └── skills/
│       └── rn-conventions/           # ← 사용자가 직접 배치
│           ├── SKILL.md
│           ├── naming.md
│           ├── typescript.md
│           ├── components.md
│           ├── api-layer.md
│           ├── state.md
│           ├── testing.md
│           ├── gotchas.md
│           └── examples/
│               ├── component.tsx
│               ├── hook.ts
│               └── api-module.ts
```

### 2. `.gitignore` 업데이트

```bash
cat .gitignore.append >> .gitignore
rm .gitignore.append
```

### 3. hook 스크립트 실행 권한 확인

```bash
chmod +x .claude/hooks/*.sh
```

### 4. GitHub Personal Access Token 발급

1. https://github.com/settings/tokens 접속
2. **Generate new token (classic)** 클릭
3. 이름: `Claude RN Harness`
4. 스코프 선택:
   - `repo` (PR 생성, 코멘트, 라벨 — 필수)
   - `read:org` (조직 레포 접근 — 조직 사용 시)
   - `read:user` (선택)
5. **Generate token** 클릭 후 토큰 복사 (한 번만 표시됨)

### 5. PAT를 셸 환경변수로 등록

`~/.zshrc` 또는 `~/.bashrc`에 추가:

```bash
export GITHUB_PAT="ghp_여기에_토큰_붙여넣기"
```

적용:
```bash
source ~/.zshrc   # 또는 ~/.bashrc
```

> 보안: PAT는 절대 코드/문서에 하드코딩하지 말 것. `.env` 파일에 두고
> `.gitignore`에 포함되었는지 확인한다.

### 6. GitHub MCP 서버 등록 (Claude Code)

프로젝트 루트에서 다음 명령 실행 (Claude Code CLI 밖, 일반 터미널):

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  -H "Authorization: Bearer $GITHUB_PAT"
```

설치 확인:
```bash
claude mcp list
# github ✅ 가 표시되어야 함
```

> `.mcp.json`은 팀 공유용으로 이미 압축에 포함되어 있다.
> `${GITHUB_PAT}` 환경변수 참조 방식이므로 각자 PAT만 셸에 등록하면 된다.
> 팀원이 다른 PAT를 쓰려면 `claude mcp add ... --scope local`로
> 개인 로컬 설정에 덮어쓸 수 있다.

### 7. 첫 실행 점검

```bash
claude
# Claude Code 진입 후
> /agents
# architect, auditor, craftsman, diagnostician, reporter, mentor 표시 확인
```

```
> /help
# /rn-build, /rn-plan, /rn-review 표시 확인
```

---

## 🎯 사용법

### 풀 파이프라인 (신규 기능)

```
> /rn-build "사용자가 상품을 즐겨찾기에 추가/제거할 수 있는 기능"
```

진행 예시:
```
✅ Stage 1 (계획) 완료 — 5개 레이어 영향, Zustand persist 결정
✅ Stage 2 (검증) 완료 — PASS, WARNING 2건
✅ Stage 3 (구현) 완료 — 8개 파일 생성
✅ Stage 4 (분석) 완료 — BLOCKER 0, WARNING 3
✅ Stage 5 (PR) 완료 — #123 (draft) 생성
✅ Stage 6 (리뷰) 완료 — APPROVE, 라인 코멘트 4건

🎉 파이프라인 완료
🔗 https://github.com/owner/repo/pull/123
```

### 계획만 빠르게

```
> /rn-plan "다국어 지원 도입"
```

→ `architect` + `auditor`만 실행. 구현/PR/리뷰는 건너뜀.

### 기존 PR 단독 리뷰

```
> /rn-review 456
```

또는 PR 번호 생략 시 현재 브랜치의 활성 PR을 자동 탐색.

### 서브에이전트 직접 호출 (고급)

특정 단계만 실행하고 싶을 때:
```
> @architect 위치 권한 처리 로직을 설계해줘
> @auditor 방금 계획 검증해줘
> @mentor PR #789를 리뷰해줘
```

---

## 🧠 모델 매핑

| Stage | 에이전트 | 페르소나 | 모델 | 이유 |
|---|---|---|---|---|
| ① | `@architect` | 건축가 | Opus 4.7 (plan 모드) | 첫 결정의 무게, 추론 깊이 |
| ② | `@auditor` | 감사관 | Sonnet 4.6 | 적대적 페르소나 + 모델 등급 차이로 self-bias 회피 |
| ③ | `@craftsman` | 장인 | Sonnet 4.6 | 어려운 결정 끝난 후의 구현 — 비용/품질 균형 |
| ④ | `@diagnostician` | 내과의 | Haiku 4.5 | 체크리스트 대조 — 빠르고 저렴해야 |
| ⑤ | `@reporter` | 기자 | Sonnet 4.6 | 글쓰기 품질 |
| ⑥ | `@mentor` | 스승 | Opus 4.7 (effort: high) | 최종 게이트, self-verification |

**비용**: 풀 파이프라인 1회 약 **$3~$8** (변경 규모에 따라 다름).
단순 작업은 `/rn-build`를 쓰지 말고 직접 처리하라.

---

## 🛡️ 자동 가드레일 (Hooks)

다음은 페르소나가 흔들려도 시스템 레벨에서 잡힌다:

| Hook | 이벤트 | 차단 대상 |
|---|---|---|
| `block-forbidden-patterns.sh` | Edit/Write 직전 | `Alert.alert(`, `: any`, 인라인 스타일, 색상 hex 하드코딩, 문서 내 `npm` |
| `block-npm-commands.sh` | Bash 직전 | `npm install`, `npm run` 등 모든 npm 명령 |
| `autofix-after-edit.sh` | Edit/Write 직후 | `yarn lint --fix`로 자동 정리 |

차단되면 Claude는 즉시 피드백을 받고 다시 시도한다.

---

## 📁 단계 간 상태 파일

`.claude/workspace/`에 각 단계 산출물이 저장됨 (gitignore 처리됨):

| 파일 | 작성자 | 형식 |
|---|---|---|
| `plan.md` | architect | 구조화 마크다운 |
| `verification.md` | auditor | PASS/FAIL + 3-tier 분류 |
| `changed-files.txt` | craftsman | 파일 경로 라인별 |
| `diagnosis.json` | diagnostician | JSON (machine-readable) |
| `pr.md` | reporter | PR 본문 사본 |
| `pr-info.json` | reporter | PR 번호/URL 메타 |
| `review.md` | mentor | 라인 코멘트 사본 |

---

## 🔧 트러블슈팅

### `/agents`에 서브에이전트가 보이지 않는다
- `.claude/agents/*.md` 파일이 있는지 확인
- Claude Code 세션을 종료하고 다시 진입 (`claude`)

### GitHub MCP 호출 실패
- `claude mcp list`로 등록 상태 확인
- PAT 만료 여부 확인 (`https://github.com/settings/tokens`)
- 환경변수 확인: `echo $GITHUB_PAT`

### Hook이 작동하지 않는다
- 실행 권한: `ls -la .claude/hooks/` → `-rwxr-xr-x` 확인
- 권한 없으면: `chmod +x .claude/hooks/*.sh`

### Stage 4에서 계속 BLOCKER가 잡힌다
- `diagnosis.json`의 violations 배열을 직접 검토
- gotchas.md 해당 항목 재확인
- 정말 의도적 일탈이면 craftsman에게 사유를 plan.md에 명시하게 한 뒤
  다시 파이프라인 실행 (auditor가 의도적 일탈을 WARNING으로 분류함)

### `npm` 명령이 자동으로 거부됨
- 의도된 동작이다. yarn으로 변환하라:
  - `npm install` → `yarn install`
  - `npm install <pkg>` → `yarn add <pkg>`
  - `npm run <script>` → `yarn <script>`

---

## 📦 점진적 도입 권장 순서

처음부터 6개를 다 쓰지 말고:

1. **Week 1**: `CLAUDE.md` + 스킬 폴더만 사용. 일반 대화로 코딩.
2. **Week 2**: `@architect` + `@craftsman` 2개 활성화. 직접 호출.
3. **Week 3**: `@mentor` 추가. 3단계 파이프라인.
4. **Week 4+**: `/rn-build`로 풀 6단계.

처음부터 풀 파이프라인을 강제하면 단순 작업에도 비용이 발생한다.

---

## 📝 라이선스

이 하네스 자체는 사용자가 자유롭게 수정 가능.
RN 컨벤션 스킬은 별도 출처를 따른다.
