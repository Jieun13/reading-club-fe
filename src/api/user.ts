import { apiClient } from './client';
import { ApiResponse, User, UserStatistics } from '../types';

export const userApi = {
  // 내 정보 조회
  getMyInfo: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  // 내 정보 수정
  updateMyInfo: async (data: { nickname?: string; profileImage?: string }): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  },

  // 프로필 업데이트 (별칭)
  updateProfile: async (data: { nickname?: string; profileImage?: string }) => {
    const response = await apiClient.put('/users/me', data);
    return response;
  },

  // 내 독서 통계 조회
  getMyStatistics: async (): Promise<ApiResponse<UserStatistics>> => {
    const response = await apiClient.get<ApiResponse<UserStatistics>>('/users/me/statistics');
    return response.data;
  },
};
