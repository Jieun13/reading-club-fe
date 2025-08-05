import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginResponse } from '../types';
import { userApi } from '../api/user';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginResponse) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  devLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (loginData: LoginResponse) => {
    const { accessToken, refreshToken, user: userData } = loginData;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // 로그인 후 유저 정보 설정
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    // localStorage 저장 제거
  };

  const devLogin = async () => {
    try {
      const response = await authApi.devLogin();
      await login(response.data.data); // user 정보도 함께 설정
    } catch (e) {
      alert('개발용 로그인 실패');
    }
  };

  // 페이지 로드 시 저장된 토큰으로 사용자 정보 복원
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          // 서버에서 최신 사용자 정보 가져오기
          try {
            const response = await userApi.getMyInfo();
            if (response.success) {
              setUser(response.data);
              setIsAuthenticated(true);
            } else {
              console.warn('Failed to fetch user info, but keeping tokens');
              // 실패해도 토큰은 유지 (네트워크 문제일 수 있음)
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.warn('Error fetching user info, but keeping tokens:', error);
            // 에러가 발생해도 토큰은 유지 (네트워크 문제일 수 있음)
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    devLogin, // 추가
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
