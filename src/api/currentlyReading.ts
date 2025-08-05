import { apiClient } from './client';
import { 
  ApiResponse, 
  CurrentlyReading, 
  CurrentlyReadingCreateRequest, 
  CurrentlyReadingUpdateRequest, 
  ProgressUpdateRequest,
  BookSearchResult,
  DuplicateCheckResponse,
  BooksWithCurrentlyReadingResponse,
  PageResponse
} from '../types';

export const currentlyReadingApi = {
  // 읽고 있는 책 목록 조회
  getCurrentlyReading: async (page: number = 0, size: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) params.append('search', search);
    
    const response = await apiClient.get<ApiResponse<PageResponse<CurrentlyReading>>>(`/currently-reading?${params}`);
    return response.data;
  },

  // 읽고 있는 책 상세 조회
  getCurrentlyReadingById: async (bookId: number) => {
    const response = await apiClient.get<ApiResponse<CurrentlyReading>>(`/currently-reading/${bookId}`);
    return response.data;
  },

  // 읽고 있는 책 추가
  addCurrentlyReading: async (bookData: CurrentlyReadingCreateRequest) => {
    const response = await apiClient.post<ApiResponse<CurrentlyReading>>('/currently-reading', bookData);
    return response.data;
  },

  // 읽고 있는 책 수정
  updateCurrentlyReading: async (bookId: number, bookData: CurrentlyReadingUpdateRequest) => {
    const response = await apiClient.put<ApiResponse<CurrentlyReading>>(`/currently-reading/${bookId}`, bookData);
    return response.data;
  },

  // 진행률 업데이트
  updateProgress: async (bookId: number, progressData: ProgressUpdateRequest) => {
    const response = await apiClient.put<ApiResponse<CurrentlyReading>>(`/currently-reading/${bookId}/progress`, progressData);
    return response.data;
  },

  // 읽고 있는 책 삭제
  deleteCurrentlyReading: async (bookId: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/currently-reading/${bookId}`);
    return response.data;
  },

  // 책 검색 (알라딘 API)
  searchBooks: async (query: string, maxResults: number = 10) => {
    const params = new URLSearchParams({
      query,
      maxResults: maxResults.toString(),
    });
    
    const response = await apiClient.get<ApiResponse<BookSearchResult[]>>(`/currently-reading/search?${params}`);
    return response.data;
  },

  // 중복 체크
  checkDuplicate: async (title: string, author?: string) => {
    const params = new URLSearchParams({ title });
    if (author) params.append('author', author);
    
    const response = await apiClient.get<ApiResponse<DuplicateCheckResponse>>(`/currently-reading/check-duplicate?${params}`);
    return response.data;
  },

  // 연체된 책 목록 조회
  getOverdueBooks: async () => {
    const response = await apiClient.get<ApiResponse<CurrentlyReading[]>>('/currently-reading/overdue');
    return response.data;
  },

  // 완독한 책 + 읽고 있는 책 함께 조회
  getBooksWithCurrentlyReading: async (page: number = 0, size: number = 10, filters?: {
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
    
    const response = await apiClient.get<ApiResponse<BooksWithCurrentlyReadingResponse>>(`/books/with-currently-reading?${params}`);
    return response.data;
  },
}; 