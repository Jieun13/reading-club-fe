import { apiClient } from './client';
import axios, { AxiosError } from 'axios';
import { 
  Post, 
  CreatePostRequest, 
  PostListResponse, 
  PostFilters 
} from '../types/post';

export const postsApi = {
  // 게시글 목록 조회
  getPosts: async (filters?: PostFilters): Promise<PostListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.postType) params.append('postType', filters.postType);
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.size) params.append('size', filters.size.toString());

    const response = await apiClient.get(`/posts?${params.toString()}`);
    return response.data;
  },

  // 게시글 상세 조회
  getPost: async (postId: number): Promise<{ success: boolean; data: Post; message: string; timestamp: string }> => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  // 게시글 생성
  createPost: async (postData: CreatePostRequest): Promise<Post> => {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  },

  // 게시글 수정
  updatePost: async (postId: number, postData: Partial<CreatePostRequest>): Promise<Post> => {
    const response = await apiClient.put(`/posts/${postId}`, postData);
    return response.data;
  },

  // 게시글 삭제
  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },

  // 내 게시글 목록 조회
  getMyPosts: async (filters?: Omit<PostFilters, 'userId'>): Promise<PostListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.postType) params.append('postType', filters.postType);
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.size) params.append('size', filters.size.toString());

    const response = await apiClient.get(`/posts/my?${params.toString()}`);
    return response.data;
  },

  // 게시글 검색
  searchPosts: async (searchParams: {
    bookTitle?: string;
    keyword?: string;
    postType?: string;
    page?: number;
    size?: number;
  }) => {
    const params = new URLSearchParams();
    
    if (searchParams.bookTitle) params.append('bookTitle', searchParams.bookTitle);
    if (searchParams.keyword) params.append('keyword', searchParams.keyword);
    if (searchParams.postType) params.append('postType', searchParams.postType);
    if (searchParams.page) params.append('page', searchParams.page.toString());
    if (searchParams.size) params.append('size', searchParams.size.toString());

    const response = await apiClient.get(`/posts/search?${params.toString()}`);
    return response.data;
  }
};
