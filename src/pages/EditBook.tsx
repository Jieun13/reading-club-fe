import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { bookApi } from '../api/book';
import { Book, BookUpdateRequest } from '../types/book';
import Loading from '../components/common/Loading';

const EditBook: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverImage: '',
    rating: 5,
    review: '',
    finishedDate: ''
  });

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const response = await bookApi.getBook(Number(id));
        const bookData = response.data;
        setBook(bookData);
        setFormData({
          title: bookData.title,
          author: bookData.author || '',
          coverImage: bookData.coverImage || '',
          rating: bookData.rating,
          review: bookData.review || '',
          finishedDate: bookData.finishedDate
        });
      } catch (error) {
        console.error('책 정보 로드 실패:', error);
        alert('책 정보를 불러오는데 실패했습니다.');
        navigate('/library');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBook();
    }
  }, [id, navigate]);

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      
      const updateData: BookUpdateRequest = {
        title: formData.title,
        author: formData.author,
        coverImage: formData.coverImage,
        rating: formData.rating,
        review: formData.review,
        finishedDate: formData.finishedDate
      };

      await bookApi.updateBook(Number(id), updateData);
      alert('책 정보가 성공적으로 수정되었습니다!');
      navigate('/library');
    } catch (error) {
      console.error('책 수정에 실패했습니다:', error);
      alert('책 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (currentRating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleRatingClick(i + 1)}
        className="focus:outline-none"
      >
        {i < currentRating ? (
          <StarIconSolid className="w-6 h-6 text-yellow-400 hover:text-yellow-500" />
        ) : (
          <StarIcon className="w-6 h-6 text-gray-300 hover:text-yellow-400" />
        )}
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Loading size="lg" text="책 정보를 불러오는 중..." />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">책을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">책 정보 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 책 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">책 정보</h2>
            
            <div className="flex items-start space-x-4 mb-6">
              {formData.coverImage ? (
                <img
                  src={formData.coverImage}
                  alt={formData.title}
                  className="w-20 h-28 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="flex-1 space-y-4">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    책 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 저자 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    저자
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 표지 이미지 URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표지 이미지 URL
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/book-cover.jpg"
              />
            </div>
          </div>

          {/* 독서 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">독서 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* 완독일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  완독일 *
                </label>
                <input
                  type="date"
                  value={formData.finishedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, finishedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 별점 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  별점 *
                </label>
                <div className="flex items-center space-x-1">
                  {renderStars(formData.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {formData.rating}점
                  </span>
                </div>
              </div>

              {/* 빈 공간 (xl 화면에서 3열 맞춤용) */}
              <div className="hidden xl:block"></div>

              {/* 리뷰 - xl 화면에서는 전체 너비 */}
              <div className="md:col-span-2 xl:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  리뷰
                </label>
                <textarea
                  value={formData.review}
                  onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                  rows={4}
                  placeholder="이 책에 대한 생각을 자유롭게 적어보세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
