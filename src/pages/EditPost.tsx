import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PostType, 
  RecommendationType, 
  PostVisibility, 
  Post,
  ReviewPost,
  RecommendationPost,
  QuotePost,
  Quote
} from '../types/post';
import { postsApi } from '../api/posts';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  
  // 독후감 필드
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  
  // 추천/비추천 필드
  const [recommendationType, setRecommendationType] = useState<RecommendationType>(RecommendationType.RECOMMEND);
  const [recommendationReason, setRecommendationReason] = useState('');
  
  // 문장 수집 필드
  const [quotes, setQuotes] = useState<Quote[]>([{ page: '1', text: '' }]);
  
  // 하위 호환성을 위한 기존 필드들
  const [quote, setQuote] = useState('');
  const [pageNumber, setPageNumber] = useState<number>(1);

  // 문장 수집 관련 함수들
  const addQuote = () => {
    setQuotes([...quotes, { page: '1', text: '' }]);
  };

  const removeQuote = (index: number) => {
    if (quotes.length > 1) {
      setQuotes(quotes.filter((_, i) => i !== index));
    }
  };

  const updateQuote = (index: number, field: 'page' | 'text', value: string | number) => {
    const updatedQuotes = quotes.map((quote, i) => 
      i === index ? { ...quote, [field]: value } : quote
    );
    setQuotes(updatedQuotes);
  };

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
    }
  }, [id]);

  const fetchPost = async (id: number) => {
    setLoading(true);
    try {
      const response = await postsApi.getPost(id);
      const postData = response.data;
      setPost(postData);
      setVisibility(postData.visibility);
      
      // 게시글 타입에 따라 필드 설정
      switch (postData.postType) {
        case PostType.REVIEW:
          const reviewPost = postData as ReviewPost;
          setReviewTitle(reviewPost.title || '');
          setReviewContent(reviewPost.content || '');
          break;
        case PostType.RECOMMENDATION:
          const recommendationPost = postData as RecommendationPost;
          setRecommendationType(recommendationPost.recommendationType);
          setRecommendationReason(recommendationPost.reason || '');
          break;
        case PostType.QUOTE:
          const quotePost = postData as QuotePost;
          
          // 새로운 방식 (quotes 배열) 우선 처리
          if (quotePost.quotes && quotePost.quotes.length > 0) {
            // 페이지를 문자열로 변환
            const quotesWithStringPage = quotePost.quotes.map(q => ({
              ...q,
              page: String(q.page)
            }));
            setQuotes(quotesWithStringPage);
          } else if (quotePost.quote && quotePost.pageNumber) {
            // 하위 호환성을 위한 기존 방식 처리
            setQuotes([{ page: String(quotePost.pageNumber), text: quotePost.quote }]);
            setQuote(quotePost.quote);
            setPageNumber(quotePost.pageNumber);
          }
          break;
      }
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러올 수 없습니다.');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post) return;

    // 각 타입별 유효성 검사
    if (post.postType === PostType.REVIEW) {
      if (!reviewTitle.trim() || !reviewContent.trim()) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
      }
    } else if (post.postType === PostType.RECOMMENDATION) {
      if (!recommendationReason.trim()) {
        alert('추천/비추천 이유를 입력해주세요.');
        return;
      }
    } else if (post.postType === PostType.QUOTE) {
      // 모든 문장이 유효한지 검사
      const hasValidQuotes = quotes.every(q => {
        const pageNum = typeof q.page === 'string' ? parseInt(q.page) : q.page;
        return q.text.trim() && !isNaN(pageNum) && pageNum > 0;
      });
      if (!hasValidQuotes) {
        alert('모든 문장과 페이지 번호를 올바르게 입력해주세요.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updateData: any = {
        visibility,
        ...(post.postType === PostType.REVIEW && {
          title: reviewTitle,
          content: reviewContent
        }),
        ...(post.postType === PostType.RECOMMENDATION && {
          recommendationType,
          reason: recommendationReason
        }),
        ...(post.postType === PostType.QUOTE && {
          quotes: quotes
            .filter(q => q.text.trim() && q.page)
            .map(q => ({
              ...q,
              page: typeof q.page === 'string' ? parseInt(q.page) || 1 : q.page
            }))
            .sort((a, b) => (a.page as number) - (b.page as number))
        })
      };

      await postsApi.updatePost(post.id, updateData);
      alert('게시글이 성공적으로 수정되었습니다.');
      navigate(`/posts/${post.id}`);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
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
        return '';
    }
  };

  const renderPostTypeForm = () => {
    if (!post) return null;

    switch (post.postType) {
      case PostType.REVIEW:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="독후감 제목을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="독후감 내용을 입력하세요"
              />
            </div>
          </div>
        );

      case PostType.RECOMMENDATION:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추천 여부
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={RecommendationType.RECOMMEND}
                    checked={recommendationType === RecommendationType.RECOMMEND}
                    onChange={(e) => setRecommendationType(e.target.value as RecommendationType)}
                    className="mr-2"
                  />
                  추천
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={RecommendationType.NOT_RECOMMEND}
                    checked={recommendationType === RecommendationType.NOT_RECOMMEND}
                    onChange={(e) => setRecommendationType(e.target.value as RecommendationType)}
                    className="mr-2"
                  />
                  비추천
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이유
              </label>
              <textarea
                value={recommendationReason}
                onChange={(e) => setRecommendationReason(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="추천/비추천 이유를 입력하세요"
              />
            </div>
          </div>
        );

      case PostType.QUOTE:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                문장 수집
              </label>
              <button
                type="button"
                onClick={addQuote}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                + 문장 추가
              </button>
            </div>
            
            {quotes.map((quoteItem, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">문장 {index + 1}</span>
                  {quotes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuote(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={quoteItem.page}
                    onChange={(e) => updateQuote(index, 'page', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="페이지"
                  />
                  <span className="text-sm text-gray-500">p :</span>
                  <textarea
                    value={quoteItem.text}
                    onChange={(e) => updateQuote(index, 'text', e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="인상 깊었던 문장을 입력하세요"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">게시글을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {getPostTypeLabel(post.postType)} 수정
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 공개 설정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              공개 설정
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={PostVisibility.PUBLIC}
                  checked={visibility === PostVisibility.PUBLIC}
                  onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                  className="mr-2"
                />
                공개
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={PostVisibility.PRIVATE}
                  checked={visibility === PostVisibility.PRIVATE}
                  onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                  className="mr-2"
                />
                비공개
              </label>
            </div>
          </div>

          {/* 책 정보 (읽기 전용) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              책 정보
            </label>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <img
                  src={post.bookInfo.cover}
                  alt={post.bookInfo.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{post.bookInfo.title}</h3>
                  <p className="text-sm text-gray-600">{post.bookInfo.author}</p>
                  <p className="text-xs text-gray-500">{post.bookInfo.publisher}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 게시글 타입별 폼 */}
          {renderPostTypeForm()}

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/posts/${post.id}`)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '수정 중...' : '게시글 수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
