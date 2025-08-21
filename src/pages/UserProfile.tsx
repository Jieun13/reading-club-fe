import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../api/user';
import { UserProfile as UserProfileType } from '../types';
import { PostType, RecommendationPost, RecommendationType } from '../types/post';
import Loading from '../components/common/Loading';
import { convertToHttps, handleImageError } from '../utils/imageUtils';
import { 
  BookOpenIcon, 
  HeartIcon, 
  DocumentTextIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface UserProfileProps {}

const UserProfile: React.FC<UserProfileProps> = () => {
  const { userId } = useParams<{ userId: string }>();
  const [targetUser, setTargetUser] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('사용자 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 사용자 프로필 정보 가져오기 (통계, 현재 읽고 있는 책, 최근 게시글 포함)
        const userResponse = await userApi.getUserProfile(parseInt(userId));
        setTargetUser(userResponse.data);
      } catch (error: any) {
        console.error('사용자 프로필 조회 실패:', error);
        if (error.response?.status === 401) {
          setError('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (error.response?.status === 404) {
          setError('사용자를 찾을 수 없습니다.');
        } else {
          setError(error.response?.data?.message || '사용자 정보를 불러올 수 없습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const getPostTypeLabel = (type: PostType) => {
    switch (type) {
      case PostType.REVIEW:
        return '독후감';
      case PostType.RECOMMENDATION:
        return '추천/비추천';
      case PostType.QUOTE:
        return '문장 수집';
      default:
        return '알 수 없음';
    }
  };

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case PostType.REVIEW:
        return 'bg-blue-100 text-blue-800';
      case PostType.RECOMMENDATION:
        return 'bg-green-100 text-green-800';
      case PostType.QUOTE:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error}</div>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">사용자를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center space-x-4">
        <img
          src={convertToHttps(targetUser.profileImage)}
          alt={targetUser.nickname || '사용자'}
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => handleImageError(e)}
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {targetUser.nickname} 님의 기록
          </h1>
          <p className="text-gray-600">
            가입일: {targetUser.createdAt ? new Date(targetUser.createdAt).toLocaleDateString('ko-KR') : '정보 없음'}
          </p>
        </div>
      </div>

      {/* 현재 읽고 있는 책 */}
      {targetUser.currentlyReading && targetUser.currentlyReading.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">현재 읽고 있는 책</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {targetUser.currentlyReading.map((book) => (
              <div key={book.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{book.author}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${book.progressPercentage || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{book.progressPercentage || 0}% 완료</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 전체 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpenIcon className="w-5 h-5 text-gray-600 mr-2" />
            전체 통계
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BookOpenIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-gray-600">완독한 책</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.totalBooks}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BookOpenIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-gray-600">읽고 있는 책</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.currentlyReadingCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <HeartIcon className="w-4 h-4 text-pink-600 mr-2" />
                <span className="text-gray-600">위시리스트</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.wishlistCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <XMarkIcon className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-gray-600">읽다 만 책</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.droppedBooksCount}</span>
            </div>
          </div>
        </div>

        {/* 이번 달 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpenIcon className="w-5 h-5 text-gray-600 mr-2" />
            이번 달 통계
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BookOpenIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-gray-600">완독한 책</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.thisMonthBooks}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <XMarkIcon className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-gray-600">읽다 만 책</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.thisMonthDroppedBooks}</span>
            </div>
          </div>
        </div>

        {/* 게시글 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 text-gray-600 mr-2" />
            게시글 통계
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-gray-600">총 게시글</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.totalPosts}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-gray-600">이번 달 게시글</span>
              </div>
              <span className="font-semibold text-lg">{targetUser.statistics.thisMonthPosts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 공개 게시글 */}
      {targetUser.recentPublicPosts && targetUser.recentPublicPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 공개 게시글</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {targetUser.recentPublicPosts.map((post) => (
              <div
                key={post.id}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* 책 표지 */}
                {post.bookInfo && (
                  <div className="relative">
                    <img
                      src={post.bookInfo.cover}
                      alt={post.bookInfo.title}
                      className="w-full h-40 object-cover"
                    />
                    {/* 게시글 타입 배지 */}
                    <div className="absolute top-2 left-2">
                      {post.postType === PostType.RECOMMENDATION ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (post as RecommendationPost).recommendationType === RecommendationType.RECOMMEND
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(post as RecommendationPost).recommendationType === RecommendationType.RECOMMEND ? '추천' : '비추천'}
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.postType)}`}>
                          {getPostTypeLabel(post.postType)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 게시글 정보 */}
                <div className="p-3">
                  {/* 책 제목 */}
                  {post.bookInfo && (
                    <h3 className="font-semibold text-gray-900 text-xs mb-2 line-clamp-2">
                      {post.bookInfo.title}
                    </h3>
                  )}

                  {/* 하단 정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="text-xs">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 게시글이 없는 경우 */}
      {(!targetUser.recentPublicPosts || targetUser.recentPublicPosts.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">공개된 게시글이 없습니다.</div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 