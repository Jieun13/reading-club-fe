export interface GroupMeeting {
  id: number;
  title: string;
  description?: string;
  meetingDateTime: string;
  location?: string;
  agenda?: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdBy: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  monthlyBook?: {
    id: number;
    bookTitle: string;
    bookAuthor: string;
    bookCoverImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  isPast: boolean;
  isUpcoming: boolean;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  meetingDateTime: string;
  location?: string;
  agenda?: string;
  monthlyBookId?: number;
}

export interface UpdateMeetingRequest {
  title: string;
  description?: string;
  meetingDateTime: string;
  location?: string;
  agenda?: string;
  status?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface BookReview {
  id: number;
  user: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  monthlyBook: {
    id: number;
    bookTitle: string;
    bookAuthor: string;
    bookCoverImage?: string;
  };
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  monthlyBookId: number;
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  isPublic?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface UpdateReviewRequest {
  rating: number;
  title: string;
  content: string;
  favoriteQuote?: string;
  recommendation?: string;
  isPublic?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: number[];
}

export const MEETING_STATUS_LABELS = {
  SCHEDULED: '예정됨',
  ONGOING: '진행 중',
  COMPLETED: '완료됨',
  CANCELLED: '취소됨'
} as const;

export const MEETING_STATUS_COLORS = {
  SCHEDULED: 'text-blue-600 bg-blue-50 border-blue-200',
  ONGOING: 'text-green-600 bg-green-50 border-green-200',
  COMPLETED: 'text-gray-600 bg-gray-50 border-gray-200',
  CANCELLED: 'text-red-600 bg-red-50 border-red-200'
} as const;
