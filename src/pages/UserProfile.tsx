import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userApi } from '../api/user';
import { UserProfile as UserProfileType } from '../types';
import { PostType, RecommendationPost, RecommendationType } from '../types/post';
import Loading from '../components/common/Loading';

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
          src={targetUser.profileImage || '/default-avatar.png'}
          alt={targetUser.nickname || '사용자'}
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
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

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">서재 통계</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">완독한 책</span>
              </div>
              <span className="font-semibold">{targetUser.statistics.totalBooks}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-gray-600">읽고 있는 책</span>
              </div>
              <span className="font-semibold">{targetUser.statistics.currentlyReadingCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-gray-600">읽고 싶은 책</span>
              </div>
              <span className="font-semibold">{targetUser.statistics.wishlistCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">게시글 통계</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span className="text-gray-600">총 게시글</span>
              </div>
              <span className="font-semibold">{targetUser.statistics.totalPosts}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">이번 달 게시글</span>
              </div>
              <span className="font-semibold">{targetUser.statistics.thisMonthPosts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">이번 달 완독</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">완독한 책</span>
              </div>
              <span className="font-semibold">{targetUser.statistics.thisMonthBooks}</span>
            </div>
          </div>
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