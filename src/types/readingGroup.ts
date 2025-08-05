export interface ReadingGroup {
  id: number;
  name: string;
  description?: string;
  creator: {
    id: number;
    kakaoId: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  };
  maxMembers: number;
  isPublic: boolean;
  inviteCode: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  currentMemberCount: number;
  hasAssignment: boolean;
  
  // 모임 일정 정보
  startDateTime?: string;
  endDateTime?: string;
  durationHours?: number;
  location?: string;
  meetingType?: 'OFFLINE' | 'ONLINE';
  meetingUrl?: string;
  
  // 책 정보
  bookTitle?: string;
  bookAuthor?: string;
  bookCoverImage?: string;
  bookPublisher?: string;
  bookDescription?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: number;
  user: {
    id: number;
    kakaoId: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  };
  role: 'CREATOR' | 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  introduction?: string;
  joinedAt: string;
  updatedAt: string;
}

export interface ReadingGroupListItem {
  id: number;
  name: string;
  description?: string;

  bookTitle: string;
  bookAuthor: string;
  bookCoverImage?: string;

  creator: {
    id: number;
    kakaoId: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  };

  maxMembers: number;
  currentMemberCount: number;
  isPublic: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  hasAssignment: boolean;

  // 모임 일정 정보
  startDateTime?: string;
  endDateTime?: string;
  durationHours?: number;
  location?: string;
  meetingType?: 'OFFLINE' | 'ONLINE';
  meetingUrl?: string;

  createdAt: string;
}

export interface CreateReadingGroupRequest {
  name: string;
  description?: string;
  maxMembers: number;
  isPublic: boolean;
  hasAssignment: boolean;

  meetingDateTime: string;

  // 모임 일정 정보
  startDateTime?: string;
  endDateTime?: string;
  durationHours?: number;
  location?: string;
  meetingType?: 'OFFLINE' | 'ONLINE';
  meetingUrl?: string;

  // 책 정보
  bookTitle: string;
  bookAuthor: string;
  bookCoverImage?: string;
  bookPublisher?: string;
  bookPublishedDate?: string;
  bookDescription?: string;
}

export interface UpdateReadingGroupRequest {
  name: string;
  description?: string;
  maxMembers: number;
  isPublic: boolean;
}

export interface JoinReadingGroupRequest {
  inviteCode: string;
  introduction?: string;
}

export const GROUP_STATUS_LABELS = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  ARCHIVED: '보관됨'
} as const;

export const GROUP_STATUS_COLORS = {
  ACTIVE: 'text-green-600 bg-green-50 border-green-200',
  INACTIVE: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  ARCHIVED: 'text-gray-600 bg-gray-50 border-gray-200'
} as const;
