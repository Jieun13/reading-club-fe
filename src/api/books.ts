import axios, { AxiosError } from 'axios';
import { Book, BookCreateRequest, BookUpdateRequest, BookSearchResult, MonthlyStats } from '../types/book';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export const bookApi = {
  // 책 목록 조회 (페이징)
  getBooks: async (page: number = 0, size: number = 100, filters?: {
    year?: number;
    month?: number;
    rating?: number;
    search?: string;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get<ApiResponse<PageResponse<Book>>>(`/books?${params}`);
    return response;
  },

  // 책 추가
  addBook: async (bookData: BookCreateRequest) => {
    const response = await api.post<ApiResponse<Book>>('/books', bookData);
    return response;
  },

  // 책 수정
  updateBook: async (id: number, bookData: BookUpdateRequest) => {
    const response = await api.put<ApiResponse<Book>>(`/books/${id}`, bookData);
    return response;
  },

  // 책 삭제
  deleteBook: async (id: number) => {
    const response = await api.delete<ApiResponse<void>>(`/books/${id}`);
    return response;
  },

  // 책 상세 조회
  getBook: async (id: number) => {
    const response = await api.get<ApiResponse<Book>>(`/books/${id}`);
    return response;
  },

  // 책 검색 (Google Books API)
  searchBooks: async (query: string, maxResults: number = 10) => {
    const response = await api.get<ApiResponse<BookSearchResult[]>>('/books/search', {
      params: { query, maxResults }
    });
    return response;
  },

  // 책 중복 체크
  checkDuplicate: async (title: string, author?: string) => {
    const params = new URLSearchParams({ title });
    if (author) params.append('author', author);
    
    const response = await api.get<ApiResponse<{
      duplicate: boolean; // isDuplicate -> duplicate로 수정
      duplicateBooks: Array<{
        id: number;
        title: string;
        author: string;
        rating: number;
        finishedDate: string;
        createdAt: string;
      }>;
    }>>(`/books/check-duplicate?${params}`);
    return response;
  },

  // 월별 통계
  getMonthlyStatistics: async () => {
    const response = await api.get<ApiResponse<MonthlyStats[]>>('/books/statistics/monthly');
    return response;
  }
};
