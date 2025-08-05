import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  ArrowLeftIcon, 
  PlusIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Loading from '../components/common/Loading';

// BookReview 타입 정의 (meeting.ts에서 이동)
interface BookReview {
  id: number;
  user: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  monthlyBook: {
    id: number;
    bookTitle: string;
    bookAuthor: string;
    bookCoverImage?: string;
  };
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  status: 'DRAFT' | 'PUBLISHED';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateReviewRequest {
  monthlyBookId: number;
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  isPublic: boolean;
  status: 'DRAFT' | 'PUBLISHED';
}

const BookReviews: React.FC = () => {
  const { groupId, monthlyBookId } = useParams<{ groupId: string; monthlyBookId: string }>();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [myReview, setMyReview] = useState<BookReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateReviewRequest>({
    monthlyBookId: Number(monthlyBookId),
    rating: 5,
    title: '',
    content: '',
    favoriteQuote: '',
    recommendation: '',
    isPublic: true,
    status: 'PUBLISHED'
  });
  const [saving, setSaving] = useState(false);

  // 임시 월간 도서 정보
  const monthlyBook = {
    id: Number(monthlyBookId),
    bookTitle: '클린 코드',
    bookAuthor: '로버트 C. 마틴',
    bookCoverImage: 'https://example.com/book1.jpg',
    yearMonth: '2025년 8월'
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // 임시 리뷰 데이터
        const mockReviews: BookReview[] = [
        {
          id: 1,
          user: {
            id: 2,
            nickname: '독서광',
            profileImage: undefined
          },
          monthlyBook: {
            id: Number(monthlyBookId),
            bookTitle: '클린 코드',
            bookAuthor: '로버트 C. 마틴',
            bookCoverImage: 'https://example.com/book1.jpg'
          },
          rating: 5,
          title: '개발자라면 꼭 읽어야 할 책',
          content: '이 책은 정말 훌륭합니다. 코드를 작성하는 방법에 대해 많은 것을 배웠습니다. 특히 함수를 작게 만들고, 의미 있는 이름을 사용하는 것의 중요성을 깨달았습니다.',
          favoriteQuote: '깨끗한 코드는 한 가지를 제대로 한다.',
          recommendation: '모든 개발자에게 추천합니다. 경험이 적은 개발자일수록 더욱 도움이 될 것 같습니다.',
          status: 'PUBLISHED',
          isPublic: true,
          createdAt: '2025-08-01T10:30:00',
          updatedAt: '2025-08-01T10:30:00'
        },
        {
          id: 2,
          user: {
            id: 3,
            nickname: '북러버'
          },
          monthlyBook: {
            id: Number(monthlyBookId),
            bookTitle: '클린 코드',
            bookAuthor: '로버트 C. 마틴',
            bookCoverImage: 'https://example.com/book1.jpg'
          },
          rating: 4,
          title: '실용적인 조언들이 가득한 책',
          content: '실무에서 바로 적용할 수 있는 내용들이 많아서 좋았습니다. 다만 일부 내용은 조금 이상적인 면이 있어서 현실적으로 적용하기 어려운 부분도 있었습니다.',
          favoriteQuote: '나쁜 코드는 나쁜 코드를 유혹한다.',
          recommendation: '개발 경험이 어느 정도 있는 분들에게 추천합니다.',
          status: 'PUBLISHED',
          isPublic: true,
          createdAt: '2025-08-01T15:20:00',
          updatedAt: '2025-08-01T15:20:00'
        }
      ];
      
      setReviews(mockReviews);
      
      // 내 리뷰 확인 (현재 사용자 ID가 1이라고 가정)
      const currentUserReview = mockReviews.find(review => review.user.id === 1);
      setMyReview(currentUserReview || null);
      
    } catch (error) {
      console.error('리뷰를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

    if (monthlyBookId) {
      fetchReviews();
    }
  }, [monthlyBookId]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('리뷰 제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      // TODO: 실제 API 호출
      console.log('리뷰 작성:', formData);
      
      alert('리뷰가 성공적으로 작성되었습니다!');
      setShowCreateForm(false);
      setFormData({
        monthlyBookId: Number(monthlyBookId),
        rating: 5,
        title: '',
        content: '',
        favoriteQuote: '',
        recommendation: '',
        isPublic: true,
        status: 'PUBLISHED'
      });
      // fetchReviews(); // TODO: 리뷰 목록 새로고침 로직 추가
    } catch (error) {
      console.error('리뷰 작성에 실패했습니다:', error);
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Loading size="lg" text="리뷰를 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(`/reading-groups/${groupId}`)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600 mr-3" />
              독서 리뷰
            </h1>
            <p className="text-gray-600 mt-1">{monthlyBook.yearMonth} - {monthlyBook.bookTitle}</p>
          </div>
        </div>

        {/* 책 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start space-x-4">
            {monthlyBook.bookCoverImage ? (
              <img
                src={monthlyBook.bookCoverImage}
                alt={monthlyBook.bookTitle}
                className="w-20 h-28 object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                <BookOpenIcon className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {monthlyBook.bookTitle}
              </h2>
              <p className="text-gray-600 mb-3">{monthlyBook.bookAuthor}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    평균 별점: ⭐ 4.5 (2개 리뷰)
                  </div>
                </div>
                
                {!myReview && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    리뷰 작성
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 내 리뷰 */}
        {myReview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">내 리뷰</h3>
              <div className="flex space-x-2">
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  수정
                </button>
                <button className="text-sm text-red-600 hover:text-red-700">
                  삭제
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {renderStars(myReview.rating)}
              <h4 className="font-medium text-gray-900">{myReview.title}</h4>
              <p className="text-gray-700">{myReview.content}</p>
              
              {myReview.favoriteQuote && (
                <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600">
                  "{myReview.favoriteQuote}"
                </blockquote>
              )}
              
              {myReview.recommendation && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">추천 이유</h5>
                  <p className="text-gray-700">{myReview.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 리뷰 작성 폼 */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">리뷰 작성</h2>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  별점 *
                </label>
                {renderStars(formData.rating, true, (rating) => 
                  setFormData(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  리뷰 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="리뷰 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  리뷰 내용 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  placeholder="책에 대한 솔직한 감상을 작성해주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인상 깊은 구절
                </label>
                <textarea
                  value={formData.favoriteQuote}
                  onChange={(e) => setFormData(prev => ({ ...prev, favoriteQuote: e.target.value }))}
                  rows={3}
                  placeholder="기억에 남는 구절이 있다면 적어주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추천 이유
                </label>
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
                  rows={3}
                  placeholder="다른 사람들에게 이 책을 추천하는 이유를 적어주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  다른 멤버들에게 공개
                </label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? '작성 중...' : '리뷰 작성'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 다른 멤버들의 리뷰 */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            멤버 리뷰 ({reviews.length}개)
          </h3>
          
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 작성된 리뷰가 없습니다
              </h3>
              <p className="text-gray-500">
                첫 번째 리뷰를 작성해보세요!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {review.user.profileImage ? (
                      <img
                        src={review.user.profileImage}
                        alt={review.user.nickname}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {review.user.nickname.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.user.nickname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {renderStars(review.rating)}
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {review.title}
                </h4>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {review.content}
                </p>
                
                {review.favoriteQuote && (
                  <blockquote className="border-l-4 border-primary-400 pl-4 mb-4 italic text-gray-600">
                    <HeartIcon className="w-4 h-4 inline mr-2 text-red-400" />
                    "{review.favoriteQuote}"
                  </blockquote>
                )}
                
                {review.recommendation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">💡 추천 이유</h5>
                    <p className="text-gray-700">{review.recommendation}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookReviews;
