import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
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
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <img
                    src={user?.profileImage || '/default-avatar.png'}
                    alt={user?.nickname}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+';
                    }}
                  />
                  <span className="text-sm font-medium" style={{ display: window.innerWidth >= 768 ? 'block' : 'none' }}>
                    {user?.nickname}
                  </span>
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
              <button
                onClick={handleKakaoLogin}
                className="btn btn-yellow px-4 py-2 text-sm font-medium flex items-center space-x-2"
              >
                <span>카카오 로그인</span>
              </button>
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
