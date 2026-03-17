# Web Code Conventions (Next.js / React)

Next.js + React + TypeScript 프로젝트에 공통으로 적용할 수 있는 코드 컨벤션을 정의합니다.
특정 프로젝트에 종속되지 않는 구조, 패턴, 규칙을 다룹니다.

---

## 전제 조건

이 문서는 아래 기술 스택을 표준으로 전제한다.

| 역할 | 라이브러리 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| UI | React |
| 언어 | TypeScript |
| 스타일 | styled-components **또는** Tailwind CSS (프로젝트별 선택) |
| 서버 상태 | TanStack Query (React Query) |
| 전역 상태 | Zustand |
| HTTP 클라이언트 | Axios |
| 날짜 처리 | dayjs |
| 폼 관리 | React Hook Form |
| 포맷팅 | Prettier |
| 린팅 | ESLint |
| 커밋 규칙 | Commitlint (Conventional Commits) |

---

## 목차

1. [Formatting (Prettier)](#1-formatting-prettier)
2. [Linting (ESLint)](#2-linting-eslint)
3. [Commit Messages](#3-commit-messages)
4. [Naming Convention](#4-naming-convention)
5. [TypeScript](#5-typescript)
6. [Project Structure](#6-project-structure)
7. [API 레이어](#7-api-레이어)
8. [상태 관리](#8-상태-관리)
9. [Custom Hooks](#9-custom-hooks)
10. [Component 작성 규칙](#10-component-작성-규칙)
11. [스타일 시스템](#11-스타일-시스템)
12. [라우팅 (Next.js App Router)](#12-라우팅-nextjs-app-router)
13. [에러 처리](#13-에러-처리)
14. [임포트 순서](#14-임포트-순서)

---

## 1. Formatting (Prettier)

모든 웹 프로젝트에서 아래 설정을 표준으로 사용한다.

```js
// .prettierrc.js
module.exports = {
  bracketSpacing: false,   // {foo: bar} — 객체 괄호 공백 없음
  singleQuote: true,       // '싱글 따옴표'
  trailingComma: 'all',    // 후행 쉼표 항상 추가
  tabWidth: 2,             // 2칸 들여쓰기
  semi: true,              // 세미콜론 필수
  printWidth: 80,          // 최대 80자
  arrowParens: 'always',   // (param) => {} 항상 괄호
  jsxSingleQuote: false,   // JSX 속성은 더블 따옴표
};
```

**규칙 요약**

| 항목 | 값 | 예시 |
|---|---|---|
| 들여쓰기 | 2칸 | |
| 세미콜론 | 항상 | `const x = 1;` |
| 따옴표 | 작은따옴표 (JSX 속성은 큰따옴표) | `'string'`, `className="foo"` |
| 후행 쉼표 | 항상 | `{a, b,}` |
| 객체 괄호 공백 | 없음 | `{foo: bar}` |
| 화살표 함수 괄호 | 항상 | `(param) => {}` |
| 최대 줄 길이 | 80자 | |

---

## 2. Linting (ESLint)

모든 웹 프로젝트에서 아래 설정을 표준으로 사용한다.

```js
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['unused-imports'],
  rules: {
    'prettier/prettier': 'error',
    'unused-imports/no-unused-imports': 'error',   // 미사용 import → 에러
    'unused-imports/no-unused-vars': 'warn',        // 미사용 변수 → 경고
    '@typescript-eslint/no-explicit-any': 'error',  // any 사용 → 에러
  },
};
```

**미사용 변수**: `_`로 시작하는 변수는 경고 무시

```typescript
// ✅ 올바른 방식
const {_unusedParam, usedParam} = props;

// ❌ 피해야 할 방식
const {unusedParam, usedParam} = props;
```

---

## 3. Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) 명세를 따른다.

**형식**: `<type>: <description>`

**허용 타입**

| 타입 | 설명 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 포맷팅, 세미콜론 등 코드 스타일 변경 |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 추가 또는 수정 |
| `chore` | 빌드 프로세스, 의존성 관리 등 |
| `imp` | 기능 개선 (커스텀 타입) |
| `build`, `ci`, `perf`, `revert` | 표준 타입 |

**제약 조건**: 헤더 최대 100자

```
feat: 즐겨찾기 기능 추가
fix: 토큰 리프레시 로직 수정
chore: 버전 코드 bump
```

---

## 4. Naming Convention

### 4.1 파일 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| React 컴포넌트 | `PascalCase.tsx` | `UserProfile.tsx`, `SubmitButton.tsx` |
| Next.js 특수 파일 | 소문자 규칙 준수 | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| Custom Hook | `camelCase.ts` | `useAuth.ts`, `useInfiniteList.ts` |
| API 모듈 | `camelCase.ts` | `users.ts`, `products.ts` |
| 유틸리티 | `camelCase.ts` | `formatter.ts`, `storage.ts` |
| 스타일 (styled-components) | `camelCase.ts(x)` | `Button.styles.ts`, `common.styles.ts` |
| 타입 정의 | `camelCase.ts` | `routeType.ts`, `commonType.ts` |

### 4.2 변수/함수 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| 변수 | `camelCase` | `userName`, `isLoading` |
| 함수 | `동사+명사 camelCase` | `handleClickButton`, `formatDate` |
| 타입/인터페이스 | `PascalCase` | `User`, `ProductListProps` |
| Enum | `PascalCase` | `OrderStatus`, `UserRole` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |

### 4.3 API 함수 네이밍 접두사

| 접두사 | HTTP 메서드 | 의미 | 예시 |
|---|---|---|---|
| `get*` | GET | 데이터 조회 | `getUserProfile()` |
| `request*` | POST | 특정 작업 요청 | `requestPasswordReset()` |
| `send*` | POST | 데이터 전송 (알림, 메일 등) | `sendVerificationCode()` |
| `check*` | GET/POST | 유효성/중복 검사 | `checkDuplicateEmail()` |
| `set*` | PUT/POST | 데이터 설정/생성 | `setDefaultPayment()` |
| `edit*` | PUT/PATCH | 기존 데이터 수정 | `editUserInfo()` |
| `delete*` | DELETE | 데이터 삭제 | `deleteAccount()` |
| `upsert*` | PUT | 없으면 생성, 있으면 수정 | `upsertAddress()` |
| `fetch*` | GET | 비동기 데이터 가져오기 | `fetchProductList()` |

### 4.4 이벤트 핸들러 네이밍

React에서 이벤트는 `on` 접두사(prop)와 `handle` 접두사(구현)를 구분한다.

| 접두사 | 용도 | 예시 |
|---|---|---|
| `on*` | Props로 받는 이벤트 콜백 | `onSubmit`, `onClick`, `onChange` |
| `handle*` | 컴포넌트 내부 이벤트 구현 | `handleSubmit`, `handleClickButton` |

### 4.5 Custom Hook 네이밍

- `use*` 접두사 필수 (`useCurrentUser`, `useToast`)
- Hook이 반환하는 함수는 핵심 동작을 명확히 표현 (`fetchUser`, `showToast`)
- 이벤트 핸들러는 `handle*` 접두사 (`handleClickTab`, `handleChangeInput`)

---

## 5. TypeScript

### 5.1 경로 별칭

절대 경로 임포트를 위해 `tsconfig.json`에 경로 별칭을 설정한다.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

| 별칭 | 실제 경로 | 사용 예 |
|---|---|---|
| `@/*` | `./src/*` | `import API from '@/apis'` |

> 별칭 구성은 프로젝트마다 다를 수 있으며, 일관성 있는 체계를 갖추는 것이 핵심이다.

### 5.2 타입 정의 원칙

- 모든 변수, 함수에 명시적 타입 정의 (`noImplicitAny` 활성화)
- `any` 사용 금지 — 부득이한 경우 `unknown` 사용 후 타입 가드 적용

**`interface` vs `type` 사용 기준**

| 구분 | 키워드 | 예시 |
|---|---|---|
| 클라이언트 전용 (Props, Hook 반환, 컴포넌트 내부 구조) | `interface` | `SubmitButtonProps`, `UseAuthReturn` |
| 서버 연동 타입 (API 요청/응답, 모델) | `type` | `CreateOrderRequest`, `UserModel` |

```typescript
// ✅ 클라이언트 전용 → interface
interface SubmitButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface UseAuthReturn {
  user: User | null;
  signIn: (credentials: SignInRequest) => Promise<void>;
  signOut: () => void;
}

// ✅ 서버 연동 타입 → type
type CreateOrderRequest = {
  productId: number;
  quantity: number;
};

type UserModel = {
  id: number;
  name: string;
  email: string;
};

// ✅ 타입 가드 패턴
const isAdmin = 'role' in user;
```

### 5.3 Enum 사용

관련된 상수 그룹은 enum으로 관리

```typescript
export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}
```

### 5.4 Export 방식

| 대상 | 방식 | 이유 |
|---|---|---|
| 컴포넌트 | `export default` | Next.js page/layout 파일, dynamic import 등 default 기대 |
| Custom Hook | `export default` | 단일 훅 파일 — 파일명으로 식별 |
| API 모듈 | `export default` | `API.domain.method()` 패턴 유지 |
| 스토어 | `export default` (스토어 인스턴스) + named export (액션 함수) | 스토어는 단일, 액션은 직접 호출 |
| 유틸 함수 / 상수 | named export | 트리쉐이킹, 복수 함수 파일 |
| 타입 / 인터페이스 | named export | 명시적 임포트 강제 |

```typescript
// ✅ 컴포넌트 → default export
const SubmitButton = () => { ... };
export default SubmitButton;

// ✅ 훅 → default export
const useAuth = () => { ... };
export default useAuth;

// ✅ 유틸 → named export
export const formatDate = (date: Date) => { ... };
export const formatCurrency = (amount: number) => { ... };

// ✅ 타입 → named export
export type UserModel = { ... };
export interface SubmitButtonProps { ... }
```

---

## 6. Project Structure

```
src/
├── apis/                    # API 호출 함수 + 타입
│   ├── axiosInstance.ts     # Axios 인스턴스 + 인터셉터 설정
│   ├── queryClient.ts       # React Query 클라이언트 설정
│   ├── users.ts             # 도메인별 API 모듈
│   ├── products.ts
│   └── index.ts             # API 통합 내보내기
│
├── assets/                  # 정적 에셋
│   ├── images/
│   └── svgs/
│
├── components/              # 재사용 공통 컴포넌트
│   ├── Button/
│   │   ├── index.tsx        # 컴포넌트 본문
│   │   └── Button.styles.ts # 스타일 (styled-components 사용 시)
│   └── ...
│
├── constants/               # 앱 전역 상수
│
├── hooks/                   # Custom React Hooks
│   ├── apis/                # API 관련 훅 (React Query 래퍼)
│   │   └── useUserProfile.ts
│   └── useDebounce.ts
│
├── models/                  # 데이터 모델 타입
│   ├── user.ts
│   └── product.ts
│
├── services/                # 비즈니스 로직 (API 결과 가공, 스토어 액션 조합)
│   ├── auth.ts
│   └── ...
│
├── stores/                  # Zustand 전역 상태
│   ├── ui.ts
│   ├── user.ts
│   └── index.ts
│
├── styles/                  # 디자인 시스템
│   ├── colors.ts            # 색상 팔레트
│   ├── typography.ts        # 타이포그래피 시스템
│   ├── breakpoints.ts       # 반응형 브레이크포인트
│   └── theme.ts             # 테마 정의 (styled-components 사용 시)
│
├── types/                   # 전역 타입 정의
│   └── index.ts
│
└── utils/                   # 순수 유틸리티 함수
    ├── formatter.ts
    └── storage.ts

app/                         # Next.js App Router
├── layout.tsx               # 루트 레이아웃
├── page.tsx                 # 루트 페이지 (/)
├── (auth)/                  # 라우트 그룹
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── products/
│   ├── page.tsx             # /products
│   └── [id]/
│       └── page.tsx         # /products/:id
└── api/                     # Route Handlers (Next.js API)
    └── users/
        └── route.ts
```

**디렉토리 원칙**

- 복잡한 컴포넌트는 디렉토리로 분리, `index.tsx`를 진입점으로 사용
- 특정 기능에 종속된 파일은 같은 디렉토리로 묶음
- 도메인에 종속되지 않는 순수 함수만 `utils/`에 위치
- 비즈니스 로직 (API 결과 가공, 여러 스토어 액션 조합)은 `services/`에 위치

**레이어별 책임 범위**

| 레이어 | 책임 | 금지 |
|---|---|---|
| `components/`, `app/` | UI 렌더링, 이벤트 수신 | 비즈니스 로직, 직접 API 호출 |
| `hooks/` | 상태/로직 캡슐화, 컴포넌트에 데이터 제공 | 여러 도메인을 넘나드는 사이드이펙트 |
| `services/` | 비즈니스 플로우 조합 (API + 스토어 + 사이드이펙트) | UI 참조 |
| `apis/` | HTTP 요청/응답 | 상태 변경, 라우팅 |
| `stores/` | 전역 상태 보관 및 단순 업데이트 | 비동기 로직, API 호출 |
| `utils/` | 순수 함수 (입력 → 출력) | 사이드이펙트, 외부 의존성 |

---

## 7. API 레이어

### 7.1 Axios 인스턴스 구성

단일 Axios 인스턴스를 생성하고 인터셉터로 공통 처리를 중앙화

```typescript
// src/apis/axiosInstance.ts
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
});

// 요청 인터셉터: 인증 토큰 자동 주입 등 공통 요청 처리
axiosInstance.interceptors.request.use((config) => {
  // 공통 헤더 처리 (프로젝트의 인증 방식에 맞게 구현)
  return config;
});

// 응답 인터셉터: 공통 에러 처리, 토큰 갱신 등
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 공통 에러 처리 (프로젝트의 에러 스펙에 맞게 구현)
    return Promise.reject(error);
  },
);
```

> 인터셉터의 구체적인 구현은 연동하는 백엔드 스펙에 따라 프로젝트별로 정의한다.

### 7.2 도메인별 API 모듈 구조

```typescript
// src/apis/users.ts

export type UpdateProfileRequest = {
  name: string;
  email: string;
};

export enum UserRole {
  Admin = 'admin',
  Member = 'member',
}

export default {
  getProfile() {
    return axiosInstance.get('/api/users/profile');
  },

  updateProfile(param: UpdateProfileRequest) {
    return axiosInstance.put('/api/users/profile', param);
  },

  deleteAccount(id: number) {
    return axiosInstance.delete(`/api/users/${id}`);
  },
};
```

### 7.3 API 통합 내보내기

```typescript
// src/apis/index.ts
import users from './users';
import products from './products';
import orders from './orders';

const API = {users, products, orders};
export default API;
```

사용:

```typescript
import API from '@/apis';
API.users.getProfile();
API.orders.createOrder(args);
```

---

## 8. 상태 관리

### 8.1 3계층 상태 관리 원칙

| 계층 | 도구 | 용도 |
|---|---|---|
| 로컬 상태 | `useState` | 컴포넌트 내부 UI 상태 |
| 전역 상태 | `Zustand` | 앱 전반에서 공유하는 상태 |
| 서버 상태 | `React Query` | 서버 데이터 fetching, 캐싱, 동기화 |

**`useState` → `Zustand`로 올리는 기준**

| 조건 | 예시 |
|---|---|
| 2개 이상의 컴포넌트가 동일 상태를 공유 | 여러 페이지에서 로그인 여부 참조 |
| 페이지 전환 후에도 상태가 유지되어야 함 | 필터 설정, 선택된 탭 |
| 전역 UI 제어 (모달, 토스트 등) | `modalStack`, `toastQueue` |

### 8.2 Zustand 스토어 패턴

```typescript
// src/stores/user.ts

type State = {
  user: User | null;
  selectedTabIndex: number;
};

const initialState: State = {
  user: null,
  selectedTabIndex: 0,
};

const userStore = create<State>()(
  devtools(
    persist(
      () => ({...initialState}),
      {
        name: 'userStore',
        // 재시작 후 유지할 필드만 명시
        partialize: (state) => ({
          selectedTabIndex: state.selectedTabIndex,
        }),
      },
    ),
  ),
);

// 액션 함수는 스토어 외부에서 내보내기
export const setUser = (user: User) => {
  userStore.setState({user});
};

export const resetUserStore = () => {
  userStore.setState(initialState);
};

export default userStore;
```

**스토어 사용 패턴**

```typescript
// 컴포넌트에서: 필요한 상태만 선택 구독
const user = useUserStore((state) => state.user);

// 액션 호출
setUser(userData);
resetUserStore();
```

---

## 9. Custom Hooks

### 9.1 API 훅 패턴 (React Query 래퍼)

```typescript
// src/hooks/apis/useUserProfile.ts

const userQueryKey = ['user', 'profile'];

const useUserProfile = () => {
  const {data, error, isFetching} = useQuery({
    queryKey: userQueryKey,
    queryFn: API.users.getProfile,
    select: (d) => d.data,
    staleTime: 60 * 1_000,
  });

  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({queryKey: userQueryKey});
  }, [queryClient]);

  return {
    profile: data,
    isFetching,
    error,
    invalidate,
  };
};

export default useUserProfile;
```

### 9.2 Mutation 훅 패턴 (낙관적 업데이트)

```typescript
const mutation = useMutation({
  mutationFn: ({type, id}: MutationArgs) =>
    type === 'add'
      ? API.bookmarks.add({id})
      : API.bookmarks.remove({id}),

  onMutate: async ({type, id}) => {
    await queryClient.cancelQueries({queryKey: [bookmarkQueryKey]});
    const previousData = queryClient.getQueryData([bookmarkQueryKey]);

    queryClient.setQueryData(
      [bookmarkQueryKey],
      (old: Item[] = []) =>
        type === 'add' ? [...old, {id}] : old.filter((item) => item.id !== id),
    );

    return {previousData};
  },

  onSuccess: () => {
    queryClient.invalidateQueries({queryKey: [bookmarkQueryKey]});
  },

  onError: (_err, _vars, context) => {
    queryClient.setQueryData([bookmarkQueryKey], context?.previousData);
  },
});
```

### 9.3 Hook 반환 구조 원칙

- 반환값 타입은 `interface`로 명시
- 데이터, 로딩, 에러, 액션 함수를 일관되게 반환

```typescript
interface BookmarkHookReturn {
  bookmarkList?: Item[];
  isLoading: boolean;
  error: Error | null;
  toggleBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
}
```

---

## 10. Component 작성 규칙

### 10.1 Server Component vs Client Component

Next.js App Router에서는 컴포넌트 종류를 명확히 구분한다.

| 종류 | 선언 | 사용 시점 |
|---|---|---|
| Server Component | 기본값 (별도 선언 불필요) | 데이터 패칭, DB 직접 접근, 서버 전용 로직 |
| Client Component | 파일 상단 `'use client'` | 이벤트 핸들러, `useState`, `useEffect`, 브라우저 API |

```typescript
// ✅ Server Component (기본) — 데이터 패칭
// app/products/page.tsx
const ProductsPage = async () => {
  const products = await API.products.getList(); // 서버에서 직접 호출

  return <ProductList products={products} />;
};

export default ProductsPage;
```

```typescript
// ✅ Client Component — 상호작용 필요 시
// components/LikeButton.tsx
'use client';

const LikeButton = ({productId}: LikeButtonProps) => {
  const [liked, setLiked] = useState(false);

  const handleClick = () => setLiked((prev) => !prev);

  return <button onClick={handleClick}>{liked ? '♥' : '♡'}</button>;
};

export default LikeButton;
```

**원칙**: Client Component는 최대한 트리 하단에 위치시켜 서버 렌더링 범위를 최대화한다.

### 10.2 기본 컴포넌트 구조

```typescript
'use client'; // Client Component인 경우에만 선언

// 1. Props 인터페이스 정의 (파일 상단)
interface SubmitButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// 2. 함수형 컴포넌트 (Props 구조 분해)
const SubmitButton = ({label, onClick, disabled}: SubmitButtonProps) => {
  // 3. 로컬 상태
  const [isPressed, setIsPressed] = useState(false);

  // 4. 전역 상태
  const user = useUserStore((s) => s.user);

  // 5. 파생 값 (useMemo)
  const buttonLabel = useMemo(
    () => (isPressed ? '처리 중...' : label),
    [isPressed, label],
  );

  // 6. 콜백 함수 (useCallback)
  const handleClick = useCallback(() => {
    setIsPressed(true);
    onClick();
  }, [onClick]);

  // 7. Effects
  useEffect(() => {
    // 단일 관심사만 처리
  }, []);

  // 8. JSX 반환
  return (
    <button onClick={handleClick} disabled={disabled}>
      {buttonLabel}
    </button>
  );
};

export default SubmitButton;
```

### 10.3 `useCallback` / `useMemo` 사용 기준

**`useCallback` — 함수 참조 안정화**

| 사용 O | 사용 X |
|---|---|
| 자식 컴포넌트의 `props`로 전달되는 함수 | 컴포넌트 내부에서만 쓰이는 단순 함수 |
| `useEffect` / `useMemo` 의존성 배열에 포함되는 함수 | 렌더마다 새로 만들어도 무방한 함수 |

**`useMemo` — 값 계산 결과 캐싱**

| 사용 O | 사용 X |
|---|---|
| 연산 비용이 높은 파생 데이터 (필터링, 정렬 등) | 단순 변수 할당, 리터럴 값 |
| 렌더마다 새 참조가 생기면 안 되는 객체/배열 | 단순 조건 연산 |

```typescript
// ✅ 리스트 필터링 → useMemo
const filteredList = useMemo(
  () => products.filter((p) => p.categoryId === selectedCategory),
  [products, selectedCategory],
);

// ❌ 단순 조건 → useMemo 불필요
const label = useMemo(() => (isActive ? '활성' : '비활성'), [isActive]);
const label = isActive ? '활성' : '비활성'; // 충분
```

### 10.4 조건부 렌더링 패턴

```typescript
// 단순 조건
{user ? <UserView /> : <GuestView />}

// null 조건
{isLoading && <LoadingSpinner />}

// 복잡한 분기: 상수 객체로 데이터 분리
const statusConfig: Record<OrderStatus, StatusConfig> = {
  [OrderStatus.Pending]: {label: '처리 중', className: 'text-yellow-500'},
  [OrderStatus.Confirmed]: {label: '확정', className: 'text-green-500'},
  [OrderStatus.Cancelled]: {label: '취소됨', className: 'text-red-500'},
};

const config = statusConfig[orderStatus];
<StatusBadge {...config} />
```

### 10.5 고차 함수 패턴

#### `handle<Action>` — 단순 클로저형 이벤트 핸들러

```typescript
const handleClickItem = (item: Product) => () => {
  router.push(`/products/${item.id}`);
};

const handleClickTab = (index: number) => () => {
  setSelectedTab(index);
};
```

#### `create<Action>Handler` — 복잡한 로직의 핸들러 팩토리

```typescript
const createToggleFilterHandler = (type: FilterType) => () => {
  setFilters((prev) => {
    if (!prev.includes(type)) return [...prev, type];
    return prev.filter((f) => f !== type);
  });
};

const createChangeInputHandler =
  (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({...prev, [key]: e.target.value}));
  };
```

#### 네이밍 선택 기준 요약

| 접두사 | 사용 시점 | 예시 |
|---|---|---|
| `handle<Action>` | 단순 파라미터 캡처 → 이벤트 핸들러 | `handleClickItem`, `handleChangeInput` |
| `create<Action>Handler` | 복잡한 조건/비동기/상태 조합 핸들러 | `createToggleFilterHandler` |
| `render<Component>` | JSX를 반환하는 함수 (리스트 렌더링 등) | `renderItem`, `renderFilterChip` |

---

## 11. 스타일 시스템

프로젝트 초기에 **styled-components** 또는 **Tailwind CSS** 중 하나를 선택하고 일관되게 사용한다. 혼용 금지.

### 11.1 색상 팔레트

색상은 역할(role) 기반으로 그룹화하여 관리한다. 하드코딩 금지.

**파일**: `src/styles/colors.ts`

```typescript
export const colors = {
  main: {
    primary: '...',
    secondary: '...',
    tertiary: '...',
  },
  text: {
    primary: '...',
    secondary: '...',
    tertiary: '...',
  },
  disable: {
    primary: '...',
    secondary: '...',
  },
  bg: {
    primary: '...',
    secondary: '...',
  },
  status: {
    error: '...',
    warning: '...',
    success: '...',
  },
};
```

### 11.2 타이포그래피 시스템

**파일**: `src/styles/typography.ts`

**네이밍 규칙**: `{스타일}_{무게}_{크기}`

| 스타일 접두사 | 의미 |
|---|---|
| `h` | Heading |
| `sh` | Subheading |
| `bt` | Button |
| `b` | Body |
| `d` | Detail |

| 무게 | 의미 |
|---|---|
| `l` | Light |
| `r` | Regular |
| `b` | Bold |

```typescript
export const typography = {
  h_b_32: {fontSize: '2rem', fontWeight: 700, lineHeight: 1.25},
  h_b_24: {fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.33},
  bt_b_16: {fontSize: '1rem', fontWeight: 700, lineHeight: 1.5},
  b_r_16: {fontSize: '1rem', fontWeight: 400, lineHeight: 1.5},
  b_r_14: {fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.57},
  d_r_12: {fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.67},
};
```

### 11.3 반응형 브레이크포인트

**파일**: `src/styles/breakpoints.ts`

```typescript
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

---

### 11.4 styled-components 사용 패턴

styled-components를 선택한 프로젝트에서 적용한다.

#### 테마 설정

```typescript
// src/styles/theme.ts
import {DefaultTheme} from 'styled-components';
import {colors} from './colors';
import {typography} from './typography';

export const theme: DefaultTheme = {
  colors,
  typography,
};
```

#### 스타일 파일 분리

복잡한 컴포넌트는 스타일을 별도 파일로 분리한다.

```
components/
└── Button/
    ├── index.tsx          # 컴포넌트 로직
    └── Button.styles.ts   # styled-components 스타일
```

```typescript
// components/Button/Button.styles.ts
import styled, {css} from 'styled-components';

interface StyledButtonProps {
  $variant: 'primary' | 'secondary';
  $disabled?: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  ${({theme}) => theme.typography.bt_b_16};

  ${({$variant, theme}) =>
    $variant === 'primary' &&
    css`
      background-color: ${theme.colors.main.primary};
      color: ${theme.colors.button.text};
    `}

  ${({$variant, theme}) =>
    $variant === 'secondary' &&
    css`
      background-color: transparent;
      border: 1px solid ${theme.colors.main.primary};
      color: ${theme.colors.main.primary};
    `}

  ${({$disabled, theme}) =>
    $disabled &&
    css`
      background-color: ${theme.colors.disable.primary};
      cursor: not-allowed;
    `}
`;
```

```typescript
// components/Button/index.tsx
import {StyledButton} from './Button.styles';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button = ({label, onClick, variant = 'primary', disabled}: ButtonProps) => (
  <StyledButton $variant={variant} $disabled={disabled} onClick={onClick} disabled={disabled}>
    {label}
  </StyledButton>
);

export default Button;
```

**styled-components 규칙**

- Props 기반 동적 스타일은 `$` 접두사 prop 사용 (DOM 전파 방지)
- 단순 컴포넌트는 인라인 정의 가능, 복잡한 컴포넌트는 `.styles.ts`로 분리
- 하드코딩된 색상값 금지 — 항상 `theme` 객체 참조
- `css` 헬퍼: 조건부 스타일 블록에 사용

```typescript
// ✅ theme 참조
background-color: ${({theme}) => theme.colors.main.primary};

// ❌ 하드코딩 금지
background-color: #2079BB;
```

---

### 11.5 Tailwind CSS 사용 패턴

Tailwind CSS를 선택한 프로젝트에서 적용한다.

#### 설정

```typescript
// tailwind.config.ts
import type {Config} from 'tailwindcss';
import {colors} from './src/styles/colors';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.main.primary,
        'primary-secondary': colors.main.secondary,
        'text-primary': colors.text.primary,
        // ...
      },
    },
  },
};

export default config;
```

#### 클래스 관리 원칙

복잡한 클래스 조합은 변수로 추출하거나 `cn()` 유틸을 사용한다.

```typescript
// ✅ cn() 유틸로 조건부 클래스 관리
import {cn} from '@/utils/cn';

const Button = ({variant, disabled}: ButtonProps) => (
  <button
    className={cn(
      'flex items-center justify-center h-14 rounded px-4',
      'text-base font-bold',
      variant === 'primary' && 'bg-primary text-white',
      variant === 'secondary' && 'border border-primary text-primary bg-transparent',
      disabled && 'bg-disable cursor-not-allowed',
    )}
  >
    {label}
  </button>
);
```

```typescript
// src/utils/cn.ts — clsx + tailwind-merge 조합
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

**Tailwind CSS 규칙**

- 인라인 `style` 속성 사용 금지 — Tailwind 클래스 또는 CSS 변수 활용
- 복잡한 조건부 클래스는 반드시 `cn()` 유틸 사용
- 커스텀 색상/타이포는 `tailwind.config.ts`의 `extend`에 정의
- 하드코딩된 색상 클래스 대신 커스텀 토큰 클래스 사용 (`text-[#2079BB]` → `text-primary`)
- 반응형은 Tailwind 브레이크포인트 prefix 사용 (`sm:`, `md:`, `lg:`)

```typescript
// ✅ 커스텀 토큰 클래스 사용
<div className="text-primary bg-bg-primary" />

// ❌ 하드코딩 금지
<div className="text-[#2079BB] bg-[#F5F5F5]" />
```

---

## 12. 라우팅 (Next.js App Router)

### 12.1 파일 기반 라우팅 규칙

| 파일 | 역할 |
|---|---|
| `page.tsx` | 라우트의 UI, `params`/`searchParams` props 수신 |
| `layout.tsx` | 공통 레이아웃 (중첩 가능) |
| `loading.tsx` | Suspense 스켈레톤/로딩 UI |
| `error.tsx` | 에러 바운더리 UI (Client Component) |
| `not-found.tsx` | 404 UI |
| `route.ts` | API Route Handler (서버 전용) |

### 12.2 동적 라우트 및 params 타입

```typescript
// app/products/[id]/page.tsx
interface ProductDetailPageProps {
  params: {id: string};
  searchParams: {[key: string]: string | string[] | undefined};
}

const ProductDetailPage = async ({params}: ProductDetailPageProps) => {
  const product = await API.products.getById(params.id);

  return <ProductDetail product={product} />;
};

export default ProductDetailPage;
```

### 12.3 클라이언트 사이드 라우팅

```typescript
'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';

const NavigationExample = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleNavigate = () => {
    router.push('/products');
    // router.replace('/login'); // 히스토리 교체
    // router.back();           // 뒤로가기
  };

  return <button onClick={handleNavigate}>이동</button>;
};
```

### 12.4 라우트 그룹

관련 페이지를 그룹화하되 URL에 영향 없음

```
app/
├── (auth)/          # URL: /login, /register (괄호 그룹은 URL에 포함 안 됨)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
└── (main)/          # URL: /, /products
    ├── page.tsx
    └── products/
        └── page.tsx
```

---

## 13. 에러 처리

### 13.1 에러 처리 계층

| 계층 | 처리 방법 |
|---|---|
| HTTP 에러 | Axios 인터셉터 (자동 처리) |
| API 에러 코드 | 인터셉터에서 `Promise.reject` |
| 인증 만료 | 인터셉터에서 자동 갱신 후 재시도 |
| Mutation 실패 | `onError` 콜백에서 롤백 |
| 사용자 알림 | Toast (단순 피드백) 또는 전역 모달 — `window.alert()` 사용 금지 |
| Next.js 에러 | `error.tsx` 에러 바운더리로 처리 |

### 13.2 사용자 알림 에러 패턴

#### 알림 방식 선택 기준

| 상황 | 방식 | 이유 |
|---|---|---|
| 단순 결과 안내 (성공/실패 피드백) | **Toast** | 사용자 흐름을 방해하지 않음 |
| 사용자 확인/선택이 필요한 에러 | **모달** | 명시적인 확인 액션 필요 |
| 설정 이동 등 후속 액션이 있는 에러 | **모달** (확인/취소 버튼) | 액션 선택지 제공 |
| 백그라운드 작업 실패 | **silent** (로깅만) | 불필요한 방해 방지 |

```typescript
// Toast: 단순 피드백
showToast('저장되었습니다.');
showErrorToast('요청 처리 중 오류가 발생했습니다.');

// 모달: 확인이 필요한 에러
openModal({
  message: '네트워크 연결을 확인해주세요.',
  onConfirm: closeModal,
});

// 모달: 후속 액션 포함
openModal({
  message: '로그인이 필요합니다.',
  confirmText: '로그인',
  onConfirm: () => router.push('/login'),
  cancelText: '취소',
});

// silent: 사용자에게 표시하지 않음
try {
  await API.analytics.logEvent(event);
} catch {
  // 분석 이벤트 실패는 사용자에게 표시하지 않음
}
```

#### 에러 메시지 작성 원칙

- 기술적 메시지(`'Network Error'`, `'404 Not Found'`)를 그대로 노출하지 않는다
- 사용자가 취할 수 있는 행동을 안내한다
- API 공통 에러는 편의 함수로 통일한다

```typescript
// ✅ 사용자 친화적
openModal({message: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'});

// ❌ 기술적 메시지 노출 금지
openModal({message: error.message}); // 'AxiosError: Request failed with status code 500'
```

### 13.3 Next.js 에러 바운더리

```typescript
// app/products/error.tsx
'use client';

interface ErrorPageProps {
  error: Error & {digest?: string};
  reset: () => void;
}

const ProductsError = ({error, reset}: ErrorPageProps) => (
  <div>
    <h2>상품 목록을 불러오지 못했습니다.</h2>
    <button onClick={reset}>다시 시도</button>
  </div>
);

export default ProductsError;
```

### 13.4 전역 모달 패턴 (Zustand 기반)

`window.alert()` / `window.confirm()` 대신 커스텀 모달 컴포넌트를 전역으로 선언하고, Zustand 스택으로 제어한다.

```typescript
// src/stores/ui.ts

export interface ModalParam {
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
}

type State = {
  modalStack: ModalParam[];
};

const uiStore = create<State>()(() => ({modalStack: []}));

export const openModal = (modal: ModalParam) => {
  uiStore.setState((s) => ({modalStack: [modal, ...s.modalStack]}));
};

export const closeModal = () => {
  uiStore.setState((s) => ({modalStack: s.modalStack.slice(1)}));
};

export default uiStore;
```

```typescript
// src/components/GlobalModal.tsx
'use client';

const GlobalModal = () => {
  const modalStack = useUiStore((s) => s.modalStack);
  const modal = modalStack[0];

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6">
        <p>{modal.message}</p>
        <div className="flex gap-2 mt-4">
          {modal.cancelText && (
            <button onClick={() => { modal.onCancel?.(); closeModal(); }}>
              {modal.cancelText}
            </button>
          )}
          <button onClick={() => { modal.onConfirm?.(); closeModal(); }}>
            {modal.confirmText ?? '확인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;
```

```typescript
// app/layout.tsx
const RootLayout = ({children}: {children: React.ReactNode}) => (
  <html>
    <body>
      <QueryClientProvider client={queryClient}>
        {children}
        <GlobalModal />
        <GlobalToast />
      </QueryClientProvider>
    </body>
  </html>
);
```

---

## 14. 임포트 순서

4개 그룹으로 구분하며, 각 그룹 사이에 빈 줄로 구분한다. (ESLint 플러그인으로 자동 정렬)

```typescript
// 1. React / Next.js 라이브러리
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// 2. 외부 라이브러리 (npm 패키지)
import dayjs from 'dayjs';
import {useForm} from 'react-hook-form';
import styled from 'styled-components'; // styled-components 사용 시

// 3. 내부 모듈 (절대 경로 별칭)
import API from '@/apis';
import {useUserStore, setUser} from '@/stores/user';
import {openModal} from '@/stores/ui';
import {colors} from '@/styles/colors';
import useUserProfile from '@/hooks/apis/useUserProfile';

// 4. 상대 경로 임포트
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
```

---

## 빠른 참조

### 컨벤션 체크리스트

- [ ] 파일명: 컴포넌트 `PascalCase.tsx`, Next.js 특수 파일 소문자, 나머지 `camelCase.ts`
- [ ] 타입: 서버 연동 → `type`, 클라이언트 전용 → `interface`
- [ ] Export: 컴포넌트/훅/API 모듈 → `default`, 유틸/타입/스토어 액션 → named
- [ ] Server/Client Component: `'use client'`는 필요한 경우에만, 트리 하단에 배치
- [ ] 비즈니스 로직: 컴포넌트나 훅이 아닌 `services/`에 위치
- [ ] 스타일: styled-components 또는 Tailwind CSS 중 하나만 사용 (혼용 금지)
- [ ] 색상/타이포: 하드코딩 금지, `colors` 객체 또는 커스텀 토큰 참조
- [ ] `useCallback`: 자식 props 전달 또는 useEffect 의존성 포함 시에만 사용
- [ ] `useMemo`: 고비용 연산, 참조 안정화가 필요한 경우에만 사용
- [ ] API 함수: 접두사 규칙 준수 (`get*`, `request*`, `set*` 등)
- [ ] Hook: `use*` 접두사, 반환값 인터페이스 정의
- [ ] 고차 함수: `handle*` / `create*Handler` / `render*` 접두사 구분
- [ ] 임포트: 4그룹 순서 준수
- [ ] 커밋: `feat:`, `fix:`, `chore:` 등 타입 필수
- [ ] 에러 알림: Toast(단순 피드백) vs 모달(확인 필요) 기준 준수
- [ ] 모달: `window.alert()` / `window.confirm()` 금지, Zustand 기반 전역 모달 패턴 사용
- [ ] 에러 메시지: 기술적 메시지 노출 금지, 사용자 친화적 문구 사용
- [ ] 미사용 import: 즉시 제거 (ESLint 에러)
- [ ] `any` 사용 금지 (ESLint 에러)
