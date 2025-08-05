import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PlusIcon, UserGroupIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { readingGroupApi } from '../api/readingGroups';
import { ReadingGroupListItem } from '../types/readingGroup';
import Loading from '../components/common/Loading';

const ReadingGroups: React.FC = () => {
  const [recruitingGroups, setRecruitingGroups] = useState<ReadingGroupListItem[]>([]);
  const [endedGroups, setEndedGroups] = useState<ReadingGroupListItem[]>([]);
  const [appliedGroups, setAppliedGroups] = useState<ReadingGroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'recruiting' | 'ended' | 'applied'>('recruiting');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // 공개 모임 조회 (모집 중인 것들)
      const publicGroupsResponse = await readingGroupApi.getPublicGroups(0, 20);
      const allPublicGroups = publicGroupsResponse.data.data.content;
      
      // 임시로 상태별로 분류 (실제로는 백엔드에서 상태 필드가 있어야 함)
      const recruiting = allPublicGroups.filter(group => 
        group.currentMemberCount < group.maxMembers && group.status === 'ACTIVE'
      );
      const ended = allPublicGroups.filter(group => 
        group.status === 'ARCHIVED' || group.currentMemberCount >= group.maxMembers
      );
      
      setRecruitingGroups(recruiting);
      setEndedGroups(ended);

      const myGroupsResponse = await readingGroupApi.getMyGroups();
      setAppliedGroups(myGroupsResponse.data.data);
      
    } catch (error) {
      console.error('독서 모임을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'recruiting' || activeTab === 'ended') {
      try {
        const response = await readingGroupApi.getPublicGroups(0, 20, searchTerm);
        const searchResults = response.data.data.content;
        
        if (activeTab === 'recruiting') {
          const recruiting = searchResults.filter(group => 
            group.currentMemberCount < group.maxMembers && group.status === 'ACTIVE'
          );
          setRecruitingGroups(recruiting);
        } else {
          const ended = searchResults.filter(group => 
            group.status === 'ARCHIVED' || group.currentMemberCount >= group.maxMembers
          );
          setEndedGroups(ended);
        }
      } catch (error) {
        console.error('검색에 실패했습니다:', error);
      }
    }
  };

  const getFilteredGroups = () => {
    switch (activeTab) {
      case 'recruiting':
        return searchTerm 
          ? recruitingGroups.filter(group =>
              group.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : recruitingGroups;
      case 'ended':
        return searchTerm 
          ? endedGroups.filter(group =>
              group.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : endedGroups;
      case 'applied':
        return searchTerm 
          ? appliedGroups.filter(group =>
              group.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : appliedGroups;
      default:
        return [];
    }
  };

  const handleApply = async (groupId: number) => {
    try {
      await readingGroupApi.joinGroup(groupId);
      alert('독서 모임 신청이 완료되었습니다!');
    } catch (error) {
      console.error('독서 모임 신청에 실패했습니다:', error);
      alert('신청에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Loading size="lg" text="독서 모임을 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
            <UserGroupIcon className="w-8 h-8 text-primary-600 mr-3"/>
            콜로세움
          </h1>
          <Link
              to="/reading-groups/create"
              className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2"/>
            모임 만들기
          </Link>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                  onClick={() => setActiveTab('recruiting')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'recruiting'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                모집 중 ({recruitingGroups.length})
              </button>
              <button
                  onClick={() => setActiveTab('ended')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'ended'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                종료된 모임 ({endedGroups.length})
              </button>
              <button
                  onClick={() => setActiveTab('applied')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'applied'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                내가 신청한 모임 ({appliedGroups.length})
              </button>
            </nav>
          </div>

          {/* 검색 */}
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon
                    className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <input
                    type="text"
                    placeholder="모임 이름으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {(activeTab === 'recruiting' || activeTab === 'ended') && (
                  <button
                      type="submit"
                      className="btn btn-primary whitespace-nowrap"
                  >
                    검색
                  </button>
              )}
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredGroups().map((group) => (
              <div
                  key={group.id}
                  onClick={() => navigate(`/reading-groups/${group.id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-[380px] cursor-pointer"
              >
                <div className="p-6 flex flex-col flex-1 justify-between">
                  {/* 헤더 */}
                  <div className="flex justify-between items-start h-[60px]">
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">저자: {group.bookAuthor}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {group.bookCoverImage ? (
                          <img
                              src={group.bookCoverImage}
                              alt={group.bookTitle}
                              className="w-12 h-16 object-cover rounded"
                          />
                      ) : (
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-gray-400"/>
                          </div>
                      )}
                    </div>
                  </div>

                  {/* 모임 정보 */}
                  <div
                      className="mt-4 bg-gray-50 rounded-lg p-3 h-[90px] text-sm text-gray-800 space-y-1 overflow-hidden">
                    <div className="flex items-center truncate">
                      <span className="font-medium mr-2">📅</span>
                      {group.startDateTime ? (
                        <>
                          {new Date(group.startDateTime).toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}{' '}
                          {new Date(group.startDateTime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </>
                      ) : (
                        '일정 미정'
                      )}
                    </div>
                    <div className="flex items-center truncate">
                      <span className="font-medium mr-2">⏱️</span>
                      {group.durationHours ? `${group.durationHours}시간 진행` : '진행 시간 미정'}
                    </div>
                    <div className="flex items-center truncate">
                      <span className="font-medium mr-2">📍</span>
                      {group.meetingType === 'OFFLINE'
                          ? group.location || '장소 미정'
                          : group.meetingUrl
                              ? '온라인 참여 링크'
                              : '온라인 주소 미정'}
                    </div>
                  </div>

                  {/* 설명 */}
                  {group.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2 h-[40px]">
                        {group.description}
                      </p>
                  )}

                  {/* 과제 유무 */}
                  <div className="mt-3">
                    <dt className="text-sm font-medium text-gray-800 inline-block mr-2">과제</dt>
                    <dd className="inline text-sm text-green-600 font-semibold">
                      {group.hasAssignment ? '모임 전까지 책 읽고 리뷰 남기기 ✅ ' : '없음'}
                    </dd>
                  </div>

                  {/* 하단 고정 */}
                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <div className="flex items-center text-gray-800 font-bold">
                        <UserGroupIcon className="w-4 h-4 mr-1"/>
                        {group.currentMemberCount}/{group.maxMembers}명
                      </div>
                      <div>모임장 : {group.creator.nickname}</div>
                    </div>

                    <div className="flex items-center justify-between text-gray-500">
                      <div>{new Date(group.createdAt).toLocaleDateString()}</div>
                      <button
                          onClick={(e) => {
                            e.stopPropagation(); // ✅ 클릭 이벤트 전파 방지
                            handleApply(group.id);
                          }}
                          className="btn btn-primary btn-sm"
                      >
                        신청하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {getFilteredGroups().length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'recruiting' && '모집 중인 독서 모임이 없습니다'}
                {activeTab === 'ended' && '종료된 독서 모임이 없습니다'}
                {activeTab === 'applied' && '신청한 독서 모임이 없습니다'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'recruiting' && '새로운 독서 모임을 만들거나 기존 모임에 참여해보세요!'}
                {activeTab === 'ended' && '아직 종료된 모임이 없습니다.'}
                {activeTab === 'applied' && '관심 있는 독서 모임에 신청해보세요!'}
              </p>
              {activeTab === 'recruiting' && (
                  <Link to="/reading-groups/create" className="btn btn-primary">
                    독서 모임 만들기
                  </Link>
              )}
            </div>
        )}
      </div>
  );
};

export default ReadingGroups;
