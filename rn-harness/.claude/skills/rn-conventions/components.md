# 10장 Component 작성 규칙 + 11장 스타일 시스템

## 10.1 기본 컴포넌트 구조

컴포넌트 내부 코드 작성 순서:

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

---

## 10.2 `useCallback` / `useMemo` 사용 기준

### `useCallback` — 함수 참조 안정화

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

### `useMemo` — 값 계산 결과 캐싱

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

단순 조건부 스타일은 배열로 처리 (`useMemo` 불필요):

```typescript
<View style={[styles.container, disabled && styles.disabled, style]} />
```

---

## 10.3 조건부 렌더링 패턴

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

---

## 10.4 고차 함수 패턴

### `handle<Action>` — 단순 클로저형 이벤트 핸들러

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

### `create<Action>Handler` — 복잡한 로직의 핸들러 팩토리

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

### `render<Component>` — JSX를 반환하는 렌더 함수

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

---

## 10.5 useRef 활용 패턴

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

색상은 역할(role) 기반으로 그룹화하여 관리. **하드코딩 금지**.

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
