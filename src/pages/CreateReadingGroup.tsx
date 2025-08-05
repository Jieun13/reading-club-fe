import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, ArrowLeftIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { readingGroupApi } from '../api/readingGroups';
import { bookApi } from '../api/books';
import { BookSearchResult } from '../types/book';
import { CreateReadingGroupRequest } from '../types/readingGroup';
import Loading from '../components/common/Loading';

interface ReadingGroupFormData {
  // 책 정보
  bookTitle: string;
  bookAuthor: string;
  bookCoverImage: string;
  bookPublisher: string;
  bookPublishedDate: string;
  bookDescription: string;

  // 모임 설정
  maxMembers: number;
  description: string;
  isPublic: boolean;
  hasAssignment: boolean;
}

const CreateReadingGroup: React.FC = () => {
  const navigate = useNavigate();

  // 책 검색 관련
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);

  // 폼 데이터
  const [formData, setFormData] = useState<ReadingGroupFormData>({
    bookTitle: '',
    bookAuthor: '',
    bookCoverImage: '',
    bookPublisher: '',
    bookPublishedDate: '',
    bookDescription: '',

    maxMembers: 10,
    description: '',
    isPublic: true,
    hasAssignment: false,
  });

  const [saving, setSaving] = useState(false);

  // 책 검색 함수
  const handleBookSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      const response = await bookApi.searchBooks(searchTerm, 20);
      if (response.data.data && Array.isArray(response.data.data)) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('책 검색 실패:', error);
      alert('책 검색에 실패했습니다. 다시 시도해주세요.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // 책 선택 함수
  const handleBookSelect = (book: BookSearchResult) => {
    setSelectedBook(book);
    setFormData(prev => ({
      ...prev,
      bookTitle: book.title,
      bookAuthor: book.author || '',
      bookCoverImage: book.cover || '',
      bookPublisher: book.publisher || '',
      bookPublishedDate: book.pubDate || '',
      bookDescription: book.description || ''
    }));
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bookTitle.trim()) {
      alert('책 제목을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      alert('모임 설명을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);

      const requestData: CreateReadingGroupRequest = {
        name: `${formData.bookTitle} 독서 모임`,
        description: formData.description,
        maxMembers: formData.maxMembers,
        isPublic: formData.isPublic,
        hasAssignment: formData.hasAssignment,
        bookTitle: formData.bookTitle,
        bookAuthor: formData.bookAuthor,
        bookCoverImage: formData.bookCoverImage,
        bookPublisher: formData.bookPublisher,
        bookPublishedDate: formData.bookPublishedDate,
        bookDescription: formData.bookDescription,
      };

      const response = await readingGroupApi.createGroup(requestData);
      
      if (response.data.success) {
        alert('독서 모임이 생성되었습니다!');
        navigate(`/reading-groups/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('모임 생성 실패:', error);
      alert('모임 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.bookTitle.trim() &&
      formData.description.trim() &&
      formData.maxMembers > 0
    );
  };

  return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center mb-8">
            <button
                onClick={() => navigate('/reading-groups')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-8 h-8 text-primary-600 mr-3" />
              독서 모임 만들기
            </h1>
            <p className="text-gray-600 mt-2">책을 선택하고 일회성 독서 모임을 만들어보세요</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!selectedBook ? (
                <>
                  {/* 1단계: 함께 읽을 책 선택 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">1단계: 함께 읽을 책 선택</h2>

                    {/* 여기서 form 대신 div로 바꿈 */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="함께 읽고 싶은 책을 검색하세요... (알라딘 도서 검색)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            disabled={searching}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBookSearch(e);
                              }
                            }}
                        />
                      </div>
                      <button
                          type="button"  // submit → button 변경
                          disabled={searching || !searchTerm.trim()}
                          className="btn btn-primary whitespace-nowrap"
                          onClick={handleBookSearch}  // 클릭 시 검색 실행
                      >
                        {searching ? '검색 중...' : '검색'}
                      </button>
                    </div>

                    {searching && (
                        <div className="text-center py-8">
                          <Loading size="md" text="책을 검색하는 중..." />
                        </div>
                    )}

                    {searchResults.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">검색 결과</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                            {searchResults.map((book, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
                                    onClick={() => handleBookSelect(book)}
                                >
                                  {book.cover ? (
                                      <img
                                          src={book.cover}
                                          alt={book.title}
                                          className="w-16 h-20 object-cover rounded flex-shrink-0"
                                      />
                                  ) : (
                                      <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                        <BookOpenIcon className="w-8 h-8 text-gray-400" />
                                      </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                                      {book.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-2">{book.author || '저자 미상'}</p>
                                    {book.publisher && (
                                        <p className="text-xs text-gray-500 mb-2">
                                          {book.publisher} {book.pubDate && `· ${book.pubDate}`}
                                        </p>
                                    )}
                                    {book.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{book.description}</p>
                                    )}
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}
                  </div>
                </>
            ) : (
                <>
                  {/* 2단계: 모임 설정 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">선택된 책</h2>
                      <button
                          type="button"
                          onClick={() => {
                            setSelectedBook(null);
                            setFormData(prev => ({
                              ...prev,
                              bookTitle: '',
                              bookAuthor: '',
                              bookCoverImage: '',
                              bookPublisher: '',
                              bookPublishedDate: '',
                              bookDescription: '',
                              maxMembers: 10,
                              description: '',
                              isPublic: true,
                              hasAssignment: false,
                            }));
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        다른 책 선택
                      </button>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      {selectedBook.cover ? (
                          <img
                              src={selectedBook.cover}
                              alt={selectedBook.title}
                              className="w-20 h-28 object-cover rounded flex-shrink-0"
                          />
                      ) : (
                          <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <BookOpenIcon className="w-10 h-10 text-gray-400" />
                          </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{selectedBook.title}</h3>
                        <p className="text-gray-600 mb-2">{selectedBook.author || '저자 미상'}</p>
                        {selectedBook.publisher && (
                            <p className="text-sm text-gray-500 mb-2">
                              {selectedBook.publisher} {selectedBook.pubDate && `· ${selectedBook.pubDate}`}
                            </p>
                        )}
                        <div className="text-sm text-primary-600 font-medium">✓ 모임 이름: "{selectedBook.title}"</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">2단계: 모임 설정</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 최대 참여자 수 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">최대 참여자 수</label>
                        <select
                            value={formData.maxMembers}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {[3, 4, 5, 6, 8, 10, 12, 15, 20].map(num => (
                              <option key={num} value={num}>
                                {num}명
                              </option>
                          ))}
                        </select>
                      </div>

                      {/* 공개 설정 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">공개 설정</label>
                        <select
                            value={formData.isPublic ? 'public' : 'private'}
                            onChange={(e) =>
                                setFormData(prev => ({ ...prev, isPublic: e.target.value === 'public' }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="public">공개 모임</option>
                          <option value="private">비공개 모임</option>
                        </select>
                      </div>

                      {/* 과제 여부 */}
                      <div className="md:col-span-2">
                        <label className="inline-flex items-center">
                          <input
                              type="checkbox"
                              checked={formData.hasAssignment}
                              onChange={(e) => setFormData(prev => ({ ...prev, hasAssignment: e.target.checked }))}
                              className="form-checkbox"
                          />
                          <span className="ml-2 text-gray-700">모임 전 과제 있음 (책 읽기 및 리뷰 작성)</span>
                        </label>
                      </div>

                      {/* 모임 설명 */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          모임 설명 (선택사항)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            placeholder={`${selectedBook.title}에 대해 함께 이야기하는 독서 모임입니다. 어떤 내용을 중점적으로 다룰지, 준비사항이 있는지 등을 적어주세요.`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            maxLength={1000}
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000자</p>
                      </div>
                    </div>
                  </div>
                </>
            )}

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">일회성 독서 모임 안내</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>모임은 설정한 시간에 자동으로 시작되고 종료됩니다.</li>
                      <li>모임 이름은 선택한 책 제목으로 자동 설정됩니다.</li>
                      <li>참여자들과 함께 책에 대해 토론하고 의견을 나눠보세요.</li>
                      <li>모임 종료 후에는 리뷰를 남길 수 있습니다.</li>
                      <li>온라인 모임의 경우 접속 URL을 꼭 확인해주세요.</li>
                      <li>과제가 있는 모임은 사전에 책을 읽고 리뷰를 작성해주세요.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                  type="button"
                  onClick={() => navigate('/reading-groups')}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                  type="submit"
                  disabled={
                      saving ||
                      !formData.bookTitle.trim() ||
                      !formData.description.trim() ||
                      formData.maxMembers <= 0
                  }
                  className="w-full sm:w-auto btn btn-primary"
              >
                {saving ? '생성 중...' : '모임 만들기'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreateReadingGroup;