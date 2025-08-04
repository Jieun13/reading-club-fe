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
  user?: {
    nickname: string;
  };
}

export interface BookCreateRequest {
  title: string;
  author?: string;
  coverImage?: string;
  rating: number;
  review?: string;
  finishedDate: string;
}

export interface BookUpdateRequest {
  title: string;
  author?: string;
  coverImage?: string;
  rating: number;
  review?: string;
  finishedDate: string;
}

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

// 기존 타입들과의 호환성을 위한 별칭
export type BookFormData = BookCreateRequest;
