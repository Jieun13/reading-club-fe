import React from 'react';
import { Book } from '../../types/book';
import { Wishlist } from '../../types/wishlist';
import { CurrentlyReading } from '../../types';
import { DroppedBook } from '../../types/droppedBook';

interface BookModalProps {
  selectedItem: { 
    type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', 
    data: Book | Wishlist | CurrentlyReading | DroppedBook 
  } | null;
  showModal: boolean;
  onClose: () => void;
  onDelete: (item: { 
    type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', 
    data: Book | Wishlist | CurrentlyReading | DroppedBook 
  }) => void;
  onStartReading: (wishlistItem: Wishlist) => void;
  onMarkAsRead: (currentlyReadingItem: CurrentlyReading) => void;
  onDropBook: (currentlyReadingItem: CurrentlyReading) => void;
  onResumeReading: (droppedBook: DroppedBook) => void;
}

const BookModal: React.FC<BookModalProps> = ({
  selectedItem,
  showModal,
  onClose,
  onDelete,
  onStartReading,
  onMarkAsRead,
  onDropBook,
  onResumeReading
}) => {
  if (!showModal || !selectedItem) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
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

  return (
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
              onClick={onClose}
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
                    onClick={() => onStartReading(selectedItem.data as Wishlist)}
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
                    onClick={() => onDropBook(selectedItem.data as CurrentlyReading)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    그만 읽기
                  </button>
                  <button
                    onClick={() => onMarkAsRead(selectedItem.data as CurrentlyReading)}
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
                    onClick={() => onResumeReading(selectedItem.data as DroppedBook)}
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
                  onClick={() => onDelete(selectedItem)}
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
  );
};

export default BookModal;
