import axios from 'axios';
import { 
  GroupMeeting, 
  CreateMeetingRequest, 
  UpdateMeetingRequest,
  BookReview,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewStatistics
} from '../types/meeting';

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export const meetingApi = {
  // 모임 일정 생성
  createMeeting: async (groupId: number, meetingData: CreateMeetingRequest) => {
    const response = await api.post<ApiResponse<GroupMeeting>>(`/reading-groups/${groupId}/meetings`, meetingData);
    return response;
  },

  // 그룹의 모임 일정 목록 조회
  getGroupMeetings: async (groupId: number) => {
    const response = await api.get<ApiResponse<GroupMeeting[]>>(`/reading-groups/${groupId}/meetings`);
    return response;
  },

  // 예정된 모임 목록 조회
  getUpcomingMeetings: async (groupId: number) => {
    const response = await api.get<ApiResponse<GroupMeeting[]>>(`/reading-groups/${groupId}/meetings/upcoming`);
    return response;
  },

  // 다음 모임 조회
  getNextMeeting: async (groupId: number) => {
    const response = await api.get<ApiResponse<GroupMeeting>>(`/reading-groups/${groupId}/meetings/next`);
    return response;
  },

  // 모임 일정 수정
  updateMeeting: async (groupId: number, meetingId: number, meetingData: UpdateMeetingRequest) => {
    const response = await api.put<ApiResponse<GroupMeeting>>(`/reading-groups/${groupId}/meetings/${meetingId}`, meetingData);
    return response;
  },

  // 모임 일정 삭제
  deleteMeeting: async (groupId: number, meetingId: number) => {
    const response = await api.delete<ApiResponse<void>>(`/reading-groups/${groupId}/meetings/${meetingId}`);
    return response;
  }
};

export const reviewApi = {
  // 리뷰 작성
  createReview: async (reviewData: CreateReviewRequest) => {
    const response = await api.post<ApiResponse<BookReview>>('/book-reviews', reviewData);
    return response;
  },

  // 월간 도서의 공개 리뷰 목록 조회
  getPublicReviews: async (monthlyBookId: number) => {
    const response = await api.get<ApiResponse<BookReview[]>>(`/book-reviews/monthly-book/${monthlyBookId}`);
    return response;
  },

  // 내 리뷰 조회
  getMyReview: async (monthlyBookId: number) => {
    const response = await api.get<ApiResponse<BookReview>>(`/book-reviews/monthly-book/${monthlyBookId}/my`);
    return response;
  },

  // 리뷰 수정
  updateReview: async (reviewId: number, reviewData: UpdateReviewRequest) => {
    const response = await api.put<ApiResponse<BookReview>>(`/book-reviews/${reviewId}`, reviewData);
    return response;
  },

  // 리뷰 삭제
  deleteReview: async (reviewId: number) => {
    const response = await api.delete<ApiResponse<void>>(`/book-reviews/${reviewId}`);
    return response;
  },

  // 월간 도서 리뷰 통계 조회
  getReviewStatistics: async (monthlyBookId: number) => {
    const response = await api.get<ApiResponse<ReviewStatistics>>(`/book-reviews/monthly-book/${monthlyBookId}/statistics`);
    return response;
  }
};
