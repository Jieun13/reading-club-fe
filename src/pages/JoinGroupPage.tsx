import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { readingGroupApi } from '../api/readingGroups';
import { ReadingGroupListItem } from '../types/readingGroup';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

const JoinGroupPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<ReadingGroupListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [introduction, setIntroduction] = useState('');

  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (!inviteCode) {
        alert('잘못된 초대 링크입니다.');
        navigate('/reading-groups');
        return;
      }

      try {
        setLoading(true);
        const response = await readingGroupApi.getGroupByInviteCode(inviteCode);
        setGroup(response.data.data);
      } catch (error) {
        console.error('모임 정보 조회 실패:', error);
        alert('존재하지 않거나 만료된 초대 링크입니다.');
        navigate('/reading-groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupInfo();
  }, [inviteCode, navigate]);

  const handleJoinGroup = async () => {
    if (!group || !inviteCode) return;

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
      console.error('모임 가입 실패:', error);
      const errorMessage = error.response?.data?.message || '모임 가입에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">모임을 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/reading-groups')}
            className="text-blue-600 hover:text-blue-800"
          >
            모임 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/reading-groups')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            모임 목록으로 돌아가기
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">모임 가입</h1>
          <p className="text-gray-600 mt-2">초대받은 독서 모임에 가입하세요</p>
        </div>

        {/* 모임 정보 카드 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-4 mb-6">
            {/* 책 표지 */}
            <div className="w-20 h-28 flex-shrink-0">
              {group.bookCoverImage ? (
                <img
                  src={group.bookCoverImage}
                  alt={group.bookTitle}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                  <BookOpenIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* 모임 정보 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h2>
              {group.description && (
                <p className="text-gray-600 mb-4">{group.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpenIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{group.bookTitle}</span>
                  {group.bookAuthor && <span className="ml-2">- {group.bookAuthor}</span>}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {new Date(group.startDateTime).toLocaleString('ko-KR')}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {group.durationHours}시간
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  {group.currentMemberCount}/{group.maxMembers}명
                </div>
              </div>
            </div>
          </div>

          {/* 모임장 정보 */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">모임장</h3>
            <div className="flex items-center">
              {group.creator.profileImage ? (
                <img
                  src={group.creator.profileImage}
                  alt={group.creator.nickname}
                  className="w-8 h-8 rounded-full mr-3"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <span className="text-sm text-gray-900">{group.creator.nickname}</span>
            </div>
          </div>
        </div>

        {/* 가입 폼 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">가입 신청</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자기소개 (선택)
            </label>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="간단한 자기소개나 모임에 대한 기대를 적어주세요"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{introduction.length}/500</p>
          </div>

          {/* 가입 조건 확인 */}
          {group.currentMemberCount >= group.maxMembers ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800 text-sm">
                이 모임은 정원이 가득 찼습니다. ({group.currentMemberCount}/{group.maxMembers}명)
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-green-800 text-sm">
                가입 가능합니다! ({group.currentMemberCount}/{group.maxMembers}명)
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => navigate('/reading-groups')}
              className="px-6 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleJoinGroup}
              disabled={joining || group.currentMemberCount >= group.maxMembers}
              className={`px-6 py-2 text-sm text-white rounded-md flex items-center ${
                joining || group.currentMemberCount >= group.maxMembers
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {joining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  가입 중...
                </>
              ) : (
                <>
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  모임 가입
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupPage;
