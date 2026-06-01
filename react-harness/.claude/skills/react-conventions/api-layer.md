# 7장 API 레이어 + 13장 에러 처리

## API 함수 네이밍 접두사 (4.3)

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

---

## 7.1 Axios 인스턴스 구성

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

---

## 7.2 도메인별 API 모듈 구조

API는 도메인별로 파일을 분리하고, **기본 내보내기 객체**로 관리

```typescript
// src/apis/users.ts

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

---

## 7.3 API 통합 내보내기

**파일**: `src/apis/index.ts`

```typescript
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

## 레이어별 책임 범위

| 레이어 | 책임 | 금지 |
|---|---|---|
| `components/`, `app/` | UI 렌더링, 이벤트 수신 | 비즈니스 로직, 직접 API 호출 |
| `hooks/` | 상태/로직 캡슐화, 컴포넌트에 데이터 제공 | 여러 도메인을 넘나드는 사이드이펙트 |
| `services/` | 비즈니스 플로우 조합 (API + 스토어 + 사이드이펙트) | UI 참조 |
| `apis/` | HTTP 요청/응답 | 상태 변경, 라우팅 |
| `stores/` | 전역 상태 보관 및 단순 업데이트 | 비동기 로직, API 호출 |
| `utils/` | 순수 함수 (입력 → 출력) | 사이드이펙트, 외부 의존성 |

---

## 에러 처리 (13장)

### 에러 처리 계층

| 계층 | 처리 방법 |
|---|---|
| HTTP 에러 | Axios 인터셉터 (자동 처리) |
| API 에러 코드 | 인터셉터에서 `Promise.reject` |
| 인증 만료 | 인터셉터에서 자동 갱신 후 재시도 |
| Mutation 실패 | `onError` 콜백에서 롤백 |
| 사용자 알림 | Toast (단순 피드백) 또는 전역 모달 — `window.alert()` **사용 금지** |
| Next.js 에러 | `error.tsx` 에러 바운더리로 처리 |

### 알림 방식 선택 기준

| 상황 | 방식 |
|---|---|
| 단순 결과 안내 (성공/실패 피드백) | **Toast** |
| 사용자 확인/선택이 필요한 에러 | **모달** |
| 설정 이동 등 후속 액션이 있는 에러 | **모달** (확인/취소 버튼) |
| 백그라운드 작업 실패 (사용자가 인지할 필요 없음) | **silent** (로깅만) |

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

// ✅ 사용자 친화적 메시지
openModal({message: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'});

// ❌ 기술적 메시지 노출 금지
openModal({message: error.message}); // 'AxiosError: Request failed with status code 500'
```

### 전역 모달 패턴 (Zustand 기반)

`window.alert()` / `window.confirm()` 대신 커스텀 모달을 Zustand 스택으로 제어한다.

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

### Next.js 에러 바운더리

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
