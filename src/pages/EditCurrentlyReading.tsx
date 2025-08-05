import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { currentlyReadingApi } from '../api/currentlyReading';
import { CurrentlyReading, CurrentlyReadingUpdateRequest, ReadingType } from '../types';
import Loading from '../components/common/Loading';

const EditCurrentlyReading: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentlyReading, setCurrentlyReading] = useState<CurrentlyReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CurrentlyReadingUpdateRequest>({
    title: '',
    author: '',
    coverImage: '',
    publisher: '',
    publishedDate: '',
    description: '',
    readingType: ReadingType.PAPER_BOOK,
    dueDate: '',
    progressPercentage: 0,
    memo: ''
  });

  useEffect(() => {
    const loadCurrentlyReading = async () => {
      try {
        setLoading(true);
        const response = await currentlyReadingApi.getCurrentlyReadingById(Number(id));
        const bookData = response.data;
        setCurrentlyReading(bookData);
        setFormData({
          title: bookData.title,
          author: bookData.author || '',
          coverImage: bookData.coverImage || '',
          publisher: bookData.publisher || '',
          publishedDate: bookData.publishedDate || '',
          description: bookData.description || '',
          readingType: bookData.readingType,
          dueDate: bookData.dueDate || '',
          progressPercentage: bookData.progressPercentage,
          memo: bookData.memo || ''
        });
      } catch (error) {
        console.error('읽고 있는 책 정보 로드 실패:', error);
        alert('읽고 있는 책 정보를 불러오는데 실패했습니다.');
        navigate('/library');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCurrentlyReading();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('책 제목을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: CurrentlyReadingUpdateRequest = {
        title: formData.title.trim(),
        author: formData.author?.trim() || '',
        coverImage: formData.coverImage?.trim() || '',
        publisher: formData.publisher?.trim() || '',
        publishedDate: formData.publishedDate?.trim() || '',
        description: formData.description?.trim() || '',
        readingType: formData.readingType,
        dueDate: formData.dueDate?.trim() || '',
        progressPercentage: formData.progressPercentage,
        memo: formData.memo?.trim() || ''
      };

      await currentlyReadingApi.updateCurrentlyReading(Number(id), updateData);
      alert('읽고 있는 책이 성공적으로 수정되었습니다!');
      navigate('/library');
    } catch (error) {
      console.error('읽고 있는 책 수정에 실패했습니다:', error);
      alert('읽고 있는 책 수정에 실패했습니다. 다시 시도해주세요.');
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
          <Loading size="lg" text="읽고 있는 책 정보를 불러오는 중..." />
        </div>
      </div>
    );
  }

  if (!currentlyReading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-gray-500">읽고 있는 책을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <BookOpenIcon className="w-8 h-8 text-orange-500 mr-3" />
          읽고 있는 책 수정
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

              {/* 대여 종료일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대여 종료일
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 빈 공간 (xl 화면에서 3열 맞춤용) */}
              <div className="hidden xl:block"></div>

              {/* 진행률 - xl 화면에서는 전체 너비 */}
              <div className="md:col-span-2 xl:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진행률: {formData.progressPercentage}% *
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

          {/* 추가 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 메모 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모
                </label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                  rows={4}
                  placeholder="이 책을 읽고 있는 소감이나 기록을 적어보세요..."
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

export default EditCurrentlyReading; 