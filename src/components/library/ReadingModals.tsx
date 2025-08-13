import React from 'react';
import { Wishlist } from '../../types/wishlist';
import { CurrentlyReading } from '../../types';
import { ReadingType } from '../../types/droppedBook';

interface ReadingModalsProps {
  showCurrentlyReadingModal: boolean;
  showCompleteModal: boolean;
  showDropBookModal: boolean;
  selectedItem: { 
    type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', 
    data: any 
  } | null;
  currentlyReadingFormData: {
    readingType: ReadingType;
    dueDate: string;
    progressPercentage: number;
    memo: string;
  };
  completeFormData: {
    rating: number;
    review: string;
    finishedDate: string;
  };
  dropBookFormData: {
    dropReason: string;
    progressPercentage: number;
  };
  onCloseCurrentlyReadingModal: () => void;
  onCloseCompleteModal: () => void;
  onCloseDropBookModal: () => void;
  onStartReadingSubmit: () => void;
  onCompleteSubmit: () => void;
  onDropBookSubmit: () => void;
  onCurrentlyReadingFormDataChange: (data: Partial<ReadingModalsProps['currentlyReadingFormData']>) => void;
  onCompleteFormDataChange: (data: Partial<ReadingModalsProps['completeFormData']>) => void;
  onDropBookFormDataChange: (data: Partial<ReadingModalsProps['dropBookFormData']>) => void;
}

const ReadingModals: React.FC<ReadingModalsProps> = ({
  showCurrentlyReadingModal,
  showCompleteModal,
  showDropBookModal,
  selectedItem,
  currentlyReadingFormData,
  completeFormData,
  dropBookFormData,
  onCloseCurrentlyReadingModal,
  onCloseCompleteModal,
  onCloseDropBookModal,
  onStartReadingSubmit,
  onCompleteSubmit,
  onDropBookSubmit,
  onCurrentlyReadingFormDataChange,
  onCompleteFormDataChange,
  onDropBookFormDataChange
}) => {
  const getReadingTypeDisplay = (type: string) => {
    switch (type) {
      case 'PAPER_BOOK': return '종이책 소장';
      case 'LIBRARY_RENTAL': return '도서관 대여';
      case 'MILLIE': return '밀리의 서재';
      case 'E_BOOK': return '전자책 소장';
      default: return type;
    }
  };

  return (
    <>
      {/* 읽는 중 모달 */}
      {showCurrentlyReadingModal && selectedItem && selectedItem.type === 'wishlist' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">읽는 중으로 이동</h2>
                <button
                  onClick={onCloseCurrentlyReadingModal}
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
                  onChange={(e) => onCurrentlyReadingFormDataChange({ readingType: e.target.value as ReadingType })}
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
                  onChange={(e) => onCurrentlyReadingFormDataChange({ dueDate: e.target.value })}
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
                  onChange={(e) => onCurrentlyReadingFormDataChange({ progressPercentage: parseInt(e.target.value) })}
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
                  onClick={onCloseCurrentlyReadingModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={onStartReadingSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  읽는 중으로 이동
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
                  onClick={onCloseCompleteModal}
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
                      onClick={() => onCompleteFormDataChange({ rating: star })}
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
                  onChange={(e) => onCompleteFormDataChange({ finishedDate: e.target.value })}
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
                  onChange={(e) => onCompleteFormDataChange({ review: e.target.value })}
                  placeholder="이 책에 대한 한줄평을 작성해주세요..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={onCloseCompleteModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={onCompleteSubmit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  완독 등록
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
                  onClick={onCloseDropBookModal}
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
                  onChange={(e) => onDropBookFormDataChange({ progressPercentage: parseInt(e.target.value) })}
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
                  onChange={(e) => onDropBookFormDataChange({ dropReason: e.target.value })}
                  placeholder="이 책을 그만 읽게 된 이유를 적어보세요..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={onCloseDropBookModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={onDropBookSubmit}
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
    </>
  );
};

export default ReadingModals;
