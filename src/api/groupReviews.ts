import { apiClient } from './client';

export interface GroupReview {
  id: number;
  user: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  readingGroup: {
    id: number;
    name: string;
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

export interface GroupReviewCreateRequest {
  readingGroupId: number;
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  isPublic: boolean;
}

export const groupReviewApi = {
  // 독서모임 리뷰 작성
  createReview: async (data: GroupReviewCreateRequest) => {
    const response = await apiClient.post('/group-reviews', data);
    return response;
  },

  // 독서모임의 공개 리뷰 목록 조회
  getGroupReviews: async (groupId: number) => {
    const response = await apiClient.get(`/group-reviews/group/${groupId}`);
    return response;
  },

  // 내 리뷰 조회
  getMyReview: async (groupId: number) => {
    const response = await apiClient.get(`/group-reviews/my-review/${groupId}`);
    return response;
  },

  // 리뷰 수정
  updateReview: async (reviewId: number, data: Partial<GroupReviewCreateRequest>) => {
    const response = await apiClient.put(`/group-reviews/${reviewId}`, data);
    return response;
  },

  // 리뷰 삭제
  deleteReview: async (reviewId: number) => {
    const response = await apiClient.delete(`/group-reviews/${reviewId}`);
    return response;
  }
};
