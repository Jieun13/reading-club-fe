import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';
import Loading from '../components/common/Loading';

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // 중복 호출 방지를 위한 ref
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return; // 이미 호출했다면 무시
    calledRef.current = true;

    const handleKakaoCallback = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          throw new Error('카카오 로그인이 취소되었습니다.');
        }

        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }

        const response = await authApi.kakaoCallback(code);

        if (response.data.success) {
          const loginData = response.data.data;
          login(loginData);
          navigate('/library', { replace: true });
        } else {
          throw new Error(response.data.message || '로그인에 실패했습니다.');
        }
      } catch (error: any) {
        if (error.response?.status === 200 || error.response?.status === 201) {
          console.log('카카오 로그인 성공 (네트워크 경고 무시)');
          return;
        }
        console.error('Kakao login failed:', error);
        setError(error.response?.data?.message || error.message || '로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleKakaoCallback();
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#fef2f2' }}
            >
              <span style={{ fontSize: '2rem' }}>❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 실패</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full btn btn-primary py-2 px-4"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#fef3c7' }}
          >
            <span style={{ fontSize: '2rem' }}>🔑</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">로그인 처리 중</h2>
          <Loading size="md" text="카카오 로그인을 처리하고 있습니다..." />
        </div>
      </div>
    </div>
  );
};

export default KakaoCallback;