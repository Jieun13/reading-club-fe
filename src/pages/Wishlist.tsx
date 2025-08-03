import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { wishlistApi } from '../api/wishlists';
import { Wishlist } from '../types/wishlist';
import Loading from '../components/common/Loading';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.getWishlists(0, 100);
      setWishlists(response.data.data.content);
    } catch (error) {
      console.error('위시리스트를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWishlist = async (wishlistId: number) => {
    if (!window.confirm('정말로 이 책을 위시리스트에서 삭제하시겠습니까?')) {
      return;
    }

    try {
      await wishlistApi.deleteWishlist(wishlistId);
      alert('위시리스트에서 성공적으로 삭제되었습니다.');
      fetchWishlists(); // 목록 새로고침
    } catch (error) {
      console.error('위시리스트 삭제에 실패했습니다:', error);
      alert('위시리스트 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 필터링된 위시리스트
  const filteredWishlists = wishlists.filter(wishlist => {
    const matchesSearch = !searchTerm || 
      wishlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wishlist.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Loading size="lg" text="위시리스트를 불러오는 중..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0 flex items-center">
          <HeartIconSolid className="w-8 h-8 text-red-500 mr-3" />
          북킷리스트
        </h1>
        <Link
          to="/wishlist/add"
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          책 추가
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색 */}
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

        </div>
      </div>

      {/* 위시리스트 목록 */}
      {filteredWishlists.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {wishlists.length === 0 ? '아직 위시리스트가 비어있습니다' : '검색 결과가 없습니다'}
          </h3>
          <p className="text-gray-500 mb-6">
            {wishlists.length === 0 
              ? '읽고 싶은 책을 추가해보세요!' 
              : '다른 검색어를 시도해보세요.'
            }
          </p>
          {wishlists.length === 0 && (
            <Link to="/wishlist/add" className="btn btn-primary">
              첫 번째 책 추가하기
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishlists.map((wishlist) => (
            <div key={wishlist.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {wishlist.coverImage ? (
                    <img
                      src={wishlist.coverImage}
                      alt={wishlist.title}
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
                      {wishlist.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{wishlist.author || '저자 미상'}</p>
                    {wishlist.memo && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        💭 {wishlist.memo}
                      </p>
                    )}
                    {wishlist.publisher && (
                      <p className="text-xs text-gray-500">
                        출판사: {wishlist.publisher}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <div>추가일: {new Date(wishlist.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/wishlist/edit/${wishlist.id}`)}
                        className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded border border-primary-200 hover:border-primary-300 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteWishlist(wishlist.id)}
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
      {wishlists.length > 0 && (
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">위시리스트 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {wishlists.length}
              </div>
              <div className="text-sm text-gray-600">전체</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
