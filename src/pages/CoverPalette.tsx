import React, { useState, useEffect } from 'react';
import ColorThief from 'colorthief';
import { monthlyCoversApi } from '../api/monthlyCovers';
import { MonthlyBookCovers } from '../types';

interface ColorPalette {
  r: number;
  g: number;
  b: number;
  hex: string;
}

interface BookColors {
  title: string;
  colors: ColorPalette[];
}

const CoverPalette: React.FC = () => {
  const [monthlyCovers, setMonthlyCovers] = useState<MonthlyBookCovers | null>(null);
  const [bookColors, setBookColors] = useState<BookColors[]>([]);
  const [filteredBookColors, setFilteredBookColors] = useState<BookColors[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridColumns, setGridColumns] = useState(25); // 기본값 25개
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);

  // RGB를 HEX로 변환하는 함수
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // 이미지에서 색상 추출하는 함수
  const extractColorsFromImage = (imageUrl: string, title: string): Promise<ColorPalette[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          // ColorThief를 사용하여 팔레트 추출 (4개 색상)
          const palette = colorThief.getPalette(img, 4);
          
          const colorPalette: ColorPalette[] = palette.map(([r, g, b]: [number, number, number]) => ({
            r,
            g,
            b,
            hex: rgbToHex(r, g, b)
          }));

          resolve(colorPalette);
        } catch (err) {
          console.error(`Failed to extract colors from ${title}:`, err);
          // 에러 발생 시 기본 색상들로 대체
          resolve([
            { r: 200, g: 200, b: 200, hex: '#C8C8C8' },
            { r: 180, g: 180, b: 180, hex: '#B4B4B4' },
            { r: 160, g: 160, b: 160, hex: '#A0A0A0' },
            { r: 140, g: 140, b: 140, hex: '#8C8C8C' }
          ]);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load image for ${title}`);
        // 이미지 로딩 실패 시 기본 색상들로 대체
        resolve([
          { r: 200, g: 200, b: 200, hex: '#C8C8C8' },
          { r: 180, g: 180, b: 180, hex: '#B4B4B4' },
          { r: 160, g: 160, b: 160, hex: '#A0A0A0' },
          { r: 140, g: 140, b: 140, hex: '#8C8C8C' }
        ]);
      };

      img.src = imageUrl;
    });
  };

  // 이번 달 책 표지 URL 데이터 가져오기
  const fetchMonthlyBookCovers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await monthlyCoversApi.getMonthlyBookCovers();
      setMonthlyCovers(response.data);
      
      // 모든 책의 표지 URL을 하나의 배열로 합치기
      const allCovers: { url: string; title: string; category: string }[] = [];
      
      // 완독한 책
      response.data.completedBookCovers.forEach((url, index) => {
        allCovers.push({ url, title: `완독한 책 ${index + 1}`, category: 'completed' });
      });
      
      // 읽고 있는 책
      response.data.currentlyReadingCovers.forEach((url, index) => {
        allCovers.push({ url, title: `읽고 있는 책 ${index + 1}`, category: 'reading' });
      });
      
      // 위시리스트
      response.data.wishlistCovers.forEach((url, index) => {
        allCovers.push({ url, title: `위시리스트 ${index + 1}`, category: 'wishlist' });
      });

      // 읽다 만 책
      response.data.droppedBookCovers.forEach((url, index) => {
        allCovers.push({ url, title: `읽다 만 책 ${index + 1}`, category: 'dropped' });
      });
      
      // 각 책의 표지에서 색상 추출
      const booksWithColors: BookColors[] = [];
      
      for (const cover of allCovers) {
        if (cover.url && cover.url.trim()) {
          try {
            const colors = await extractColorsFromImage(cover.url, cover.title);
            booksWithColors.push({
              title: cover.title,
              colors: colors
            });
          } catch (err) {
            console.error(`Failed to extract colors from ${cover.title}:`, err);
            // 에러 발생 시 기본 색상들로 대체
            booksWithColors.push({
              title: cover.title,
              colors: [
                { r: 200, g: 200, b: 200, hex: '#C8C8C8' },
                { r: 180, g: 180, b: 180, hex: '#B4B4B4' },
                { r: 160, g: 160, b: 160, hex: '#A0A0A0' },
                { r: 140, g: 140, b: 140, hex: '#8C8C8C' }
              ]
            });
          }
        }
      }
      
      setBookColors(booksWithColors);
      setFilteredBookColors(booksWithColors); // 초기에는 모든 책 표시
    } catch (err) {
      setError('책 표지 데이터를 가져오는 중 오류가 발생했습니다.');
      console.error('Error fetching monthly book covers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 완독한 책만 필터링하는 함수
  const toggleCompletedFilter = () => {
    if (showOnlyCompleted) {
      // 필터 해제: 모든 책 표시
      setFilteredBookColors(bookColors);
      setShowOnlyCompleted(false);
    } else {
      // 필터 적용: 완독한 책만 표시
      const completedBooks = bookColors.filter((_, index) => {
        // 완독한 책의 인덱스 계산 (완독한 책이 먼저 배열에 들어가 있음)
        return monthlyCovers && index < monthlyCovers.completedBookCovers.length;
      });
      setFilteredBookColors(completedBooks);
      setShowOnlyCompleted(true);
    }
  };

  // 반응형 그리드 컬럼 수 계산
  useEffect(() => {
    const calculateGridColumns = () => {
      const containerWidth = window.innerWidth;
      
      if (containerWidth < 640) {        // sm: 640px 미만
        setGridColumns(8);               // 모바일: 8개
      } else if (containerWidth < 768) { // md: 768px 미만
        setGridColumns(12);              // 태블릿: 12개
      } else if (containerWidth < 1024) { // lg: 1024px 미만
        setGridColumns(18);              // 작은 데스크톱: 18개
      } else if (containerWidth < 1280) { // xl: 1280px 미만
        setGridColumns(22);              // 중간 데스크톱: 22개
      } else {                           // 1280px 이상
        setGridColumns(25);              // 큰 데스크톱: 25개
      }
    };

    // 초기 계산
    calculateGridColumns();
    
    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', calculateGridColumns);
    
    // 클린업
    return () => window.removeEventListener('resize', calculateGridColumns);
  }, []);

  useEffect(() => {
    fetchMonthlyBookCovers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">월간 팔레트를 생성하고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Palette</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchMonthlyBookCovers}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!monthlyCovers || monthlyCovers.totalCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Monthly Palette</h1>
            <p className="text-lg text-gray-600 mb-4">
              이번 달에 등록한 책들의 표지 색상으로 만든 팔레트입니다
            </p>
            <div className="bg-white rounded-xl shadow-lg p-12">
              <p className="text-gray-500 text-lg">이번 달에 등록한 책이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">책을 등록하면 팔레트가 생성됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 Palette</h1>
          <p className="text-lg text-gray-600 mb-2">
            이번 달에 기록한 책들의 표지로 만든 팔레트입니다.
          </p>
        </div>

          {/* 독서 잔디 그리드 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 mt-4 text-center">Your Style, in Every Book.</h2>
          
              {filteredBookColors.length > 0 ? (
              <div className="flex justify-center mt-4">
                <div className="space-y-2">
                  {/* 가로 gridColumns개씩 줄바꿈하여 표시 */}
                  {Array.from({ length: Math.ceil(filteredBookColors.length / gridColumns) }, (_, pageIndex) => (
                  <div key={pageIndex} className="grid gap-1" style={{ 
                    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                    gridTemplateRows: 'repeat(4, 1fr)'
                  }}>
                    {/* 세로 4줄, 가로는 최대 gridColumns개 */}
                    {Array.from({ length: 4 }, (_, rowIndex) => (
                      Array.from({ length: gridColumns }, (_, colIndex) => {
                        const bookIndex = pageIndex * gridColumns + colIndex;
                        const book = filteredBookColors[bookIndex];
                        
                        if (!book) {
                          // 책이 없는 경우 빈 공간
                          return (
                            <div
                              key={`${pageIndex}-${rowIndex}-${colIndex}`}
                              className="w-8 h-8 rounded-md border border-gray-100 bg-gray-50"
                            />
                          );
                        }
                        
                        return (
                          <div
                            key={`${pageIndex}-${rowIndex}-${colIndex}`}
                            className="w-8 h-8 rounded-md border border-gray-200 hover:scale-110 transition-transform"
                            style={{ backgroundColor: book.colors[rowIndex]?.hex || '#f3f4f6' }}
                            title={`${book.title} - ${book.colors[rowIndex]?.hex || '기본색'}`}
                          />
                        );
                      })
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">팔레트를 생성할 수 없습니다.</p>
            </div>
          )}
          
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-xs">
                각 세로 줄은 한 권의 책 표지에서 추출한 색상들의 모음이며, {showOnlyCompleted ? '완독한 책만 표시됩니다.' : '책을 등록할 때마다 가로로 늘어납니다.'}
              </p>
            </div>
            {/* 기준 날짜 */}
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
               created on {new Date().getFullYear()}-{new Date().getMonth() + 1}-{new Date().getDate()}
              </p>
            </div>
        </div>

        {/* 필터링 버튼 */}
        <div className="flex justify-center mb-6 mt-8">
              <button
                onClick={toggleCompletedFilter}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  showOnlyCompleted
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showOnlyCompleted ? '✅ 완독한 책만 보기' : '📚 완독한 책만 보기'}
              </button>
            </div>
      </div>
    </div>
  );
};

export default CoverPalette;
