export interface DroppedBook {
  id: number;
  title: string;
  author?: string;
  isbn?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  readingType: ReadingType;
  readingTypeDisplay: string;
  progressPercentage?: number;
  dropReason: string;
  startedDate?: string;
  droppedDate?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    kakaoId: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface DroppedBookCreateRequest {
  title: string;
  author?: string;
  isbn?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  readingType: ReadingType;
  progressPercentage?: number;
  dropReason: string;
  startedDate?: string;
  droppedDate?: string;
}

export interface DroppedBookUpdateRequest {
  title?: string;
  author?: string;
  isbn?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  readingType?: ReadingType;
  progressPercentage?: number;
  dropReason?: string;
  startedDate?: string;
  droppedDate?: string;
}

export interface DroppedBookListResponse {
  content: DroppedBook[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
  };
}

export enum ReadingType {
  PAPER_BOOK = 'PAPER_BOOK',
  LIBRARY_RENTAL = 'LIBRARY_RENTAL',
  MILLIE = 'MILLIE',
  E_BOOK = 'E_BOOK'
}

export const READING_TYPE_LABELS: Record<ReadingType, string> = {
  [ReadingType.PAPER_BOOK]: '종이책 소장',
  [ReadingType.LIBRARY_RENTAL]: '도서관 대여',
  [ReadingType.MILLIE]: '밀리의 서재',
  [ReadingType.E_BOOK]: '전자책 소장'
};
