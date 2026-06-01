# 테스트 전략 — Jest / React Testing Library / MSW / Playwright

## 테스트 전략 개요

| 계층 | 도구 | 대상 | 비율 |
|---|---|---|---|
| 단위(Unit) | Jest | 유틸 함수, 서비스 로직, 순수 함수 | ~60% |
| 통합(Integration) | Jest + RTL + MSW | 컴포넌트, Custom Hook, API 연동 | ~30% |
| E2E | Playwright | 사용자 핵심 플로우 (로그인, 결제 등) | ~10% |

**테스트 원칙**

- 구현 세부사항이 아닌 **동작(behavior)**을 테스트한다
- 렌더링 구조보다 사용자가 보는 텍스트와 실제 인터랙션을 기준으로 검증한다
- 각 테스트는 하나의 관심사만 검증한다 (단일 책임)
- 테스트는 독립적으로 실행 가능해야 한다 (순서 의존 금지)

---

## Jest — 단위 테스트

### 설정

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: [
    '@testing-library/jest-dom',
    '<rootDir>/test/setup.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {tsconfig: 'tsconfig.json'}],
  },
};
```

### 유틸 함수 테스트

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

---

## RTL — 컴포넌트 & Hook 테스트

### 기본 컴포넌트 테스트

```typescript
// src/components/__tests__/SubmitButton.test.tsx
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import SubmitButton from '../SubmitButton';

describe('SubmitButton', () => {
  it('label 텍스트를 렌더링한다', () => {
    render(<SubmitButton label="확인" onClick={() => {}} />);
    expect(screen.getByText('확인')).toBeInTheDocument();
  });

  it('버튼 클릭 시 onClick이 호출된다', () => {
    const handleClick = jest.fn();
    render(<SubmitButton label="확인" onClick={handleClick} />);

    fireEvent.click(screen.getByText('확인'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled=true이면 onClick이 호출되지 않는다', () => {
    const handleClick = jest.fn();
    render(<SubmitButton label="확인" onClick={handleClick} disabled />);

    fireEvent.click(screen.getByText('확인'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### Custom Hook 테스트 (`renderHook`)

```typescript
// src/hooks/__tests__/useCounter.test.ts
import {renderHook, act} from '@testing-library/react';
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

### React Query 훅 테스트

```typescript
// src/hooks/apis/__tests__/useUserProfile.test.ts
import React from 'react';
import {renderHook, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import useUserProfile from '../useUserProfile';
import {server} from '../../../test/server';
import {userErrorHandlers} from '../../../test/handlers/users';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {queries: {retry: false, gcTime: 0}},
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

### 쿼리 선택 기준

| 메서드 | 사용 시점 |
|---|---|
| `getByText` | 화면에 표시된 텍스트로 요소 선택 (가장 우선) |
| `getByRole` | 접근성 역할로 선택 (`button`, `heading` 등) |
| `getByTestId` | `data-testid` 속성으로 선택 (**최후 수단**) |
| `queryByText` | 요소가 없을 수도 있을 때 (없으면 null 반환) |
| `findByText` | 비동기 렌더링 후 요소 대기 |

> `getByTestId`는 내부 구현에 의존하므로 최후 수단으로만 사용한다.

---

## MSW — API 모킹

MSW(Mock Service Worker)로 네트워크 수준에서 API를 가로챈다.
Axios 인스턴스를 직접 모킹하는 대신 실제 HTTP 요청을 인터셉트하므로 인터셉터 로직까지 포함한 현실적인 테스트가 가능하다.

### 핸들러 정의

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

### 서버 설정

```typescript
// test/server.ts
import {setupServer} from 'msw/node';
import {userHandlers} from './handlers/users';
import {productHandlers} from './handlers/products';

export const server = setupServer(...userHandlers, ...productHandlers);
```

### Jest 전역 설정과 연동

```typescript
// test/setup.ts
import {server} from './server';

beforeAll(() => server.listen({onUnhandledRequest: 'warn'}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Playwright — E2E 테스트

### 디렉토리 구조

```
e2e/
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   ├── products/
│   │   ├── product-list.spec.ts
│   │   └── product-detail.spec.ts
│   └── checkout.spec.ts
├── fixtures/
│   └── auth.ts           # 로그인 상태 fixture
└── playwright.config.ts
```

### 설정

```typescript
// playwright.config.ts
import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  baseURL: 'http://localhost:3000',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',    // 또는 yarn dev, pnpm dev
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 기본 테스트 예시

```typescript
// e2e/tests/auth/login.spec.ts
import {test, expect} from '@playwright/test';

test.describe('로그인', () => {
  test('이메일/비밀번호로 로그인 성공 시 홈으로 이동한다', async ({page}) => {
    await page.goto('/login');

    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', {name: '로그인'}).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('홈')).toBeVisible();
  });

  test('잘못된 비밀번호 시 에러 메시지가 표시된다', async ({page}) => {
    await page.goto('/login');

    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('wrong');
    await page.getByRole('button', {name: '로그인'}).click();

    await expect(page.getByText('로그인에 실패했습니다')).toBeVisible();
  });
});
```

### E2E 테스트 작성 원칙

- 핵심 사용자 시나리오(크리티컬 패스)에만 E2E 테스트를 작성한다
- `data-testid`보다 사용자가 실제로 보는 텍스트로 요소를 선택한다
- 테스트 전용 계정과 테스트 환경(`staging`)을 분리한다
- 로그인 등 반복 로직은 Playwright fixture로 분리한다

### 실행 명령

```bash
# 전체 E2E 실행
npx playwright test

# 특정 파일 실행
npx playwright test e2e/tests/auth/login.spec.ts

# UI 모드 (디버깅)
npx playwright test --ui

# 리포트 확인
npx playwright show-report
```

---

## 테스트 파일 구조

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
    └── useDebounce.ts
```

### 테스트 헬퍼 — `renderWithProviders`

```typescript
// test/utils/renderWithProviders.tsx
import React from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {...render(ui, {wrapper: Wrapper, ...options}), queryClient};
};
```

---

## 테스트 작성 원칙 요약

| 원칙 | 올바른 방식 | 피해야 할 방식 |
|---|---|---|
| 행동 기반 테스트 | 사용자가 보는 텍스트로 검증 | 컴포넌트 내부 구조(props, state) 직접 확인 |
| 단일 책임 | 하나의 `it` 블록 = 하나의 검증 | 하나의 테스트에서 여러 시나리오 검증 |
| 독립적 테스트 | `afterEach`로 상태 초기화 | 테스트 순서에 의존하는 공유 상태 |
| 현실적인 모킹 | MSW로 네트워크 레이어 모킹 | 구현 내부 함수 직접 모킹 |
| 의미 있는 테스트명 | `it('로그인 성공 시 홈으로 이동한다')` | `it('works')` / `it('test1')` |
