import { apiClient } from './client';
import { ApiResponse, MonthlyBookCovers } from '../types';

// 타입을 다시 export
export type { MonthlyBookCovers };

export const monthlyCoversApi = {
  // 이번 달에 등록한 책들의 표지 URL을 카테고리별로 조회
  getMonthlyBookCovers: async (): Promise<ApiResponse<MonthlyBookCovers>> => {
    const response = await apiClient.get<ApiResponse<MonthlyBookCovers>>('/books/monthly-covers');
    return response.data;
  },
};
