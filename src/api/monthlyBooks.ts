import { apiClient } from './client';

export interface MonthlyBook {
  id: number;
  group: {
    id: number;
    name: string;
  };
  title: string;
  author: string;
  publisher: string;
  coverImage?: string;
  description?: string;
  year: number;
  month: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export const monthlyBookApi = {
  // 현재 월간 도서 조회
  getCurrentMonthlyBook: async (groupId: number) => {
    const response = await apiClient.get(`/reading-groups/${groupId}/monthly-books/current`);
    return response;
  },

  // 그룹의 월간 도서 목록 조회
  getGroupMonthlyBooks: async (groupId: number) => {
    const response = await apiClient.get(`/reading-groups/${groupId}/monthly-books`);
    return response;
  },

  // 월간 도서 선정
  selectMonthlyBook: async (groupId: number, data: {
    title: string;
    author: string;
    publisher: string;
    coverImage?: string;
    description?: string;
    year: number;
    month: number;
  }) => {
    const response = await apiClient.post(`/reading-groups/${groupId}/monthly-books`, data);
    return response;
  },

  // 월간 도서 상태 변경
  updateMonthlyBookStatus: async (groupId: number, monthlyBookId: number, status: string) => {
    const response = await apiClient.put(`/reading-groups/${groupId}/monthly-books/${monthlyBookId}/status?status=${status}`);
    return response;
  }
};
