# 4장 — Naming Convention

## 4.1 파일 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| React 컴포넌트 | `PascalCase.tsx` | `UserProfile.tsx`, `SubmitButton.tsx` |
| Next.js 특수 파일 | 소문자 규칙 준수 | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| Custom Hook | `camelCase.ts` | `useAuth.ts`, `useInfiniteList.ts` |
| API 모듈 | `camelCase.ts` | `users.ts`, `products.ts` |
| 유틸리티 | `camelCase.ts` | `formatter.ts`, `storage.ts` |
| 스타일 (styled-components) | `<Component>.styles.ts` | `Button.styles.ts`, `common.styles.ts` |
| 타입 정의 | `camelCase.ts` | `routeType.ts`, `commonType.ts` |

---

## 4.2 변수/함수 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| 변수 | `camelCase` | `userName`, `isLoading` |
| 함수 | `동사+명사 camelCase` | `handleClickButton`, `formatDate` |
| 타입/인터페이스 | `PascalCase` | `User`, `ProductListProps` |
| Enum | `PascalCase` | `OrderStatus`, `UserRole` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |

---

## 4.3 API 함수 네이밍 접두사

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

## 4.4 이벤트 핸들러 네이밍

React에서 이벤트는 `on` 접두사(prop)와 `handle` 접두사(구현)를 구분한다.

| 접두사 | 용도 | 예시 |
|---|---|---|
| `on*` | Props로 받는 이벤트 콜백 | `onSubmit`, `onClick`, `onChange` |
| `handle*` | 컴포넌트 내부 이벤트 구현 | `handleSubmit`, `handleClickButton` |

---

## 4.5 Custom Hook 네이밍

- `use*` 접두사 필수 (`useCurrentUser`, `useToast`)
- Hook이 반환하는 함수는 핵심 동작을 명확히 표현 (`fetchUser`, `showToast`)
- 이벤트 핸들러는 `handle*` 접두사 (`handleClickTab`, `handleChangeInput`)

---

## 고차 함수 네이밍 (10장에서 정의, 네이밍 관련)

| 접두사 | 사용 시점 | 예시 |
|---|---|---|
| `handle<Action>` | 단순 파라미터 캡처 → 이벤트 핸들러 | `handleClickItem`, `handleChangeInput` |
| `create<Action>Handler` | 복잡한 조건/비동기/상태 조합 핸들러 | `createToggleFilterHandler`, `createChangeInputHandler` |
| `render<Component>` | JSX 반환 함수 | `renderItem`, `renderFilterChip` |

```typescript
// handle<Action> — 단순 클로저형
const handleClickItem = (item: Product) => () => {
  router.push(`/products/${item.id}`);
};

// create<Action>Handler — 복잡한 로직
const createToggleFilterHandler = (type: FilterType) => () => {
  setFilters((prev) => {
    if (!prev.includes(type)) return [...prev, type];
    return prev.filter((f) => f !== type);
  });
};

// render<Component> — JSX 반환
const renderItem = (item: Product) => (
  <div key={item.id} onClick={handleClickItem(item)}>
    <ProductCard product={item} />
  </div>
);
```

---

## 임포트 순서 (14장)

4개 그룹으로 구분하며, 각 그룹 사이에 빈 줄로 구분한다.

```typescript
// 1. React / Next.js 라이브러리
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// 2. 외부 라이브러리 (npm 패키지)
import dayjs from 'dayjs';
import {useForm} from 'react-hook-form';
import styled from 'styled-components';

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

## Commit Messages (3장)

[Conventional Commits](https://www.conventionalcommits.org/) 명세를 따른다.

**형식**: `<type>: <description>`

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

**제약 조건**: 헤더 최대 100자

```
feat: 즐겨찾기 기능 추가
fix: 토큰 리프레시 로직 수정
chore: 의존성 업데이트
```
