# 12장 — 라우팅 (Next.js App Router)

## 12.1 파일 기반 라우팅 규칙

| 파일 | 역할 |
|---|---|
| `page.tsx` | 라우트의 UI, `params`/`searchParams` props 수신 |
| `layout.tsx` | 공통 레이아웃 (중첩 가능) |
| `loading.tsx` | Suspense 스켈레톤/로딩 UI |
| `error.tsx` | 에러 바운더리 UI (Client Component 필수) |
| `not-found.tsx` | 404 UI |
| `route.ts` | API Route Handler (서버 전용) |

**특수 파일 네이밍**: 모두 소문자 (`page.tsx`, `layout.tsx`, `loading.tsx` 등)

---

## 12.2 동적 라우트 및 params 타입

```typescript
// app/products/[id]/page.tsx
interface ProductDetailPageProps {
  params: {id: string};
  searchParams: {[key: string]: string | string[] | undefined};
}

const ProductDetailPage = async ({params}: ProductDetailPageProps) => {
  const product = await API.products.getById(params.id);

  return <ProductDetail product={product} />;
};

export default ProductDetailPage;
```

### 동적 라우트 패턴

| 패턴 | 경로 예시 | `params` |
|---|---|---|
| `[id]` | `/products/123` | `{id: '123'}` |
| `[...slug]` | `/blog/2024/01/title` | `{slug: ['2024', '01', 'title']}` |
| `[[...slug]]` | `/blog` 또는 `/blog/a/b` | `{slug: undefined}` 또는 `{slug: ['a', 'b']}` |

---

## 12.3 클라이언트 사이드 라우팅

```typescript
'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';

const NavigationExample = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleNavigate = () => {
    router.push('/products');
    // router.replace('/login'); // 히스토리 교체
    // router.back();           // 뒤로가기
  };

  return <button onClick={handleNavigate}>이동</button>;
};
```

**라우팅 훅 사용 규칙**:
- `useRouter`, `usePathname`, `useSearchParams`는 Client Component에서만 사용
- Server Component에서는 `params` / `searchParams` props로 수신

---

## 12.4 라우트 그룹

관련 페이지를 그룹화하되 URL에 영향 없음.

```
app/
├── (auth)/          # URL: /login, /register (괄호 그룹은 URL에 포함 안 됨)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (main)/          # URL: /, /products
│   ├── page.tsx
│   └── products/
│       └── page.tsx
└── (admin)/         # URL: /dashboard
    └── dashboard/
        └── page.tsx
```

**라우트 그룹 용도**:
- 같은 레이아웃을 공유하는 페이지 묶기 (각 그룹에 `layout.tsx` 배치)
- 관심사에 따른 논리적 파일 구조 정리
- URL 구조에 영향 없이 코드 조직화

---

## 12.5 레이아웃 중첩

```typescript
// app/layout.tsx — 루트 레이아웃 (모든 페이지에 적용)
const RootLayout = ({children}: {children: React.ReactNode}) => (
  <html>
    <body>
      <QueryClientProvider client={queryClient}>
        {children}
        <GlobalModal />
        <GlobalToast />
      </QueryClientProvider>
    </body>
  </html>
);

export default RootLayout;
```

```typescript
// app/(main)/layout.tsx — main 그룹 레이아웃
const MainLayout = ({children}: {children: React.ReactNode}) => (
  <div>
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

export default MainLayout;
```

---

## 12.6 Server Component와 데이터 패칭

`page.tsx`는 기본적으로 Server Component이므로 직접 데이터 패칭이 가능하다.

```typescript
// app/products/page.tsx — Server Component (기본)
const ProductsPage = async () => {
  const products = await API.products.getList(); // 서버에서 직접 호출

  return (
    <div>
      <h1>상품 목록</h1>
      <ProductList products={products} />
    </div>
  );
};

export default ProductsPage;
```

**원칙**:
- `page.tsx`에서 가능하면 서버에서 데이터를 패칭한다
- 클라이언트 사이드 패칭이 필요한 경우(실시간 업데이트, 사용자 인터랙션 후 패칭) React Query 훅 사용
- Server Component에서 Client Component로 데이터를 props로 전달하는 패턴 권장

---

## 12.7 Link 컴포넌트

페이지 간 이동은 `<Link>` 컴포넌트 사용 (클라이언트 사이드 네비게이션, 프리페칭 지원).

```typescript
import Link from 'next/link';

// ✅ Link 사용
<Link href="/products">상품 목록</Link>
<Link href={`/products/${product.id}`}>상세 보기</Link>

// ❌ a 태그 직접 사용 금지 (풀 리로드 발생)
<a href="/products">상품 목록</a>
```

**프로그래매틱 네비게이션** (이벤트 핸들러 내에서):
- `router.push()`: 히스토리 스택에 추가
- `router.replace()`: 현재 히스토리 교체
- `router.back()`: 뒤로가기
