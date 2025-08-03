export interface Wishlist {
  id: number;
  title: string;
  author?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    kakaoId: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface WishlistCreateRequest {
  title: string;
  author?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  memo?: string;
}

export interface WishlistUpdateRequest {
  title: string;
  author?: string;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  memo?: string;
}
