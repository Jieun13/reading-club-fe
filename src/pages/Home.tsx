import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const handleKakaoLogin = () => {
    const kakaoLoginUrl = authApi.getKakaoLoginUrl();
    window.location.href = kakaoLoginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container py-12">
        {/* 히어로 섹션 */}
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span style={{ fontSize: '2.5rem' }}>📚</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              독서모임
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              읽은 책을 기록하고, 독서 습관을 만들어보세요. 
              당신의 독서 여정을 함께 응원합니다.
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="mb-8" style={{ marginBottom: '4rem' }}>
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-lg text-gray-700">
                  안녕하세요, <span className="font-semibold text-primary-600">{user?.nickname}</span>님! 👋
                </p>
                <div className="flex flex-col gap-4 justify-center" style={{ gap: '1rem' }}>
                  <Link
                    to="/library"
                    className="btn btn-primary px-8 py-4 text-lg"
                    style={{ display: 'inline-block', textDecoration: 'none' }}
                  >
                    내 서재 보기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleKakaoLogin}
                  className="btn btn-yellow px-8 py-4 text-lg flex items-center mx-auto"
                  style={{ gap: '0.75rem' }}
                >
                  <span>카카오로 시작하기</span>
                </button>
                <p className="text-sm text-gray-600">
                  간편하게 카카오 계정으로 로그인하세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
