import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { droppedBooksApi } from '../api/droppedBooks';
import { DroppedBook, DroppedBookUpdateRequest, ReadingType } from '../types/droppedBook';
import Loading from '../components/common/Loading';

const EditDroppedBook: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [droppedBook, setDroppedBook] = useState<DroppedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DroppedBookUpdateRequest>({
    title: '',
    author: '',
    isbn: '',
    coverImage: '',
    publisher: '',
    publishedDate: '',
    description: '',
    readingType: ReadingType.PAPER_BOOK,
    progressPercentage: 0,
    dropReason: '',
    startedDate: '',
    droppedDate: ''
  });

  useEffect(() => {
    const loadDroppedBook = async () => {
      try {
        setLoading(true);
        
        const response = await droppedBooksApi.getDroppedBook(Number(id));
        
        // API 응답이 ApiResponse 형태인지 확인
        let bookData: DroppedBook;
        
        // 타입 가드 함수
        const isApiResponse = (obj: any): obj is { data: DroppedBook } => {
          return obj && typeof obj === 'object' && 'data' in obj && obj.data;
        };
        
        if (isApiResponse(response)) {
          // ApiResponse 형태인 경우
          bookData = response.data;
        } else {
          // 직접 DroppedBook인 경우
          bookData = response as DroppedBook;
        }
        
        // 데이터 유효성 검사
        if (!bookData || !bookData.title) {
          throw new Error('유효하지 않은 책 데이터입니다.');
        }
        
        setDroppedBook(bookData);
        
        // 날짜 형식을 YYYY-MM-DD로 변환하는 함수
        const formatDateForInput = (dateString: string | undefined) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        const formDataToSet = {
          title: bookData.title,
          author: bookData.author || '',
          isbn: bookData.isbn || '',
          coverImage: bookData.coverImage || '',
          publisher: bookData.publisher || '',
          publishedDate: formatDateForInput(bookData.publishedDate),
          description: bookData.description || '',
          readingType: bookData.readingType,
          progressPercentage: bookData.progressPercentage || 0,
          dropReason: bookData.dropReason,
          startedDate: formatDateForInput(bookData.startedDate),
          droppedDate: formatDateForInput(bookData.droppedDate)
        };
        
        setFormData(formDataToSet);
        
      } catch (error) {
        console.error('읽다 만 책 정보 로드 실패:', error);
        alert('읽다 만 책 정보를 불러오는데 실패했습니다.');
        navigate('/library');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDroppedBook();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      alert('책 제목을 입력해주세요.');
      return;
    }

    if (!formData.dropReason?.trim()) {
      alert('중단 이유를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: DroppedBookUpdateRequest = {
        title: formData.title?.trim() || '',
        author: formData.author?.trim() || '',
        isbn: formData.isbn?.trim() || '',
        coverImage: formData.coverImage?.trim() || '',
        publisher: formData.publisher?.trim() || '',
        publishedDate: formData.publishedDate?.trim() || '',
        description: formData.description?.trim() || '',
        readingType: formData.readingType,
        progressPercentage: formData.progressPercentage,
        dropReason: formData.dropReason?.trim() || '',
        startedDate: formData.startedDate?.trim() || '',
        droppedDate: formData.droppedDate?.trim() || ''
      };

      await droppedBooksApi.updateDroppedBook(Number(id), updateData);
      alert('읽다 만 책이 성공적으로 수정되었습니다!');
      navigate('/library');
    } catch (error) {
      console.error('읽다 만 책 수정에 실패했습니다:', error);
      alert('읽다 만 책 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const getReadingTypeDisplay = (type: ReadingType) => {
    switch (type) {
      case ReadingType.PAPER_BOOK: return '종이책 소장';
      case ReadingType.LIBRARY_RENTAL: return '도서관 대여';
      case ReadingType.MILLIE: return '밀리의 서재';
      case ReadingType.E_BOOK: return '전자책 소장';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Loading size="lg" text="읽다 만 책 정보를 불러오는 중..." />
        </div>
      </div>
    );
  }

  if (!droppedBook) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">읽다 만 책을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <BookOpenIcon className="w-8 h-8 text-orange-500 mr-3" />
          읽다 만 책 수정
        </h1>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="978-0-000000-0-0"
                />
              </div>

              {/* 출판사 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출판사
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 출판일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출판일
                </label>
                <input
                  type="date"
                  value={formData.publishedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 빈 공간 (2열 맞춤용) */}
              <div></div>
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

          {/* 읽기 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">읽기 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* 읽기 형태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  읽기 형태 *
                </label>
                <select
                  value={formData.readingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, readingType: e.target.value as ReadingType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {Object.values(ReadingType).map((type) => (
                    <option key={type} value={type}>
                      {getReadingTypeDisplay(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 시작일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  읽기 시작일
                </label>
                <input
                  type="date"
                  value={formData.startedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 중단일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  읽기 중단일
                </label>
                <input
                  type="date"
                  value={formData.droppedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, droppedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 진행률 */}
              <div className="md:col-span-2 xl:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진행률: {formData.progressPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progressPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, progressPercentage: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${formData.progressPercentage}%, #e5e7eb ${formData.progressPercentage}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 중단 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">중단 정보</h3>
            
            {/* 중단 이유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                중단 이유 *
              </label>
              <textarea
                value={formData.dropReason}
                onChange={(e) => setFormData(prev => ({ ...prev, dropReason: e.target.value }))}
                rows={4}
                placeholder="책을 중단하게 된 이유를 적어주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
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

export default EditDroppedBook;
