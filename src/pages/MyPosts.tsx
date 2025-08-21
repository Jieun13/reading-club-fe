import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Post,
  PostType,
  PostVisibility,
  ReviewPost,
  RecommendationPost,
  QuotePost,
  RecommendationType
} from '../types/post';
import { postsApi, commentApi } from '../api/posts';
import { wishlistApi } from '../api/wishlists';
import { bookApi } from '../api/books';
import { currentlyReadingApi } from '../api/currentlyReading';
import { useAuth } from '../contexts/AuthContext';
import { convertToHttps, handleImageError } from '../utils/imageUtils';
import { CurrentlyReading } from '../types';
import { BookOpenIcon, HeartIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import BookModal from '../components/library/BookModal';

const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<PostType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [commentCounts, setCommentCounts] = useState<{ [postId: number]: number }>({});

  // 통계 관련 상태
  const [currentlyReading, setCurrentlyReading] = useState<CurrentlyReading[]>([]);
  const [completedBooksCount, setCompletedBooksCount] = useState(0);
  const [currentlyReadingCount, setCurrentlyReadingCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [droppedBooksCount, setDroppedBooksCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [thisMonthPostsCount, setThisMonthPostsCount] = useState(0);
  const [thisMonthCompletedCount, setThisMonthCompletedCount] = useState(0);

  // 모달 상태
  const [selectedItem, setSelectedItem] = useState<{ type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: any } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 모든 데이터를 병렬로 가져오기
      const [
        postsResponse,
        currentlyReadingResponse,
        booksResponse,
        wishlistResponse
      ] = await Promise.all([
        postsApi.getMyPosts({ page: 0, size: 1000 }), // 모든 게시글 가져오기
        currentlyReadingApi.getCurrentlyReading(),
        bookApi.getBooks(0, 1000), // 모든 책 가져오기
        wishlistApi.getWishlists(0, 1000) // 모든 위시리스트 가져오기
      ]);

      const postsData = postsResponse.data?.posts || [];
      const currentlyReadingData = currentlyReadingResponse.data?.content || [];
      const booksData = booksResponse.data?.data?.content || [];
      const wishlistData = wishlistResponse.data?.data?.content || [];

      setPosts(postsData);
      setCurrentlyReading(currentlyReadingData);
      setPostCount(postsData.length);
      setCurrentlyReadingCount(currentlyReadingData.length);
      setCompletedBooksCount(booksData.length);
      setWishlistCount(wishlistData.length);
      setDroppedBooksCount(0); // 기본값으로 설정

      // 이번 달 통계 계산
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      // 이번 달 게시글 수
      const thisMonthPosts = postsData.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate.getMonth() === thisMonth && postDate.getFullYear() === thisYear;
      });
      setThisMonthPostsCount(thisMonthPosts.length);

      // 이번 달 완독한 책 수
      const thisMonthCompleted = booksData.filter(book => {
        const finishedDate = new Date(book.finishedDate);
        return finishedDate.getMonth() === thisMonth && finishedDate.getFullYear() === thisYear;
      });
      setThisMonthCompletedCount(thisMonthCompleted.length);

      setTotalPages(1);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      setPosts([]);
      setCurrentlyReading([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleItemClick = (book: CurrentlyReading) => {
    setSelectedItem({ type: 'currentlyReading', data: book });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async (item: { type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: any }) => {
    // 삭제 로직은 여기서는 구현하지 않음 (my페이지에서는 읽기 전용)
    closeModal();
  };

  const handleStartReading = (wishlistItem: any) => {
    // 읽기 시작 로직은 여기서는 구현하지 않음
    closeModal();
  };

  const handleMarkAsRead = (currentlyReadingItem: CurrentlyReading) => {
    // 읽기 완료 로직은 여기서는 구현하지 않음
    closeModal();
  };

  const handleDropBook = (currentlyReadingItem: CurrentlyReading) => {
    // 책 중단 로직은 여기서는 구현하지 않음
    closeModal();
  };

  const handleResumeReading = (droppedBook: any) => {
    // 다시 읽기 로직은 여기서는 구현하지 않음
    closeModal();
  };

  const handleTypeChange = (type: PostType | 'ALL') => {
    setSelectedType(type);
    setCurrentPage(0);
  };

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

  const handleAddToWishlist = async (post: Post) => {
    if (!post.bookInfo) {
      alert('책 정보가 없습니다.');
      return;
    }

    try {
      const wishlistData = {
        title: post.bookInfo.title,
        author: post.bookInfo.author || '',
        coverImage: post.bookInfo.cover || '',
        publisher: post.bookInfo.publisher || '',
        publishedDate: post.bookInfo.pubDate || '',
        description: post.bookInfo.description || '',
        memo: `${post.userName}님의 게시글에서 추가`
      };

      await wishlistApi.addWishlist(wishlistData);
      alert('읽고 싶은 책에 추가되었습니다!');
    } catch (error) {
      console.error('위시리스트 추가 실패:', error);
      alert('이미 위시리스트에 있는 책이거나 추가에 실패했습니다.');
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

  const renderPostContent = (post: Post) => {
    switch (post.postType) {
      case PostType.REVIEW:
        const reviewPost = post as ReviewPost;
        return (
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {reviewPost.title}
              </h3>
              <p className="text-gray-600 line-clamp-3 leading-relaxed">
                {reviewPost.content}
              </p>
            </div>
        );

      case PostType.RECOMMENDATION:
        const recommendationPost = post as RecommendationPost;
        return (
            <div>
              <p className="text-gray-600 line-clamp-3 leading-relaxed">
                {recommendationPost.reason}
              </p>
            </div>
        );

      case PostType.QUOTE:
        const quotePost = post as QuotePost;

        // 새로운 방식 (quotes 배열) 우선 처리
        if (quotePost.quotes && quotePost.quotes.length > 0) {
          return (
              <div className="space-y-3">
                {quotePost.quotes.slice(0, 2).map((quote, index) => (
                    <div key={index} className="border-l-4 border-purple-300 pl-4">
                      <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-medium">
                      {quote.page}p
                    </span>
                      </div>
                      <blockquote className="text-gray-700 text-m leading-relaxed line-clamp-2">
                        "{quote.text}"
                      </blockquote>
                    </div>
                ))}
                {quotePost.quotes.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{quotePost.quotes.length - 2}개 문장 더보기
                    </div>
                )}
              </div>
          );
        }

        // 하위 호환성을 위한 기존 방식 처리
        if (quotePost.quote && quotePost.pageNumber) {
          return (
              <div className="border-l-4 border-purple-300 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-medium">
                    {quotePost.pageNumber}p
                  </span>
                </div>
                <blockquote className="text-gray-700 text-m leading-relaxed line-clamp-2">
                  "{quotePost.quote}"
                </blockquote>
              </div>
          );
        }

        return <p className="text-gray-500">문장 정보가 없습니다.</p>;
      default:
        return null;
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6 flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <img
            src={convertToHttps(user?.profileImage)}
            alt={user?.nickname || '사용자'}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => handleImageError(e)}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user?.nickname || '사용자'} 님의 기록
            </h1>
          </div>
        </div>
        <Link
          to="/profile"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{ textDecoration: 'none' }}
        >
          프로필 설정
        </Link>
      </div>

      {/* 현재 읽고 있는 책 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">현재 읽고 있는 책</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentlyReading.map((book) => (
            <div 
              key={book.id} 
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleItemClick(book)}
            >
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
          {currentlyReading.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              현재 읽고 있는 책이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 전체 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 통계</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BookOpenIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-gray-600">완독한 책</span>
              </div>
              <span className="font-semibold text-lg">{completedBooksCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BookOpenIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-gray-600">읽고 있는 책</span>
              </div>
              <span className="font-semibold text-lg">{currentlyReadingCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <HeartIcon className="w-4 h-4 text-pink-600 mr-2" />
                <span className="text-gray-600">위시리스트</span>
              </div>
              <span className="font-semibold text-lg">{wishlistCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-gray-600">읽다 만 책</span>
              </div>
              <span className="font-semibold text-lg">{droppedBooksCount}</span>
            </div>
          </div>
        </div>

        {/* 이번 달 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">이번 달 통계</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BookOpenIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-gray-600">완독한 책</span>
              </div>
              <span className="font-semibold text-lg">{thisMonthCompletedCount}</span>
            </div>
          </div>
        </div>

        {/* 게시글 통계 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">게시글 통계</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-gray-600">총 게시글</span>
              </div>
              <span className="font-semibold text-lg">{postCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-gray-600">이번 달 게시글</span>
              </div>
              <span className="font-semibold text-lg">{thisMonthPostsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      {!posts || posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">게시글이 없습니다.</div>
            <Link
                to="/posts/create"
                className="text-blue-600 hover:text-blue-800"
            >
              첫 번째 게시글을 작성해보세요!
            </Link>
          </div>
      ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {posts && posts.map((post) => (
                <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
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
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{commentCounts[post.id] || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                  <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {page + 1}
                  </button>
              ))}

              <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
      )}

      {/* 책 모달 */}
      <BookModal
        selectedItem={selectedItem}
        showModal={showModal}
        onClose={closeModal}
        onDelete={handleDelete}
        onStartReading={handleStartReading}
        onMarkAsRead={handleMarkAsRead}
        onDropBook={handleDropBook}
        onResumeReading={handleResumeReading}
      />
    </div>
  );
};

export default MyPosts; 