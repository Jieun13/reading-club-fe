import { apiClient } from './client';
import { 
  ApiResponse, 
  Book, 
  BookCreateRequest, 
  BookUpdateRequest, 
  BookSearchResult, 
  MonthlyStats,
  PageResponse,
  AllBooksResponse
} from '../types';

export const bookApi = {
  // 내 책 목록 조회 (페이징) - 키워드 검색 통일
  getMyBooks: async (params: {
    page?: number;
    size?: number;
    year?: number;
    month?: number;
    rating?: number;
    search?: string;
  } = {}): Promise<ApiResponse<PageResponse<Book>>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.year !== undefined) queryParams.append('year', params.year.toString());
    if (params.month !== undefined) queryParams.append('month', params.month.toString());
    if (params.rating !== undefined) queryParams.append('rating', params.rating.toString());
    if (params.search && params.search.trim()) queryParams.append('search', params.search.trim());
    
    const response = await apiClient.get<ApiResponse<PageResponse<Book>>>(`/books?${queryParams}`);
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

  // 모든 책 상태 조회 (새로운 API)
  getAllBooks: async (page = 0, size = 10, filters: {
    year?: number;
    month?: number;
    rating?: number;
    search?: string;
  } = {}): Promise<ApiResponse<AllBooksResponse['data']>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(filters.year && { year: filters.year.toString() }),
      ...(filters.month && { month: filters.month.toString() }),
      ...(filters.rating && { rating: filters.rating.toString() }),
      ...(filters.search && { search: filters.search })
    });
    
    const response = await apiClient.get<ApiResponse<AllBooksResponse['data']>>(`/books/all?${params}`);
    return response.data;
  },

  // 통합 검색 API - 모든 상태의 책을 키워드로 검색
  searchAllBooks: async (search: string, page = 0, size = 10): Promise<ApiResponse<AllBooksResponse['data']>> => {
    const params = new URLSearchParams({
      search: search.trim(),
      page: page.toString(),
      size: size.toString()
    });
    
    const response = await apiClient.get<ApiResponse<AllBooksResponse['data']>>(`/books/all?${params}`);
    return response.data;
  },
};
