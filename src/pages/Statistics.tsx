import React, { useState, useEffect } from 'react';
import { ChartBarIcon, BookOpenIcon, CalendarIcon, StarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { bookApi } from '../api/books';
import { postsApi } from '../api/posts';
import { Book, MonthlyStats } from '../types/book';
import Loading from '../components/common/Loading';

const Statistics: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksResponse, statsResponse, postsResponse] = await Promise.all([
        bookApi.getBooks(0, 100),
        bookApi.getMonthlyStatistics(),
        postsApi.getMyPosts()
      ]);
      
      setBooks(booksResponse.data.data.content);
      setMonthlyStats(statsResponse.data.data);
      setPostCount(postsResponse.data?.posts?.length || 0);
    } catch (error) {
      console.error('데이터를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  // 기본 통계 계산
  const totalBooks = books.length;
  const averageRating = totalBooks > 0 
    ? (books.reduce((sum, book) => sum + book.rating, 0) / totalBooks).toFixed(1)
    : '0';

  // 선택된 연도의 월별 통계 필터링
  const yearlyStats = monthlyStats.filter(stat => stat.year === selectedYear);
  const maxCount = Math.max(...yearlyStats.map(stat => stat.count), 1);

  // 최근 완독한 책들
  const recentBooks = books
    .sort((a, b) => new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime())
    .slice(0, 5);

  // 평균 독서 시간 계산 (이 예제에서는 월별 완독 수로 대체)
  const thisYearCount = yearlyStats.reduce((sum, stat) => sum + stat.count, 0);
  const averagePerMonth = thisYearCount > 0 ? (thisYearCount / 12).toFixed(1) : '0';

  if (loading) {
    return <Loading size="lg" text="통계를 불러오는 중..." />;
  }

  if (totalBooks === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">독서 통계</h1>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 통계를 보여드릴 데이터가 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            책을 추가하시면 다양한 독서 통계를 확인하실 수 있습니다.
          </p>
          <a href="/books/add" className="btn btn-primary">
            첫 책 추가하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">독서 통계</h1>

      {/* 기본 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 책</p>
              <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 별점</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">올해 완독</p>
              <p className="text-2xl font-bold text-gray-900">{thisYearCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">월평균</p>
              <p className="text-2xl font-bold text-gray-900">{averagePerMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">게시글</p>
              <p className="text-2xl font-bold text-gray-900">{postCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 월별 완독 통계 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">월별 완독 현황</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>{year}년</option>
                );
              })}
            </select>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const stat = yearlyStats.find(s => s.month === month);
              const count = stat?.count || 0;
              
              return (
                <div key={month} className="flex items-center">
                  <div className="w-8 text-sm text-gray-600">{month}월</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 text-sm font-medium text-gray-900 text-right">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 별점 분포 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">별점 분포</h2>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = books.filter(book => book.rating === rating).length;
              const percentage = totalBooks > 0 ? Math.round((count / totalBooks) * 100) : 0;
              
              return (
                <div key={rating} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex">
                      {Array.from({ length: rating }, (_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-gray-700">{rating}점</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-900 mr-2">
                      {count}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 최근 완독한 책 */}
      {recentBooks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">최근 완독한 책</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBooks.map((book) => (
              <div key={book.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
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
                    <div className="flex">
                      {Array.from({ length: book.rating }, (_, i) => (
                        <StarIcon key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(book.finishedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
