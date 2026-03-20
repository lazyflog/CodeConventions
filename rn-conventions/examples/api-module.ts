/**
 * API 모듈 보일러플레이트
 *
 * 적용된 컨벤션:
 * - [7.2] 도메인별 파일 분리 + default export 객체로 관리
 * - [4.3] API 함수 네이밍 접두사: get*(조회), edit*(수정), delete*(삭제), request*(작업요청)
 * - [5.2] 요청/응답 타입 → type (서버 연동)
 * - [5.3] 관련 Enum 정의
 * - [5.4] 요청/응답 타입 → named export, API 모듈 → default export
 * - [7.3] index.ts에서 API 객체로 통합
 */

import axiosInstance from './axiosInstance';  // [7.1] 단일 Axios 인스턴스

// [5.2] 1. 요청/응답 타입 정의 — 서버 연동 타입 → type
// [5.4] 타입 → named export
export type UserModel = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type GetUserListRequest = {
  page: number;
  limit?: number;
  search?: string;
};

export type GetUserListResponse = {
  items: UserModel[];
  total: number;
  page: number;
};

export type UpdateProfileRequest = {
  name: string;
  email: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

// [5.3] 2. 관련 Enum 정의 — PascalCase
export enum UserRole {
  Admin = 'admin',
  Member = 'member',
  Guest = 'guest',
}

// [7.2] 3. API 함수 객체 — default export
// [4.3] 함수명 접두사 규칙 준수
export default {
  // get* — 데이터 조회 (GET)
  getProfile() {
    return axiosInstance.get<UserModel>('/api/users/profile');
  },

  getUserList(params: GetUserListRequest) {
    return axiosInstance.get<GetUserListResponse>('/api/users', {params});
  },

  // set* — 데이터 설정/생성 (PUT/POST)
  setDefaultPayment(paymentMethodId: string) {
    return axiosInstance.put('/api/users/payment/default', {paymentMethodId});
  },

  // edit* — 기존 데이터 수정 (PUT/PATCH)
  editUserInfo(data: UpdateProfileRequest) {
    return axiosInstance.put<UserModel>('/api/users/profile', data);
  },

  // request* — 특정 작업 요청 (POST)
  requestPasswordReset(email: string) {
    return axiosInstance.post('/api/users/password-reset', {email});
  },

  // send* — 데이터 전송 (POST, 알림/메일 등)
  sendVerificationCode(phone: string) {
    return axiosInstance.post('/api/users/verification', {phone});
  },

  // check* — 유효성/중복 검사 (GET/POST)
  checkDuplicateEmail(email: string) {
    return axiosInstance.get<{isDuplicate: boolean}>('/api/users/check-email', {
      params: {email},
    });
  },

  // upsert* — 없으면 생성, 있으면 수정 (PUT)
  upsertAddress(address: AddressData) {
    return axiosInstance.put('/api/users/address', address);
  },

  // delete* — 데이터 삭제 (DELETE)
  deleteAccount(id: number) {
    return axiosInstance.delete(`/api/users/${id}`);
  },
};

// [7.3] 통합 내보내기 파일 예시 (src/APIs/index.ts):
//
// import users from './users';
// import products from './products';
// import orders from './orders';
//
// const API = {users, products, orders};
// export default API;
//
// 사용: API.users.getProfile()
//       API.users.editUserInfo({name: '홍길동', email: 'hong@example.com'})

type AddressData = {
  street: string;
  city: string;
  zipCode: string;
};
