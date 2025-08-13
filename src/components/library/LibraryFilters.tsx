import React from 'react';

enum LibraryFilter {
  ALL = 'ALL',
  COMPLETED = 'COMPLETED',
  CURRENTLY_READING = 'CURRENTLY_READING',
  WISHLIST = 'WISHLIST',
  DROPPED = 'DROPPED'
}

interface LibraryFiltersProps {
  filter: LibraryFilter;
  setFilter: (filter: LibraryFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
  booksCount: number;
  currentlyReadingCount: number;
  wishlistCount: number;
  droppedBooksCount: number;
  showAddBookDropdown: boolean;
  setShowAddBookDropdown: (show: boolean) => void;
}

const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  ratingFilter,
  setRatingFilter,
  booksCount,
  currentlyReadingCount,
  wishlistCount,
  droppedBooksCount,
  showAddBookDropdown,
  setShowAddBookDropdown
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* 첫 번째 줄: 전체, 검색 */}
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
              전체 ({booksCount + currentlyReadingCount + wishlistCount + droppedBooksCount})
            </button>
          </div>
          {/* 검색 */}
          <div className="flex justify-end">
            <input
              type="text"
              placeholder="책 제목이나 저자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* 두 번째 줄: 기본 필터 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(LibraryFilter.COMPLETED)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === LibraryFilter.COMPLETED
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              완독한 책 ({booksCount})
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
              읽고 있는 책 ({currentlyReadingCount})
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
              읽고 싶은 책 ({wishlistCount})
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
              읽다 만 책 ({droppedBooksCount})
            </button>
          </div>
          
          {/* 책 추가 버튼들 */}
          <div className="relative">
            <button
              onClick={() => setShowAddBookDropdown(!showAddBookDropdown)}
              className="inline-flex items-center justify-center bg-green-600 text-white w-20 h-10 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              책 추가
            </button>
            {showAddBookDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200 sm:right-0 right-auto left-0">
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

        {/* 세 번째 줄: 별점 필터 (완독한 책 필터가 선택된 경우에만 표시) */}
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
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryFilters;
