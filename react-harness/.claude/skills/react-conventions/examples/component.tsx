/**
 * Client Component 보일러플레이트
 *
 * 적용된 컨벤션:
 * - [10.1] Server vs Client: 'use client' 선언 (이벤트 핸들러, useState 사용)
 * - [10.2] Props 인터페이스: interface 사용 — [5.2] 클라이언트 전용 → interface
 * - [10.2] 컴포넌트 내부 코드 순서: 로컬 상태 → 전역 상태 → useMemo → useCallback → useEffect → JSX
 * - [10.3] useCallback: 자식 props로 전달되는 함수에만 사용
 * - [10.3] useMemo: 고비용 연산에만 사용
 * - [11.1] 색상 하드코딩 금지 → colors 객체 또는 커스텀 토큰 사용
 * - [11.2] 폰트 하드코딩 금지 → typography 객체 사용
 * - [3] 인라인 style 금지 → styled-components 또는 Tailwind className 사용
 * - [5.4] 컴포넌트 → default export
 * - [4.4] 이벤트 핸들러 → handle* 접두사
 */

'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useUserStore} from '@/stores/user'; // [8.2] Zustand 선택 구독
import {cn} from '@/utils/cn';              // [11.5] Tailwind cn() 유틸

// [10.2] 1. Props 인터페이스 정의 (파일 상단) — [5.2] 클라이언트 전용 → interface
interface SubmitButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
}

// [10.2] 2. 함수형 컴포넌트 (Props 구조 분해)
const SubmitButton = ({
  label,
  onClick,
  variant = 'primary',
  disabled,
  loading = false,
}: SubmitButtonProps) => {
  // [10.2] 3. 로컬 상태
  const [isPressed, setIsPressed] = useState(false);

  // [10.2] 4. 전역 상태 — [8.2] 필요한 상태만 선택 구독
  const user = useUserStore((s) => s.user);

  // [10.3] 5. 파생 값 (useMemo) — 고비용 연산에만 사용
  const buttonLabel = useMemo(
    () => (loading ? '처리 중...' : label),
    [loading, label],
  );

  // [10.3] 6. 콜백 함수 — 자식 props로 전달되는 함수에만 useCallback 사용
  const handleClick = useCallback(() => {
    if (loading) return;
    onClick();
    setIsPressed(false);
  }, [onClick, loading]); // [4.4] handle* 접두사

  // [10.2] 7. Effects (각각 단일 책임)
  useEffect(() => {
    // 단일 관심사만 처리
  }, [user]);

  // [10.2] 8. JSX 반환
  // [3] 인라인 style 금지 — Tailwind className 사용
  // [11.1] 색상 하드코딩 금지 — 커스텀 토큰 클래스 사용
  return (
    <button
      className={cn(
        'flex items-center justify-center h-14 rounded px-4',
        'text-base font-bold transition-colors',
        variant === 'primary' && 'bg-primary text-white',
        variant === 'secondary' && 'border border-primary text-primary bg-transparent',
        (disabled || loading) && 'bg-disable cursor-not-allowed opacity-50',
      )}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {/* [10.4] 조건부 렌더링 — null 조건 패턴 */}
      {isPressed && <span className="mr-2 w-2 h-2 rounded-full bg-success" />}
      {buttonLabel}
    </button>
  );
};

// [5.4] 컴포넌트 → default export
export default SubmitButton;
