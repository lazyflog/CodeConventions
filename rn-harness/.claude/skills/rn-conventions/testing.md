# 15장 — 테스트

## 15.1 테스트 전략 개요

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

## 15.2 Jest — 단위 테스트

### 설정

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

### 서비스 로직 테스트

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

## 15.3 RNTL — 컴포넌트 & Hook 테스트

### 기본 컴포넌트 테스트

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

### Custom Hook 테스트 (`renderHook`)

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

### React Query 훅 테스트

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

### 쿼리 선택 기준

| 메서드 | 사용 시점 |
|---|---|
| `getByText` | 화면에 표시된 텍스트로 요소 선택 (가장 우선) |
| `getByRole` | 접근성 역할로 선택 (`button`, `header` 등) |
| `getByTestId` | `testID` prop으로 선택 (**최후 수단**) |
| `queryByText` | 요소가 없을 수도 있을 때 (없으면 null 반환) |
| `findByText` | 비동기 렌더링 후 요소 대기 |

> `getByTestId`는 내부 구현에 의존하므로 최후 수단으로만 사용한다.

---

## 15.4 MSW — API 모킹

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
// test/setup.ts  (jest.config.js의 setupFilesAfterFramework에 등록)
import {server} from './server';

beforeAll(() => server.listen({onUnhandledRequest: 'warn'}));
afterEach(() => server.resetHandlers()); // 테스트 간 핸들러 초기화
afterAll(() => server.close());
```

### 테스트 내 핸들러 오버라이드

```typescript
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

## 15.5 Maestro — E2E 테스트

### 디렉토리 구조

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

### 기본 플로우 예시 — 로그인

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

### 재사용 서브플로우

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
```

### 실행 명령

```bash
# 단일 플로우 실행
maestro test e2e/flows/auth/login.yaml

# 전체 E2E 테스트 실행
maestro test e2e/flows/

# 특정 디바이스에서 실행
maestro --device <device-id> test e2e/flows/
```

### E2E 테스트 작성 원칙

- 핵심 사용자 시나리오(크리티컬 패스)에만 E2E 테스트를 작성한다
- `clearState: true`로 매 플로우 시작 시 앱 상태를 초기화한다
- 테스트 전용 계정과 테스트 환경(`staging`)을 분리한다
- `testID`보다 사용자가 실제로 보는 텍스트로 요소를 선택한다
- 반복 로직은 서브플로우로 분리하고, 파일명에 언더스코어(`_`) 접두사를 붙인다

---

## 15.6 테스트 파일 구조

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

### 테스트 헬퍼 — `renderWithProviders`

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

## 15.7 테스트 작성 원칙 요약

| 원칙 | 올바른 방식 | 피해야 할 방식 |
|---|---|---|
| 행동 기반 테스트 | 사용자가 보는 텍스트로 검증 | 컴포넌트 내부 구조(props, state) 직접 확인 |
| 단일 책임 | 하나의 `it` 블록 = 하나의 검증 | 하나의 테스트에서 여러 시나리오 검증 |
| 독립적 테스트 | `afterEach`로 상태 초기화 | 테스트 순서에 의존하는 공유 상태 |
| 현실적인 모킹 | MSW로 네트워크 레이어 모킹 | 구현 내부 함수 직접 모킹 |
| 의미 있는 테스트명 | `it('로그인 성공 시 홈으로 이동한다')` | `it('works')` / `it('test1')` |
