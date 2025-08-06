import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  ArrowLeftIcon, 
  ShareIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { readingGroupApi } from '../api/readingGroups';
import { wishlistApi } from '../api/wishlists';
import { ReadingGroup, GroupMember } from '../types/readingGroup';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

const ReadingGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<ReadingGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [introduction, setIntroduction] = useState('');

  useEffect(() => {
    const fetchGroupData = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await readingGroupApi.getGroup(Number(id));
          setGroup(response.data.data);
          
          // 멤버 목록 가져오기
          await fetchMembers(Number(id));
        } catch (error) {
          console.error('독서 모임을 불러오는데 실패했습니다:', error);
          alert('독서 모임을 찾을 수 없습니다.');
          navigate('/reading-groups');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGroupData();
  }, [id, navigate]);

  const fetchMembers = async (id: number) => {
    try {
      const response = await readingGroupApi.getGroupMembers(id);
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('멤버 목록 조회 실패:', error);
      // 비공개 모임이거나 권한이 없는 경우 빈 배열로 설정
      setMembers([]);
    }
  };

  const handleJoinGroup = async () => {
    if (!group) return;

    try {
      if (group.isPublic) {
        // 공개 모임 직접 가입
        await readingGroupApi.joinGroup(group.id, introduction);
        alert('모임에 성공적으로 가입했습니다!');
      } else {
        // 비공개 모임 초대 코드 필요
        if (!inviteCodeInput.trim()) {
          alert('초대 코드를 입력해주세요.');
          return;
        }
        await readingGroupApi.joinByInviteCode(group.id, inviteCodeInput, introduction);
        alert('모임에 성공적으로 가입했습니다!');
      }
      
      // 상태 초기화 및 새로고침
      setShowJoinModal(false);
      setInviteCodeInput('');
      setIntroduction('');
      await fetchMembers(group.id);
      
      // 그룹 정보도 새로고침 (currentMemberCount 업데이트)
      const response = await readingGroupApi.getGroup(group.id);
      setGroup(response.data.data);
    } catch (error) {
      console.error('모임 가입 실패:', error);
      alert('모임 가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleRemoveMember = async (userId: number, nickname: string) => {
    if (!group || !window.confirm(`${nickname}님을 모임에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      await readingGroupApi.removeMember(group.id, userId);
      alert('멤버가 성공적으로 제거되었습니다.');
      await fetchMembers(group.id);
      
      // 그룹 정보도 새로고침
      const response = await readingGroupApi.getGroup(group.id);
      setGroup(response.data.data);
    } catch (error) {
      console.error('멤버 제거 실패:', error);
      alert('멤버 제거에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!group || !window.confirm('정말로 이 모임에서 탈퇴하시겠습니까?')) {
      return;
    }

    try {
      await readingGroupApi.leaveGroup(group.id);
      alert('모임에서 성공적으로 탈퇴했습니다.');
      navigate('/reading-groups');
    } catch (error) {
      console.error('모임 탈퇴 실패:', error);
      alert('모임 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCopyInviteCode = () => {
    if (group) {
      const inviteUrl = `${window.location.origin}/reading-groups/join/${group.inviteCode}`;
      navigator.clipboard.writeText(inviteUrl);
      alert('초대 링크가 복사되었습니다!');
    }
  };

  const handleAddToWishlist = async () => {
    if (!group || !group.bookTitle) {
      return;
    }

    try {
      // 중복 체크
      const duplicateCheck = await wishlistApi.checkDuplicate(
        group.bookTitle,
        group.bookAuthor || undefined
      );

      if (duplicateCheck.data.data.duplicate) {
        alert('이미 읽고 싶은 책에 추가된 책입니다.');
        return;
      }

      const wishlistData = {
        title: group.bookTitle,
        author: group.bookAuthor || '',
        publisher: group.bookPublisher || '',
        coverImage: group.bookCoverImage || '',
        memo: `${group.name} 모임의 이달의 책`
      };

      await wishlistApi.addWishlist(wishlistData);
      alert('읽고 싶은 책에 추가되었습니다!');
    } catch (error) {
      console.error('읽고 싶은 책 추가 실패:', error);
      alert('읽고 싶은 책 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleRegenerateInviteCode = async () => {
    if (!group || !window.confirm('초대 코드를 재생성하시겠습니까? 기존 링크는 사용할 수 없게 됩니다.')) {
      return;
    }

    try {
      const response = await readingGroupApi.regenerateInviteCode(group.id);
      setGroup(prev => prev ? { ...prev, inviteCode: response.data.data.inviteCode } : null);
      alert('초대 코드가 재생성되었습니다.');
    } catch (error) {
      console.error('초대 코드 재생성 실패:', error);
      alert('초대 코드 재생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !window.confirm('정말로 이 모임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await readingGroupApi.deleteGroup(group.id);
      alert('모임이 삭제되었습니다.');
      navigate('/reading-groups');
    } catch (error) {
      console.error('모임 삭제 실패:', error);
      alert('모임 삭제에 실패했습니다. 다시 시도해주세요.');
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
          <Link to="/reading-groups" className="text-blue-600 hover:text-blue-800">
            모임 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === group.creator.id;
  const isMember = members.some(member => member.user.id === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/reading-groups')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                모임 목록
              </button>
            </div>
            
            {isCreator && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDeleteGroup}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  모임 삭제
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 모임 기본 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                  <p className="text-gray-600">{group.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.isPublic ? '공개' : '비공개'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">모임 일시</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {group.startDateTime ? new Date(group.startDateTime).toLocaleString('ko-KR') : '미정'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">진행 시간</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {group.durationHours ? `${group.durationHours}시간` : '미정'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">모임 방식</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {group.meetingType === 'OFFLINE' ? '오프라인' : group.meetingType === 'ONLINE' ? '온라인' : '미정'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">모임 장소</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {group.meetingType === 'OFFLINE' && group.location ? group.location : 
                     group.meetingType === 'ONLINE' && group.meetingUrl ? group.meetingUrl : '미정'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">참여 인원</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {group.currentMemberCount}/{group.maxMembers}명
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">과제</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {group.hasAssignment ? '모임 전까지 책 읽고 리뷰 남기기' : '과제 없음'}
                  </dd>
                </div>
              </div>
            </div>

            {/* 이달의 책 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  이달의 책
                </h2>
              </div>

              {group.bookTitle ? (
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-20 flex-shrink-0">
                    {group.bookCoverImage ? (
                      <img
                        src={group.bookCoverImage}
                        alt={group.bookTitle}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-image') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="fallback-image w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <BookOpenIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{group.bookTitle}</h3>
                    <p className="text-gray-600 text-sm mb-2">{group.bookAuthor}</p>
                    <p className="text-xs text-gray-500 mb-3">{group.bookPublisher}</p>

                    <div className="flex items-center justify-end">
                      <button
                        onClick={handleAddToWishlist}
                        className="flex items-center px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        읽고 싶은 책 추가
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">아직 선정된 책이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 모임장 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">모임장</h3>
              <div className="flex items-center">
                {group.creator.profileImage ? (
                  <img
                    src={group.creator.profileImage}
                    alt={group.creator.nickname}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{group.creator.nickname}</p>
                </div>
              </div>
            </div>

            {/* 멤버 목록 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  멤버 ({members.length}/{group.maxMembers})
                </h3>
                
                {/* 가입/탈퇴 버튼 */}
                {!isMember && members.length < group.maxMembers && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <UserGroupIcon className="w-4 h-4 mr-1" />
                    모임 가입
                  </button>
                )}
                
                {isMember && !isCreator && (
                  <button
                    onClick={handleLeaveGroup}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    모임 탈퇴
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Link
                        to={`/users/${member.user.id}`}
                        className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        {member.user.profileImage ? (
                          <img
                            src={member.user.profileImage}
                            alt={member.user.nickname}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{member.user.nickname}</span>
                            {member.role === 'CREATOR' && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                모임장
                              </span>
                            )}
                            {member.role === 'ADMIN' && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                관리자
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(member.joinedAt).toLocaleDateString('ko-KR')} 가입
                          </p>
                          {member.introduction && (
                            <p className="text-sm text-gray-600 mt-1">{member.introduction}</p>
                          )}
                        </div>
                      </Link>
                      
                      {/* 멤버 삭제 버튼 (모임장만, 자신과 다른 모임장은 제외) */}
                      {isCreator && member.role !== 'CREATOR' && member.user.id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.user.id, member.user.nickname)}
                          className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                        >
                          제거
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>아직 가입한 멤버가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 초대 링크 */}
            {(isCreator || isMember) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">초대 링크</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowInviteCode(!showInviteCode)}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <ShareIcon className="w-4 h-4 mr-2" />
                    초대 링크 보기
                  </button>
                  
                  {showInviteCode && (
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-500 mb-1">초대 코드</p>
                        <p className="font-mono text-sm">{group.inviteCode}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCopyInviteCode}
                          className="flex-1 px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          링크 복사
                        </button>
                        {isCreator && (
                          <button
                            onClick={handleRegenerateInviteCode}
                            className="flex-1 px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            재생성
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 가입 모달 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {group?.isPublic ? '모임 가입' : '비공개 모임 가입'}
            </h3>
            
            {!group?.isPublic && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  초대 코드 *
                </label>
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="초대 코드를 입력하세요"
                />
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개 (선택)
              </label>
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="간단한 자기소개를 입력하세요"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{introduction.length}/500</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCodeInput('');
                  setIntroduction('');
                }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleJoinGroup}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                가입하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingGroupDetail;
