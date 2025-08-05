import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpenIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { bookApi } from '../api/books';
import { BookSearchResult } from '../types/book';
import Loading from '../components/common/Loading';

interface MonthlyBookData {
  year: number;
  month: number;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImage: string;
  bookPublisher: string;
  bookPublishedDate: string;
  bookDescription: string;
  selectionReason: string;
  startDate: string;
  endDate: string;
}

const SelectMonthlyBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [formData, setFormData] = useState<MonthlyBookData>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    bookTitle: '',
    bookAuthor: '',
    bookCoverImage: '',
    bookPublisher: '',
    bookPublishedDate: '',
    bookDescription: '',
    selectionReason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const response = await bookApi.searchBooks(searchTerm, 20);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('책 검색에 실패했습니다:', error);
      alert('책 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSearching(false);
    }
  };

  const handleBookSelect = (book: BookSearchResult) => {
    setSelectedBook(book);
    setFormData(prev => ({
      ...prev,
      bookTitle: book.title,
      bookAuthor: book.author || '',
      bookCoverImage: book.cover || '',
      bookPublisher: book.publisher || '',
      bookPublishedDate: book.pubDate || '',
      bookDescription: book.description || ''
    }));
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !formData.selectionReason.trim()) {
      alert('책을 선택하고 선정 이유를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      // TODO: 실제 API 호출
      console.log('월간 도서 선정 데이터:', formData);
      
      alert('월간 도서가 성공적으로 선정되었습니다!');
              navigate(`/reading-groups/${id}`);
    } catch (error) {
      console.error('월간 도서 선정에 실패했습니다:', error);
      alert('월간 도서 선정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(`/reading-groups/${id}`)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpenIcon className="w-8 h-8 text-primary-600 mr-3" />
            월간 도서 선정
          </h1>
        </div>

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
                    placeholder="이달에 함께 읽을 책을 검색하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={searching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchTerm.trim()}
                  className="btn btn-primary whitespace-nowrap"
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
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
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
                          <BookOpenIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
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
                  className="text-sm text-primary-600 hover:text-primary-700"
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
                    <BookOpenIcon className="w-10 h-10 text-gray-400" />
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

            {/* 월간 도서 설정 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">월간 도서 설정</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* 연도 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연도
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                </div>

                {/* 월 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData(prev => ({ ...prev, month: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>
                </div>

                {/* 시작일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 선정 이유 - 전체 너비 */}
                <div className="md:col-span-2 xl:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선정 이유 *
                  </label>
                  <textarea
                    value={formData.selectionReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, selectionReason: e.target.value }))}
                    rows={4}
                    placeholder="이 책을 이달의 책으로 선정한 이유를 설명해주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.selectionReason.length}/1000자
                  </p>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/reading-groups/${id}`)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto btn btn-primary"
              >
                {saving ? '선정 중...' : '월간 도서 선정'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SelectMonthlyBook;
