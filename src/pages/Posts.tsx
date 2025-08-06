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
import { useAuth } from '../contexts/AuthContext';
import { convertToHttps, handleImageError } from '../utils/imageUtils';

const Posts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<PostType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [commentCounts, setCommentCounts] = useState<{ [postId: number]: number }>({});

  // 검색 관련 상태
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'bookTitle' | 'keyword'>('bookTitle');

  const fetchPosts = useCallback(async () => {
    console.log('fetchPosts 시작, filters:', { selectedType, currentPage });
    setLoading(true);
    try {
      const filters = {
        ...(selectedType !== 'ALL' && { postType: selectedType as PostType }),
        page: currentPage,
        size: 10
      };

      console.log('API 호출 전, filters:', filters);
      const response = await postsApi.getAllPosts(filters);
      console.log('API 응답 전체:', response);
      console.log('posts 데이터:', response.data?.posts);
      console.log('totalPages:', response.data?.totalPages);

      const postsData = response.data?.posts || [];
      setPosts(postsData);
      setTotalPages(response.data?.totalPages || 1);
      
      // 댓글 개수 조회
      const commentCountPromises = postsData.map(async (post: Post) => {
        try {
          const commentResponse = await commentApi.getComments(post.id, 0, 1);
          return { postId: post.id, count: commentResponse.data?.totalComments || 0 };
        } catch (error) {
          console.error(`댓글 개수 조회 실패 (postId: ${post.id}):`, error);
          return { postId: post.id, count: 0 };
        }
      });
      
      const commentCountsData = await Promise.all(commentCountPromises);
      const countsMap: { [postId: number]: number } = {};
      commentCountsData.forEach(({ postId, count }) => {
        countsMap[postId] = count;
      });
      setCommentCounts(countsMap);
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      setPosts([]); // 에러 시 빈 배열로 설정
      setTotalPages(1);
      setCommentCounts({});
    } finally {
      setLoading(false);
    }
  }, [selectedType, currentPage]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      // 검색어가 비어있으면 검색 모드 해제하고 일반 게시글 조회
      setSearchMode(false);
      return;
    }

    setLoading(true);
    try {
      const searchParams = {
        ...(searchType === 'bookTitle' ? { bookTitle: searchQuery.trim() } : { keyword: searchQuery.trim() }),
        ...(selectedType !== 'ALL' && { postType: selectedType as PostType }),
        page: currentPage,
        size: 10
      };

      const response = await postsApi.searchPosts(searchParams);
      const postsData = response.data?.content || [];
      setPosts(postsData);
      setTotalPages(response.data?.totalPages || 1);
      
      // 댓글 개수 조회
      const commentCountPromises = postsData.map(async (post: Post) => {
        try {
          const commentResponse = await commentApi.getComments(post.id, 0, 1);
          return { postId: post.id, count: commentResponse.data?.totalComments || 0 };
        } catch (error) {
          console.error(`댓글 개수 조회 실패 (postId: ${post.id}):`, error);
          return { postId: post.id, count: 0 };
        }
      });
      
      const commentCountsData = await Promise.all(commentCountPromises);
      const countsMap: { [postId: number]: number } = {};
      commentCountsData.forEach(({ postId, count }) => {
        countsMap[postId] = count;
      });
      setCommentCounts(countsMap);
    } catch (error) {
      console.error('게시글 검색 실패:', error);
      setPosts([]);
      setTotalPages(1);
      setCommentCounts({});
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType, selectedType, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);

    // 검색어가 비어있으면 검색 모드 해제하고 전체 게시글 조회
    if (!searchQuery.trim()) {
      setSearchMode(false);
      return;
    }

    setSearchMode(true);
    handleSearch();
  };

  // 검색어 입력 핸들러 추가
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // 검색어가 비어있으면 검색 모드 해제
    if (!value.trim()) {
      setSearchMode(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchMode(false);
    setCurrentPage(0);
  };

  // useEffect 수정 - 순환 참조 방지
  useEffect(() => {
    if (searchMode && searchQuery.trim()) {
      handleSearch();
    } else if (!searchMode) {
      fetchPosts();
    }
  }, [searchMode, selectedType, currentPage]); // handleSearch 제거하여 순환 참조 방지

  // 타입 필터 변경 시 페이지 리셋 및 데이터 다시 불러오기
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
      // 중복 체크
      const duplicateCheck = await wishlistApi.checkDuplicate(
          post.bookInfo.title,
          post.bookInfo.author || undefined
      );

      if (duplicateCheck.data.data.duplicate) {
        alert('이미 읽고 싶은 책에 추가된 책입니다.');
        return;
      }

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
      alert('읽고 싶은 책 추가에 실패했습니다. 다시 시도해주세요.');
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
              <h3 className="font-semibold text-l text-gray-900 mb-2">
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
                <div className="mb-1">
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

        return <div className="text-gray-500 text-sm">문장이 없습니다.</div>;

      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    console.log('로딩 중...');
    return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">게시글을 불러오는 중...</div>
          </div>
        </div>
    );
  }

  console.log('렌더링 시점 - posts:', posts, 'posts.length:', posts?.length);

  return (
      <div className="max-w-6xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">게시글</h1>
          <Link
              to="/posts/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            게시글 작성
          </Link>
        </div>

        {/* 검색 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 타입 선택 */}
              <div className="flex-shrink-0">
                <div className="relative inline-block">
                  <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as 'bookTitle' | 'keyword')}
                      className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="bookTitle">책 제목</option>
                  </select>
                </div>
              </div>

              {/* 검색 입력 */}
              <div className="flex-1">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder={searchType === 'bookTitle' ? '책 제목을 입력하세요' : '제목, 내용, 책 제목에서 검색'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 검색 버튼 */}
              <div className="flex gap-2">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-shrink-0"
                >
                  검색
                </button>
                {searchMode && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex-shrink-0"
                    >
                      초기화
                    </button>
                )}
              </div>
            </div>

            {/* 검색 결과 표시 */}
            {searchMode && (
                <div className="text-sm text-gray-600">
              <span className="font-medium">
                {searchType === 'bookTitle' ? '책 제목' : '전체'} 검색: "{searchQuery}"
              </span>
                  {selectedType !== 'ALL' && (
                      <span className="ml-2">
                  • 타입: {getPostTypeLabel(selectedType as PostType)}
                </span>
                  )}
                </div>
            )}
          </form>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
                onClick={() => handleTypeChange('ALL')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedType === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              전체
            </button>
            <button
                onClick={() => handleTypeChange(PostType.REVIEW)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedType === PostType.REVIEW
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              독후감
            </button>
            <button
                onClick={() => handleTypeChange(PostType.RECOMMENDATION)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedType === PostType.RECOMMENDATION
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              추천/비추천
            </button>
            <button
                onClick={() => handleTypeChange(PostType.QUOTE)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedType === PostType.QUOTE
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              문장 수집
            </button>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts && posts.map((post) => (
                  <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden h-48 border border-gray-300"
                  >
                    <div className="flex h-full">
                      {/* 왼쪽: 책 정보 (연한 회색 배경) */}
                      <div className="bg-gray-50 p-4 flex-shrink-0 w-48 h-full">
                        <div className="flex items-start space-x-3 h-full">
                          {/* 책 표지 */}
                          {post.bookInfo && (
                              <img
                                  src={post.bookInfo.cover}
                                  alt={post.bookInfo.title}
                                  className="w-16 h-20 object-cover rounded shadow-sm flex-shrink-0"
                              />
                          )}

                          {/* 책 정보 */}
                          {post.bookInfo && (
                              <div className="flex-1 min-w-0 flex flex-col justify-between h-full max-w-[120px]">
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                                    {post.bookInfo.title}
                                  </h3>
                                  <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                                    {post.bookInfo.author}
                                  </p>
                                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                    {post.bookInfo.publisher}
                                  </p>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddToWishlist(post);
                                      }}
                                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors whitespace-nowrap"
                                  >
                                    읽고 싶은 책 추가
                                  </button>
                                </div>
                              </div>
                          )}
                        </div>
                      </div>

                      {/* 오른쪽: 게시글 정보 */}
                      <div className="flex-1 p-4 flex flex-col h-full">
                        {/* 상단: 게시글 타입과 공개 설정 */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {post.postType === PostType.RECOMMENDATION ? (
                                // 추천/비추천 게시글의 경우 추천/비추천 여부를 표시
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    (post as RecommendationPost).recommendationType === RecommendationType.RECOMMEND
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                          {(post as RecommendationPost).recommendationType === RecommendationType.RECOMMEND ? '추천' : '비추천'}
                        </span>
                            ) : (
                                // 다른 게시글 타입의 경우 기존 태그 표시
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.postType)}`}>
                          {getPostTypeLabel(post.postType)}
                        </span>
                            )}
                            {post.visibility === PostVisibility.PRIVATE && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          비공개
                        </span>
                            )}

                          </div>
                          
                          {/* 댓글 개수 표시 */}
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{commentCounts[post.id] || 0}</span>
                          </div>
                        </div>

                        {/* 중간: 게시글 내용 */}
                        <div className="flex-1 mb-3 overflow-hidden">
                          <div className="text-sm text-gray-700 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {renderPostContent(post)}
                          </div>
                        </div>

                        {/* 하단: 작성자 정보와 작성일 */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-auto">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/users/${post.userId}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            >
                              {post.userProfileImage && (
                                  <img
                                      src={convertToHttps(post.userProfileImage)}
                                      alt={post.userName}
                                      className="w-5 h-5 rounded-full cursor-pointer"
                                      onError={(e) => handleImageError(e)}
                                  />
                              )}
                              <span className="text-xs text-gray-600 cursor-pointer">
                                {post.userName}
                              </span>
                            </Link>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(post.createdAt)}
                          </div>
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
      </div>
  );
};

export default Posts;