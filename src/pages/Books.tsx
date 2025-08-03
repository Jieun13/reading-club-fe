import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { bookApi } from '../api/books';
import { Book } from '../types/book';
import Loading from '../components/common/Loading';

const Books: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | undefined>();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookApi.getBooks(0, 100);
      setBooks(response.data.data.content);
    } catch (error) {
      console.error('책 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('정말로 이 책을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await bookApi.deleteBook(bookId);
      alert('책이 성공적으로 삭제되었습니다.');
      fetchBooks(); // 목록 새로고침
    } catch (error) {
      console.error('책 삭제에 실패했습니다:', error);
      alert('책 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRating = !filterRating || book.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < rating ? (
          <StarIconSolid className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ));
  };

  if (loading) {
    return <Loading size="lg" text="책 목록을 불러오는 중..." />;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">내 책장</h1>
        <Link
          to="/books/add"
          className="btn btn-primary inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          책 추가
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="책 제목이나 저자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">모든 별점</option>
            <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
            <option value="4">⭐⭐⭐⭐ (4점)</option>
            <option value="3">⭐⭐⭐ (3점)</option>
            <option value="2">⭐⭐ (2점)</option>
            <option value="1">⭐ (1점)</option>
          </select>
        </div>
      </div>

      {/* 책 목록 */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterRating ? '검색 결과가 없습니다' : '아직 등록된 책이 없습니다'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterRating 
              ? '다른 검색어나 필터를 시도해보세요' 
              : '첫 번째 책을 추가해보세요!'
            }
          </p>
          {!searchTerm && !filterRating && (
            <Link to="/books/add" className="btn btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              첫 책 추가하기
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author || '저자 미상'}</p>
                    <div className="flex items-center space-x-1 mb-3">
                      {renderStars(book.rating)}
                      <span className="text-sm text-gray-600 ml-2">({book.rating}점)</span>
                    </div>
                    {book.review && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {book.review}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <div>완독일: {new Date(book.finishedDate).toLocaleDateString()}</div>
                      <div>등록일: {new Date(book.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/books/edit/${book.id}`)}
                        className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded border border-primary-200 hover:border-primary-300 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 통계 요약 */}
      {books.length > 0 && (
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">독서 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {books.length}
              </div>
              <div className="text-sm text-gray-600">전체 책</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {books.length > 0 ? (books.reduce((sum, book) => sum + book.rating, 0) / books.length).toFixed(1) : 0}
              </div>
              <div className="text-sm text-gray-600">평균 별점</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {books.filter(book => book.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-600">4점 이상</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Date().getFullYear()}
              </div>
              <div className="text-sm text-gray-600">올해</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
