import React from 'react';
import { Book } from '../../types/book';
import { Wishlist } from '../../types/wishlist';
import { CurrentlyReading } from '../../types';
import { DroppedBook } from '../../types/droppedBook';

interface BookGridProps {
  filteredItems: Array<{ 
    type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', 
    data: Book | Wishlist | CurrentlyReading | DroppedBook 
  }>;
  onItemClick: (item: { 
    type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', 
    data: Book | Wishlist | CurrentlyReading | DroppedBook 
  }) => void;
  loadingMore: boolean;
  hasMore: boolean;
}

const BookGrid: React.FC<BookGridProps> = ({ 
  filteredItems, 
  onItemClick, 
  loadingMore, 
  hasMore 
}) => {
  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-gray-500 text-lg mb-4">
          책이 없습니다.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
      </div>
    );
  }

  return (
    <>
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
              onClick={() => onItemClick(item)}
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
                    {isBook ? '완독 ✅' : isCurrentlyReading ? '읽는 중 📖' : isDroppedBook ? '읽다 만 ⏳' : '읽고 싶은 📚'}
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
      
      {/* 무한 스크롤 로딩 표시 */}
      {loadingMore && (
        <div className="text-center py-6">
          <div className="text-gray-500">더 많은 책을 불러오는 중...</div>
        </div>
      )}
      
      {/* 더 이상 로드할 데이터가 없을 때 */}
      {!hasMore && filteredItems.length > 0 && (
        <div className="text-center py-6">
          <div className="text-gray-400 text-sm">모든 책을 불러왔습니다</div>
        </div>
      )}
    </>
  );
};

export default BookGrid;
