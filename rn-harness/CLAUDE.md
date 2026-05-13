# RN 프로젝트 - 6단계 Harness Engineering

이 프로젝트는 React Native 코드 컨벤션을 6단계 서브에이전트 파이프라인으로
강제하는 하네스를 갖추고 있다. 매 작업은 이 헌법을 따른다.

---

## 패키지 매니저

이 프로젝트는 **yarn만 사용**한다. `npm` 명령은 절대 실행하지 않는다.

| 작업 | 명령 |
|---|---|
| 의존성 설치 | `yarn install` (또는 `yarn`) |
| 패키지 추가 | `yarn add <pkg>` / `yarn add -D <pkg>` |
| 스크립트 실행 | `yarn <script>` |
| 락파일 | `yarn.lock` (수정 금지, 커밋 필수) |

**금지**: `npm install`, `npm i`, `npm run`, `package-lock.json` 생성

---

## 빌드/테스트 명령

```bash
yarn lint              # ESLint
yarn lint:fix          # ESLint 자동 수정
yarn typecheck         # TypeScript 검사
yarn test              # Jest 단위/통합 테스트
yarn test:watch        # Jest watch 모드
yarn test:coverage     # 커버리지 리포트
yarn e2e               # Maestro E2E 테스트
```

---

## 6단계 하네스 — 작업 처리 규칙

새로운 기능 개발 요청이 들어오면 다음 흐름을 따른다:

1. **단순 작업**(타이포, 색상 토큰 변경, 한 줄 수정)
   → 직접 처리. 하네스 호출 불필요

2. **신규 기능 / 다파일 변경 / 새 도메인 추가**
   → `/rn-build "<기능 설명>"` 슬래시 명령 안내

3. **기존 PR/diff 리뷰만 필요**
   → `/rn-review` 명령 안내

서브에이전트는 다음 6종이 있다:

| Stage | 에이전트 | 역할 |
|---|---|---|
| ① | `@architect` | 계획 (코드 작성 금지) |
| ② | `@auditor` | 계획 검증 (BLOCKER 판정) |
| ③ | `@craftsman` | 구현 |
| ④ | `@diagnostician` | 정적 분석 (JSON 출력) |
| ⑤ | `@reporter` | PR 본문 + 실제 PR 생성 |
| ⑥ | `@mentor` | 최종 리뷰 + PR 코멘트 |

---

## RN 컨벤션 — 절대 위반 금지

`.claude/skills/rn-conventions/` 폴더의 스킬 문서가 단일 진실 소스(SST).
모든 코드 결정은 해당 문서의 섹션 번호를 인용해야 한다.

핵심 금지 사항 (gotchas.md 전체 참조):
- `Alert.alert()` 사용 → Zustand 팝업 스택만 사용
- `any` 타입 → `unknown` + 타입가드
- 인라인 스타일 → `StyleSheet.create`
- 색상/폰트 하드코딩 → `colors`, `Fonts` 객체
- 비즈니스 로직을 컴포넌트/훅에 작성 → `services/`로 이동
- `npm` 명령 → `yarn` 사용

---

## 단계 간 상태 파일

각 서브에이전트는 `.claude/workspace/` 디렉토리에 산출물을 저장한다.
이 디렉토리는 `.gitignore`에 포함되어 있다 (git 추적 안 함).

```
.claude/workspace/
├── plan.md              # @architect 출력
├── verification.md      # @auditor 출력
├── changed-files.txt    # @craftsman 출력
├── diagnosis.json       # @diagnostician 출력
├── pr.md                # @reporter 출력
└── review.md            # @mentor 출력
```

다음 단계 서브에이전트는 이전 단계의 파일을 입력으로 읽는다.

---

## GitHub 통합

GitHub MCP 서버가 연결되어 있다. `@reporter`는 PR을 직접 생성하고,
`@mentor`는 생성된 PR에 라인 단위 코멘트를 작성한다.

설치 확인: `claude mcp list` → `github` ✅ 표시 필요
설치 명령: `README.md`의 "GitHub MCP 설치" 섹션 참조

---

## 작업 시작 시 행동 강령

1. 사용자 요청을 받으면 **먼저 단순/복잡을 판정**한다.
2. 복잡한 작업이면 곧바로 코드를 작성하지 말고 `/rn-build` 안내.
3. RN 컨벤션 위반을 발견하면 반드시 `gotchas.md`의 항목 번호 인용.
4. `yarn` 외 다른 패키지 매니저 명령은 거부하고 사용자에게 알린다.
