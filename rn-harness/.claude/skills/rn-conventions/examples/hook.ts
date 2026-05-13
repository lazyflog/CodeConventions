/**
 * Custom Hook 보일러플레이트
 *
 * 적용된 컨벤션:
 * - [4.4] use* 접두사 필수
 * - [9.1] Query Key를 파일 상단 상수로 정의
 * - [9.1] useQuery: select로 필요한 데이터만 추출
 * - [9.2] Mutation: 낙관적 업데이트 + onError 롤백 패턴
 * - [9.4] 반환값 타입을 interface로 명시
 * - [10.2] useCallback: useEffect 의존성 포함 함수에만 사용
 * - [5.2] Hook 반환 타입 → interface (클라이언트 전용)
 * - [5.4] Custom Hook → default export
 */

import {useCallback} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

import API from '@app/APIs';  // [7.3] API 통합 객체

// [9.1] 1. Query Key는 파일 상단에 상수로 정의
const userProfileQueryKey = ['user', 'profile'];

// [9.4] 반환값 타입은 interface로 명시 — [5.2] 클라이언트 전용 → interface
interface UseUserProfileReturn {
  profile: UserModel | undefined;
  isFetching: boolean;
  error: Error | null;
  updateProfile: (data: UpdateProfileRequest) => void;
  invalidate: () => void;
  mutationStatus: {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
}

// [9.1] 서버 연동 타입 → type (5.2)
type UserModel = {
  id: number;
  name: string;
  email: string;
};

type UpdateProfileRequest = {
  name: string;
  email: string;
};

// [4.4] use* 접두사 필수
const useUserProfile = (): UseUserProfileReturn => {
  const queryClient = useQueryClient();

  // [9.1] 2. useQuery: 데이터 조회
  const {data: profile, error, isFetching} = useQuery({
    queryKey: userProfileQueryKey,
    queryFn: () => API.users.getProfile(),
    select: (response) => response.data as UserModel,  // 응답에서 필요한 데이터만 추출
    staleTime: 60 * 1_000,   // 1분 캐시
  });

  // [9.2] Mutation — 낙관적 업데이트 패턴
  const {mutate: updateProfile, isPending, isSuccess, isError} = useMutation({
    mutationFn: (data: UpdateProfileRequest) => API.users.updateProfile(data),

    // 낙관적 업데이트
    onMutate: async (newData) => {
      await queryClient.cancelQueries({queryKey: userProfileQueryKey});
      const previousProfile = queryClient.getQueryData(userProfileQueryKey);

      queryClient.setQueryData(
        userProfileQueryKey,
        (old: UserModel | undefined) => old ? {...old, ...newData} : old,
      );

      return {previousProfile};
    },

    onSuccess: () => {
      // 성공 시 캐시 무효화
      queryClient.invalidateQueries({queryKey: userProfileQueryKey});
    },

    // 실패 시 롤백
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(userProfileQueryKey, context?.previousProfile);
    },
  });

  // [10.2] 캐시 무효화 함수 — useEffect 의존성 포함 가능성 → useCallback
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({queryKey: userProfileQueryKey});
  }, [queryClient]);

  // [9.4] 일관된 반환 구조: 데이터, 로딩, 에러, 액션 함수
  return {
    profile,
    isFetching,
    error: error as Error | null,
    updateProfile,
    invalidate,
    mutationStatus: {isPending, isSuccess, isError},
  };
};

// [5.4] Custom Hook → default export
export default useUserProfile;
