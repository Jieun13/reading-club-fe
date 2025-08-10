import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { bookApi } from '../api/book';
import { droppedBooksApi } from '../api/droppedBooks';
import { DroppedBookCreateRequest, ReadingType, READING_TYPE_LABELS } from '../types/droppedBook';
import { BookSearchResult } from '../types/book';
import Loading from '../components/common/Loading';

interface DuplicateCheckResult {
  duplicate: boolean;
  message?: string;
}

const AddDroppedBook: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [formData, setFormData] = useState({
    readingType: ReadingType.PAPER_BOOK,
    progressPercentage: 0,
    dropReason: '',
    droppedDate: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<DuplicateCheckResult | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // 선택된 책이 변경될 때 중복 체크
  useEffect(() => {
    if (selectedBook) {
      checkDuplicate();
    } else {
      setDuplicateCheckResult(null);
    }
  }, [selectedBook]);

  const checkDuplicate = async () => {
    if (!selectedBook) return;

    try {
      setCheckingDuplicate(true);
      setDuplicateCheckResult(null);

      // 제목 + 저자 기준 중복 체크 (가장 정확)
      if (selectedBook.title && selectedBook.author) {
        const titleAuthorResult = await droppedBooksApi.checkDuplicateByTitleAndAuthor(selectedBook.title, selectedBook.author);
        
        // isDuplicate 또는 duplicate 속성 체크
        const isDuplicate = titleAuthorResult.isDuplicate || titleAuthorResult.duplicate;
        
        if (isDuplicate) {
          setDuplicateCheckResult({
            duplicate: true,
            message: titleAuthorResult.message || `이미 읽다 만 책으로 등록된 책입니다: ${selectedBook.title} - ${selectedBook.author}`
          });
          return;
        }
      }

      // 제목만 기준 중복 체크 (저자가 없는 경우)
      if (selectedBook.title && (!selectedBook.author || selectedBook.author.trim() === '')) {
        const titleResult = await droppedBooksApi.checkDuplicateByTitle(selectedBook.title);
        
        if (titleResult.isDuplicate) {
          setDuplicateCheckResult({
            duplicate: true,
            message: titleResult.message || `이미 읽다 만 책으로 등록된 제목입니다: ${selectedBook.title}`
          });
          return;
        }
      }

      // 중복 없음
      setDuplicateCheckResult({ duplicate: false });
    } catch (error) {
      console.error('중복 체크에 실패했습니다:', error);
      // 중복 체크 실패 시에도 계속 진행
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const response = await bookApi.searchBooks(searchTerm, 20);
      setSearchResults(response.data);
    } catch (error) {
      console.error('책 검색에 실패했습니다:', error);
      alert('책 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSearching(false);
    }
  };

  const handleBookSelect = (book: BookSearchResult) => {
    setSelectedBook(book);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      setSaving(true);
      
      const droppedBookData: DroppedBookCreateRequest = {
        title: selectedBook.title,
        author: selectedBook.author || '',
        isbn: selectedBook.isbn || '',
        coverImage: selectedBook.cover || '',
        publisher: selectedBook.publisher || '',
        publishedDate: selectedBook.pubDate || '',
        description: selectedBook.description || '',
        readingType: formData.readingType,
        progressPercentage: formData.progressPercentage,
        dropReason: formData.dropReason,
        droppedDate: formData.droppedDate
      };

      await droppedBooksApi.createDroppedBook(droppedBookData);
      alert('읽다 만 책에 성공적으로 추가되었습니다!');
      navigate('/library');
    } catch (error) {
      console.error('읽다 만 책 추가에 실패했습니다:', error);
      alert('읽다 만 책 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <XCircleIcon className="w-8 h-8 text-red-500 mr-3" />
          읽다 만 책 추가
        </h1>

        {!selectedBook ? (
          <>
            {/* 책 검색 */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">책 검색</h2>
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="읽다 만 책의 제목이나 저자를 입력하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={searching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchTerm.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {searching ? '검색 중...' : '검색'}
                </button>
              </form>
            </div>

            {/* 검색 결과 */}
            {searching && (
              <div className="text-center py-8">
                <Loading size="md" text="책을 검색하는 중..." />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">검색 결과</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {searchResults.map((book, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-colors"
                      onClick={() => handleBookSelect(book)}
                    >
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {book.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {book.author || '저자 미상'}
                        </p>
                        {book.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {book.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          {book.pubDate && (
                            <span>출간: {book.pubDate}</span>
                          )}
                          {book.publisher && (
                            <span>출판사: {book.publisher}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* 선택된 책 정보 및 폼 */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 선택된 책 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">선택된 책</h2>
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  다른 책 선택
                </button>
              </div>
              <div className="flex items-start space-x-4">
                {selectedBook.cover ? (
                  <img
                    src={selectedBook.cover}
                    alt={selectedBook.title}
                    className="w-20 h-28 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {selectedBook.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {selectedBook.author || '저자 미상'}
                  </p>
                  {selectedBook.publisher && (
                    <p className="text-sm text-gray-500 mb-2">
                      출판사: {selectedBook.publisher}
                    </p>
                  )}
                  {selectedBook.description && (
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {selectedBook.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 중복 경고 - 중단 정보 카드 위에 표시 */}
            {duplicateCheckResult?.duplicate && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      이미 읽다 만 책 목록에 있는 책입니다.
                    </h4>
                  </div>
                </div>
              </div>
            )}

            {/* 중복 체크 중 */}
            {checkingDuplicate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Loading size="sm" text="중복 체크 중..." />
                </div>
              </div>
            )}

            {/* 중단 정보 입력 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">중단 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 읽기 유형 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    읽기 유형 *
                  </label>
                  <select
                    required
                    value={formData.readingType}
                    onChange={(e) => setFormData(prev => ({ ...prev, readingType: e.target.value as ReadingType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {Object.entries(READING_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 중단일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    중단일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.droppedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, droppedDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* 진행률 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    진행률: {formData.progressPercentage}% *
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.progressPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, progressPercentage: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${formData.progressPercentage}%, #e5e7eb ${formData.progressPercentage}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    슬라이더를 드래그하여 읽은 진행률을 설정하세요
                  </div>
                </div>

                {/* 중단 이유 - 전체 너비 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    중단 이유 *
                  </label>
                  <textarea
                    required
                    value={formData.dropReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, dropReason: e.target.value }))}
                    rows={3}
                    placeholder="이 책을 중단한 이유를 적어주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/library')}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving || duplicateCheckResult?.duplicate}
                className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '저장 중...' : duplicateCheckResult?.duplicate ? '이미 등록된 책입니다' : '읽다 만 책에 추가'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddDroppedBook;
