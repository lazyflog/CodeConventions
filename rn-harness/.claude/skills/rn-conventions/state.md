# 8장 상태 관리 + 9장 Custom Hooks

## 8. 상태 관리

### 8.1 3계층 상태 관리 원칙

| 계층 | 도구 | 용도 |
|---|---|---|
| 로컬 상태 | `useState` | 컴포넌트 내부 UI 상태 |
| 전역 상태 | `Zustand` | 앱 전반에서 공유하는 상태 |
| 서버 상태 | `React Query` | 서버 데이터 fetching, 캐싱, 동기화 |

### `useState` → `Zustand`로 올리는 기준

아래 조건 중 하나라도 해당하면 `Zustand`로 이동한다.

| 조건 | 예시 |
|---|---|
| 2개 이상의 컴포넌트가 동일 상태를 공유 | 여러 화면에서 로그인 여부 참조 |
| 화면 전환 후에도 상태가 유지되어야 함 | 필터 설정, 선택된 탭 인덱스 |
| 앱 재시작 후에도 유지되어야 함 (`persist`) | 사용자 토큰, 알림 설정 |
| 전역 UI 제어 (팝업, 로딩 등) | `popupStack`, `isInLoading` |

반대로 단일 컴포넌트 내부에서만 쓰이는 상태(입력값, 토글, 포커스 등)는 `useState`로 유지한다.

---

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

---

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

---

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

---

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

---

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

## services/ 레이어 — 비즈니스 로직

비즈니스 로직(API 결과 가공, 여러 스토어 액션 조합, 앱 초기화 등)은 `services/`에 위치.
컴포넌트나 훅에서 직접 처리하지 않는다.

```typescript
// src/services/auth.ts
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

```typescript
// 병렬 요청 에러 처리
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
