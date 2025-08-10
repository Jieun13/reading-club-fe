import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Library from './pages/Library';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import AddWishlist from './pages/AddWishlist';
import EditWishlist from './pages/EditWishlist';

import AddCurrentlyReading from './pages/AddCurrentlyReading';
import EditCurrentlyReading from './pages/EditCurrentlyReading';
import AddDroppedBook from './pages/AddDroppedBook';
import EditDroppedBook from './pages/EditDroppedBook';
import ReadingGroups from './pages/ReadingGroups';
import CreateReadingGroup from './pages/CreateReadingGroup';
import ReadingGroupDetail from './pages/ReadingGroupDetail';
import JoinGroupPage from './pages/JoinGroupPage';
import SelectMonthlyBook from './pages/SelectMonthlyBook';
import GroupMembers from './pages/GroupMembers';
import BookReviews from './pages/BookReviews';
import Posts from './pages/Posts';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import MyPosts from './pages/MyPosts';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import KakaoCallback from './pages/KakaoCallback';
import Loading from './components/common/Loading';
import { useAuth } from './contexts/AuthContext';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading size="lg" text="로딩 중..." />;
  }

  if (!isAuthenticated) {
    return <Home />;
  }

  return <>{children}</>;
};

const AboutPage: React.FC = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">독서모임 소개</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <div style={{ maxWidth: 'none' }}>
        <p className="text-gray-600 mb-4">
          독서모임은 개인의 독서 기록을 관리하고 독서 습관을 만들어가는 웹 서비스입니다.
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">주요 기능</h3>
        <ul className="text-gray-600" style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.25rem' }}>읽은 책 기록 및 관리</li>
          <li style={{ marginBottom: '0.25rem' }}>별점 및 리뷰 작성</li>
          <li style={{ marginBottom: '0.25rem' }}>독서 통계 및 분석</li>
          <li style={{ marginBottom: '0.25rem' }}>알라딘 API를 통한 책 검색</li>
          <li style={{ marginBottom: '0.25rem' }}>카카오 로그인을 통한 간편 인증</li>
        </ul>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">사용 방법</h3>
        <div className="space-y-3 text-gray-600">
          <div>
            <strong>1. 로그인:</strong> 카카오 계정으로 간편하게 로그인하세요.
          </div>
          <div>
            <strong>2. 책 추가:</strong> 알라딘 API로 책을 검색하고 내 책장에 추가하세요.
          </div>
          <div>
            <strong>3. 독서 기록:</strong> 읽기 상태, 별점, 리뷰를 기록하세요.
          </div>
          <div>
            <strong>4. 통계 확인:</strong> 나의 독서 패턴과 통계를 확인하세요.
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          
          {/* 인증이 필요한 라우트들 */}
          <Route path="/library" element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          } />
          <Route path="/books/add" element={
            <ProtectedRoute>
              <AddBook />
            </ProtectedRoute>
          } />
          <Route path="/books/edit/:id" element={
            <ProtectedRoute>
              <EditBook />
            </ProtectedRoute>
          } />

          <Route path="/wishlists/add" element={
            <ProtectedRoute>
              <AddWishlist />
            </ProtectedRoute>
          } />
          <Route path="/wishlists/edit/:id" element={
            <ProtectedRoute>
              <EditWishlist />
            </ProtectedRoute>
          } />

          <Route path="/currently-reading/add" element={
            <ProtectedRoute>
              <AddCurrentlyReading />
            </ProtectedRoute>
          } />
          <Route path="/currently-reading/edit/:id" element={
            <ProtectedRoute>
              <EditCurrentlyReading />
            </ProtectedRoute>
          } />
          <Route path="/dropped-books/add" element={
            <ProtectedRoute>
              <AddDroppedBook />
            </ProtectedRoute>
          } />
          <Route path="/dropped-books/edit/:id" element={
            <ProtectedRoute>
              <EditDroppedBook />
            </ProtectedRoute>
          } />
          <Route path="/reading-groups" element={
            <ProtectedRoute>
              <ReadingGroups />
            </ProtectedRoute>
          } />
          <Route path="/reading-groups/create" element={
            <ProtectedRoute>
              <CreateReadingGroup />
            </ProtectedRoute>
          } />
          <Route path="/reading-groups/:id" element={
            <ProtectedRoute>
              <ReadingGroupDetail />
            </ProtectedRoute>
          } />
          <Route path="/reading-groups/:id/join" element={
            <ProtectedRoute>
              <JoinGroupPage />
            </ProtectedRoute>
          } />
          <Route path="/reading-groups/:id/members" element={
            <ProtectedRoute>
              <GroupMembers />
            </ProtectedRoute>
          } />
          <Route path="/reading-groups/:id/select-monthly-book" element={
            <ProtectedRoute>
              <SelectMonthlyBook />
            </ProtectedRoute>
          } />
          <Route path="/reading-groups/:id/monthly-books/:monthlyBookId/reviews" element={
            <ProtectedRoute>
              <BookReviews />
            </ProtectedRoute>
          } />
          <Route path="/posts" element={
            <ProtectedRoute>
              <Posts />
            </ProtectedRoute>
          } />
          <Route path="/my" element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          } />
          <Route path="/posts/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path="/posts/:id" element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          } />
          <Route path="/posts/:id/edit" element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          } />
          <Route path="/statistics" element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/users/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
