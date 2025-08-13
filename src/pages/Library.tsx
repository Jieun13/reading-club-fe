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
import LibraryFilters from '../components/library/LibraryFilters';
import BookGrid from '../components/library/BookGrid';
import BookModal from '../components/library/BookModal';
import ReadingModals from '../components/library/ReadingModals';

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
  
  // 무한 스크롤 관련 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
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

  // 무한 스크롤을 위한 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, hasMore, loadingMore]);

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

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await fetchData(currentPage + 1, true);
  };

  const fetchData = async (page: number = 0, append: boolean = false) => {
    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // 개별 API를 사용하여 각 상태별로 데이터 조회 (20권씩 페이지네이션)
      const [booksResponse, wishlistResponse, currentlyReadingResponse, droppedBooksResponse] = await Promise.all([
        bookApi.getMyBooks({ page, size: 20 }),
        wishlistApi.getWishlists(page, 20),
        currentlyReadingApi.getCurrentlyReading(page, 20),
        droppedBooksApi.getDroppedBooks(page, 20)
      ]);
      
      const newBooks = booksResponse.data.content || [];
      const newWishlistItems = wishlistResponse.data.data.content || [];
      const newCurrentlyReading = currentlyReadingResponse.data.content || [];
      const newDroppedBooks = droppedBooksResponse.data.content || [];
      
      if (append) {
        // 추가 로드인 경우 기존 데이터에 추가
        setBooks(prev => [...prev, ...newBooks]);
        setWishlistItems(prev => [...prev, ...newWishlistItems]);
        setCurrentlyReading(prev => [...prev, ...newCurrentlyReading]);
        setDroppedBooks(prev => [...prev, ...newDroppedBooks]);
      } else {
        // 초기 로드인 경우 기존 데이터 교체
        setBooks(newBooks);
        setWishlistItems(newWishlistItems);
        setCurrentlyReading(newCurrentlyReading);
        setDroppedBooks(newDroppedBooks);
      }
      
      // 더 로드할 데이터가 있는지 확인
      const hasMoreBooks = !booksResponse.data.last;
      const hasMoreWishlists = !wishlistResponse.data.data.last;
      const hasMoreCurrentlyReading = !currentlyReadingResponse.data.last;
      const hasMoreDroppedBooks = !droppedBooksResponse.data.last;
      
      setHasMore(hasMoreBooks || hasMoreWishlists || hasMoreCurrentlyReading || hasMoreDroppedBooks);
      setCurrentPage(page);
      
    } catch (error) {
      // 데이터 조회 실패
      alert('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getFilteredItems = () => {
    let items: Array<{ type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: Book | Wishlist | CurrentlyReading | DroppedBook }> = [];
    
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
    
    if (filter === LibraryFilter.ALL || filter === LibraryFilter.CURRENTLY_READING) {
      items = items.concat(
        currentlyReading.map(book => ({ type: 'currentlyReading' as const, data: book }))
      );
    }
    
    if (filter === LibraryFilter.ALL || filter === LibraryFilter.WISHLIST) {
      items = items.concat(
        wishlistItems.map(item => ({ type: 'wishlist' as const, data: item }))
      );
    }

    if (filter === LibraryFilter.ALL || filter === LibraryFilter.DROPPED) {
      items = items.concat(
        droppedBooks.map(book => ({ type: 'droppedBook' as const, data: book }))
      );
    }

    // 검색 필터링
    if (searchTerm) {
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
    }

    return items;
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
    setDropBookFormData({
      dropReason: '',
      progressPercentage: currentlyReadingItem.progressPercentage
    });
    setShowDropBookModal(true);
  };

  // 그만 읽기 모달에서 제출 처리
  const handleDropBookSubmit = async () => {
    if (!selectedItem || selectedItem.type !== 'currentlyReading') {
      return;
    }
    
    const currentlyReadingItem = selectedItem.data as CurrentlyReading;
    
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
      
      const newDroppedBookResponse = await droppedBooksApi.createDroppedBook(droppedBookData);
      
      // 읽고 있는 책에서 삭제
      await currentlyReadingApi.deleteCurrentlyReading(currentlyReadingItem.id);
      
      // 데이터 완전 새로고침
      await fetchData();
      
      // 모달들 닫기
      setShowDropBookModal(false);
      closeModal();
      alert('읽다 만 책으로 이동되었습니다!');
    } catch (error) {
      alert('읽다 만 책 추가에 실패했습니다. 다시 시도해주세요.');
    }
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
      alert('읽기를 재개하는데 실패했습니다. 다시 시도해주세요.');
    }
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
      <LibraryFilters
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        booksCount={books.length}
        currentlyReadingCount={currentlyReading.length}
        wishlistCount={wishlistItems.length}
        droppedBooksCount={droppedBooks.length}
        showAddBookDropdown={showAddBookDropdown}
        setShowAddBookDropdown={setShowAddBookDropdown}
      />

      {/* 책 목록 */}
      <BookGrid
        filteredItems={filteredItems}
        onItemClick={handleItemClick}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />

      {/* 상세 보기 모달 */}
      <BookModal
        selectedItem={selectedItem}
        showModal={showModal}
        onClose={closeModal}
        onDelete={handleDelete}
        onStartReading={handleStartReading}
        onMarkAsRead={handleMarkAsRead}
        onDropBook={handleDropBook}
        onResumeReading={handleResumeReading}
      />

      {/* 읽기 관련 모달들 */}
      <ReadingModals
        showCurrentlyReadingModal={showCurrentlyReadingModal}
        showCompleteModal={showCompleteModal}
        showDropBookModal={showDropBookModal}
        selectedItem={selectedItem}
        currentlyReadingFormData={currentlyReadingFormData}
        completeFormData={completeFormData}
        dropBookFormData={dropBookFormData}
        onCloseCurrentlyReadingModal={closeCurrentlyReadingModal}
        onCloseCompleteModal={closeCompleteModal}
        onCloseDropBookModal={closeDropBookModal}
        onStartReadingSubmit={handleStartReadingSubmit}
        onCompleteSubmit={handleCompleteSubmit}
        onDropBookSubmit={handleDropBookSubmit}
        onCurrentlyReadingFormDataChange={(data) => setCurrentlyReadingFormData(prev => ({ ...prev, ...data }))}
        onCompleteFormDataChange={(data) => setCompleteFormData(prev => ({ ...prev, ...data }))}
        onDropBookFormDataChange={(data) => setDropBookFormData(prev => ({ ...prev, ...data }))}
      />
    </div>
  );
};

export default Library;