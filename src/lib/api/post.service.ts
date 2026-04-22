import { axiosClient } from "./client";
import {
  ApiResponse,
  Post,
  CreatePostData,
  UpdatePostData,
  PostFilters,
  PaginatedResponse,
  TrendingPosts,
} from "../types";

export const postService = {
  // Lấy top 3 post
  getTrendingPosts: async (): Promise<ApiResponse<TrendingPosts[]>> => {
    return await axiosClient.get(`/posts/trending`);
  },
  // Get all posts with filters
  getAllPosts: async (
    filters?: PostFilters,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.authorId) params.append("authorId", filters.authorId);
    if (filters?.sort) params.append("sort", filters.sort);

    return await axiosClient.get(`/posts?${params.toString()}`);
  },

  // Get single post by ID
  getPostById: async (postId: string): Promise<ApiResponse<Post>> => {
    return await axiosClient.get(`/posts/${postId}`);
  },

  // Get post by slug
  getPostBySlug: async (slug: string): Promise<ApiResponse<Post>> => {
    return await axiosClient.get(`/posts/slug/${slug}`);
  },

  // Create new post
  createPost: async (data: CreatePostData): Promise<ApiResponse<Post>> => {
    return await axiosClient.post("/posts", data);
  },

  // Update post
  updatePost: async (
    postId: string,
    data: UpdatePostData,
  ): Promise<ApiResponse<Post>> => {
    return await axiosClient.put(`/posts/${postId}`, data);
  },

  // Delete post
  deletePost: async (postId: string): Promise<ApiResponse> => {
    return await axiosClient.delete(`/posts/${postId}`);
  },

  // Publish post
  publishPost: async (postId: string): Promise<ApiResponse> => {
    return await axiosClient.patch(`/posts/${postId}/publish`);
  },

  // Change post status
  changePostStatus: async (
    postId: string,
    status: Post["status"],
  ): Promise<ApiResponse> => {
    return await axiosClient.patch(`/posts/${postId}/status`, { status });
  },

  // Like post
  likePost: async (postId: string): Promise<ApiResponse> => {
    return await axiosClient.post(`/posts/${postId}/like`);
  },

  // Unlike post
  unlikePost: async (postId: string): Promise<ApiResponse> => {
    return await axiosClient.delete(`/posts/${postId}/like`);
  },

  // Check if current user liked post
  isPostLikedByUser: async (postId: string): Promise<ApiResponse<boolean>> => {
    return await axiosClient.get(`/posts/${postId}/is-liked`);
  },

  // Get user's own posts
  getMyPosts: async (
    filters?: PostFilters,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);

    return await axiosClient.get(`/posts/my-posts?${params.toString()}`);
  },

  // Get user's liked posts
  getMyLikedPosts: async (
    filters?: PostFilters,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.sort) params.append("sort", filters.sort);

    return await axiosClient.get(`/posts/my-liked-posts?${params.toString()}`);
  },
};
