import { apiClient } from './client';
import { DroppedBook, DroppedBookCreateRequest, DroppedBookUpdateRequest } from '../types/droppedBook';

// 페이징 응답 타입 정의
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

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// 중복 체크 응답 타입 정의
interface DuplicateCheckResponse {
  isDuplicate: boolean;
  duplicate?: boolean; // 백엔드 응답에 맞게 추가
  existingBook?: DroppedBook;
  message?: string;
}

export const droppedBooksApi = {
  // 읽다 만 책 목록 조회 (페이징)
  getDroppedBooks: async (page: number = 0, size: number = 100, search?: string): Promise<ApiResponse<PageResponse<DroppedBook>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    const response = await apiClient.get<ApiResponse<PageResponse<DroppedBook>>>(`/dropped-books?${params}`);
    return response.data;
  },

  // 읽다 만 책 상세 조회
  getDroppedBook: async (id: number) => {
    const response = await apiClient.get<DroppedBook>(`/dropped-books/${id}`);
    return response.data;
  },

  // 읽다 만 책 추가
  createDroppedBook: async (data: DroppedBookCreateRequest) => {
    const response = await apiClient.post<DroppedBook>('/dropped-books', data);
    return response.data;
  },

  // 읽다 만 책 수정
  updateDroppedBook: async (id: number, data: DroppedBookUpdateRequest) => {
    const response = await apiClient.put<DroppedBook>(`/dropped-books/${id}`, data);
    return response.data;
  },

  // 읽다 만 책 삭제
  deleteDroppedBook: async (id: number) => {
    await apiClient.delete(`/dropped-books/${id}`);
  },

  // ISBN 기준 중복 체크
  checkDuplicateByIsbn: async (isbn: string): Promise<DuplicateCheckResponse> => {
    // 백엔드 API에 맞게 title과 author로 중복 체크
    // ISBN으로는 직접 체크할 수 없으므로 title만으로 체크
    const response = await apiClient.get<ApiResponse<DuplicateCheckResponse>>(`/dropped-books/check-duplicate?title=${encodeURIComponent(isbn)}`);
    return response.data.data;
  },

  // 제목 + 저자 기준 중복 체크
  checkDuplicateByTitleAndAuthor: async (title: string, author: string): Promise<DuplicateCheckResponse> => {
    const response = await apiClient.get<ApiResponse<DuplicateCheckResponse>>(`/dropped-books/check-duplicate?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
    return response.data.data;
  },

  // 제목만 기준 중복 체크
  checkDuplicateByTitle: async (title: string): Promise<DuplicateCheckResponse> => {
    const response = await apiClient.get<ApiResponse<DuplicateCheckResponse>>(`/dropped-books/check-duplicate?title=${encodeURIComponent(title)}`);
    return response.data.data;
  },

  // 통합 중복 체크 (title과 author 파라미터)
  checkDuplicate: async (title: string, author?: string): Promise<DuplicateCheckResponse> => {
    const params = new URLSearchParams({
      title: title
    });
    
    if (author && author.trim()) {
      params.append('author', author.trim());
    }
    
    const response = await apiClient.get<ApiResponse<DuplicateCheckResponse>>(`/dropped-books/check-duplicate?${params}`);
    return response.data.data;
  }
};