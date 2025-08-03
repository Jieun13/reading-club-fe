import { apiClient } from './client';
import { 
  ApiResponse, 
  Book, 
  BookCreateRequest, 
  BookUpdateRequest, 
  BookSearchResult, 
  MonthlyStats,
  PageResponse 
} from '../types';

export const bookApi = {
  // 내 책 목록 조회 (페이징)
  getMyBooks: async (params: {
    page?: number;
    size?: number;
    year?: number;
    month?: number;
    rating?: number;
    search?: string;
  } = {}): Promise<ApiResponse<PageResponse<Book>>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Book>>>('/books', {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        ...params,
      },
    });
    return response.data;
  },

  // 책 상세 조회
  getBook: async (bookId: number): Promise<ApiResponse<Book>> => {
    const response = await apiClient.get<ApiResponse<Book>>(`/books/${bookId}`);
    return response.data;
  },

  // 책 등록
  createBook: async (data: BookCreateRequest): Promise<ApiResponse<Book>> => {
    const response = await apiClient.post<ApiResponse<Book>>('/books', data);
    return response.data;
  },

  // 책 수정
  updateBook: async (bookId: number, data: BookUpdateRequest): Promise<ApiResponse<Book>> => {
    const response = await apiClient.put<ApiResponse<Book>>(`/books/${bookId}`, data);
    return response.data;
  },

  // 책 삭제
  deleteBook: async (bookId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/books/${bookId}`);
    return response.data;
  },

  // 책 검색 (알라딘 Books API)
  searchBooks: async (query: string, maxResults: number = 10): Promise<ApiResponse<BookSearchResult[]>> => {
    const response = await apiClient.get<ApiResponse<BookSearchResult[]>>('/books/search', {
      params: { query, maxResults },
    });
    return response.data;
  },

  // 월별 독서 통계
  getMonthlyStatistics: async (): Promise<ApiResponse<MonthlyStats[]>> => {
    const response = await apiClient.get<ApiResponse<MonthlyStats[]>>('/books/statistics/monthly');
    return response.data;
  },
};
