/**
 * Server Component 보일러플레이트
 *
 * 적용된 컨벤션:
 * - [10.1] Server Component: 'use client' 없음 (기본값)
 * - [10.1] async 함수로 직접 데이터 패칭
 * - [12.2] params/searchParams Props 타입 정의
 * - [5.2] 서버 연동 타입 → type, 페이지 Props → interface
 * - [5.4] 페이지 컴포넌트 → default export
 * - [7.3] API 통합 객체 사용
 *
 * 주의:
 * - useState, useEffect 등 훅 사용 금지
 * - onClick 등 이벤트 핸들러 사용 금지
 * - window, document 등 브라우저 API 접근 금지
 * - 상호작용이 필요한 부분은 Client Component로 분리하여 import
 */

import API from '@/apis'; // [7.3] API 통합 객체

// Client Component 임포트 (상호작용이 필요한 부분만)
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter'; // 'use client' 컴포넌트

// [5.2] 서버 연동 타입 → type
type ProductModel = {
  id: number;
  name: string;
  price: number;
  categoryId: string;
};

// [12.2] 페이지 Props → interface (클라이언트 전용)
interface ProductsPageProps {
  searchParams: {[key: string]: string | string[] | undefined};
}

// [10.1] Server Component — async 함수로 직접 데이터 패칭
const ProductsPage = async ({searchParams}: ProductsPageProps) => {
  // 서버에서 직접 API 호출 (React Query 불필요)
  const category = typeof searchParams.category === 'string'
    ? searchParams.category
    : undefined;

  const products: ProductModel[] = await API.products
    .getList({category})
    .then((res) => res.data);

  return (
    <div>
      <h1>상품 목록</h1>

      {/* Client Component — 필터 상호작용 */}
      <ProductFilter currentCategory={category} />

      {/* Server Component에서 데이터를 props로 전달 */}
      <div>
        {products.length === 0 ? (
          <p>상품이 없습니다.</p>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

// [5.4] 페이지 컴포넌트 → default export
export default ProductsPage;
