# 10장 Component 작성 규칙 + 11장 스타일 시스템

## 10.1 Server Component vs Client Component

Next.js App Router에서는 컴포넌트 종류를 명확히 구분한다.

| 종류 | 선언 | 사용 시점 |
|---|---|---|
| Server Component | 기본값 (별도 선언 불필요) | 데이터 패칭, DB 직접 접근, 서버 전용 로직 |
| Client Component | 파일 상단 `'use client'` | 이벤트 핸들러, `useState`, `useEffect`, 브라우저 API |

```typescript
// ✅ Server Component (기본) — 데이터 패칭
// app/products/page.tsx
const ProductsPage = async () => {
  const products = await API.products.getList();
  return <ProductList products={products} />;
};

export default ProductsPage;
```

```typescript
// ✅ Client Component — 상호작용 필요 시
// components/LikeButton.tsx
'use client';

const LikeButton = ({productId}: LikeButtonProps) => {
  const [liked, setLiked] = useState(false);
  const handleClick = () => setLiked((prev) => !prev);
  return <button onClick={handleClick}>{liked ? '♥' : '♡'}</button>;
};

export default LikeButton;
```

**원칙**: Client Component는 최대한 트리 하단에 위치시켜 서버 렌더링 범위를 최대화한다.

**Server Component 금지 사항**:
- `useState`, `useEffect` 등 훅 사용 금지
- 이벤트 핸들러(`onClick`, `onChange` 등) 사용 금지
- 브라우저 전용 API(`window`, `document` 등) 접근 금지

---

## 10.2 기본 컴포넌트 구조 (Client Component)

컴포넌트 내부 코드 작성 순서:

```typescript
'use client'; // Client Component인 경우에만 선언

// 1. Props 인터페이스 정의 (파일 상단)
interface SubmitButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// 2. 함수형 컴포넌트 (Props 구조 분해)
const SubmitButton = ({label, onClick, disabled}: SubmitButtonProps) => {
  // 3. 로컬 상태
  const [isPressed, setIsPressed] = useState(false);

  // 4. 전역 상태
  const user = useUserStore((s) => s.user);

  // 5. 파생 값 (useMemo)
  const buttonLabel = useMemo(
    () => (isPressed ? '처리 중...' : label),
    [isPressed, label],
  );

  // 6. 콜백 함수 (useCallback)
  const handleClick = useCallback(() => {
    setIsPressed(true);
    onClick();
  }, [onClick]);

  // 7. Effects
  useEffect(() => {
    // 단일 관심사만 처리
  }, []);

  // 8. JSX 반환
  return (
    <button onClick={handleClick} disabled={disabled}>
      {buttonLabel}
    </button>
  );
};

export default SubmitButton;
```

---

## 10.3 `useCallback` / `useMemo` 사용 기준

### `useCallback` — 함수 참조 안정화

| 사용 O | 사용 X |
|---|---|
| 자식 컴포넌트의 `props`로 전달되는 함수 | 컴포넌트 내부에서만 쓰이는 단순 함수 |
| `useEffect` / `useMemo` 의존성 배열에 포함되는 함수 | 렌더마다 새로 만들어도 무방한 함수 |

```typescript
// ✅ 자식 props로 전달 → useCallback
const handleClick = useCallback(() => {
  onClick();
}, [onClick]);

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
| 연산 비용이 높은 파생 데이터 (필터링, 정렬 등) | 단순 변수 할당, 리터럴 값 |
| 렌더마다 새 참조가 생기면 안 되는 객체/배열 | 단순 조건 연산 |

```typescript
// ✅ 리스트 필터링 → useMemo
const filteredList = useMemo(
  () => products.filter((p) => p.categoryId === selectedCategory),
  [products, selectedCategory],
);

// ❌ 단순 조건 → useMemo 불필요
const label = useMemo(() => (isActive ? '활성' : '비활성'), [isActive]);
const label = isActive ? '활성' : '비활성'; // 충분
```

---

## 10.4 조건부 렌더링 패턴

```typescript
// 단순 조건
{user ? <UserView /> : <GuestView />}

// null 조건
{isLoading && <LoadingSpinner />}

// 복잡한 분기: 상수 객체로 데이터 분리
const statusConfig: Record<OrderStatus, StatusConfig> = {
  [OrderStatus.Pending]: {label: '처리 중', className: 'text-yellow-500'},
  [OrderStatus.Confirmed]: {label: '확정', className: 'text-green-500'},
  [OrderStatus.Cancelled]: {label: '취소됨', className: 'text-red-500'},
};

const config = statusConfig[orderStatus];
<StatusBadge {...config} />
```

---

## 10.5 고차 함수 패턴

### `handle<Action>` — 단순 클로저형 이벤트 핸들러

```typescript
const handleClickItem = (item: Product) => () => {
  router.push(`/products/${item.id}`);
};

const handleClickTab = (index: number) => () => {
  setSelectedTab(index);
};
```

### `create<Action>Handler` — 복잡한 로직의 핸들러 팩토리

```typescript
const createToggleFilterHandler = (type: FilterType) => () => {
  setFilters((prev) => {
    if (!prev.includes(type)) return [...prev, type];
    return prev.filter((f) => f !== type);
  });
};

const createChangeInputHandler =
  (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({...prev, [key]: e.target.value}));
  };
```

### `render<Component>` — JSX를 반환하는 렌더 함수

```typescript
const renderItem = (item: Product) => (
  <div key={item.id} onClick={handleClickItem(item)}>
    <ProductCard product={item} />
  </div>
);
```

---

## 10.6 useRef 활용 패턴

```typescript
// DOM 참조
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// 플래그 (리렌더링 없이 값 유지)
const hasShownOnboarding = useRef(false);
if (hasShownOnboarding.current) return;
hasShownOnboarding.current = true;
```

---

## 11. 스타일 시스템

프로젝트 초기에 **styled-components** 또는 **Tailwind CSS** 중 하나를 선택하고 일관되게 사용한다. **혼용 금지**.

### 11.1 색상 팔레트

**파일**: `src/styles/colors.ts`

색상은 역할(role) 기반으로 그룹화하여 관리. **하드코딩 금지**.

```typescript
export const colors = {
  main: {
    primary: '...',
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

### 11.2 타이포그래피 시스템

**파일**: `src/styles/typography.ts`

**네이밍 규칙**: `{스타일}_{무게}_{크기}`

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
export const typography = {
  h_b_32: {fontSize: '2rem', fontWeight: 700, lineHeight: 1.25},
  h_b_24: {fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.33},
  bt_b_16: {fontSize: '1rem', fontWeight: 700, lineHeight: 1.5},
  b_r_16: {fontSize: '1rem', fontWeight: 400, lineHeight: 1.5},
  b_r_14: {fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.57},
  d_r_12: {fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.67},
};
```

### 11.3 반응형 브레이크포인트

**파일**: `src/styles/breakpoints.ts`

```typescript
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

### 11.4 styled-components 사용 패턴

- Props 기반 동적 스타일은 **`$` 접두사** prop 사용 (DOM 전파 방지)
- 단순 컴포넌트는 인라인 정의 가능, 복잡한 컴포넌트는 `.styles.ts`로 분리
- 하드코딩된 색상값 금지 — 항상 `theme` 객체 참조
- `css` 헬퍼: 조건부 스타일 블록에 사용

```typescript
// ✅ theme 참조
background-color: ${({theme}) => theme.colors.main.primary};

// ❌ 하드코딩 금지
background-color: #2079BB;
```

### 11.5 Tailwind CSS 사용 패턴

- 인라인 `style` 속성 사용 금지 — Tailwind 클래스 또는 CSS 변수 활용
- 복잡한 조건부 클래스는 반드시 `cn()` 유틸 사용
- 커스텀 색상/타이포는 `tailwind.config.ts`의 `extend`에 정의
- 하드코딩된 색상 클래스 금지 (`text-[#2079BB]` → `text-primary`)
- 반응형은 Tailwind 브레이크포인트 prefix 사용 (`sm:`, `md:`, `lg:`)

```typescript
// ✅ 커스텀 토큰 클래스 사용
<div className="text-primary bg-bg-primary" />

// ❌ 하드코딩 금지
<div className="text-[#2079BB] bg-[#F5F5F5]" />
```
