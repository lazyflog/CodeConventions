# 5장 — TypeScript

## 5.1 경로 별칭

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

---

## 5.2 타입 정의 원칙

- 모든 변수, 함수에 명시적 타입 정의 (`noImplicitAny` 활성화)
- **`any` 사용 금지** — 부득이한 경우 `unknown` 사용 후 타입 가드 적용

### `interface` vs `type` 사용 기준

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

---

## 5.3 Enum 사용

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

---

## 5.4 Export 방식

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

## 5.5 Formatting (Prettier 설정)

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

## 5.6 ESLint 설정

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
