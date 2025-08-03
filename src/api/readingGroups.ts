import axios, { AxiosError } from 'axios';
import { 
  ReadingGroup, 
  ReadingGroupListItem, 
  CreateReadingGroupRequest, 
  UpdateReadingGroupRequest,
  GroupMember
} from '../types/readingGroup';

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

export const readingGroupApi = {
  // 독서 모임 생성
  createGroup: async (groupData: CreateReadingGroupRequest) => {
    const response = await api.post<ApiResponse<ReadingGroup>>('/reading-groups', groupData);
    return response;
  },

  // 공개 독서 모임 목록 조회
  getPublicGroups: async (page: number = 0, size: number = 10, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) params.append('search', search);
    
    const response = await api.get<ApiResponse<PageResponse<ReadingGroupListItem>>>(`/reading-groups/public?${params}`);
    return response;
  },

  // 내가 속한 독서 모임 목록 조회
  getMyGroups: async () => {
    const response = await api.get<ApiResponse<ReadingGroupListItem[]>>('/reading-groups/my');
    return response;
  },

  // 독서 모임 상세 조회
  getGroup: async (groupId: number) => {
    const response = await api.get<ApiResponse<ReadingGroup>>(`/reading-groups/${groupId}`);
    return response;
  },

  // 독서 모임 수정
  updateGroup: async (groupId: number, groupData: UpdateReadingGroupRequest) => {
    const response = await api.put<ApiResponse<ReadingGroup>>(`/reading-groups/${groupId}`, groupData);
    return response;
  },

  // 독서 모임 삭제
  deleteGroup: async (groupId: number) => {
    const response = await api.delete<ApiResponse<void>>(`/reading-groups/${groupId}`);
    return response;
  },

  // 초대 코드 재생성
  regenerateInviteCode: async (groupId: number) => {
    const response = await api.post<ApiResponse<{ inviteCode: string }>>(`/reading-groups/${groupId}/regenerate-invite-code`);
    return response;
  },

  // 초대 링크로 그룹 정보 미리보기
  getGroupByInviteCode: async (inviteCode: string) => {
    const response = await api.get<ApiResponse<ReadingGroupListItem>>(`/reading-groups/invite/${inviteCode}`);
    return response;
  },

  // 멤버 관리 API
  getGroupMembers: async (groupId: number) => {
    const response = await api.get<ApiResponse<GroupMember[]>>(`/reading-groups/${groupId}/members`);
    return response;
  },

  joinGroup: async (groupId: number, introduction?: string) => {
    const response = await api.post<ApiResponse<GroupMember>>(`/reading-groups/${groupId}/members/join`, {
      introduction: introduction || ''
    });
    return response;
  },

  joinByInviteCode: async (groupId: number, inviteCode: string, introduction?: string) => {
    const response = await api.post<ApiResponse<GroupMember>>(`/reading-groups/${groupId}/members/join-by-code`, {
      inviteCode,
      introduction: introduction || ''
    });
    return response;
  },

  removeMember: async (groupId: number, userId: number) => {
    const response = await api.delete<ApiResponse<void>>(`/reading-groups/${groupId}/members/${userId}`);
    return response;
  },

  leaveGroup: async (groupId: number) => {
    const response = await api.delete<ApiResponse<void>>(`/reading-groups/${groupId}/members/leave`);
    return response;
  },
};
