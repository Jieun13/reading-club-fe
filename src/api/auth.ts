import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export const authApi = {
  // 카카오 로그인 콜백
  kakaoCallback: async (code: string) => {
    const response = await axios.get<ApiResponse<LoginResponse>>(
      `${API_BASE_URL}/auth/kakao/callback?code=${code}`,
        { withCredentials: true }
    );
    return response;
  },

  // 토큰 갱신
  refreshToken: async (refreshToken: string) => {
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken }
    );
    return response;
  },

  // 로그아웃
  logout: async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const response = await axios.post<ApiResponse<void>>(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response;
    }
  },

  // 토큰 유효성 검증
  validateToken: async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const response = await axios.get<ApiResponse<boolean>>(
        `${API_BASE_URL}/auth/validate`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response;
    }
    throw new Error('No token found');
  },

  // 카카오 로그인 URL 생성
  getKakaoLoginUrl: (): string => {
    const clientId = process.env.REACT_APP_KAKAO_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI || 'http://localhost:3000/auth/kakao/callback';
    
    return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  },

  // 개발용 더미 로그인
  devLogin: async () => {
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${API_BASE_URL}/auth/dev-login`
    );
    return response;
  },
};
