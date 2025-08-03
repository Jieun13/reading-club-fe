import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserGroupIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { readingGroupApi } from '../api/readingGroups';
import { ReadingGroupListItem } from '../types/readingGroup';
import Loading from '../components/common/Loading';

const JoinReadingGroup: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ReadingGroupListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [introduction, setIntroduction] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inviteCode) {
      fetchGroupInfo();
    }
  }, [inviteCode]);

  const fetchGroupInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: 실제로는 초대 코드로 그룹 정보를 가져와야 함
      // 임시로 공개 그룹 목록에서 첫 번째 그룹을 사용
      const response = await readingGroupApi.getPublicGroups(0, 1);
      if (response.data.data.content.length > 0) {
        setGroup(response.data.data.content[0]);
      } else {
        setError('유효하지 않은 초대 코드입니다.');
      }
    } catch (error) {
      console.error('그룹 정보를 불러오는데 실패했습니다:', error);
      setError('유효하지 않은 초대 코드입니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode || !group) return;

    try {
      setJoining(true);
      await readingGroupApi.joinByInviteCode(
        group.id,
        inviteCode,
        introduction.trim() || undefined
      );
      
      alert('독서 모임에 성공적으로 가입했습니다!');
      navigate(`/reading-groups/${group.id}`);
    } catch (error: any) {
      console.error('모임 가입에 실패했습니다:', error);
      const errorMessage = error.response?.data?.message || '모임 가입에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" text="모임 정보를 확인하는 중..." />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            초대 링크 오류
          </h2>
          <p className="text-gray-600 mb-6">
            {error || '유효하지 않은 초대 링크입니다.'}
          </p>
          <button
            onClick={() => navigate('/reading-groups')}
            className="btn btn-primary"
          >
            독서 모임 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            독서 모임 초대
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            다음 독서 모임에 초대되었습니다
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* 모임 정보 */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-sm text-gray-600 mb-3">
                {group.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-1" />
                {group.currentMemberCount}/{group.maxMembers}명
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  group.isPublic 
                    ? 'text-green-600 bg-green-50 border border-green-200' 
                    : 'text-gray-600 bg-gray-50 border border-gray-200'
                }`}>
                  {group.isPublic ? '공개' : '비공개'}
                </span>
              </div>
            </div>
          </div>

          {/* 모임장 정보 */}
          <div className="mb-4">
            <div className="flex items-center">
              {group.creator.profileImage ? (
                <img
                  src={group.creator.profileImage}
                  alt={group.creator.nickname}
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                  <UserGroupIcon className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {group.creator.nickname}
                </div>
                <div className="text-xs text-gray-500">모임장</div>
              </div>
            </div>
          </div>

          {/* 자기소개 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              간단한 자기소개 (선택사항)
            </label>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="안녕하세요! 독서를 좋아하는 ○○○입니다."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {introduction.length}/500자
            </p>
          </div>

          {/* 가입 버튼 */}
          <div className="space-y-3">
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full btn btn-primary flex items-center justify-center"
            >
              {joining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  가입 중...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  모임 가입하기
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/reading-groups')}
              className="w-full btn btn-outline"
            >
              다른 모임 둘러보기
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="text-center text-xs text-gray-500">
          가입 후 언제든지 모임에서 탈퇴할 수 있습니다.
        </div>
      </div>
    </div>
  );
};

export default JoinReadingGroup;
