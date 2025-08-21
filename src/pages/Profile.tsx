import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, 
  PencilIcon,
  BookOpenIcon,
  StarIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';
import { userApi } from '../api/user';
import { bookApi } from '../api/books';
import { currentlyReadingApi } from '../api/currentlyReading';
import { droppedBooksApi } from '../api/droppedBooks';
import { wishlistApi } from '../api/wishlists';
import { convertToHttps, handleImageError } from '../utils/imageUtils';
import { Book } from '../types/book';
import { CurrentlyReading } from '../types';
import { DroppedBook } from '../types/droppedBook';
import { Wishlist } from '../types/wishlist';
import BookModal from '../components/library/BookModal';

const Profile: React.FC = () => {
  const { user, logout, updateUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 통계 및 책 데이터 상태
  const [books, setBooks] = useState<Book[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<CurrentlyReading[]>([]);
  const [droppedBooks, setDroppedBooks] = useState<DroppedBook[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Wishlist[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // 모달 상태
  const [selectedItem, setSelectedItem] = useState<{ type: 'book' | 'wishlist' | 'currentlyReading' | 'droppedBook', data: Book | Wishlist | CurrentlyReading | DroppedBook } | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
    } else {
      setNickname('');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStatsData();
    }
  }, [user]);

  const fetchStatsData = async () => {
    try {
      setStatsLoading(true);
      const [booksResponse, currentlyReadingResponse, droppedBooksResponse, wishlistResponse] = await Promise.all([
        bookApi.getBooks(0, 100),
        currentlyReadingApi.getCurrentlyReading(0, 10),
        droppedBooksApi.getDroppedBooks(0, 10),
        wishlistApi.getWishlists(0, 10)
      ]);
      
      setBooks(booksResponse.data.data.content);
      setCurrentlyReading(currentlyReadingResponse.data.content);
      setDroppedBooks(droppedBooksResponse.data.content);
      setWishlistItems(wishlistResponse.data.data.content);
    } catch (error) {
      console.error('통계 데이터를 불러오는데 실패했습니다:', error);
    } finally {
      setStatsLoading(false);
    }
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
    // 삭제 로직은 여기서는 구현하지 않음 (프로필 페이지에서는 읽기 전용)
    closeModal();
  };

  const handleStartReading = (wishlistItem: Wishlist) => {
    // 읽기 시작 로직은 여기서는 구현하지 않음
    closeModal();
  };

  const handleMarkAsRead = (currentlyReadingItem: CurrentlyReading) => {
    // 읽기 완료 로직은 여기서는 구현하지 않음
    closeModal();
  };

  const handleDropBook = (currentlyReadingItem: CurrentlyReading) => {
    // 책 중단 로직은 여기서는 구현하지 않음
    closeModal();
  };

  const handleResumeReading = (droppedBook: DroppedBook) => {
    // 다시 읽기 로직은 여기서는 구현하지 않음
    closeModal();
  };

  if (isLoading) {
    return <div className="container py-8 text-gray-400">로딩 중...</div>;
  }
  if (!user) {
    return <div className="container py-8 text-gray-400">유저 정보를 불러올 수 없습니다.</div>;
  }

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      try {
        setIsLoggingOut(true);
        await authApi.logout();
        logout();
      } catch (error) {
        console.error('로그아웃 중 오류가 발생했습니다:', error);
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  const handleNicknameUpdate = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    if (nickname === user?.nickname) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await userApi.updateProfile({ nickname });
      updateUser(response.data.data);
      setIsEditing(false);
      alert('닉네임이 성공적으로 변경되었습니다.');
    } catch (error: any) {
      console.error('닉네임 변경 실패:', error);
      const errorMessage = error.response?.data?.message || '닉네임 변경에 실패했습니다.';
      alert(errorMessage);
      setNickname(user?.nickname || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setNickname(user?.nickname || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 통계 계산
  const totalBooks = books.length;
  const averageRating = totalBooks > 0 
    ? (books.reduce((sum, book) => sum + book.rating, 0) / totalBooks).toFixed(1)
    : '0';
  const thisYearCount = books.filter(book => 
    new Date(book.finishedDate).getFullYear() === new Date().getFullYear()
  ).length;

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">프로필 설정</h1>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className="w-5 h-5 inline mr-2" />
                프로필 정보
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5 inline mr-2" />
                계정 설정
              </button>
            </nav>
          </div>

          {/* 탭 내용 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* 프로필 이미지 및 기본 정보 */}
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {user?.profileImage ? (
                      <img
                        src={convertToHttps(user.profileImage)}
                        alt="프로필"
                        className="w-24 h-24 rounded-full object-cover"
                        onError={(e) => handleImageError(e)}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="text-2xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none bg-transparent"
                            maxLength={20}
                          />
                          <button
                            onClick={handleNicknameUpdate}
                            disabled={isUpdating}
                            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                          >
                            {isUpdating ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <h2 className="text-2xl font-bold text-gray-900">{user?.nickname}</h2>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="닉네임 수정"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">
                      가입일: {user?.createdAt ? formatDate(user.createdAt) : '정보 없음'}
                    </p>
                  </div>
                </div>

                {/* 통계 요약 */}
                {!statsLoading && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">독서 현황</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {totalBooks}
                        </div>
                        <div className="text-sm text-gray-600">전체 책</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {averageRating}
                        </div>
                        <div className="text-sm text-gray-600">평균 별점</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentlyReading.length}
                        </div>
                        <div className="text-sm text-gray-600">읽고 있는 책</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {thisYearCount}
                        </div>
                        <div className="text-sm text-gray-600">올해 완독</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 읽고 있는 책 */}
                {!statsLoading && currentlyReading.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">읽고 있는 책</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentlyReading.map((book) => (
                        <div 
                          key={book.id} 
                          className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleItemClick({ type: 'currentlyReading', data: book })}
                        >
                          {book.coverImage ? (
                            <img
                              src={convertToHttps(book.coverImage)}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpenIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                              {book.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">{book.author || '저자 미상'}</p>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-500">
                                진행률: {book.progressPercentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 읽다 만 책 */}
                {!statsLoading && droppedBooks.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">읽다 만 책</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {droppedBooks.map((book) => (
                        <div 
                          key={book.id} 
                          className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleItemClick({ type: 'droppedBook', data: book })}
                        >
                          {book.coverImage ? (
                            <img
                              src={convertToHttps(book.coverImage)}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpenIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                              {book.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">{book.author || '저자 미상'}</p>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-500">
                                진행률: {book.progressPercentage || 0}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 읽고 싶은 책 */}
                {!statsLoading && wishlistItems.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">읽고 싶은 책</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistItems.map((book) => (
                        <div 
                          key={book.id} 
                          className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleItemClick({ type: 'wishlist', data: book })}
                        >
                          {book.coverImage ? (
                            <img
                              src={convertToHttps(book.coverImage)}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpenIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                              {book.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">{book.author || '저자 미상'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900 mb-4">계정 관리</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-2">로그아웃</h4>
                      <p className="text-sm text-red-600 mb-3">
                        현재 세션에서 로그아웃합니다. 다시 로그인하려면 카카오 계정으로 인증해야 합니다.
                      </p>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 책 모달 */}
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
      </div>
    </div>
  );
};

export default Profile;
