import React, { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { Wishlist } from '../types/wishlist';
import { bookApi } from '../api/book';
import { wishlistApi } from '../api/wishlists';

enum LibraryFilter {
  ALL = 'ALL',
  COMPLETED = 'COMPLETED',
  WISHLIST = 'WISHLIST'
}

const Library: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LibraryFilter>(LibraryFilter.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: 'book' | 'wishlist', data: Book | Wishlist } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({
    rating: 5,
    review: '',
    finishedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksResponse, wishlistResponse] = await Promise.all([
        bookApi.getMyBooks({}),
        wishlistApi.getWishlists()
      ]);
      setBooks(booksResponse.data.content || []);
      setWishlistItems(wishlistResponse.data.data.content || []);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    let items: Array<{ type: 'book' | 'wishlist', data: Book | Wishlist }> = [];

    if (filter === LibraryFilter.ALL || filter === LibraryFilter.COMPLETED) {
      let filteredBooks = books;
      
      // 별점 필터링 (완독한 책만)
      if (ratingFilter !== null) {
        filteredBooks = books.filter(book => book.rating === ratingFilter);
      }
      
      items = items.concat(
        filteredBooks.map(book => ({ type: 'book' as const, data: book }))
      );
    }

    if (filter === LibraryFilter.ALL || filter === LibraryFilter.WISHLIST) {
      items = items.concat(
        wishlistItems.map(item => ({ type: 'wishlist' as const, data: item }))
      );
    }

    // 검색 필터링
    if (searchTerm) {
      items = items.filter(item => {
        const title = item.type === 'book' 
          ? (item.data as Book).title 
          : (item.data as Wishlist).title;
        const author = item.type === 'book' 
          ? (item.data as Book).author 
          : (item.data as Wishlist).author || '';
        
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (author && author.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    return items;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const handleItemClick = (item: { type: 'book' | 'wishlist', data: Book | Wishlist }) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async (item: { type: 'book' | 'wishlist', data: Book | Wishlist }) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      if (item.type === 'book') {
        await bookApi.deleteBook((item.data as Book).id);
        setBooks(books.filter(book => book.id !== (item.data as Book).id));
        alert('완독한 책이 삭제되었습니다.');
      } else {
        await wishlistApi.deleteWishlist((item.data as Wishlist).id);
        setWishlistItems(wishlistItems.filter(wishlist => wishlist.id !== (item.data as Wishlist).id));
        alert('읽고 싶은 책이 삭제되었습니다.');
      }
      closeModal();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleMarkAsRead = (wishlistItem: Wishlist) => {
    // 완료 폼 데이터 초기화
    setCompleteFormData({
      rating: 5,
      review: '',
      finishedDate: new Date().toISOString().split('T')[0]
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async () => {
    if (!selectedItem || selectedItem.type !== 'wishlist') return;

    const wishlistItem = selectedItem.data as Wishlist;

    try {
      // 완독한 책으로 추가
      const bookData = {
        title: wishlistItem.title,
        author: wishlistItem.author || '',
        coverImage: wishlistItem.coverImage || '',
        rating: completeFormData.rating,
        review: completeFormData.review,
        finishedDate: completeFormData.finishedDate
      };

      const newBookResponse = await bookApi.createBook(bookData);
      
      // 위시리스트에서 삭제
      await wishlistApi.deleteWishlist(wishlistItem.id);
      
      // 상태 업데이트
      setBooks([...books, newBookResponse.data]);
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItem.id));
      
      // 모달들 닫기
      setShowCompleteModal(false);
      setShowModal(false);
      
      alert('완독한 책으로 이동되었습니다!');
    } catch (error) {
      console.error('읽기 완료 처리 실패:', error);
      alert('읽기 완료 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">서재</h1>
        <p className="text-gray-600">완독한 책과 읽고 싶은 책을 한 번에 관리하세요</p>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* 첫 번째 줄: 기본 필터 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilter(LibraryFilter.ALL);
                  setRatingFilter(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === LibraryFilter.ALL
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체 ({books.length + wishlistItems.length})
              </button>
              <button
                onClick={() => setFilter(LibraryFilter.COMPLETED)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === LibraryFilter.COMPLETED
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                완독한 책 ({books.length})
              </button>
              <button
                onClick={() => {
                  setFilter(LibraryFilter.WISHLIST);
                  setRatingFilter(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === LibraryFilter.WISHLIST
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                읽고 싶은 책 ({wishlistItems.length})
              </button>
            </div>

            {/* 책 추가 버튼들 */}
            <div className="flex gap-2">
              <a
                href="/books/add"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                완독한 책 추가
              </a>
              <a
                href="/wishlists/add"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                읽고 싶은 책 추가
              </a>
            </div>
          </div>

          {/* 두 번째 줄: 별점 필터 (완독한 책 필터가 선택된 경우에만 표시) */}
          {filter === LibraryFilter.COMPLETED && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">별점:</span>
              <button
                onClick={() => setRatingFilter(null)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  ratingFilter === null
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(rating)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    ratingFilter === rating
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{rating}</span>
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* 세 번째 줄: 검색 */}
          <div className="flex justify-end">
            <input
              type="text"
              placeholder="책 제목이나 저자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 책 목록 */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-500 text-lg mb-4">
            {searchTerm ? '검색 결과가 없습니다.' : '책이 없습니다.'}
          </div>
          {!searchTerm && (
            <div className="space-x-4">
              <a
                href="/books/add"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                완독한 책 등록하기
              </a>
              <a
                href="/wishlists/add"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                읽고 싶은 책 추가하기
              </a>
            </div>
          )}
        </div>
      ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {filteredItems.map((item, index) => {
              const isBook = item.type === 'book';
              const bookData = item.data as Book;
              const wishlistData = item.data as Wishlist;

              return (
                  <div
                      key={`${item.type}-${index}`}
                      className="w-28 h-52 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                      onClick={() => handleItemClick(item)}
                  >
                    {/* 책 표지와 상태 배지 */}
                    <div className="relative h-30 flex-shrink-0">
                      <img
                          src={isBook ? (bookData.coverImage || '/default-book-cover.jpg') : (wishlistData.coverImage || '/default-book-cover.jpg')}
                          alt={isBook ? bookData.title : wishlistData.title}
                          className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isBook
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                    }`}>
                      {isBook ? '완독' : '읽고 싶은'}
                    </span>
                      </div>

                      {/* 완독한 책의 별점 표시 */}
                      {isBook && (
                          <div className="absolute bottom-2 left-2">
                            <div className="bg-white rounded-full px-3 py-1 shadow-sm">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-3 h-3 ${
                                            i < bookData.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                      <path
                                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                ))}
                                <span className="ml-1 text-xs text-gray-700 font-medium">
                            {bookData.rating}
                          </span>
                              </div>
                            </div>
                          </div>
                      )}
                    </div>

                    {/* 책 제목 */}
                    <div className="p-4 h-20 flex items-start bg-white border-t border-gray-100 flex-shrink-0">
                      <h3 className="font-medium text-sm text-gray-900 w-full leading-tight overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {isBook ? (bookData.title || '제목 없음') : (wishlistData.title || '제목 없음')}
                      </h3>
                    </div>
                  </div>
              );
            })}
          </div>
      )}

      {/* 상세 보기 모달 */}
      {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedItem.type === 'book' ? '완독한 책' : '읽고 싶은 책'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 책 정보 */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* 책 표지 */}
                <div className="flex-shrink-0">
                  <img
                    src={selectedItem.type === 'book' 
                      ? ((selectedItem.data as Book).coverImage || '/default-book-cover.jpg')
                      : ((selectedItem.data as Wishlist).coverImage || '/default-book-cover.jpg')
                    }
                    alt={selectedItem.type === 'book' 
                      ? (selectedItem.data as Book).title
                      : (selectedItem.data as Wishlist).title
                    }
                    className="w-48 h-64 object-cover rounded-lg shadow-md mx-auto md:mx-0"
                  />
                </div>

                {/* 책 상세 정보 */}
                <div className="flex-1 relative">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedItem.type === 'book' 
                      ? (selectedItem.data as Book).title
                      : (selectedItem.data as Wishlist).title
                    }
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {selectedItem.type === 'book' 
                      ? ((selectedItem.data as Book).author || '저자 미상')
                      : ((selectedItem.data as Wishlist).author || '저자 미상')
                    }
                  </p>

                  {/* 완독한 책의 경우 별점과 완독일 표시 */}
                  {selectedItem.type === 'book' && (
                    <>
                      <div className="flex items-center mb-4">
                        <span className="text-sm text-gray-600 mr-2">별점:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < (selectedItem.data as Book).rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {(selectedItem.data as Book).rating}/5
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">완독일: </span>
                        <span className="text-sm text-gray-900">
                          {formatDate((selectedItem.data as Book).finishedDate)}
                        </span>
                      </div>

                      {/* 한줄평 */}
                      {(selectedItem.data as Book).review && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">한줄평</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {(selectedItem.data as Book).review}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* 읽고 싶은 책의 경우 추가일과 메모 표시 */}
                  {selectedItem.type === 'wishlist' && (
                    <>
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">추가일: </span>
                        <span className="text-sm text-gray-900">
                          {formatDate((selectedItem.data as Wishlist).createdAt)}
                        </span>
                      </div>

                      {/* 메모 */}
                      {(selectedItem.data as Wishlist).memo && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">메모</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {(selectedItem.data as Wishlist).memo}
                          </p>
                        </div>
                      )}

                    </>
                  )}

                  {/* 읽고 싶은 책의 경우 읽기 완료 버튼을 오른쪽 아래에 배치 */}
                  {selectedItem.type === 'wishlist' && (
                    <div className="absolute bottom-0 right-0">
                      <button
                        onClick={() => handleMarkAsRead(selectedItem.data as Wishlist)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        읽기 완료
                      </button>
                    </div>
                  )}

                  {/* 수정/삭제 버튼 */}
                  <div className="flex gap-2 mt-6">
                    <a
                      href={selectedItem.type === 'book' 
                        ? `/books/edit/${(selectedItem.data as Book).id}`
                        : `/wishlists/edit/${(selectedItem.data as Wishlist).id}`
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      수정
                    </a>
                    <button
                      onClick={() => handleDelete(selectedItem)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 읽기 완료 모달 */}
      {showCompleteModal && selectedItem && selectedItem.type === 'wishlist' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">읽기 완료</h2>
                <button
                  onClick={closeCompleteModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 책 정보 */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={(selectedItem.data as Wishlist).coverImage || '/default-book-cover.jpg'}
                    alt={(selectedItem.data as Wishlist).title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(selectedItem.data as Wishlist).title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(selectedItem.data as Wishlist).author || '저자 미상'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 별점 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  별점 *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCompleteFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= completeFormData.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {completeFormData.rating}점
                  </span>
                </div>
              </div>

              {/* 완독일 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  완독일 *
                </label>
                <input
                  type="date"
                  value={completeFormData.finishedDate}
                  onChange={(e) => setCompleteFormData(prev => ({ ...prev, finishedDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* 한줄평 입력 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  한줄평
                </label>
                <textarea
                  value={completeFormData.review}
                  onChange={(e) => setCompleteFormData(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="이 책에 대한 한줄평을 작성해주세요..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={closeCompleteModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCompleteSubmit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  완독 등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
