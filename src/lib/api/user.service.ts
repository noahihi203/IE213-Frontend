import { axiosClient } from "./client";
import { ApiResponse, User, UserFilters, PaginatedResponse } from "../types";

export interface UpdateProfilePayload {
  fullName: string;
  bio: string;
  avatar: string;
}

export interface UpdateEmailPayload {
  newEmail: string;
  currentPassword: string;
}

export interface UpdateUsernamePayload {
  newUsername: string;
}

export interface FollowListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FollowListResponse {
  followers?: User[];
  following?: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const userService = {
  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<ApiResponse<User>> => {
    return await axiosClient.get(`/user/${userId}`);
  },

  // Update user profile (Current user)
  updateUserProfile: async (
    data: UpdateProfilePayload,
  ): Promise<ApiResponse<User>> => {
    return await axiosClient.put(`/user`, data);
  },

  // Update user email
  updateUserEmail: async (
    data: UpdateEmailPayload,
  ): Promise<ApiResponse<User>> => {
    return await axiosClient.put(`/user/update-email`, data);
  },

  // Update user username
  updateUserUsername: async (
    data: UpdateUsernamePayload,
  ): Promise<ApiResponse<User>> => {
    return await axiosClient.put(`/user/update-username`, data);
  },

  // Get all users (Admin only)
  getAllUsers: async (
    filters?: UserFilters,
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.role) params.append("role", filters.role);
    if (filters?.status) params.append("status", filters.status);

    return await axiosClient.get(`/user/all?${params.toString()}`);
  },

  // Get all users (Admin only)
  getTopAuthors: async (): Promise<ApiResponse<User[]>> => {
    return await axiosClient.get(`/user/top-authors`);
  },

  // Delete user (Admin only)
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    return await axiosClient.delete(`/user/${userId}`);
  },

  // Restore user (Admin only)
  restoreUser: async (userId: string): Promise<ApiResponse<User>> => {
    return await axiosClient.put(`/user/restore/${userId}`);
  },

  // Change user role (Admin only)
  changeUserRole: async (
    userId: string,
    role: "user" | "author" | "admin",
  ): Promise<ApiResponse<User>> => {
    return await axiosClient.put(`/user/${userId}/role`, { role });
  },

  getMyFollowers: async (
    query?: FollowListQuery,
  ): Promise<ApiResponse<FollowListResponse>> => {
    const params = new URLSearchParams();

    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return await axiosClient.get(`/user/followers${suffix}`);
  },

  getMyFollowing: async (
    query?: FollowListQuery,
  ): Promise<ApiResponse<FollowListResponse>> => {
    const params = new URLSearchParams();

    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return await axiosClient.get(`/user/following${suffix}`);
  },

  getUserFollowers: async (
    userId: string,
    query?: FollowListQuery,
  ): Promise<ApiResponse<FollowListResponse>> => {
    const params = new URLSearchParams();

    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return await axiosClient.get(`/user/${userId}/followers${suffix}`);
  },

  getUserFollowing: async (
    userId: string,
    query?: FollowListQuery,
  ): Promise<ApiResponse<FollowListResponse>> => {
    const params = new URLSearchParams();

    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return await axiosClient.get(`/user/${userId}/following${suffix}`);
  },

  followUser: async (userId: string): Promise<ApiResponse> => {
    return await axiosClient.post(`/user/${userId}/follow`);
  },

  unfollowUser: async (userId: string): Promise<ApiResponse> => {
    return await axiosClient.post(`/user/${userId}/unfollow`);
  },
};
