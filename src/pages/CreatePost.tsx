import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PostType, 
  RecommendationType, 
  PostVisibility, 
  BookInfo, 
  CreatePostRequest,
  Quote
} from '../types/post';
import { postsApi } from '../api/posts';
import { bookApi } from '../api/books';
import { BookSearchResult } from '../types/book';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPostType, setSelectedPostType] = useState<PostType>(PostType.REVIEW);
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.PUBLIC);
  
  // 책 검색 관련
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 책 검색
  const handleBookSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await bookApi.searchBooks(searchQuery);
      setSearchResults(results.data.data);
    } catch (error) {
      console.error('책 검색 실패:', error);
      alert('책 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 책 선택
  const handleBookSelect = (book: BookSearchResult) => {
    setSelectedBook({
      isbn: book.isbn || '',
      title: book.title,
      author: book.author || '',
      publisher: book.publisher || '',
      cover: book.cover || '',
      pubDate: book.pubDate || '',
      description: book.description
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // 게시글 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBook) {
      alert('책을 선택해주세요.');
      return;
    }

    // 각 타입별 유효성 검사
    if (selectedPostType === PostType.REVIEW) {
      if (!reviewTitle.trim() || !reviewContent.trim()) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
      }
    } else if (selectedPostType === PostType.RECOMMENDATION) {
      if (!recommendationReason.trim()) {
        alert('추천/비추천 이유를 입력해주세요.');
        return;
      }
    } else if (selectedPostType === PostType.QUOTE) {
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
      const postData: CreatePostRequest = {
        bookInfo: selectedBook,
        postType: selectedPostType,
        visibility,
        ...(selectedPostType === PostType.REVIEW && {
          title: reviewTitle,
          content: reviewContent
        }),
        ...(selectedPostType === PostType.RECOMMENDATION && {
          recommendationType,
          reason: recommendationReason
        }),
        ...(selectedPostType === PostType.QUOTE && {
          quotes: quotes
            .filter(q => q.text.trim() && q.page)
            .map(q => ({
              ...q,
              page: typeof q.page === 'string' ? parseInt(q.page) || 1 : q.page
            }))
            .sort((a, b) => (a.page as number) - (b.page as number))
        })
      };

      await postsApi.createPost(postData);
      alert('게시글이 성공적으로 작성되었습니다.');
      navigate('/posts');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostTypeForm = () => {
    switch (selectedPostType) {
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">게시글 작성</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 게시글 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              게시글 타입
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={PostType.REVIEW}
                  checked={selectedPostType === PostType.REVIEW}
                  onChange={(e) => setSelectedPostType(e.target.value as PostType)}
                  className="mr-2"
                />
                독후감
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={PostType.RECOMMENDATION}
                  checked={selectedPostType === PostType.RECOMMENDATION}
                  onChange={(e) => setSelectedPostType(e.target.value as PostType)}
                  className="mr-2"
                />
                추천/비추천
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={PostType.QUOTE}
                  checked={selectedPostType === PostType.QUOTE}
                  onChange={(e) => setSelectedPostType(e.target.value as PostType)}
                  className="mr-2"
                />
                문장 수집
              </label>
            </div>
          </div>

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

          {/* 책 검색 및 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              책 선택
            </label>
            {!selectedBook ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBookSearch()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="책 제목이나 저자를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={handleBookSearch}
                    disabled={isSearching}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSearching ? '검색 중...' : '검색'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                    {searchResults.map((book) => (
                      <div
                        key={book.isbn}
                        onClick={() => handleBookSelect(book)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{book.title}</h3>
                            <p className="text-sm text-gray-600">{book.author}</p>
                            <p className="text-xs text-gray-500">{book.publisher}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedBook.cover}
                    alt={selectedBook.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedBook.title}</h3>
                    <p className="text-sm text-gray-600">{selectedBook.author}</p>
                    <p className="text-xs text-gray-500">{selectedBook.publisher}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBook(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    변경
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 게시글 타입별 폼 */}
          {selectedBook && renderPostTypeForm()}

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedBook}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '작성 중...' : '게시글 작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
