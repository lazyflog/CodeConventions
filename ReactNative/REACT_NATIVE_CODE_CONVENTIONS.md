# ReactNative Code Conventions

React Native + TypeScript 프로젝트에 공통으로 적용할 수 있는 코드 컨벤션을 정의합니다.
특정 프로젝트에 종속되지 않는 구조, 패턴, 규칙을 다룹니다.

---

## 전제 조건

이 문서는 아래 기술 스택을 표준으로 전제한다. 모든 React Native 프로젝트는 동일한 스택을 사용한다.

| 역할 | 라이브러리 |
|---|---|
| UI | React Native |
| 언어 | TypeScript |
| 네비게이션 | React Navigation |
| 서버 상태 | TanStack Query (React Query) |
| 전역 상태 | Zustand |
| HTTP 클라이언트 | Axios |
| 날짜 처리 | dayjs |
| 바텀시트 | @gorhom/bottom-sheet |
| 권한 처리 | react-native-permissions |
| Safe Area | react-native-safe-area-context |
| 포맷팅 | Prettier |
| 린팅 | ESLint |
| 커밋 규칙 | Commitlint (Conventional Commits) |
| 단위/통합 테스트 | Jest + React Native Testing Library (RNTL) |
| API 모킹 | MSW (Mock Service Worker) |
| E2E 테스트 | Maestro |

---

## 목차

1. [Formatting (Prettier)](#1-formatting-prettier)
2. [Linting (ESLint)](#2-linting-eslint)
3. [Commit Messages](#3-commit-messages)
4. [Naming Convention](#4-naming-convention)
5. [TypeScript](#5-typescript) *(interface vs type, export 방식 포함)*
6. [Project Structure](#6-project-structure) *(services 레이어 포함)*
7. [API 레이어](#7-api-레이어)
8. [상태 관리](#8-상태-관리)
9. [Custom Hooks](#9-custom-hooks)
10. [Component 작성 규칙](#10-component-작성-규칙)
11. [스타일 시스템](#11-스타일-시스템)
12. [네비게이션](#12-네비게이션)
13. [에러 처리](#13-에러-처리)
14. [임포트 순서](#14-임포트-순서)
15. [테스트](#15-테스트)

---

## 1. Formatting (Prettier)

모든 RN 프로젝트에서 아래 설정을 표준으로 사용한다.

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
};
```

**규칙 요약**

| 항목 | 값 | 예시 |
|---|---|---|
| 들여쓰기 | 2칸 | |
| 세미콜론 | 항상 | `const x = 1;` |
| 따옴표 | 작은따옴표 | `'string'` |
| 후행 쉼표 | 항상 | `{a, b,}` |
| 객체 괄호 공백 | 없음 | `{foo: bar}` |
| 화살표 함수 괄호 | 항상 | `(param) => {}` |
| 최대 줄 길이 | 80자 | |

---

## 2. Linting (ESLint)

모든 RN 프로젝트에서 아래 설정을 표준으로 사용한다.

```js
// .eslintrc.js
module.exports = {
  extends: [
    '@react-native',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  plugins: ['unused-imports'],
  rules: {
    'prettier/prettier': 'error',
    'unused-imports/no-unused-imports': 'error',   // 미사용 import → 에러
    'unused-imports/no-unused-vars': 'warn',        // 미사용 변수 → 경고
    'react-native/no-inline-styles': 'warn',        // 인라인 스타일 → 경고
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

**인라인 스타일**: 모든 스타일은 `StyleSheet.create`로 분리

```typescript
// ✅ 올바른 방식
const styles = StyleSheet.create({container: {flex: 1}});
<View style={styles.container} />

// ❌ 피해야 할 방식
<View style={{flex: 1}} />
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
| Custom Hook | `camelCase.ts` | `useAuth.ts`, `useInfiniteList.ts` |
| API 모듈 | `camelCase.ts` | `users.ts`, `products.ts` |
| 유틸리티 | `camelCase.ts` | `formatter.ts`, `storage.ts` |
| 스타일 | `camelCase.ts(x)` | `colors.tsx`, `fonts.tsx` |
| 타입 정의 | `camelCase.ts` | `routerType.ts`, `commonType.ts` |

### 4.2 변수/함수 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| 변수 | `camelCase` | `userName`, `isLoading` |
| 함수 | `동사+명사 camelCase` | `handlePressButton`, `formatDate` |
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

### 4.4 Custom Hook 네이밍

- `use*` 접두사 필수 (`useCurrentLocation`, `useToast`)
- Hook이 반환하는 함수는 핵심 동작을 명확히 표현 (`fetchLocation`, `showToast`)
- 이벤트 핸들러는 `handle*` 접두사 (`handlePressTab`, `handleLoadError`)

---

## 5. TypeScript

### 5.1 경로 별칭

절대 경로 임포트를 위해 `tsconfig.json`에 경로 별칭을 설정한다.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["./src/*"],
      "@assets/*": ["./src/assets/*"]
    }
  }
}
```

| 별칭 | 실제 경로 | 사용 예 |
|---|---|---|
| `@app/*` | `./src/*` | `import API from '@app/APIs'` |
| `@assets/*` | `./src/assets/*` | `import Logo from '@assets/logo.svg'` |

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
interface SubmitButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
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

// ✅ 기존 타입 확장 시 extends (interface)
interface AdminProps extends UserModel {
  role: 'admin';
}

// ✅ 타입 가드 패턴 (in 연산자로 프로퍼티 존재 여부 확인)
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

export enum SortDirection {
  Asc,
  Desc,
}
```

### 5.4 Export 방식

| 대상 | 방식 | 이유 |
|---|---|---|
| 컴포넌트 | `export default` | React Navigation, lazy import 등 default 기대 |
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

// ✅ 스토어 → default(인스턴스) + named(액션)
const userStore = create<State>()(...);
export const setUser = (user: User) => userStore.setState({user});
export const resetUserStore = () => userStore.setState(initialState);
export default userStore;

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
├── APIs/                    # API 호출 함수 + 타입
│   ├── axiosInstance.ts     # Axios 인스턴스 + 인터셉터 설정
│   ├── queryClient.ts       # React Query 클라이언트 설정
│   ├── users.ts             # 도메인별 API 모듈
│   ├── products.ts
│   └── index.ts             # API 통합 내보내기
│
├── assets/                  # 정적 에셋
│   ├── images/
│   ├── fonts/
│   └── svgs/
│
├── components/              # 재사용 공통 컴포넌트
│   ├── Button.tsx
│   └── ...
│
├── constants/               # 앱 전역 상수
│
├── hooks/                   # Custom React Hooks
│   ├── apis/                # API 관련 훅 (React Query 래퍼)
│   │   └── useUserProfile.ts
│   └── useLocation.ts
│
├── models/                  # 데이터 모델 타입
│   ├── user.ts
│   └── product.ts
│
├── routers/                 # 네비게이션 설정
│   ├── index.tsx            # 루트 네비게이터 구성
│   └── routerType.ts        # RootStackParamList 타입 정의
│
├── screens/                 # 화면 컴포넌트 (최상위)
│   ├── home/
│   │   ├── index.tsx        # 진입점
│   │   └── HomeHeader.tsx
│   └── ...
│
├── services/                # 비즈니스 로직 (API 결과 가공, 스토어 액션 조합)
│   ├── auth.ts              # signIn, signOut, initialize 등 인증 플로우
│   └── ...
│
├── stores/                  # Zustand 전역 상태
│   ├── ui.ts                # UI 상태 (팝업, 로딩 등)
│   ├── user.ts              # 사용자 정보
│   └── index.ts             # 스토어 통합 내보내기
│
├── styles/                  # 디자인 시스템
│   ├── colors.tsx           # 색상 팔레트
│   ├── fonts.tsx            # 폰트 시스템
│   └── common.ts            # 공통 레이아웃 값
│
├── types/                   # 전역 타입 정의
│   └── index.ts
│
└── utils/                   # 순수 유틸리티 함수
    ├── storage.ts
    ├── formatter.ts
    └── location.ts

test/                            # 테스트 공용 설정 (src/ 와 동일 레벨)
├── server.ts                    # MSW 서버 설정
├── setup.ts                     # Jest 전역 설정
├── handlers/                    # MSW 핸들러 (도메인별 분리)
│   ├── users.ts
│   └── products.ts
└── utils/
    └── renderWithProviders.tsx  # Provider 래퍼 헬퍼

e2e/                             # Maestro E2E 테스트
├── flows/
│   ├── auth/
│   │   ├── login.yaml
│   │   └── logout.yaml
│   └── ...
└── config.yaml
```

**디렉토리 원칙**

- 복잡한 화면은 하위 파일로 분리, `index.tsx`를 진입점으로 사용
- 특정 기능에 종속된 파일은 같은 디렉토리로 묶음
- 도메인에 종속되지 않는 순수 함수만 `utils/`에 위치
- API 호출 결과 가공, 여러 스토어 액션 조합, 앱 초기화 등 비즈니스 로직은 `services/`에 위치 (컴포넌트나 훅에서 직접 처리하지 않음)

**레이어별 책임 범위**

| 레이어 | 책임 | 금지 |
|---|---|---|
| `components/`, `screens/` | UI 렌더링, 이벤트 수신 | 비즈니스 로직, 직접 API 호출 |
| `hooks/` | 상태/로직 캡슐화, 컴포넌트에 데이터 제공 | 여러 도메인을 넘나드는 사이드이펙트 |
| `services/` | 비즈니스 플로우 조합 (API + 스토어 + 사이드이펙트) | UI 참조 |
| `APIs/` | HTTP 요청/응답 | 상태 변경, 네비게이션 |
| `stores/` | 전역 상태 보관 및 단순 업데이트 | 비동기 로직, API 호출 |
| `utils/` | 순수 함수 (입력 → 출력) | 사이드이펙트, 외부 의존성 |

---

## 7. API 레이어

### 7.1 Axios 인스턴스 구성

단일 Axios 인스턴스를 생성하고 인터셉터로 공통 처리를 중앙화

```typescript
// src/APIs/axiosInstance.ts
const axiosInstance = axios.create({
  baseURL: Config.BASE_URL,
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

> 인터셉터의 구체적인 구현(인증 방식, 에러 코드 처리, 토큰 갱신 로직 등)은 연동하는 백엔드 스펙에 따라 프로젝트별로 정의한다.

### 7.2 도메인별 API 모듈 구조

API는 도메인별로 파일을 분리하고, 기본 내보내기 객체로 관리

```typescript
// src/APIs/users.ts

// 1. 요청/응답 타입 정의
export type UpdateProfileRequest = {
  name: string;
  email: string;
};

// 2. 관련 Enum 정의
export enum UserRole {
  Admin = 'admin',
  Member = 'member',
}

// 3. API 함수 객체 (기본 내보내기)
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

**파일**: `src/APIs/index.ts`

```typescript
import users from './users';
import products from './products';
import orders from './orders';

const API = {users, products, orders};
export default API;
```

사용:

```typescript
import API from '@app/APIs';
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

아래 조건 중 하나라도 해당하면 `Zustand`로 이동한다.

| 조건 | 예시 |
|---|---|
| 2개 이상의 컴포넌트가 동일 상태를 공유 | 여러 화면에서 로그인 여부 참조 |
| 화면 전환 후에도 상태가 유지되어야 함 | 필터 설정, 선택된 탭 인덱스 |
| 앱 재시작 후에도 유지되어야 함 (`persist`) | 사용자 토큰, 알림 설정 |
| 전역 UI 제어 (팝업, 로딩 등) | `popupStack`, `isInLoading` |

반대로 단일 컴포넌트 내부에서만 쓰이는 상태(입력값, 토글, 포커스 등)는 `useState`로 유지한다.

### 8.2 Zustand 스토어 패턴

```typescript
// 1. State 타입 정의
type State = {
  user: User | null;
  selectedTabIndex: number;
};

// 2. 초기값 분리
const initialState: State = {
  user: null,
  selectedTabIndex: 0,
};

// 3. 스토어 생성 (devtools + persist 미들웨어)
const userStore = create<State>()(
  devtools(
    persist(
      () => ({...initialState}),
      {
        name: 'userStore',
        storage: createJSONStorage(() => AsyncStorage),
        // 재시작 후 유지할 필드만 명시
        partialize: (state) => ({
          selectedTabIndex: state.selectedTabIndex,
        }),
      },
    ),
  ),
);

// 4. 액션 함수는 스토어 외부에서 내보내기
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
// 컴포넌트에서: 필요한 상태만 선택 구독 (불필요한 리렌더링 방지)
const user = Stores.user((state) => state.user);
const tabIndex = Stores.user((state) => state.selectedTabIndex);

// 액션 호출
setUser(userData);
resetUserStore();
```

### 8.3 Zustand 미들웨어 사용 규칙

- `devtools`: 항상 적용 (Redux DevTools 지원)
- `persist`: 앱 재시작 후에도 유지가 필요한 데이터에만 적용
- `partialize`: 영속화할 필드를 명시적으로 지정 (전체 상태 저장 지양)

---

## 9. Custom Hooks

### 9.1 API 훅 패턴 (React Query 래퍼)

```typescript
// src/hooks/apis/useUserProfile.ts

// 1. Query Key는 파일 상단에 상수로 정의
const userQueryKey = ['user', 'profile'];

const useUserProfile = () => {
  const token = storage.get('token');

  // 2. useQuery: 데이터 조회
  const {data, error, isFetching} = useQuery({
    queryKey: userQueryKey,
    queryFn: API.users.getProfile,
    select: (d) => d.data,          // 응답에서 필요한 데이터만 추출
    staleTime: 60 * 1_000,          // 1분 캐시
    enabled: !!token,               // 조건부 실행
  });

  const queryClient = useQueryClient();

  // 3. 캐시 무효화 함수
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({queryKey: userQueryKey});
  }, [queryClient]);

  // 4. 일관된 반환 구조
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

  // 낙관적 업데이트
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

  // 실패 시 롤백
  onError: (_err, _vars, context) => {
    queryClient.setQueryData([bookmarkQueryKey], context?.previousData);
  },
});
```

### 9.3 일반 Hook 패턴

```typescript
const useLocation = () => {
  const handlePermissionDenied = useCallback(() => {
    // 권한 거부 처리
  }, []);

  const fetchLocation = useCallback(async () => {
    const status = await requestLocationPermission();

    if (status !== RESULTS.GRANTED) {
      handlePermissionDenied();
      return;
    }

    try {
      const location = await getCurrentLocation();
      setLocation(location); // Zustand 액션 호출
    } catch {
      handlePermissionDenied();
    }
  }, [handlePermissionDenied]);

  return {fetchLocation};
};

export default useLocation;
```

### 9.4 Hook 반환 구조 원칙

- 반환값 타입은 `interface`로 명시
- 데이터, 로딩, 에러, 액션 함수를 일관되게 반환

```typescript
interface BookmarkHookReturn {
  bookmarkList?: Item[];
  isLoading: boolean;
  error: Error | null;
  toggleBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  status: {isPending: boolean; isSuccess: boolean; isError: boolean};
}
```

---

## 10. Component 작성 규칙

### 10.1 기본 컴포넌트 구조

```typescript
// 1. Props 인터페이스 정의 (파일 상단)
interface SubmitButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

// 2. 함수형 컴포넌트 (Props 구조 분해)
const SubmitButton = ({label, onPress, style, disabled}: SubmitButtonProps) => {
  // 3. 훅 호출 (상단에 모아서)
  const insets = useSafeAreaInsets();

  // 4. 로컬 상태
  const [isPressed, setIsPressed] = useState(false);

  // 5. 서버/전역 상태
  const user = Stores.user((s) => s.user);

  // 6. 파생 값 (useMemo) — 동적 스타일 포함
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: disabled ? colors.disable.primary : colors.main.primary,
        },
      }),
    [disabled],
  );

  // 7. 콜백 함수 (useCallback)
  const handlePress = useCallback(() => {
    onPress();
    setIsPressed(false);
  }, [onPress]);

  // 8. Effects (각각 단일 책임)
  useEffect(() => {
    // 단일 관심사만 처리
  }, [/* 관련 의존성 */]);

  // 9. JSX 반환
  return (
    <TouchableOpacity
      style={[styles.container, dynamicStyles.container, style]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

// 10. 정적 스타일 (컴포넌트 하단)
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 4,
  },
  label: {
    ...Fonts.bt_b_16,
    color: colors.button.text,
  },
});

export default SubmitButton;
```

### 10.2 `useCallback` / `useMemo` 사용 기준

무분별한 사용은 오히려 성능 저하를 유발하므로 아래 기준에 따라 사용한다.

**`useCallback` — 함수 참조 안정화**

| 사용 O | 사용 X |
|---|---|
| 자식 컴포넌트의 `props`로 전달되는 함수 | 컴포넌트 내부에서만 쓰이는 단순 함수 |
| `useEffect` / `useMemo` 의존성 배열에 포함되는 함수 | 렌더마다 새로 만들어도 무방한 함수 |

```typescript
// ✅ 자식 props로 전달 → useCallback
const handlePress = useCallback(() => {
  onPress();
}, [onPress]);

// ✅ useEffect 의존성 포함 → useCallback
const fetchData = useCallback(async () => {
  const data = await API.products.getList();
  setProducts(data);
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ❌ 내부에서만 쓰이는 단순 함수 → 불필요
const handleToggle = useCallback(() => {
  setVisible((v) => !v);
}, []); // 불필요한 useCallback
```

**`useMemo` — 값 계산 결과 캐싱**

| 사용 O | 사용 X |
|---|---|
| 동적 스타일 (`StyleSheet.create` 포함) | 단순 변수 할당, 리터럴 값 |
| 연산 비용이 높은 파생 데이터 (필터링, 정렬 등) | 단순 조건 연산 |
| 렌더마다 새 참조가 생기면 안 되는 객체/배열 | |

```typescript
// ✅ 동적 스타일 → useMemo 필수
const dynamicStyles = useMemo(
  () => StyleSheet.create({
    container: {backgroundColor: disabled ? colors.disable.primary : colors.main.primary},
  }),
  [disabled],
);

// ✅ 리스트 필터링 → useMemo
const filteredList = useMemo(
  () => products.filter((p) => p.categoryId === selectedCategory),
  [products, selectedCategory],
);

// ❌ 단순 조건 → useMemo 불필요
const label = useMemo(() => (isActive ? '활성' : '비활성'), [isActive]); // 불필요
const label = isActive ? '활성' : '비활성'; // 충분
```

단순 조건부 스타일은 배열로 처리 (`useMemo` 불필요)

```typescript
<View style={[styles.container, disabled && styles.disabled, style]} />
```

### 10.3 조건부 렌더링 패턴

```typescript
// 단순 조건
{user ? <UserView /> : <GuestView />}

// null 조건
{isLoading && <LoadingSpinner />}

// 복잡한 분기: 상수 객체로 데이터 분리
const statusConfig: Record<OrderStatus, StatusConfig> = {
  [OrderStatus.Pending]: {label: '처리 중', style: styles.pending},
  [OrderStatus.Confirmed]: {label: '확정', style: styles.confirmed},
  [OrderStatus.Cancelled]: {label: '취소됨', style: styles.cancelled},
};

const config = statusConfig[orderStatus];
<StatusBadge {...config} />
```

### 10.4 고차 함수 패턴

고차 함수는 역할에 따라 접두사로 구분한다.

#### `handle<Action>` — 단순 클로저형 이벤트 핸들러

파라미터를 클로저로 캡처해 단일 이벤트를 처리할 때 사용

```typescript
// 아이템을 캡처해 onPress 핸들러 생성
const handlePressItem = (item: Product) => () => {
  navigation.navigate('ProductDetailScreen', {id: item.id});
};

// 인덱스를 캡처해 탭 핸들러 생성
const handlePressTab = (index: number) => () => {
  setSelectedTab(index);
};

// 레이아웃 이벤트 핸들러 (이벤트 파라미터 포함)
const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
  const layout = event.nativeEvent.layout;
  setLayouts((prev) => {
    const updated = [...prev];
    updated[index] = layout;
    return updated;
  });
};
```

#### `create<Action>Handler` — 복잡한 로직의 핸들러 팩토리

조건 분기, 상태 조합, 비동기 처리 등 로직이 복잡한 핸들러 생성 시 사용

```typescript
// 조건 분기가 포함된 필터 핸들러
const createPressFilterHandler = (type: FilterType) => () => {
  setFilters((prev) => {
    if (!prev.includes(type)) return [...prev, type];
    return prev.filter((f) => f !== type);
  });
};

// 이벤트 파라미터가 포함된 핸들러
const createSwitchChangeHandler =
  (key: keyof Settings) => (value: boolean) => {
    setSettings((prev) => ({...prev, [key]: value}));
  };

// 비동기 처리 포함
const createShareHandler = (platform: SharePlatform) => async () => {
  await Share.open({url: currentUrl, platform});
};
```

#### `render<Component>` — JSX를 반환하는 렌더 함수

렌더링 로직 분리 시 사용. FlatList의 `renderItem`이나 반복 렌더링에 활용

```typescript
// FlatList renderItem
const renderItem: ListRenderItem<Product> = ({item}) => (
  <TouchableOpacity onPress={handlePressItem(item)}>
    <ProductCard product={item} />
  </TouchableOpacity>
);

// 동적 스타일링 포함
const renderFilterChip = (filter: FilterItem) => {
  const isSelected = activeFilters.includes(filter.key);
  return (
    <TouchableOpacity
      key={filter.key}
      style={[styles.chip, isSelected && styles.selectedChip]}
      onPress={createPressFilterHandler(filter.key)}
    >
      <Text>{filter.label}</Text>
    </TouchableOpacity>
  );
};

// 라우터에서 헤더 컴포넌트 반환
const renderHeader = (props: ScreenHeaderProps) => (): ReactNode => (
  <ScreenHeader {...props} />
);
```

#### 네이밍 선택 기준 요약

| 접두사 | 사용 시점 | 예시 |
|---|---|---|
| `handle<Action>` | 단순 파라미터 캡처 → 이벤트 핸들러 | `handlePressItem`, `handleLayout` |
| `create<Action>Handler` | 복잡한 조건/비동기/상태 조합 핸들러 | `createPressFilterHandler`, `createSwitchChangeHandler` |
| `render<Component>` | JSX 반환 함수 | `renderItem`, `renderFilterChip`, `renderHeader` |

### 10.5 useRef 활용 패턴

```typescript
// BottomSheet 제어
const bottomSheetRef = useRef<BottomSheetModal>(null);
bottomSheetRef.current?.present();
bottomSheetRef.current?.dismiss();

// 플래그 (리렌더링 없이 값 유지)
const hasShownOnboarding = useRef(false);
if (hasShownOnboarding.current) return;
hasShownOnboarding.current = true;
```

---

## 11. 스타일 시스템

### 11.1 색상 팔레트

**파일**: `src/styles/colors.tsx`

색상은 역할(role) 기반으로 그룹화하여 관리한다. 하드코딩 금지.

```typescript
export const colors = {
  main: {
    primary: '...',      // 메인 브랜드 색상
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

```typescript
// ✅ 올바른 방식
color: colors.main.primary

// ❌ 피해야 할 방식
color: '#2079BB'
```

### 11.2 폰트 시스템

**파일**: `src/styles/fonts.tsx`

**폰트 네이밍 규칙**: `{스타일}_{무게}_{크기}`

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
// 사용 예시
const styles = StyleSheet.create({
  heading: Fonts.h_b_20,    // Heading Bold 20px
  button: Fonts.bt_b_16,   // Button Bold 16px
  body: Fonts.b_r_14,      // Body Regular 14px
  detail: Fonts.d_r_12,    // Detail Regular 12px
});
```

### 11.3 공통 레이아웃 값

**파일**: `src/styles/common.ts`

여러 화면에서 공유하는 레이아웃 값(패딩, 마진 등)은 이 파일에서 관리

```typescript
export const screenPaddingHorizontal = 20;
export const headerHeight = 56;
```

---

## 12. 네비게이션

### 12.1 라우터 타입 정의

**파일**: `src/routers/routerType.ts`

```typescript
export type RootStackParamList = {
  // params 없는 스크린
  SplashScreen: undefined;
  HomeScreen: undefined;

  // 선택적 params
  ProductListScreen: {categoryId?: string} | undefined;

  // 필수 params
  ProductDetailScreen: {
    productId: string;
    source: 'list' | 'search';
  };

  // Pick 유틸리티로 허용 스크린 제한
  AuthScreen: {
    nextScreen: keyof Pick<
      RootStackParamList,
      'HomeScreen' | 'ProductListScreen'
    >;
  };
};

// 전역 타입 선언으로 useNavigation 타입 자동 적용
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### 12.2 네비게이션 사용 패턴

```typescript
const navigation = useNavigation();
const route = useRoute<RouteProp<RootStackParamList, 'ProductDetailScreen'>>();

// 이동
navigation.navigate('ProductDetailScreen', {productId: '123', source: 'list'});
navigation.goBack();

// 스택 교체
navigation.dispatch(StackActions.replace('HomeScreen'));

// 파라미터 접근
const {productId, source} = route.params;
```

### 12.3 라우터 구성 패턴

```typescript
const AppRouter = () => (
  <RootStack.Navigator
    screenOptions={screenOptions}
    initialRouteName={'SplashScreen'}
  >
    <RootStack.Screen name={'SplashScreen'} component={SplashScreen} />

    <RootStack.Screen
      name={'ProductDetailScreen'}
      component={ProductDetailScreen}
      options={{
        headerShown: true,
        header: renderHeader({title: '상품 상세'}),
      }}
    />
  </RootStack.Navigator>
);
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
| 사용자 알림 | Toast (단순 피드백) 또는 Zustand 기반 전역 팝업 — `Alert.alert()` 사용 금지 |

### 13.2 사용자 알림 에러 패턴

#### 알림 방식 선택 기준

| 상황 | 방식 | 이유 |
|---|---|---|
| 단순 결과 안내 (성공/실패 피드백) | **Toast** | 사용자 흐름을 방해하지 않음 |
| 사용자 확인/선택이 필요한 에러 | **팝업** | 명시적인 확인 액션 필요 |
| 설정 이동 등 후속 액션이 있는 에러 | **팝업** (확인/취소 버튼) | 액션 선택지 제공 |
| 백그라운드 작업 실패 (사용자가 인지할 필요 없음) | **silent** (로깅만) | 불필요한 방해 방지 |

```typescript
// Toast: 단순 피드백
showToast('저장되었습니다.');
showErrorToast('요청 처리 중 오류가 발생했습니다.');

// 팝업: 확인이 필요한 에러
pushPopup({text: '네트워크 연결을 확인해주세요.'}, navigation);

// 팝업: 후속 액션 포함
pushPopup(
  {
    text: '위치 권한이 필요합니다.',
    confirmText: '설정으로 이동',
    onConfirm: () => Linking.openSettings(),
    cancelText: '취소',
  },
  navigation,
);

// silent: 사용자에게 표시하지 않음
try {
  await API.analytics.logEvent(event);
} catch {
  // 분석 이벤트 실패는 사용자에게 표시하지 않음
}
```

#### 에러 메시지 작성 원칙

- 기술적 메시지(`'Network Error'`, `'404 Not Found'`)를 그대로 노출하지 않는다
- 사용자가 취할 수 있는 행동을 안내한다 ("잠시 후 다시 시도해주세요", "설정에서 권한을 허용해주세요")
- API 공통 에러는 `pushApiFailedPopup(navigation)` 같은 편의 함수로 통일한다

```typescript
// ✅ 사용자 친화적
pushPopup({text: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}, navigation);

// ❌ 기술적 메시지 노출 금지
pushPopup({text: error.message}, navigation); // 'AxiosError: Request failed with status code 500'
```

#### 알림 호출 위치 원칙

| 호출 위치 | 허용 여부 | 비고 |
|---|---|---|
| 컴포넌트 (`onPress`, `useEffect` 내) | ✅ | UI 흐름과 직결된 에러 |
| Custom Hook (`onError` 콜백) | ✅ | React Query mutation/query 에러 |
| `services/` | ✅ | 비즈니스 플로우 에러 |
| `APIs/` (인터셉터) | ⚠️ 제한적 | 전역 공통 에러만 (401, 네트워크 단절 등) |
| `stores/` | ❌ | UI 참조 금지 |

#### 전역 팝업 패턴 (Zustand 기반)

`alert()` / `Alert.alert()` 대신 커스텀 팝업 컴포넌트를 전역으로 선언하고, Zustand 스택으로 제어한다. 모든 프로젝트에서 이 패턴을 표준으로 사용한다.

**구조**

```
App.tsx
└── <NavigationContainer>
      └── <Popup>              ← NavigationContainer 안에 위치 (useNavigation 사용)
            └── AppRouter
```

**1. 팝업 파라미터 타입 및 스토어 액션 정의**

```typescript
// src/stores/appState.ts

export interface PopupParam {
  text: string;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
}

type State = {
  popupStack: PopupParam[];
  // ...
};

// 팝업 추가: 현재 화면 이름을 함께 기록
export const pushPopup = (
  popup: PopupParam,
  navigation: NavigationProp<...>,
) => {
  const currentScreen = getCurrentScreenName(navigation);
  appStateStore.setState({
    popupStack: [{...popup, screen: currentScreen}, ...getState().popupStack],
  });
};

// 팝업 제거 (확인/취소 버튼 누를 때)
export const popPopup = () => {
  appStateStore.setState({
    popupStack: getState().popupStack.slice(1),
  });
};

// API 공통 에러용 편의 함수
export const pushApiFailedPopup = (navigation: NavigationProp<...>) => {
  pushPopup({text: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}, navigation);
};
```

**2. 팝업 컴포넌트**

```typescript
// src/components/Popup.tsx

const Popup = ({children}: {children: ReactNode}) => {
  const popupStack = Stores.appState((s) => s.popupStack);
  const navigation = useNavigation();

  // 스택의 첫 번째 팝업만 표시
  // 현재 화면과 팝업이 push된 화면이 다르면 자동으로 popPopup()
  // Android 하드웨어 백 버튼으로도 팝업 닫기 처리

  return (
    <View style={{flex: 1}}>
      {children}
      {showPopup && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text>{popupContext.text}</Text>
            {/* 확인/취소 버튼 */}
          </View>
        </View>
      )}
    </View>
  );
};
```

**3. App.tsx에서 네비게이터를 감싸서 사용**

```typescript
// App.tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <Popup>        {/* Popup은 NavigationContainer 안에서 useNavigation 사용 */}
        <AppRouter />
      </Popup>
    </NavigationContainer>
  </QueryClientProvider>
);
```

**핵심 특징**

- **스택 구조**: 여러 팝업이 순서대로 쌓여 하나씩 표시됨
- **화면 인식**: 팝업이 push된 화면에서만 표시 (다른 화면으로 이동 시 자동 제거)
- **Android 백 버튼**: `BackHandler`로 팝업 닫기 처리
- **`Alert.alert()` 사용 금지**: 스타일 커스터마이징 불가, 네이티브 UI 일관성 없음

### 13.3 서비스 레벨 에러 처리

```typescript
export const initializeUser = () => {
  return API.users
    .getProfile()
    .then((res) => {
      if (!res.data) throw new Error('Failed to get user');
      setUser(res.data);
    })
    .catch(() => {
      signOut(); // 에러 시 로그아웃
    });
};
```

### 13.4 병렬 요청 에러 처리

```typescript
// Promise.allSettled: 일부 실패해도 다른 요청은 계속 처리
const [result1, result2] = await Promise.allSettled([
  API.products.getList(),
  API.products.getRecommended(),
]);

if (result1.status === 'fulfilled') {
  // 성공 처리
} else {
  console.error('데이터 로드 실패:', result1.reason);
}
```

---

## 14. 임포트 순서

4개 그룹으로 구분하며, 각 그룹 사이에 빈 줄로 구분한다. (ESLint 플러그인으로 자동 정렬)

```typescript
// 1. React / React Native 라이브러리
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RouteProp, StackActions, useNavigation, useRoute} from '@react-navigation/native';

// 2. 외부 라이브러리 (npm 패키지)
import dayjs from 'dayjs';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// 3. 내부 모듈 (절대 경로 별칭)
import API from '@app/APIs';
import Stores from '@app/stores';
import {colors} from '@app/styles/colors';
import Fonts from '@app/styles/fonts';
import useUserProfile from '@app/hooks/apis/useUserProfile';

// 4. 상대 경로 임포트
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
```

---

## 15. 테스트

### 15.1 테스트 전략 개요

테스트는 신뢰도와 유지보수성을 균형 있게 고려해 3계층으로 구성한다.

| 계층 | 도구 | 대상 | 비율 |
|---|---|---|---|
| 단위(Unit) | Jest | 유틸 함수, 서비스 로직, 순수 함수 | ~60% |
| 통합(Integration) | Jest + RNTL + MSW | 컴포넌트, Custom Hook, API 연동 | ~30% |
| E2E | Maestro | 사용자 핵심 플로우 (로그인, 충전 등) | ~10% |

**테스트 원칙**

- 구현 세부사항이 아닌 **동작(behavior)**을 테스트한다
- 렌더링 구조보다 사용자가 보는 텍스트와 실제 인터랙션을 기준으로 검증한다
- 각 테스트는 하나의 관심사만 검증한다 (단일 책임)
- 테스트는 독립적으로 실행 가능해야 한다 (순서 의존 금지)

---

### 15.2 Jest — 단위 테스트

#### 설정

```js
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterFramework: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/test/setup.ts',
  ],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
};
```

#### 유틸 함수 테스트

```typescript
// src/utils/__tests__/formatter.test.ts
import {formatDate, formatCurrency} from '../formatter';

describe('formatDate', () => {
  it('YYYY-MM-DD 형식으로 날짜를 반환한다', () => {
    expect(formatDate(new Date('2024-01-15'))).toBe('2024-01-15');
  });

  it('null이면 빈 문자열을 반환한다', () => {
    expect(formatDate(null)).toBe('');
  });
});

describe('formatCurrency', () => {
  it('천 단위 구분 기호가 포함된 원화 형식으로 반환한다', () => {
    expect(formatCurrency(10000)).toBe('10,000원');
  });
});
```

#### 서비스 로직 테스트

서비스 레이어는 API 호출을 모킹하고 비즈니스 로직만 검증한다.

```typescript
// src/services/__tests__/auth.test.ts
import * as authService from '../auth';
import API from '@app/APIs';
import {setUser, resetUserStore} from '@app/stores/user';

jest.mock('@app/APIs');
jest.mock('@app/stores/user');

describe('initializeUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('프로필 조회 성공 시 setUser를 호출한다', async () => {
    const mockUser = {id: 1, name: 'Test'};
    (API.users.getProfile as jest.Mock).mockResolvedValue({data: mockUser});

    await authService.initializeUser();

    expect(setUser).toHaveBeenCalledWith(mockUser);
  });

  it('프로필 조회 실패 시 signOut을 호출한다', async () => {
    (API.users.getProfile as jest.Mock).mockRejectedValue(new Error('Network'));

    await authService.initializeUser();

    expect(resetUserStore).toHaveBeenCalled();
  });
});
```

---

### 15.3 RNTL — 컴포넌트 & Hook 테스트

React Native Testing Library를 사용해 사용자 관점에서 컴포넌트를 테스트한다.

#### 기본 컴포넌트 테스트

```typescript
// src/components/__tests__/SubmitButton.test.tsx
import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import SubmitButton from '../SubmitButton';

describe('SubmitButton', () => {
  it('label 텍스트를 렌더링한다', () => {
    const {getByText} = render(
      <SubmitButton label="확인" onPress={() => {}} />,
    );

    expect(getByText('확인')).toBeTruthy();
  });

  it('버튼 클릭 시 onPress가 호출된다', () => {
    const handlePress = jest.fn();
    const {getByText} = render(
      <SubmitButton label="확인" onPress={handlePress} />,
    );

    fireEvent.press(getByText('확인'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('disabled=true 이면 onPress가 호출되지 않는다', () => {
    const handlePress = jest.fn();
    const {getByText} = render(
      <SubmitButton label="확인" onPress={handlePress} disabled />,
    );

    fireEvent.press(getByText('확인'));

    expect(handlePress).not.toHaveBeenCalled();
  });
});
```

#### Custom Hook 테스트 (`renderHook`)

```typescript
// src/hooks/__tests__/useCounter.test.ts
import {renderHook, act} from '@testing-library/react-native';
import useCounter from '../useCounter';

describe('useCounter', () => {
  it('초기값이 0이다', () => {
    const {result} = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it('increment 호출 시 count가 1 증가한다', () => {
    const {result} = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

#### React Query 훅 테스트

React Query 훅은 `QueryClientProvider` 래퍼와 함께 테스트한다. `retry: false`로 설정해 테스트 속도를 높인다.

```typescript
// src/hooks/apis/__tests__/useUserProfile.test.ts
import React from 'react';
import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import useUserProfile from '../useUserProfile';
import {server} from '../../../test/server';
import {userErrorHandlers} from '../../../test/handlers/users';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  });
  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserProfile', () => {
  it('프로필 데이터를 정상적으로 반환한다', async () => {
    const {result} = renderHook(() => useUserProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.profile).toEqual({id: 1, name: 'Test User'});
    });
  });

  it('API 에러 시 error 상태를 반환한다', async () => {
    server.use(userErrorHandlers.profileServerError);

    const {result} = renderHook(() => useUserProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

#### 쿼리 선택 기준

| 메서드 | 사용 시점 |
|---|---|
| `getByText` | 화면에 표시된 텍스트로 요소 선택 (가장 우선) |
| `getByRole` | 접근성 역할로 선택 (`button`, `header` 등) |
| `getByTestId` | `testID` prop으로 선택 (최후 수단) |
| `queryByText` | 요소가 없을 수도 있을 때 (없으면 null 반환) |
| `findByText` | 비동기 렌더링 후 요소 대기 |

> `getByTestId`는 내부 구현에 의존하므로 최후 수단으로만 사용한다. 가능하면 사용자가 실제로 보는 텍스트나 역할로 선택한다.

---

### 15.4 MSW — API 모킹

MSW(Mock Service Worker)로 네트워크 수준에서 API를 가로챈다. Axios 인스턴스를 직접 모킹하는 대신 실제 HTTP 요청을 인터셉트하므로 인터셉터 로직까지 포함한 현실적인 테스트가 가능하다.

#### 핸들러 정의

```typescript
// test/handlers/users.ts
import {http, HttpResponse} from 'msw';

export const userHandlers = [
  http.get('/api/users/profile', () => {
    return HttpResponse.json({id: 1, name: 'Test User', email: 'test@test.com'});
  }),

  http.put('/api/users/profile', async ({request}) => {
    const body = await request.json();
    return HttpResponse.json({...(body as object), id: 1});
  }),
];

// 에러 핸들러 (테스트별 오버라이드용)
export const userErrorHandlers = {
  profileNotFound: http.get('/api/users/profile', () => {
    return HttpResponse.json({message: 'Not Found'}, {status: 404});
  }),

  profileServerError: http.get('/api/users/profile', () => {
    return HttpResponse.json(
      {message: 'Internal Server Error'},
      {status: 500},
    );
  }),
};
```

#### 서버 설정

```typescript
// test/server.ts
import {setupServer} from 'msw/node';
import {userHandlers} from './handlers/users';
import {productHandlers} from './handlers/products';

export const server = setupServer(...userHandlers, ...productHandlers);
```

#### Jest 전역 설정과 연동

```typescript
// test/setup.ts  (jest.config.js의 setupFilesAfterFramework에 등록)
import {server} from './server';

beforeAll(() => server.listen({onUnhandledRequest: 'warn'}));
afterEach(() => server.resetHandlers()); // 테스트 간 핸들러 초기화
afterAll(() => server.close());
```

#### 테스트 내 핸들러 오버라이드

```typescript
import {server} from '../../../test/server';
import {userErrorHandlers} from '../../../test/handlers/users';

it('404 에러 시 error 상태를 반환한다', async () => {
  // 이 it 블록에서만 오버라이드 — afterEach에서 자동 초기화됨
  server.use(userErrorHandlers.profileNotFound);

  const {result} = renderHook(() => useUserProfile(), {wrapper: createWrapper()});

  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
  });
});
```

---

### 15.5 Maestro — E2E 테스트

Maestro는 YAML 기반의 간결한 문법으로 모바일 E2E 테스트를 작성한다. iOS/Android를 동일 파일로 지원하며 Detox 대비 설정이 단순하다.

#### 디렉토리 구조

```
e2e/
├── flows/
│   ├── auth/
│   │   ├── _login-helper.yaml   # 재사용 서브플로우 (언더스코어 접두사)
│   │   ├── login.yaml
│   │   └── logout.yaml
│   ├── charging/
│   │   ├── start-charge.yaml
│   │   └── stop-charge.yaml
│   └── onboarding.yaml
└── config.yaml
```

#### 기본 플로우 예시 — 로그인

```yaml
# e2e/flows/auth/login.yaml
appId: com.example.app
name: 로그인 플로우

---
- launchApp:
    clearState: true            # 앱 상태 초기화

- assertVisible: "이메일"
- tapOn: "이메일"
- inputText: "test@example.com"

- tapOn: "비밀번호"
- inputText: "password123"

- tapOn: "로그인"
- assertVisible: "홈"           # 로그인 성공 후 홈 화면 확인
```

#### 재사용 서브플로우

반복적으로 필요한 플로우(로그인 등)는 서브플로우로 분리하고 `runFlow`로 재사용한다.

```yaml
# e2e/flows/auth/_login-helper.yaml
- tapOn: "이메일"
- inputText: ${EMAIL}
- tapOn: "비밀번호"
- inputText: ${PASSWORD}
- tapOn: "로그인"
- assertVisible: "홈"
```

```yaml
# e2e/flows/charging/start-charge.yaml
appId: com.example.app
name: 충전 시작 플로우

---
- runFlow:
    file: ../auth/_login-helper.yaml
    env:
      EMAIL: test@example.com
      PASSWORD: password123

- tapOn: "충전소 찾기"
- assertVisible: "주변 충전소"
- tapOn:
    id: "charge-station-item-0"
- tapOn: "충전 시작"
- assertVisible: "충전 중"
```

#### 실행 명령

```bash
# 단일 플로우 실행
maestro test e2e/flows/auth/login.yaml

# 전체 E2E 테스트 실행
maestro test e2e/flows/

# 특정 디바이스에서 실행
maestro --device <device-id> test e2e/flows/
```

#### E2E 테스트 작성 원칙

- 핵심 사용자 시나리오(크리티컬 패스)에만 E2E 테스트를 작성한다
- `clearState: true`로 매 플로우 시작 시 앱 상태를 초기화한다
- 테스트 전용 계정과 테스트 환경(`staging`)을 분리한다
- `testID`보다 사용자가 실제로 보는 텍스트로 요소를 선택한다
- 반복 로직은 서브플로우로 분리하고, 파일명에 언더스코어(`_`) 접두사를 붙인다

---

### 15.6 테스트 파일 구조

테스트 파일은 대상 파일과 동일한 디렉토리의 `__tests__` 폴더에 위치시킨다.

```
src/
├── utils/
│   ├── formatter.ts
│   └── __tests__/
│       └── formatter.test.ts
│
├── services/
│   ├── auth.ts
│   └── __tests__/
│       └── auth.test.ts
│
├── components/
│   ├── SubmitButton.tsx
│   └── __tests__/
│       └── SubmitButton.test.tsx
│
└── hooks/
    ├── apis/
    │   ├── useUserProfile.ts
    │   └── __tests__/
    │       └── useUserProfile.test.ts
    └── useLocation.ts
```

#### 테스트 헬퍼 — `renderWithProviders`

React Query, Navigation 등 Provider가 필요한 컴포넌트 테스트를 위한 공통 래퍼.

```typescript
// test/utils/renderWithProviders.tsx
import React from 'react';
import {render, RenderOptions} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NavigationContainer} from '@react-navigation/native';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {retry: false, gcTime: 0},
      mutations: {retry: false},
    },
  });

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {queryClient = createTestQueryClient(), ...options}: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );

  return {...render(ui, {wrapper: Wrapper, ...options}), queryClient};
};
```

---

### 15.7 테스트 작성 원칙 요약

| 원칙 | 올바른 방식 | 피해야 할 방식 |
|---|---|---|
| 행동 기반 테스트 | 사용자가 보는 텍스트로 검증 | 컴포넌트 내부 구조(props, state) 직접 확인 |
| 단일 책임 | 하나의 `it` 블록 = 하나의 검증 | 하나의 테스트에서 여러 시나리오 검증 |
| 독립적 테스트 | `afterEach`로 상태 초기화 | 테스트 순서에 의존하는 공유 상태 |
| 현실적인 모킹 | MSW로 네트워크 레이어 모킹 | 구현 내부 함수 직접 모킹 |
| 의미 있는 테스트명 | `it('로그인 성공 시 홈으로 이동한다')` | `it('works')` / `it('test1')` |

---

## 빠른 참조

### 컨벤션 체크리스트

- [ ] 파일명: 컴포넌트 `PascalCase.tsx`, 나머지 `camelCase.ts`
- [ ] 타입: 서버 연동 → `type`, 클라이언트 전용 → `interface`
- [ ] Export: 컴포넌트/훅/API 모듈 → `default`, 유틸/타입/스토어 액션 → named
- [ ] 비즈니스 로직: 컴포넌트나 훅이 아닌 `services/`에 위치
- [ ] Props: `interface`로 정의, 기존 타입 `extends` 활용
- [ ] 스타일: `StyleSheet.create`로 컴포넌트 하단에 정의
- [ ] 동적 스타일: `useMemo` + `StyleSheet.create`
- [ ] `useCallback`: 자식 props 전달 또는 useEffect 의존성 포함 시에만 사용
- [ ] `useMemo`: 동적 스타일, 고비용 연산, 참조 안정화가 필요한 경우에만 사용
- [ ] API 함수: 접두사 규칙 준수 (`get*`, `request*`, `set*` 등)
- [ ] Hook: `use*` 접두사, 반환값 인터페이스 정의
- [ ] 고차 함수: `handle*` / `create*Handler` / `render*` 접두사 구분
- [ ] 임포트: 4그룹 순서 준수
- [ ] 커밋: `feat:`, `fix:`, `chore:` 등 타입 필수
- [ ] 에러 알림: Toast(단순 피드백) vs 팝업(확인 필요) 기준 준수
- [ ] 팝업: `Alert.alert()` 금지, Zustand 기반 전역 팝업 패턴 사용
- [ ] 에러 메시지: 기술적 메시지 노출 금지, 사용자 친화적 문구 사용
- [ ] 미사용 import: 즉시 제거 (ESLint 에러)
- [ ] 인라인 스타일: 사용 금지 (ESLint 경고)
- [ ] 색상/폰트: 하드코딩 금지, `colors`, `Fonts` 객체 사용
- [ ] 테스트: 구현 세부사항이 아닌 동작(behavior) 기준으로 작성
- [ ] 테스트 요소 선택: `getByText` / `getByRole` 우선, `getByTestId` 최후 수단
- [ ] 컴포넌트/훅 테스트: RNTL `render` / `renderHook` 사용
- [ ] API 모킹: MSW 핸들러 사용, Axios 인스턴스 직접 모킹 금지
- [ ] 에러 핸들러: 정상 핸들러와 분리 선언, `server.use()`로 테스트 내 오버라이드
- [ ] React Query 테스트: `retry: false`, `gcTime: 0` 설정
- [ ] E2E: 핵심 사용자 플로우에만 작성, `clearState: true`로 상태 초기화
- [ ] E2E 서브플로우: 반복 로직 분리, 파일명 `_` 접두사
- [ ] 테스트 파일 위치: 대상 파일 동일 디렉토리의 `__tests__/` 폴더
