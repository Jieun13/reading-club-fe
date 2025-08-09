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
import { postsApi, commentApi } from '../api/posts';
import { wishlistApi } from '../api/wishlists';
import { useAuth } from '../contexts/AuthContext';
import { convertToHttps, handleImageError } from '../utils/imageUtils';
import { Comment, CommentCreateRequest } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
      fetchComments(parseInt(id));
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

  const fetchComments = async (postId: number) => {
    try {
      const response = await commentApi.getComments(postId);
      setComments(response.data?.comments?.content || []);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      setComments([]);
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

  // 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post) return;

    try {
      await commentApi.createComment(post.id, { content: commentContent.trim() });
      setCommentContent('');
      fetchComments(post.id);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 대댓글 작성
  const handleReplySubmit = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim() || !post) return;

    try {
      await commentApi.createComment(post.id, { content: replyContent.trim(), parentId });
      setReplyContent('');
      setShowReplyForm(null);
      fetchComments(post.id);
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
      alert('대댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentApi.deleteComment(commentId);
      fetchComments(post!.id);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 대댓글 폼 토글
  const toggleReplyForm = (commentId: number) => {
    if (showReplyForm === commentId) {
      setShowReplyForm(null);
      setReplyContent('');
    } else {
      setShowReplyForm(commentId);
      setReplyContent('');
    }
  };

  const renderPostContent = (post: Post) => {
    switch (post.postType) {
      case PostType.REVIEW:
        const reviewPost = post as ReviewPost;
        return (
          <div className="space-y-4">
            <h2 className="text-l font-bold text-gray-900">
              {reviewPost.title}
            </h2>
            <div className="prose max-w-none">
              <div className="text-m whitespace-pre-wrap text-gray-700 leading-relaxed">
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
              <div className="text-m whitespace-pre-wrap text-gray-700 leading-relaxed">
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
              <h2 className="text-sm font-bold text-gray-900">
                수집한 문장들
              </h2>
              <div className="space-y-6">
                {quotePost.quotes.map((quote, index) => (
                  <div key={index} className="border-l-4 border-gray-300 pl-6 py-4 bg-gray-50 rounded-r-lg">
                    <div className="flex items-center mb-3">
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                        {quote.page}p
                      </span>
                    </div>
                    <blockquote className="text-sm text-gray-800 leading-relaxed pr-4">
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
                <h2 className="text-xl font-bold text-gray-900">
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

  // 댓글 렌더링
  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const commentDate = formatDate(comment.createdAt);
    
    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <Link
                to={`/users/${comment.user.id}`}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                {comment.user.profileImage && (
                  <img
                    src={convertToHttps(comment.user.profileImage)}
                    alt={comment.user.nickname}
                    className="w-6 h-6 rounded-full cursor-pointer"
                    onError={(e) => handleImageError(e)}
                  />
                )}
                <span className="text-sm font-medium text-gray-900 cursor-pointer">
                  {comment.user.nickname}
                </span>
              </Link>
              <span className="text-xs text-gray-500">
                {commentDate}
              </span>
            </div>
            
            {comment.canDelete && (
              <button
                onClick={() => handleCommentDelete(comment.id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-700">
            {comment.isDeleted ? (
              <span className="text-gray-500 italic">삭제된 댓글입니다.</span>
            ) : (
              comment.content
            )}
          </div>
          
          {!comment.isDeleted && !isReply && (
            <div className="mt-2">
              <button
                onClick={() => toggleReplyForm(comment.id)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                답글 달기
              </button>
            </div>
          )}
        </div>
        
        {/* 대댓글들 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
        
        {/* 대댓글 폼 */}
        {showReplyForm === comment.id && (
          <div className="ml-8 mb-3">
            <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="대댓글을 입력하세요..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  작성
                </button>
                <button
                  type="button"
                  onClick={() => toggleReplyForm(comment.id)}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
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
          {/* 책 정보 - 모바일에서는 상단에, 데스크톱에서는 왼쪽에 */}
          {post.bookInfo && (
            <div className="lg:hidden mb-6">
              {/* 모바일용 책 정보 레이아웃 */}
              <div className="flex items-start space-x-4">
                <img
                  src={post.bookInfo.cover}
                  alt={post.bookInfo.title}
                  className="w-20 h-28 object-cover rounded shadow-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-sm text-gray-900 text-base leading-snug">
                    {post.bookInfo.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {post.bookInfo.author}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {post.bookInfo.publisher}
                  </p>
                  <button
                    onClick={handleAddToWishlist}
                    className="mt-3 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200 transition-colors"
                  >
                    읽고 싶은 책 추가
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:space-x-6">
            {/* 책 정보 - 데스크톱용 (왼쪽) */}
            {post.bookInfo && (
              <div className="hidden lg:block w-36 flex-shrink-0">
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
            <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-4">
              {renderPostContent(post)}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                to={`/users/${post.userId}`}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                {post.userProfileImage && (
                    <img
                        src={convertToHttps(post.userProfileImage)}
                        alt={post.userName}
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onError={(e) => handleImageError(e)}
                    />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900 cursor-pointer">
                    {post.userName}
                  </div>
                  <div className="text-xs text-gray-500">
                    작성자
                  </div>
                </div>
              </Link>
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

      {/* 댓글 섹션 */}
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            댓글 ({comments.length}개)
          </h3>
        </div>

        {/* 댓글 목록 */}
        <div className="px-6 py-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => renderComment(comment))}
            </div>
          )}
        </div>

        {/* 댓글 작성 폼 */}
        <div className="px-6 py-4 border-t border-gray-200">
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentContent.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                댓글 작성
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
