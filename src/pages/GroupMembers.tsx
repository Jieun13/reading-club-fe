import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  UserIcon,
  StarIcon,
  UserMinusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { readingGroupApi } from '../api/readingGroups';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

interface GroupMember {
  id: number;
  user: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  role: 'CREATOR' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}

interface GroupInfo {
  id: number;
  name: string;
  creator: {
    id: number;
    nickname: string;
  };
}

const GroupMembers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // 그룹 정보 가져오기
        const groupResponse = await readingGroupApi.getGroup(Number(id));
        setGroupInfo({
          id: groupResponse.data.data.id,
          name: groupResponse.data.data.name,
          creator: groupResponse.data.data.creator
        });

        // 멤버 목록 가져오기 (임시 데이터)
        // 실제로는 readingGroupApi.getMembers(Number(id)) 같은 API 호출
        const mockMembers: GroupMember[] = [
          {
            id: 1,
            user: {
              id: groupResponse.data.data.creator.id,
              nickname: groupResponse.data.data.creator.nickname,
              profileImage: groupResponse.data.data.creator.profileImage
            },
            role: 'CREATOR',
            status: 'ACTIVE',
            joinedAt: groupResponse.data.data.createdAt
          },
          // 추가 멤버들은 실제 API에서 가져와야 함
        ];
        
        setMembers(mockMembers);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
        navigate('/reading-groups');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!window.confirm(`정말로 ${memberName}님을 모임에서 내보내시겠습니까?`)) {
      return;
    }

    try {
              // 실제로는 readingGroupApi.removeMember(id, memberId) 같은 API 호출
      alert('멤버가 성공적으로 제거되었습니다.');
      // 멤버 목록 새로고침
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('멤버 제거 실패:', error);
      alert('멤버 제거에 실패했습니다.');
    }
  };

  const isCreator = user && groupInfo && groupInfo.creator.id === user.id;

  if (loading) {
    return <Loading />;
  }

  if (!groupInfo) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">모임을 찾을 수 없습니다</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              to={`/reading-groups/${id}`}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">멤버 관리</h1>
              <p className="text-gray-600 mt-1">{groupInfo.name}</p>
            </div>
          </div>
        </div>

        {/* 멤버 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              모임 멤버 ({members.filter(m => m.status === 'ACTIVE').length}명)
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {members
              .filter(member => member.status === 'ACTIVE')
              .map((member) => (
                <div key={member.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {member.user.profileImage ? (
                          <img
                            src={member.user.profileImage}
                            alt={member.user.nickname}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {member.user.nickname}
                          </h3>
                          {member.role === 'CREATOR' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <StarIcon className="w-3 h-3 mr-1" />
                              모임장
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {new Date(member.joinedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} 가입
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center space-x-2">
                      {isCreator && member.role !== 'CREATOR' && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.user.nickname)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <UserMinusIcon className="w-4 h-4 mr-1" />
                          내보내기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {members.filter(m => m.status === 'ACTIVE').length === 0 && (
            <div className="px-6 py-12 text-center">
              <UserIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">아직 가입한 멤버가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 초대 섹션 */}
        {isCreator && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 멤버 초대</h3>
            <p className="text-gray-600 mb-4">
              아래 초대 링크를 공유하여 새로운 멤버를 모임에 초대할 수 있습니다.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/reading-groups/join/${groupInfo.id}`}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/reading-groups/join/${groupInfo.id}`);
                  alert('초대 링크가 클립보드에 복사되었습니다.');
                }}
                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700"
              >
                복사
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMembers;
