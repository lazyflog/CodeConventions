# 4장 — Naming Convention

## 4.1 파일 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| React 컴포넌트 | `PascalCase.tsx` | `UserProfile.tsx`, `SubmitButton.tsx` |
| Custom Hook | `camelCase.ts` | `useAuth.ts`, `useInfiniteList.ts` |
| API 모듈 | `camelCase.ts` | `users.ts`, `products.ts` |
| 유틸리티 | `camelCase.ts` | `formatter.ts`, `storage.ts` |
| 스타일 | `camelCase.ts(x)` | `colors.tsx`, `fonts.tsx` |
| 타입 정의 | `camelCase.ts` | `routerType.ts`, `commonType.ts` |

---

## 4.2 변수/함수 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| 변수 | `camelCase` | `userName`, `isLoading` |
| 함수 | `동사+명사 camelCase` | `handlePressButton`, `formatDate` |
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

## 4.4 Custom Hook 네이밍

- `use*` 접두사 필수 (`useCurrentLocation`, `useToast`)
- Hook이 반환하는 함수는 핵심 동작을 명확히 표현 (`fetchLocation`, `showToast`)
- 이벤트 핸들러는 `handle*` 접두사 (`handlePressTab`, `handleLoadError`)

---

## 고차 함수 네이밍 (10장에서 정의, 네이밍 관련)

| 접두사 | 사용 시점 | 예시 |
|---|---|---|
| `handle<Action>` | 단순 파라미터 캡처 → 이벤트 핸들러 | `handlePressItem`, `handleLayout` |
| `create<Action>Handler` | 복잡한 조건/비동기/상태 조합 핸들러 | `createPressFilterHandler`, `createSwitchChangeHandler` |
| `render<Component>` | JSX 반환 함수 | `renderItem`, `renderFilterChip`, `renderHeader` |

```typescript
// handle<Action> — 단순 클로저형
const handlePressItem = (item: Product) => () => {
  navigation.navigate('ProductDetailScreen', {id: item.id});
};

// create<Action>Handler — 복잡한 로직
const createPressFilterHandler = (type: FilterType) => () => {
  setFilters((prev) => {
    if (!prev.includes(type)) return [...prev, type];
    return prev.filter((f) => f !== type);
  });
};

// render<Component> — JSX 반환
const renderItem: ListRenderItem<Product> = ({item}) => (
  <TouchableOpacity onPress={handlePressItem(item)}>
    <ProductCard product={item} />
  </TouchableOpacity>
);
```

---

## 임포트 순서 (14장)

4개 그룹으로 구분하며, 각 그룹 사이에 빈 줄로 구분한다.

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
chore: 버전 코드 bump
```
