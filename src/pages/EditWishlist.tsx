import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/outline';
import { wishlistApi } from '../api/wishlists';
import { Wishlist, WishlistUpdateRequest } from '../types/wishlist';
import Loading from '../components/common/Loading';

const EditWishlist: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<WishlistUpdateRequest>({
    title: '',
    author: '',
    coverImage: '',
    publisher: '',
    publishedDate: '',
    description: '',
    memo: ''
  });

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        const response = await wishlistApi.getWishlist(Number(id));
        const wishlistData = response.data.data;
        setWishlist(wishlistData);
        setFormData({
          title: wishlistData.title,
          author: wishlistData.author || '',
          coverImage: wishlistData.coverImage || '',
          publisher: wishlistData.publisher || '',
          publishedDate: wishlistData.publishedDate || '',
          description: wishlistData.description || '',
          memo: wishlistData.memo || ''
        });
      } catch (error) {
        console.error('위시리스트 정보 로드 실패:', error);
        alert('위시리스트 정보를 불러오는데 실패했습니다.');
        navigate('/library');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadWishlist();
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('책 제목을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData: WishlistUpdateRequest = {
        title: formData.title.trim(),
        author: formData.author?.trim() || '',
        coverImage: formData.coverImage?.trim() || '',
        publisher: formData.publisher?.trim() || '',
        publishedDate: formData.publishedDate?.trim() || '',
        description: formData.description?.trim() || '',
        memo: formData.memo?.trim() || ''
      };

      await wishlistApi.updateWishlist(Number(id), updateData);
      alert('위시리스트가 성공적으로 수정되었습니다!');
      navigate('/library');
    } catch (error) {
      console.error('위시리스트 수정에 실패했습니다:', error);
      alert('위시리스트 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!wishlist) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">위시리스트를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">읽고 싶은 책 수정</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 책 표지 */}
          {formData.coverImage && (
            <div className="flex justify-center mb-6">
              <img
                src={formData.coverImage}
                alt={formData.title}
                className="w-32 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* 책 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              책 제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 저자 */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              저자
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 메모 */}
          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이 책에 대한 메모를 작성해주세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWishlist;
