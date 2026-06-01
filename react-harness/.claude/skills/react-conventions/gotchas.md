# Gotchas — Claude가 자주 틀리는 패턴

원본 문서에서 ❌ 안티패턴, 주의사항, 금지 규칙만 추출.
Claude가 기본값으로 돌아가려는 지점에 집중.

---

## 1. `window.alert()` / `window.confirm()` 사용 금지

```typescript
// ❌ 절대 사용 금지
window.alert('오류가 발생했습니다.');
window.confirm('정말 삭제하시겠습니까?');

// ✅ Zustand 기반 전역 모달 사용
openModal({message: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'});

// ✅ 단순 피드백은 Toast
showToast('저장되었습니다.');
showErrorToast('요청 처리 중 오류가 발생했습니다.');
```

> **이유**: `window.alert()`/`window.confirm()`은 스타일 커스터마이징 불가, 브라우저마다 UI 불일치, 렌더링 차단

---

## 2. `any` 타입 사용 금지

```typescript
// ❌ 금지
const processData = (data: any) => { ... };
const response: any = await API.users.getProfile();

// ✅ unknown + 타입 가드 사용
const processData = (data: unknown) => {
  if (typeof data === 'string') { ... }
};

// ✅ 정확한 타입 정의
const response: UserModel = await API.users.getProfile();
```

---

## 3. 인라인 스타일 금지

```typescript
// ❌ 금지
<div style={{flex: 1, backgroundColor: '#fff'}} />
<p style={{fontSize: 16, color: '#333'}}>텍스트</p>

// ✅ styled-components 사용 시
<StyledContainer />  // styled.div`...`

// ✅ Tailwind CSS 사용 시
<div className="flex-1 bg-bg-primary" />
<p className="text-base text-text-primary">텍스트</p>
```

---

## 4. 색상/폰트 하드코딩 금지

```typescript
// ❌ 금지 (styled-components)
color: '#2079BB';
background-color: '#F5F5F5';
font-size: 16px;

// ❌ 금지 (Tailwind)
className="text-[#2079BB] bg-[#F5F5F5]"

// ✅ styled-components — theme 참조
color: ${({theme}) => theme.colors.main.primary};
${({theme}) => theme.typography.b_r_16};

// ✅ Tailwind — 커스텀 토큰 클래스
className="text-primary bg-bg-primary"
```

---

## 5. `useCallback` 남용 금지

```typescript
// ❌ 컴포넌트 내부에서만 쓰이는 단순 함수에 useCallback 불필요
const handleToggle = useCallback(() => {
  setVisible((v) => !v);
}, []); // 불필요

// ✅ useCallback 사용 기준:
// (1) 자식 컴포넌트 props로 전달되는 함수
const handleClick = useCallback(() => {
  onClick();
}, [onClick]);

// (2) useEffect / useMemo 의존성 배열에 포함되는 함수
const fetchData = useCallback(async () => {
  const data = await API.products.getList();
  setProducts(data);
}, []);

useEffect(() => { fetchData(); }, [fetchData]);
```

---

## 6. `useMemo` 남용 금지

```typescript
// ❌ 단순 조건에 useMemo 불필요
const label = useMemo(() => (isActive ? '활성' : '비활성'), [isActive]);

// ✅ 단순 조건은 직접 표현식으로
const label = isActive ? '활성' : '비활성';

// ✅ useMemo 사용 기준:
// (1) 리스트 필터링 등 고비용 연산
const filteredList = useMemo(
  () => products.filter((p) => p.categoryId === selectedCategory),
  [products, selectedCategory],
);

// (2) 렌더마다 새 참조가 생기면 안 되는 객체/배열
```

---

## 7. interface vs type 혼용 금지

```typescript
// ❌ 클라이언트 전용 타입에 type 사용
type SubmitButtonProps = {
  label: string;
  onClick: () => void;
};

// ✅ 클라이언트 전용(Props, Hook 반환) → interface
interface SubmitButtonProps {
  label: string;
  onClick: () => void;
}

// ❌ 서버 연동 타입에 interface 사용
interface CreateOrderRequest {
  productId: number;
  quantity: number;
}

// ✅ 서버 연동 타입(API 요청/응답, 모델) → type
type CreateOrderRequest = {
  productId: number;
  quantity: number;
};
```

---

## 8. Export 방식 혼용 금지

```typescript
// ❌ 컴포넌트에 named export
export const SubmitButton = () => { ... };

// ✅ 컴포넌트 → default export
const SubmitButton = () => { ... };
export default SubmitButton;

// ❌ 유틸 함수에 default export
const formatDate = (date: Date) => { ... };
export default formatDate;

// ✅ 유틸 함수 → named export (트리쉐이킹)
export const formatDate = (date: Date) => { ... };
export const formatCurrency = (amount: number) => { ... };
```

---

## 9. 비즈니스 로직을 컴포넌트/훅에 직접 작성 금지

```typescript
// ❌ 컴포넌트에서 비즈니스 로직 직접 처리
const LoginPage = () => {
  const handleLogin = async () => {
    const res = await API.auth.signIn(credentials);
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
    router.push('/');
    // 스토어 업데이트, 스토리지 저장, 라우팅 조합 = 비즈니스 로직
  };
};

// ✅ services/ 레이어에서 처리
// src/services/auth.ts
export const signIn = async (credentials: SignInRequest) => {
  const res = await API.auth.signIn(credentials);
  setUser(res.data.user);
  localStorage.setItem('token', res.data.token);
};

// 컴포넌트는 서비스 함수만 호출
const handleLogin = async () => {
  await authService.signIn(credentials);
  router.push('/');
};
```

---

## 10. 기술적 에러 메시지 노출 금지

```typescript
// ❌ 기술적 메시지 그대로 노출
openModal({message: error.message});
// 'AxiosError: Request failed with status code 500'

// ✅ 사용자 친화적 메시지
openModal({message: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'});
```

---

## 11. API 모킹 시 Axios 인스턴스 직접 모킹 금지

```typescript
// ❌ Axios 인스턴스 직접 모킹 (인터셉터 로직 테스트 불가)
jest.mock('@/apis');
(API.users.getProfile as jest.Mock).mockResolvedValue({data: mockUser});

// ✅ MSW로 네트워크 레이어에서 인터셉트 (인터셉터까지 포함한 현실적 테스트)
export const userHandlers = [
  http.get('/api/users/profile', () => {
    return HttpResponse.json({id: 1, name: 'Test User'});
  }),
];
```

> 단, 서비스 레이어 단위 테스트에서 API 호출 자체를 모킹하는 것은 허용

---

## 12. 테스트에서 `getByTestId` 남용 금지

```typescript
// ❌ testID에 의존 (내부 구현 의존)
const button = screen.getByTestId('submit-button');
fireEvent.click(button);

// ✅ 사용자가 보는 텍스트 우선
fireEvent.click(screen.getByText('확인'));

// ✅ 접근성 역할 활용
fireEvent.click(screen.getByRole('button', {name: '확인'}));
```

---

## 13. Zustand 스토어에 비동기 로직/API 호출 금지

```typescript
// ❌ 스토어 내부에 API 호출
const userStore = create<State>()(() => ({
  user: null,
  fetchUser: async () => {  // ← API 호출은 스토어 책임이 아님
    const res = await API.users.getProfile();
    set({user: res.data});
  },
}));

// ✅ 스토어는 단순 상태 보관 + 액션만
const userStore = create<State>()(() => ({...initialState}));

export const setUser = (user: User) => userStore.setState({user});
export const resetUserStore = () => userStore.setState(initialState);

// 비동기 로직은 services/ 또는 React Query 훅에서 처리
```

---

## 14. React Query 훅 테스트 시 retry 설정 누락

```typescript
// ❌ retry 미설정 시 실패 테스트가 3회 재시도하여 느려짐
const queryClient = new QueryClient();

// ✅ 테스트용 QueryClient는 retry: false 필수
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {retry: false, gcTime: 0},
    mutations: {retry: false},
  },
});
```

---

## 15. 미사용 import 방치 금지

```typescript
// ❌ 미사용 import (ESLint 에러)
import {useState, useEffect, useCallback} from 'react';
// useCallback을 실제로 사용하지 않는 경우

// ✅ 사용하는 것만 import
import {useState, useEffect} from 'react';

// 미사용 변수는 _ 접두사 (경고 무시)
const {_unusedParam, usedParam} = props;
```

---

## 16. `'use client'` 남용 금지

```typescript
// ❌ 모든 컴포넌트에 'use client' 추가
'use client'; // ← 데이터 패칭만 하는 페이지에 불필요

const ProductsPage = () => {
  const {data} = useQuery(...);
  return <ProductList products={data} />;
};

// ✅ Server Component를 기본으로 사용
// app/products/page.tsx (Server Component)
const ProductsPage = async () => {
  const products = await API.products.getList();
  return <ProductList products={products} />;
};

// 'use client'는 상호작용이 필요한 컴포넌트에만 + 트리 하단에 배치
```

---

## 17. styled-components / Tailwind CSS 혼용 금지

```typescript
// ❌ 같은 프로젝트에서 혼용
<StyledButton>...</StyledButton>                    // styled-components
<div className="flex items-center">...</div>         // Tailwind

// ✅ 프로젝트 초기에 하나를 선택하고 일관되게 사용
```
