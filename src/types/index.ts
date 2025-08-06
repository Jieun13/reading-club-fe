import { Post } from './post';

// API 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// 사용자 관련 타입
export interface User {
  id: number;
  nickname: string;
  profileImage?: string;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  nickname: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  statistics: UserStatistics;
  currentlyReading: CurrentlyReading[];
  recentPublicPosts: Post[];
}

export interface UserStatistics {
  totalBooks: number;
  currentlyReadingCount: number;
  wishlistCount: number;
  totalPosts: number;
  thisMonthPosts: number;
  thisMonthBooks: number;
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
  author?: string;
  publisher?: string;
  pubDate?: string;
  description?: string;
  cover?: string;
  isbn?: string;
  categoryName?: string;
  priceStandard?: number;
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

// 읽고 있는 책 관련 타입
export enum ReadingType {
  PAPER_BOOK = 'PAPER_BOOK',
  LIBRARY_RENTAL = 'LIBRARY_RENTAL',
  MILLIE = 'MILLIE',
  E_BOOK = 'E_BOOK'
}

export interface CurrentlyReading {
  id: number;
  title: string;
  author?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  readingType: ReadingType;
  readingTypeDisplay: string;
  dueDate?: string;
  progressPercentage: number;
  memo?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface CurrentlyReadingCreateRequest {
  title: string;
  author?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  readingType: ReadingType;
  dueDate?: string;
  progressPercentage: number;
  memo?: string;
}

export interface CurrentlyReadingUpdateRequest extends CurrentlyReadingCreateRequest {}

export interface ProgressUpdateRequest {
  progressPercentage: number;
  memo?: string;
}

export interface DuplicateCheckResponse {
  duplicate: boolean;
  duplicateBooks: CurrentlyReading[];
}

export interface BooksWithCurrentlyReadingResponse {
  books: PageResponse<Book>;
  currentlyReading: CurrentlyReading[];
  totalCurrentlyReading: number;
}

export interface Comment {
  id: number;
  content: string;
  isDeleted: boolean;
  isReply: boolean;
  parentId: number | null;
  replyCount: number;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nickname: string;
    profileImage: string;
  };
  replies?: Comment[];
}

export interface CommentCreateRequest {
  content: string;
  parentId?: number | null;
}

export interface CommentListResponse {
  comments: {
    content: Comment[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
  totalComments: number;
  activeComments: number;
}
