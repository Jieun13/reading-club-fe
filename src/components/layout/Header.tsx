import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout, devLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logout();
      navigate('/');
    }
  };

  const handleKakaoLogin = () => {
    const kakaoLoginUrl = authApi.getKakaoLoginUrl();
    window.location.href = kakaoLoginUrl;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container">
        {/* 개발 환경에서만 노출되는 개발용 더미 로그인 버튼 */}
        {process.env.NODE_ENV === 'development' && !isAuthenticated && (
          <button onClick={devLogin} style={{marginRight: 16, background: '#eee', padding: '4px 12px', borderRadius: 4}}>
            개발용 더미 로그인
          </button>
        )}
        <div className="flex justify-between items-center" style={{ height: '4rem' }}>
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" style={{ textDecoration: 'none' }}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
              <span className="text-xl font-bold text-gray-900">독서모임</span>
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden items-center space-x-4" style={{ display: window.innerWidth >= 768 ? 'flex' : 'none' }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/library"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ textDecoration: 'none' }}
                >
                  서재
                </Link>

                <Link
                  to="/reading-groups"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ textDecoration: 'none' }}
                >
                  콜로세움
                </Link>
                <Link
                  to="/posts"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ textDecoration: 'none' }}
                >
                  게시글
                </Link>
                <Link
                  to="/statistics"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ textDecoration: 'none' }}
                >
                  통계
                </Link>
              </>
            ) : (
              <Link
                to="/about"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                style={{ textDecoration: 'none' }}
              >
                소개
              </Link>
            )}
          </nav>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <span className="text-gray-300">로딩 중...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <img
                    src={user.profileImage || '/default-avatar.png'}
                    alt={user.nickname}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                  <span>{user.nickname}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div 
                    className="bg-white rounded-md shadow-lg py-2"
                    style={{ 
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '0.5rem',
                      width: '12rem',
                      zIndex: 50
                    }}
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      프로필 설정
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <img src="/default-avatar.png" alt="사용자" className="w-8 h-8 rounded-full" />
                <span className="text-gray-400">사용자</span>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}>
          <div className="px-4 py-3 bg-white border-t">
            {isAuthenticated ? (
              <>
                <Link
                  to="/library"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  서재
                </Link>

                <Link
                  to="/reading-groups"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  콜로세움
                </Link>
                <Link
                  to="/posts"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  게시글
                </Link>
                <Link
                  to="/statistics"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  통계
                </Link>
              </>
            ) : (
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                style={{ textDecoration: 'none' }}
                onClick={() => setIsMenuOpen(false)}
              >
                소개
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
