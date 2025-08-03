import { apiClient } from './client';

export interface BookReview {
  id: number;
  user: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookReviewCreateRequest {
  monthlyBookId: number;
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  isPublic: boolean;
}

export const bookReviewApi = {
  // 리뷰 작성
  createReview: async (data: BookReviewCreateRequest) => {
    const response = await apiClient.post('/book-reviews', data);
    return response;
  },

  // 월간 도서의 공개 리뷰 목록 조회
  getPublicReviews: async (monthlyBookId: number) => {
    const response = await apiClient.get(`/book-reviews/monthly-book/${monthlyBookId}`);
    return response;
  },

  // 내 리뷰 조회
  getMyReview: async (monthlyBookId: number) => {
    const response = await apiClient.get(`/book-reviews/my-review/${monthlyBookId}`);
    return response;
  },

  // 리뷰 수정
  updateReview: async (reviewId: number, data: Partial<BookReviewCreateRequest>) => {
    const response = await apiClient.put(`/book-reviews/${reviewId}`, data);
    return response;
  },

  // 리뷰 삭제
  deleteReview: async (reviewId: number) => {
    const response = await apiClient.delete(`/book-reviews/${reviewId}`);
    return response;
  }
};
