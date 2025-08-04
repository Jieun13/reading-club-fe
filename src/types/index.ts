// API 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// 사용자 관련 타입
export interface User {
  nickname: string;
  profileImage?: string;
  createdAt: string;
}

export interface UserStatistics {
  totalBooks: number;
  averageRating: number;
  booksThisMonth: number;
  booksThisYear: number;
}

// 책 관련 타입
export interface Book {
  id: number;
  title: string;
  author?: string;
  coverImage?: string;
  rating: number;
  review?: string;
  finishedDate: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface BookCreateRequest {
  title: string;
  author?: string;
  coverImage?: string;
  rating: number;
  review?: string;
  finishedDate: string;
}

export interface BookUpdateRequest extends BookCreateRequest {}

export interface BookSearchResult {
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  thumbnail?: string;
}

export interface MonthlyStats {
  year: number;
  month: number;
  count: number;
  averageRating: number;
}

// 인증 관련 타입
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// 페이지네이션 타입
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
