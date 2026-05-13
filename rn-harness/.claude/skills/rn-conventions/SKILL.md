---
description: >
  React Native + TypeScript 컴포넌트 작성, 네이밍, API 모듈 구조,
  상태 관리, 테스트 작성 시 팀 컨벤션을 따르도록 가이드.
  RN 코드 리뷰, 신규 컴포넌트/훅/API 모듈 생성 작업에 자동 적용.
---

# React Native 코드 컨벤션 스킬

이 스킬은 React Native + TypeScript 프로젝트의 팀 코드 컨벤션을 Claude가 항상 준수하도록 안내한다.

## 기술 스택 전제

| 역할 | 라이브러리 |
|---|---|
| 서버 상태 | TanStack Query (React Query) |
| 전역 상태 | Zustand |
| HTTP 클라이언트 | Axios |
| 네비게이션 | React Navigation |
| 단위/통합 테스트 | Jest + RNTL |
| API 모킹 | MSW |
| E2E | Maestro |

---

## 핵심 규칙 요약

### 네이밍 ([상세 → naming.md](naming.md))
- 파일명: 컴포넌트 `PascalCase.tsx`, 나머지 `camelCase.ts`
- 변수/함수: `camelCase`, 타입/인터페이스: `PascalCase`, 상수: `UPPER_SNAKE_CASE`
- API 함수 접두사: `get*`(조회) `request*`(작업요청) `edit*`(수정) `delete*`(삭제) 등

### TypeScript ([상세 → typescript.md](typescript.md))
- **`any` 사용 금지** — 부득이하면 `unknown` + 타입가드
- 클라이언트 전용(Props, Hook 반환) → `interface`, 서버 연동 타입(API 요청/응답) → `type`
- Export: 컴포넌트/훅/API모듈 → `default export`, 유틸/타입/스토어액션 → `named export`

### 컴포넌트 ([상세 → components.md](components.md))
- 순서: Props 인터페이스 → 훅 → 로컬 상태 → 전역 상태 → 파생값(useMemo) → 콜백(useCallback) → Effects → JSX → 정적 스타일
- **인라인 스타일 금지** — 모든 스타일은 `StyleSheet.create`로 분리
- **색상/폰트 하드코딩 금지** — `colors`, `Fonts` 객체 사용
- `useCallback`: 자식 props 전달 또는 useEffect 의존성 포함 시에만 사용 (남용 금지)
- `useMemo`: 동적 스타일, 고비용 연산, 참조 안정화 필요 시에만 사용

### API 레이어 ([상세 → api-layer.md](api-layer.md))
- 도메인별 파일 분리 (`users.ts`, `products.ts`)하고 `default export` 객체로 관리
- 사용: `API.users.getProfile()` 패턴
- 인터셉터에서 공통 에러/인증 처리 중앙화

### 상태 관리 ([상세 → state.md](state.md))
- 로컬 → `useState`, 전역 → `Zustand`, 서버 → `React Query`
- Zustand 스토어: 액션 함수는 스토어 외부에 `named export`로 분리
- 비즈니스 로직(API 결과 가공, 여러 액션 조합)은 `services/`에 위치 — 컴포넌트/훅에서 직접 처리 금지

### 에러 처리
- **`Alert.alert()` 사용 금지** — Zustand 기반 전역 팝업 패턴 사용
- 단순 피드백 → Toast, 확인/선택 필요 → 팝업
- 기술적 에러 메시지 (`'AxiosError: 500'`) 사용자에게 노출 금지

### 테스트 ([상세 → testing.md](testing.md))
- 구현 세부사항이 아닌 **동작(behavior)** 기준 테스트
- 요소 선택: `getByText` / `getByRole` 우선, `getByTestId` 최후 수단
- API 모킹: MSW 핸들러 사용 — Axios 인스턴스 직접 모킹 금지
- React Query 테스트: `retry: false`, `gcTime: 0` 설정 필수

---

## 자주 틀리는 패턴 ([상세 → gotchas.md](gotchas.md))

Claude가 기본값으로 돌아가려는 위험 지점:

| 상황 | ❌ 금지 | ✅ 올바른 방식 |
|---|---|---|
| 사용자 알림 | `Alert.alert()` | Zustand 팝업 스택 |
| 스타일 작성 | `style={{flex: 1}}` | `StyleSheet.create` |
| 타입 | `any` | `unknown` + 타입가드 |
| useCallback | 모든 함수에 적용 | 자식 props/useEffect 의존성만 |
| 색상 | `'#2079BB'` | `colors.main.primary` |
| 비즈니스 로직 위치 | 컴포넌트/훅 내부 | `services/` 레이어 |

---

## 상세 파일 안내

| 파일 | 내용 |
|---|---|
| [gotchas.md](gotchas.md) | 안티패턴 및 금지 규칙 모음 |
| [naming.md](naming.md) | 4장 — 파일/변수/함수/API 네이밍 규칙 |
| [typescript.md](typescript.md) | 5장 — interface vs type, export 방식 |
| [components.md](components.md) | 10장 컴포넌트 작성 + 11장 스타일 시스템 |
| [api-layer.md](api-layer.md) | 7장 API 레이어 + 4.3 API 함수 네이밍 |
| [state.md](state.md) | 8장 상태 관리 + 9장 Custom Hooks |
| [testing.md](testing.md) | 15장 테스트 전략 (Jest/RNTL/MSW/Maestro) |
| [examples/component.tsx](examples/component.tsx) | 컴포넌트 보일러플레이트 |
| [examples/hook.ts](examples/hook.ts) | Custom Hook 보일러플레이트 |
| [examples/api-module.ts](examples/api-module.ts) | API 모듈 보일러플레이트 |
