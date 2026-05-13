/**
 * 컴포넌트 보일러플레이트
 *
 * 적용된 컨벤션:
 * - [10.1] Props 인터페이스: interface + TouchableOpacityProps extends
 * - [5.2] 클라이언트 전용 타입 → interface
 * - [10.1] 컴포넌트 내부 코드 순서: 훅 → 로컬 상태 → 전역 상태 → useMemo → useCallback → useEffect → JSX
 * - [10.2] useCallback: 자식 props로 전달되는 함수에만 사용
 * - [10.2] useMemo: 동적 스타일에 필수 적용
 * - [11.1] 색상 하드코딩 금지 → colors 객체 사용
 * - [11.2] 폰트 하드코딩 금지 → Fonts 객체 사용
 * - [2] 인라인 스타일 금지 → StyleSheet.create 사용
 * - [5.4] 컴포넌트 → default export
 * - [4.4] 이벤트 핸들러 → handle* 접두사
 */

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Stores from '@app/stores';            // [8.2] Zustand 선택 구독
import {colors} from '@app/styles/colors';   // [11.1] 색상 시스템
import Fonts from '@app/styles/fonts';       // [11.2] 폰트 시스템

// [10.1] 1. Props 인터페이스 정의 (파일 상단) — [5.2] 클라이언트 전용 → interface
interface SubmitButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

// [10.1] 2. 함수형 컴포넌트 (Props 구조 분해)
const SubmitButton = ({
  label,
  onPress,
  style,
  disabled,
  loading = false,
}: SubmitButtonProps) => {
  // [10.1] 3. 훅 호출 (상단에 모아서)
  const insets = useSafeAreaInsets();

  // [10.1] 4. 로컬 상태
  const [isPressed, setIsPressed] = useState(false);

  // [10.1] 5. 서버/전역 상태 — [8.2] 필요한 상태만 선택 구독
  const user = Stores.user((s) => s.user);

  // [10.2] 6. 파생 값 (useMemo) — 동적 스타일에는 useMemo 필수
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          // [11.1] 색상 하드코딩 금지, colors 객체 사용
          backgroundColor:
            disabled || loading
              ? colors.disable.primary
              : colors.main.primary,
        },
      }),
    [disabled, loading],
  );

  // [10.2] 7. 콜백 함수 — 자식 props로 전달되는 함수에만 useCallback 사용
  const handlePress = useCallback(() => {
    if (loading) return;
    onPress();
    setIsPressed(false);
  }, [onPress, loading]);  // [4.4] handle* 접두사

  // [10.1] 8. Effects (각각 단일 책임)
  useEffect(() => {
    // 단일 관심사만 처리
  }, [user]);

  // [10.1] 9. JSX 반환
  return (
    // [2] 인라인 스타일 금지 — style prop을 배열로 합성
    <TouchableOpacity
      style={[styles.container, dynamicStyles.container, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* [10.3] 조건부 렌더링 — null 조건 패턴 */}
        {isPressed && <View style={styles.pressIndicator} />}
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

// [10.1] 10. 정적 스타일 (컴포넌트 하단) — StyleSheet.create 분리
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.success,  // [11.1] colors 객체
  },
  label: {
    ...Fonts.bt_b_16,              // [11.2] Fonts 객체 (Button Bold 16px)
    color: colors.text.primary,    // [11.1] colors 객체
  },
});

// [5.4] 컴포넌트 → default export
export default SubmitButton;
