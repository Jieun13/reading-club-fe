import axios, { AxiosError } from 'axios';
import { Wishlist, WishlistCreateRequest, WishlistUpdateRequest } from '../types/wishlist';

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

export const wishlistApi = {
  // 위시리스트 목록 조회 (페이징)
  getWishlists: async (page: number = 0, size: number = 100, filters?: {
    priority?: number;
    search?: string;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (filters?.priority) params.append('priority', filters.priority.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get<ApiResponse<PageResponse<Wishlist>>>(`/wishlists?${params}`);
    return response;
  },

  // 위시리스트 추가
  addWishlist: async (wishlistData: WishlistCreateRequest) => {
    const response = await api.post<ApiResponse<Wishlist>>('/wishlists', wishlistData);
    return response;
  },

  // 위시리스트 수정
  updateWishlist: async (id: number, wishlistData: WishlistUpdateRequest) => {
    const response = await api.put<ApiResponse<Wishlist>>(`/wishlists/${id}`, wishlistData);
    return response;
  },

  // 위시리스트 삭제
  deleteWishlist: async (id: number) => {
    const response = await api.delete<ApiResponse<void>>(`/wishlists/${id}`);
    return response;
  },

  // 위시리스트 상세 조회
  getWishlist: async (id: number) => {
    const response = await api.get<ApiResponse<Wishlist>>(`/wishlists/${id}`);
    return response;
  },

  // 위시리스트 중복 체크
  checkDuplicate: async (title: string, author?: string) => {
    const params = new URLSearchParams({ title });
    if (author) params.append('author', author);
    
    const response = await api.get<ApiResponse<{
      duplicate: boolean;
      duplicateWishlists: Array<{
        id: number;
        title: string;
        author: string;
        priority: number;
        createdAt: string;
      }>;
    }>>(`/wishlists/check-duplicate?${params}`);
    return response;
  }
};
