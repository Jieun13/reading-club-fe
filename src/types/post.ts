// 게시글 타입 정의
export interface BookInfo {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  cover: string;
  pubDate: string;
  description?: string;
}

export enum PostType {
  REVIEW = 'REVIEW',           // 독후감
  RECOMMENDATION = 'RECOMMENDATION', // 추천/비추천
  QUOTE = 'QUOTE'              // 문장 수집
}

export enum RecommendationType {
  RECOMMEND = 'RECOMMEND',
  NOT_RECOMMEND = 'NOT_RECOMMEND'
}

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export interface Quote {
  page: string | number;
  text: string;
}

export interface BasePost {
  id: number;
  userId: number;
  userName: string;
  userProfileImage?: string;
  bookInfo: BookInfo;
  postType: PostType;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPost extends BasePost {
  postType: PostType.REVIEW;
  title: string;
  content: string;
}

export interface RecommendationPost extends BasePost {
  postType: PostType.RECOMMENDATION;
  recommendationType: RecommendationType;
  reason: string;
}

export interface QuotePost extends BasePost {
  postType: PostType.QUOTE;
  quotes?: Quote[];
  // 하위 호환성을 위한 기존 필드들
  quote?: string;
  pageNumber?: number;
}

export type Post = ReviewPost | RecommendationPost | QuotePost;

export interface CreatePostRequest {
  bookInfo: BookInfo;
  postType: PostType;
  visibility: PostVisibility;
  // 독후감
  title?: string;
  content?: string;
  // 추천/비추천
  recommendationType?: RecommendationType;
  reason?: string;
  // 문장 수집 (새로운 방식)
  quotes?: Quote[];
  // 문장 수집 (기존 방식 - 하위 호환성)
  quote?: string;
  pageNumber?: number;
}

export interface PostListResponse {
  success: boolean;
  data: {
    posts: Post[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
  message: string;
  timestamp: string;
}

export interface PostFilters {
  postType?: PostType;
  visibility?: PostVisibility;
  userId?: number;
  page?: number;
  size?: number;
}
