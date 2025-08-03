import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, HeartIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { bookApi } from '../api/book';
import { wishlistApi } from '../api/wishlists';
import { WishlistCreateRequest } from '../types/wishlist';
import { BookSearchResult } from '../types/book';
import Loading from '../components/common/Loading';

interface DuplicateWishlist {
  id: number;
  title: string;
  author: string;
  createdAt: string;
}

const AddWishlist: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [formData, setFormData] = useState({
    memo: ''
  });
  const [saving, setSaving] = useState(false);
  const [duplicateWishlists, setDuplicateWishlists] = useState<DuplicateWishlist[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // 선택된 책이 변경될 때 중복 체크
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!selectedBook) return;

      try {
        const response = await wishlistApi.checkDuplicate(
          selectedBook.title,
          selectedBook.author
        );
        
        console.log('위시리스트 중복 체크 응답:', response.data.data);
        
        if (response.data.data.duplicate) {
          setDuplicateWishlists(response.data.data.duplicateWishlists);
          setShowDuplicateWarning(true);
        } else {
          setDuplicateWishlists([]);
          setShowDuplicateWarning(false);
        }
      } catch (error) {
        console.error('중복 체크 실패:', error);
      }
    };

    if (selectedBook) {
      checkDuplicate();
    }
  }, [selectedBook]);

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
      
      const wishlistData: WishlistCreateRequest = {
        title: selectedBook.title,
        author: selectedBook.author || '',
        coverImage: selectedBook.cover || '',
        publisher: selectedBook.publisher || '',
        publishedDate: selectedBook.pubDate || '',
        description: selectedBook.description || '',
        memo: formData.memo
      };

      await wishlistApi.addWishlist(wishlistData);
      alert('위시리스트에 성공적으로 추가되었습니다!');
      navigate('/library');
    } catch (error) {
      console.error('위시리스트 추가에 실패했습니다:', error);
      alert('위시리스트 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <HeartIcon className="w-8 h-8 text-red-500 mr-3" />
          위시리스트에 책 추가
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
                    placeholder="읽고 싶은 책의 제목이나 저자를 입력하세요..."
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

            {/* 중복 경고 - 초록색 */}
            {showDuplicateWarning && duplicateWishlists.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      이미 위시리스트에 있는 책입니다
                    </h4>
                    <div className="space-y-2">
                      {duplicateWishlists.map((wishlist) => (
                        <div key={wishlist.id} className="text-sm text-green-700 bg-green-100 rounded p-2">
                          <div className="font-medium">{wishlist.title}</div>
                          <div className="text-xs text-green-600 mt-1">
                            저자: {wishlist.author} | 
                            추가일: {new Date(wishlist.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      그래도 추가하시겠습니까? 같은 책을 여러 번 추가할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 위시리스트 정보 입력 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">위시리스트 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* 메모 - 전체 너비 */}
                <div className="md:col-span-2 xl:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메모 (읽고 싶은 이유나 기대하는 점)
                  </label>
                  <textarea
                    value={formData.memo}
                    onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                    rows={4}
                    placeholder="이 책을 읽고 싶은 이유나 기대하는 점을 적어보세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                disabled={saving}
                className="w-full sm:w-auto btn btn-primary"
              >
                {saving ? '저장 중...' : '위시리스트에 추가'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddWishlist;
