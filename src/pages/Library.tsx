import React, { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { Wishlist } from '../types/wishlist';
import { CurrentlyReading } from '../types';
import { ReadingType } from '../types/droppedBook';
import { DroppedBook } from '../types/droppedBook';
import { bookApi } from '../api/book';
import { wishlistApi } from '../api/wishlists';
import { currentlyReadingApi } from '../api/currentlyReading';
import { droppedBooksApi } from '../api/droppedBooks';

enum LibraryFilter {
  ALL = 'ALL',
  COMPLETED = 'COMPLETED',
  CURRENTLY_READING = 'CURRENTLY_READING',
  WISHLIST = 'WISHLIST',
  DROPPED = 'DROPPED'
}

const Library: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Wishlist[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<CurrentlyReading[]>([]);
  const [droppedBooks, setDroppedBooks] = useState<DroppedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LibraryFilter>(LibraryFilter.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: Book | Wishlist | CurrentlyReading | DroppedBook } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCurrentlyReadingModal, setShowCurrentlyReadingModal] = useState(false);
  const [showDropBookModal, setShowDropBookModal] = useState(false);
  
  // showDropBookModal 상태 변경 추적
  useEffect(() => {
    // showDropBookModal 상태 변경 감지
  }, [showDropBookModal]);
  const [showAddBookDropdown, setShowAddBookDropdown] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({
    rating: 5,
    review: '',
    finishedDate: new Date().toISOString().split('T')[0]
  });
              const [currentlyReadingFormData, setCurrentlyReadingFormData] = useState({
              readingType: ReadingType.PAPER_BOOK,
              dueDate: '',
              progressPercentage: 0,
              memo: ''
            });
  const [dropBookFormData, setDropBookFormData] = useState({
    dropReason: '',
    progressPercentage: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddBookDropdown && !(event.target as Element).closest('.relative')) {
        setShowAddBookDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddBookDropdown]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 개별 API를 사용하여 각 상태별로 데이터 조회
      const [booksResponse, wishlistResponse, currentlyReadingResponse, droppedBooksResponse] = await Promise.all([
        bookApi.getMyBooks({}),
        wishlistApi.getWishlists(),
        currentlyReadingApi.getCurrentlyReading(),
        droppedBooksApi.getDroppedBooks()
      ]);
      
      setBooks(booksResponse.data.content || []);
      setWishlistItems(wishlistResponse.data.data.content || []);
      setCurrentlyReading(currentlyReadingResponse.data.content || []);
      setDroppedBooks(droppedBooksResponse.data.content || []);
      
      // 데이터 로드 완료
    } catch (error) {
      // 데이터 조회 실패
      alert('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 검색어나 필터가 변경될 때 데이터 다시 조회하는 useEffect 제거
  // 대신 클라이언트 사이드에서 필터링 처리

  const getFilteredItems = () => {
    let items: Array<{ type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: Book | Wishlist | CurrentlyReading | DroppedBook }> = [];
    
    // getFilteredItems 호출됨
    
    if (filter === LibraryFilter.ALL || filter === LibraryFilter.COMPLETED) {
      let filteredBooks = books;
      // 별점 필터링 (완독한 책만)
      if (ratingFilter !== null) {
        filteredBooks = books.filter(book => book.rating === ratingFilter);
      }
      items = items.concat(
        filteredBooks.map(book => ({ type: 'book' as const, data: book }))
      );
      // 완독한 책 추가됨
    }
    
    if (filter === LibraryFilter.ALL || filter === LibraryFilter.CURRENTLY_READING) {
      items = items.concat(
        currentlyReading.map(book => ({ type: 'currentlyReading' as const, data: book }))
      );
      // 읽고 있는 책 추가됨
    }
    
    if (filter === LibraryFilter.ALL || filter === LibraryFilter.WISHLIST) {
      items = items.concat(
        wishlistItems.map(item => ({ type: 'wishlist' as const, data: item }))
      );
      // 읽고 싶은 책 추가됨
    }

    if (filter === LibraryFilter.ALL || filter === LibraryFilter.DROPPED) {
      items = items.concat(
        droppedBooks.map(book => ({ type: 'droppedBook' as const, data: book }))
      );
      // 읽다 만 책 추가됨
    }

    // 검색 필터링
    if (searchTerm) {
      const beforeSearchCount = items.length;
      items = items.filter(item => {
        const title = item.type === 'book' 
          ? (item.data as Book).title 
          : item.type === 'currentlyReading'
          ? (item.data as CurrentlyReading).title
          : item.type === 'droppedBook'
          ? (item.data as DroppedBook).title
          : (item.data as Wishlist).title;
        const author = item.type === 'book' 
          ? (item.data as Book).author 
          : item.type === 'currentlyReading'
          ? (item.data as CurrentlyReading).author || ''
          : item.type === 'droppedBook'
          ? (item.data as DroppedBook).author || ''
          : (item.data as Wishlist).author || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
               (author && author.toLowerCase().includes(searchTerm.toLowerCase()));
      });
      // 검색 필터링 후
    }

    // 최종 필터링된 아이템 수
    return items;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const handleItemClick = (item: { type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: Book | Wishlist | CurrentlyReading | DroppedBook }) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async (item: { type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: Book | Wishlist | CurrentlyReading | DroppedBook }) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      if (item.type === 'book') {
        await bookApi.deleteBook((item.data as Book).id);
        setBooks(books.filter(book => book.id !== (item.data as Book).id));
        alert('완독한 책이 삭제되었습니다.');
      } else if (item.type === 'currentlyReading') {
        await currentlyReadingApi.deleteCurrentlyReading((item.data as CurrentlyReading).id);
        setCurrentlyReading(currentlyReading.filter(book => book.id !== (item.data as CurrentlyReading).id));
        alert('읽고 있는 책이 삭제되었습니다.');
      } else if (item.type === 'droppedBook') {
        await droppedBooksApi.deleteDroppedBook((item.data as DroppedBook).id);
        setDroppedBooks(droppedBooks.filter(book => book.id !== (item.data as DroppedBook).id));
        alert('읽다 만 책이 삭제되었습니다.');
      } else {
        await wishlistApi.deleteWishlist((item.data as Wishlist).id);
        setWishlistItems(wishlistItems.filter(wishlist => wishlist.id !== (item.data as Wishlist).id));
        alert('읽고 싶은 책이 삭제되었습니다.');
      }
      closeModal();
    } catch (error) {
      // 삭제 실패
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 읽고 싶은 책을 읽고 있는 책으로 이동
  const handleStartReading = (wishlistItem: Wishlist) => {
    setCurrentlyReadingFormData({
              readingType: ReadingType.PAPER_BOOK,
        dueDate: '',
        progressPercentage: 0,
        memo: ''
      });
    setShowCurrentlyReadingModal(true);
  };

  // 읽고 있는 책을 읽고 있는 책으로 추가하는 함수
  const handleStartReadingSubmit = async () => {
    if (!selectedItem || selectedItem.type !== 'wishlist') return;
    
    const wishlistItem = selectedItem.data as Wishlist;
    
    try {
      // 읽고 있는 책으로 추가
      const currentlyReadingData = {
        title: wishlistItem.title,
        author: wishlistItem.author || '',
        coverImage: wishlistItem.coverImage || '',
        publisher: wishlistItem.publisher || '',
        publishedDate: wishlistItem.publishedDate || '',
        description: wishlistItem.description || '',
        readingType: currentlyReadingFormData.readingType,
                        dueDate: currentlyReadingFormData.dueDate || undefined,
                progressPercentage: currentlyReadingFormData.progressPercentage,
                memo: currentlyReadingFormData.memo

              };
      
      const newCurrentlyReadingResponse = await currentlyReadingApi.addCurrentlyReading(currentlyReadingData);
      
      // 위시리스트에서 삭제
      await wishlistApi.deleteWishlist(wishlistItem.id);
      
      // 상태 업데이트
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItem.id));
      setCurrentlyReading([...currentlyReading, newCurrentlyReadingResponse.data]);
      
      // 모달들 닫기
      setShowCurrentlyReadingModal(false);
      setShowModal(false);
      alert('읽고 있는 책으로 이동되었습니다!');
    } catch (error) {
      // 읽고 있는 책 추가 실패
      alert('읽고 있는 책 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 읽고 있는 책을 완독한 책으로 이동
  const handleMarkAsRead = (currentlyReadingItem: CurrentlyReading) => {
    setCompleteFormData({
      rating: 5,
      review: '',
      finishedDate: new Date().toISOString().split('T')[0]
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async () => {
    if (!selectedItem || selectedItem.type !== 'currentlyReading') return;
    
    const currentlyReadingItem = selectedItem.data as CurrentlyReading;
    
    try {
      // 완독한 책으로 추가
      const bookData = {
        title: currentlyReadingItem.title,
        author: currentlyReadingItem.author || '',
        coverImage: currentlyReadingItem.coverImage || '',
        rating: completeFormData.rating,
        review: completeFormData.review,
        finishedDate: completeFormData.finishedDate
      };
      
      const newBookResponse = await bookApi.createBook(bookData);
      
      // 읽고 있는 책에서 삭제
      await currentlyReadingApi.deleteCurrentlyReading(currentlyReadingItem.id);
      
      // 상태 업데이트
      setBooks([...books, newBookResponse.data]);
      setCurrentlyReading(currentlyReading.filter(item => item.id !== currentlyReadingItem.id));
      
      // 모달들 닫기
      setShowCompleteModal(false);
      setShowModal(false);
      alert('완독한 책으로 이동되었습니다!');
    } catch (error) {
      // 읽기 완료 처리 실패
      alert('읽기 완료 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
  };

  const closeCurrentlyReadingModal = () => {
    setShowCurrentlyReadingModal(false);
  };

  const closeDropBookModal = () => {
    setShowDropBookModal(false);
  };

  // 읽고 있는 책을 읽다 만 책으로 이동하는 모달 열기
  const handleDropBook = (currentlyReadingItem: CurrentlyReading) => {
    // handleDropBook 호출됨
    setDropBookFormData({
      dropReason: '',
      progressPercentage: currentlyReadingItem.progressPercentage
    });
    setShowDropBookModal(true);
    // showDropBookModal 설정됨
  };

  // 그만 읽기 모달에서 제출 처리
  const handleDropBookSubmit = async () => {
    // handleDropBookSubmit 호출됨
    if (!selectedItem || selectedItem.type !== 'currentlyReading') {
      // selectedItem이 없거나 타입이 맞지 않음
      return;
    }
    
    const currentlyReadingItem = selectedItem.data as CurrentlyReading;
    // currentlyReadingItem
    
    try {
      // 읽다 만 책으로 추가
      const droppedBookData = {
        title: currentlyReadingItem.title,
        author: currentlyReadingItem.author || '',
        isbn: undefined,
        coverImage: currentlyReadingItem.coverImage || '',
        publisher: currentlyReadingItem.publisher || '',
        publishedDate: currentlyReadingItem.publishedDate,
        description: currentlyReadingItem.description || '',
        readingType: currentlyReadingItem.readingType,
        progressPercentage: dropBookFormData.progressPercentage,
        dropReason: dropBookFormData.dropReason || '사용자가 그만 읽기로 설정',
        startedDate: currentlyReadingItem.createdAt.split('T')[0],
        droppedDate: new Date().toISOString().split('T')[0],

      };
      
      // droppedBookData
      
      const newDroppedBookResponse = await droppedBooksApi.createDroppedBook(droppedBookData);
      
      // newDroppedBookResponse
      
      // 읽고 있는 책에서 삭제
      await currentlyReadingApi.deleteCurrentlyReading(currentlyReadingItem.id);
      
      // 데이터 완전 새로고침
      await fetchData();
      
      // 모달들 닫기
      setShowDropBookModal(false);
      closeModal();
      alert('읽다 만 책으로 이동되었습니다!');
    } catch (error) {
      // 읽다 만 책 추가 실패
      alert('읽다 만 책 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const getReadingTypeDisplay = (type: string) => {
    switch (type) {
      case 'PAPER_BOOK': return '종이책 소장';
      case 'LIBRARY_RENTAL': return '도서관 대여';
      case 'MILLIE': return '밀리의 서재';
      case 'E_BOOK': return '전자책 소장';
      default: return type;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // 읽다 만 책을 다시 읽는 중으로 변경하는 함수
  const handleResumeReading = async (droppedBook: DroppedBook) => {
    try {
      // 읽는 중으로 생성
      await currentlyReadingApi.addCurrentlyReading({
        title: droppedBook.title,
        author: droppedBook.author || '',
        coverImage: droppedBook.coverImage || '',
        publisher: droppedBook.publisher || '',
        publishedDate: droppedBook.publishedDate,
        description: droppedBook.description || '',
        readingType: droppedBook.readingType,
                    dueDate: '',
            progressPercentage: droppedBook.progressPercentage || 0,
            memo: ''

          });

      // 읽다 만 책에서 제거
      await droppedBooksApi.deleteDroppedBook(droppedBook.id);
      
      // 데이터 새로고침
      await fetchData();
      
      // 모달 닫기
      setSelectedItem(null);
      setShowModal(false);
      
      alert('책이 읽는 중으로 이동되었습니다.');
    } catch (error) {
      // 읽기 재개 실패
      alert('읽기를 재개하는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  const filteredItems = getFilteredItems();
  // filteredItems 최종 결과

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
                전체 ({books.length + currentlyReading.length + wishlistItems.length + droppedBooks.length})
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
                  setFilter(LibraryFilter.CURRENTLY_READING);
                  setRatingFilter(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === LibraryFilter.CURRENTLY_READING
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                읽고 있는 책 ({currentlyReading.length})
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
              <button
                onClick={() => {
                  setFilter(LibraryFilter.DROPPED);
                  setRatingFilter(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === LibraryFilter.DROPPED
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                읽다 만 책 ({droppedBooks.length})
              </button>
            </div>
            {/* 책 추가 버튼들 */}
            <div className="relative">
              <button
                onClick={() => setShowAddBookDropdown(!showAddBookDropdown)}
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                책 추가
              </button>
              {showAddBookDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                  <a
                    href="/books/add"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    완독한 책 추가
                  </a>
                  <a
                    href="/currently-reading/add"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    읽고 있는 책 추가
                  </a>
                  <a
                    href="/wishlists/add"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    읽고 싶은 책 추가
                  </a>
                  <a
                    href="/dropped-books/add"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    읽다 만 책 추가
                  </a>
                </div>
              )}
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
                href="/currently-reading/add"
                className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                읽고 있는 책 추가하기
              </a>
              <a
                href="/wishlists/add"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                읽고 싶은 책 추가하기
              </a>
              <a
                href="/dropped-books/add"
                className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                읽다 만 책 추가하기
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {filteredItems.map((item, index) => {
            const isBook = item.type === 'book';
            const isCurrentlyReading = item.type === 'currentlyReading';
            const isDroppedBook = item.type === 'droppedBook';
            const bookData = item.data as Book;
            const currentlyReadingData = item.data as CurrentlyReading;
            const wishlistData = item.data as Wishlist;
            const droppedBookData = item.data as DroppedBook;

            return (
              <div
                key={`${item.type}-${index}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col w-full"
                onClick={() => handleItemClick(item)}
              >
                {/* 표지 이미지 */}
                <div className="relative w-full aspect-[10/12] overflow-hidden">
                  <img
                    src={
                      isBook
                        ? bookData.coverImage || '/default-book-cover.jpg'
                        : isCurrentlyReading
                        ? currentlyReadingData.coverImage || '/default-book-cover.jpg'
                        : isDroppedBook
                        ? droppedBookData.coverImage || '/default-book-cover.jpg'
                        : wishlistData.coverImage || '/default-book-cover.jpg'
                    }
                    alt={
                      isBook 
                        ? bookData.title 
                        : isCurrentlyReading 
                        ? currentlyReadingData.title 
                        : isDroppedBook
                        ? droppedBookData.title
                        : wishlistData.title
                    }
                    className="w-full h-full object-cover object-center"
                  />

                  {/* 상태 배지 */}
                  <div className="absolute top-2 right-2 z-10">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isBook ? 'bg-green-100 text-green-800' 
                        : isCurrentlyReading ? 'bg-blue-100 text-blue-800'
                        : isDroppedBook ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {isBook ? '완독' : isCurrentlyReading ? '읽는 중' : isDroppedBook ? '읽다 만' : '읽고 싶은'}
                    </span>
                  </div>


                </div>

                {/* 하단 영역: 제목 + 별점 */}
                <div className="bg-white border-t border-gray-100 px-3 py-2 h-[60px] flex flex-col justify-center relative">
                  {/* 진행률 표시 (읽고 있는 책만) */}
                  {isCurrentlyReading && (
                    <div className="absolute top-0 left-0 right-0">
                      <div className="bg-gray-200 h-1">
                        <div
                          className={`h-1 ${getProgressColor(currentlyReadingData.progressPercentage)}`}
                          style={{ width: `${currentlyReadingData.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {isBook ? bookData.title || '제목 없음' 
                     : isCurrentlyReading ? currentlyReadingData.title || '제목 없음'
                     : isDroppedBook ? droppedBookData.title || '제목 없음'
                     : wishlistData.title || '제목 없음'}
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
                  {selectedItem.type === 'book' ? '완독한 책' 
                   : selectedItem.type === 'currentlyReading' ? '읽고 있는 책'
                   : selectedItem.type === 'droppedBook' ? '읽다 만 책'
                   : '읽고 싶은 책'}
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
                      : selectedItem.type === 'currentlyReading'
                      ? ((selectedItem.data as CurrentlyReading).coverImage || '/default-book-cover.jpg')
                      : selectedItem.type === 'droppedBook'
                      ? ((selectedItem.data as DroppedBook).coverImage || '/default-book-cover.jpg')
                      : ((selectedItem.data as Wishlist).coverImage || '/default-book-cover.jpg')
                    }
                    alt={selectedItem.type === 'book' 
                      ? (selectedItem.data as Book).title 
                      : selectedItem.type === 'currentlyReading'
                      ? (selectedItem.data as CurrentlyReading).title
                      : selectedItem.type === 'droppedBook'
                      ? (selectedItem.data as DroppedBook).title
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
                      : selectedItem.type === 'currentlyReading'
                      ? (selectedItem.data as CurrentlyReading).title
                      : selectedItem.type === 'droppedBook'
                      ? (selectedItem.data as DroppedBook).title
                      : (selectedItem.data as Wishlist).title
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedItem.type === 'book' 
                      ? ((selectedItem.data as Book).author || '저자 미상')
                      : selectedItem.type === 'currentlyReading'
                      ? ((selectedItem.data as CurrentlyReading).author || '저자 미상')
                      : selectedItem.type === 'droppedBook'
                      ? ((selectedItem.data as DroppedBook).author || '저자 미상')
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

                  {/* 읽고 있는 책의 경우 읽기 정보 표시 */}
                  {selectedItem.type === 'currentlyReading' && (
                    <>
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">읽기 형태: </span>
                        <span className="text-sm text-gray-900">
                          {getReadingTypeDisplay((selectedItem.data as CurrentlyReading).readingType)}
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">진행률: </span>
                        <span className="text-sm text-gray-900">
                          {(selectedItem.data as CurrentlyReading).progressPercentage}%
                        </span>
                      </div>
                      {(selectedItem.data as CurrentlyReading).dueDate && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-600">대여 종료일: </span>
                          <span className="text-sm text-gray-900">
                            {formatDate((selectedItem.data as CurrentlyReading).dueDate!)}
                          </span>
                        </div>
                      )}

                      {/* 메모 */}
                      {(selectedItem.data as CurrentlyReading).memo && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">메모</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {(selectedItem.data as CurrentlyReading).memo}
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

                  {/* 읽다 만 책의 경우 중단일과 메모 표시 */}
                  {selectedItem.type === 'droppedBook' && (
                    <>
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">중단일: </span>
                        <span className="text-sm text-gray-900">
                          {formatDate((selectedItem.data as DroppedBook).createdAt)}
                        </span>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">진행률: </span>
                        <span className="text-sm text-gray-900">
                          {(selectedItem.data as DroppedBook).progressPercentage || 0}%
                        </span>
                        {/* 진행률 바 표시 */}
                        <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-2 ${getProgressColor((selectedItem.data as DroppedBook).progressPercentage || 0)}`}
                            style={{ width: `${(selectedItem.data as DroppedBook).progressPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                      {/* 중단 이유 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">중단 이유</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {(selectedItem.data as DroppedBook).dropReason || '중단 이유 없음'}
                        </p>
                      </div>
                    </>
                  )}

                  {/* 읽고 싶은 책의 경우 읽는 중 버튼을 오른쪽 아래에 배치 */}
                  {selectedItem.type === 'wishlist' && (
                    <div className="absolute bottom-0 right-0">
                      <button
                        onClick={() => handleStartReading(selectedItem.data as Wishlist)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        읽는 중
                      </button>
                    </div>
                  )}

                  {/* 읽고 있는 책의 경우 읽기 완료 버튼과 그만 읽기 버튼을 오른쪽 아래에 배치 */}
                  {selectedItem.type === 'currentlyReading' && (
                    <div className="absolute bottom-0 right-0 flex gap-2">
                      <button
                        onClick={() => handleDropBook(selectedItem.data as CurrentlyReading)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        그만 읽기
                      </button>
                      <button
                        onClick={() => handleMarkAsRead(selectedItem.data as CurrentlyReading)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        읽기 완료
                      </button>
                    </div>
                  )}

                  {/* 읽다 만 책의 경우 읽는 중 버튼을 오른쪽 아래에 배치 */}
                  {selectedItem.type === 'droppedBook' && (
                    <div className="absolute bottom-0 right-0">
                      <button
                        onClick={() => handleResumeReading(selectedItem.data as DroppedBook)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        다시 읽기
                      </button>
                    </div>
                  )}

                  {/* 수정/삭제 버튼 */}
                  <div className="flex gap-2 mt-6">
                    <a
                      href={selectedItem.type === 'book'
                        ? `/books/edit/${(selectedItem.data as Book).id}`
                        : selectedItem.type === 'currentlyReading'
                        ? `/currently-reading/edit/${(selectedItem.data as CurrentlyReading).id}`
                        : selectedItem.type === 'droppedBook'
                        ? `/dropped-books/edit/${(selectedItem.data as DroppedBook).id}`
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

      {/* 읽는 중 모달 */}
      {showCurrentlyReadingModal && selectedItem && selectedItem.type === 'wishlist' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">읽는 중으로 이동</h2>
                <button
                  onClick={closeCurrentlyReadingModal}
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

              {/* 읽기 형태 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  읽기 형태 *
                </label>
                <select
                  value={currentlyReadingFormData.readingType}
                  onChange={(e) => setCurrentlyReadingFormData(prev => ({ ...prev, readingType: e.target.value as ReadingType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대여 종료일
                </label>
                <input
                  type="date"
                  value={currentlyReadingFormData.dueDate}
                  onChange={(e) => setCurrentlyReadingFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* 진행률 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진행률: {currentlyReadingFormData.progressPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentlyReadingFormData.progressPercentage}
                  onChange={(e) => setCurrentlyReadingFormData(prev => ({ ...prev, progressPercentage: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${currentlyReadingFormData.progressPercentage}%, #e5e7eb ${currentlyReadingFormData.progressPercentage}%, #e5e7eb 100%)`
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



              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={closeCurrentlyReadingModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleStartReadingSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  읽는 중으로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 그만 읽기 모달 */}
      {showDropBookModal && selectedItem && selectedItem.type === 'currentlyReading' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">그만 읽기</h2>
                <button
                  onClick={closeDropBookModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 책 정보 */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={(selectedItem.data as CurrentlyReading).coverImage || '/default-book-cover.jpg'}
                    alt={(selectedItem.data as CurrentlyReading).title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(selectedItem.data as CurrentlyReading).title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(selectedItem.data as CurrentlyReading).author || '저자 미상'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 진행률 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  중단 시 진행률: {dropBookFormData.progressPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dropBookFormData.progressPercentage}
                  onChange={(e) => setDropBookFormData(prev => ({ ...prev, progressPercentage: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${dropBookFormData.progressPercentage}%, #e5e7eb ${dropBookFormData.progressPercentage}%, #e5e7eb 100%)`
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

              {/* 중단 이유 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  중단 이유 *
                </label>
                <textarea
                  value={dropBookFormData.dropReason}
                  onChange={(e) => setDropBookFormData(prev => ({ ...prev, dropReason: e.target.value }))}
                  placeholder="이 책을 그만 읽게 된 이유를 적어보세요..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>


              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={closeDropBookModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDropBookSubmit}
                  disabled={!dropBookFormData.dropReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  그만 읽기로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 읽기 완료 모달 */}
      {showCompleteModal && selectedItem && selectedItem.type === 'currentlyReading' && (
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
                    src={(selectedItem.data as CurrentlyReading).coverImage || '/default-book-cover.jpg'}
                    alt={(selectedItem.data as CurrentlyReading).title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(selectedItem.data as CurrentlyReading).title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(selectedItem.data as CurrentlyReading).author || '저자 미상'}
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