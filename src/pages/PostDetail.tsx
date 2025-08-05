import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Post, 
  PostType, 
  ReviewPost, 
  RecommendationPost, 
  QuotePost,
  RecommendationType 
} from '../types/post';
import { postsApi } from '../api/posts';
import { wishlistApi } from '../api/wishlists';
import { useAuth } from '../contexts/AuthContext';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
    }
  }, [id]);

  const fetchPost = async (id: number) => {
    setLoading(true);
    try {
      const response = await postsApi.getPost(id);
      setPost(response.data);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러올 수 없습니다.');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await postsApi.deletePost(post.id);
      alert('게시글이 삭제되었습니다.');
      navigate('/posts');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
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

  const handleAddToWishlist = async () => {
    if (!post?.bookInfo) {
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
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {reviewPost.title}
            </h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {reviewPost.content}
              </div>
            </div>
          </div>
        );

      case PostType.RECOMMENDATION:
        const recommendationPost = post as RecommendationPost;
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                recommendationPost.recommendationType === RecommendationType.RECOMMEND
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {recommendationPost.recommendationType === RecommendationType.RECOMMEND ? '추천' : '비추천'}
              </span>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {recommendationPost.reason}
              </div>
            </div>
          </div>
        );

      case PostType.QUOTE:
        const quotePost = post as QuotePost;
        
        // 새로운 방식 (quotes 배열) 우선 처리
        if (quotePost.quotes && quotePost.quotes.length > 0) {
          return (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {quotePost.bookInfo?.title || '문장 수집'}
              </h2>
              <div className="space-y-6">
                {quotePost.quotes.map((quote, index) => (
                  <div key={index} className="border-l-4 border-gray-300 pl-6 py-4 bg-gray-50 rounded-r-lg">
                    <div className="flex items-center mb-3">
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                        {quote.page}p
                      </span>
                    </div>
                    <blockquote className="text-l text-gray-800 leading-relaxed pr-4">
                      "{quote.text}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        // 하위 호환성을 위한 기존 방식 처리
        if (quotePost.quote && quotePost.pageNumber) {
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {quotePost.bookInfo?.title || '문장 수집'}
                </h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {quotePost.pageNumber}p
                </span>
              </div>
              <blockquote className="border-l-4 border-gray-300 pl-6 py-4 bg-gray-50 rounded-r-lg">
                <div className="text-lg text-gray-800 italic leading-relaxed">
                  "{quotePost.quote}"
                </div>
              </blockquote>
            </div>
          );
        }
        
        return <div className="text-gray-500">문장이 없습니다.</div>;

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">게시글을 불러오는 중... (postId: {id})</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">게시글을 찾을 수 없습니다.</div>
          <Link
            to="/posts"
            className="text-blue-600 hover:text-blue-800"
          >
            게시글 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.id === post.userId;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 목록으로 돌아가기 버튼 */}
      <div className="mb-4">
        <Link
          to="/posts"
          className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPostTypeColor(post.postType)}`}>
                {getPostTypeLabel(post.postType)}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </span>
              {post.createdAt !== post.updatedAt && (
                <span className="text-sm text-gray-400">
                  (수정됨)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="flex space-x-6">
            {/* 책 정보 */}
            {post.bookInfo && (
                <div className="w-36 flex-shrink-0">
                  <img
                      src={post.bookInfo.cover}
                      alt={post.bookInfo.title}
                      className="w-full h-44 object-cover rounded shadow-lg"
                  />
                  <div className="mt-4 text-left break-words">
                    <h3 className="font-medium text-gray-900 text-sm leading-snug">
                      {post.bookInfo.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {post.bookInfo.author}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {post.bookInfo.publisher}
                    </p>
                    <button
                        onClick={handleAddToWishlist}
                        className="mt-3 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors"
                    >
                      읽고 싶은 책 추가
                    </button>
                  </div>
                </div>
            )}

            {/* 게시글 내용 */}
            <div className="flex-1 min-w-0">
              {renderPostContent(post)}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {post.userProfileImage && (
                  <img
                      src={post.userProfileImage}
                      alt={post.userName}
                      className="w-8 h-8 rounded-full"
                  />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {post.userName}
                </div>
                <div className="text-xs text-gray-500">
                  작성자
                </div>
              </div>
            </div>

            {/* 수정/삭제 버튼 */}
            {isAuthor && (
              <div className="flex space-x-2">
                <Link
                  to={`/posts/${post.id}/edit`}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
