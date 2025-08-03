import React, { useState, useEffect } from 'react';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';
import { userApi } from '../api/user';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
    }
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      try {
        setIsLoggingOut(true);
        await authApi.logout();
        logout();
      } catch (error) {
        console.error('로그아웃 중 오류가 발생했습니다:', error);
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  const handleNicknameUpdate = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    if (nickname === user?.nickname) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await userApi.updateProfile({ nickname });
      updateUser(response.data.data);
      setIsEditing(false);
      alert('닉네임이 성공적으로 변경되었습니다.');
    } catch (error: any) {
      console.error('닉네임 변경 실패:', error);
      const errorMessage = error.response?.data?.message || '닉네임 변경에 실패했습니다.';
      alert(errorMessage);
      setNickname(user?.nickname || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setNickname(user?.nickname || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">프로필 설정</h1>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className="w-5 h-5 inline mr-2" />
                프로필 정보
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5 inline mr-2" />
                계정 설정
              </button>
            </nav>
          </div>

          {/* 탭 내용 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* 프로필 이미지 및 기본 정보 */}
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="프로필"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="text-2xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none bg-transparent"
                            maxLength={20}
                          />
                          <button
                            onClick={handleNicknameUpdate}
                            disabled={isUpdating}
                            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                          >
                            {isUpdating ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <h2 className="text-2xl font-bold text-gray-900">{user?.nickname}</h2>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="닉네임 수정"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">
                      가입일: {user?.createdAt ? formatDate(user.createdAt) : '정보 없음'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900 mb-4">계정 관리</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-2">로그아웃</h4>
                      <p className="text-sm text-red-600 mb-3">
                        현재 세션에서 로그아웃합니다. 다시 로그인하려면 카카오 계정으로 인증해야 합니다.
                      </p>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
