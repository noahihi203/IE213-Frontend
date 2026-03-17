import { axiosClient } from "./client";
import { ApiResponse, User, UserFilters, PaginatedResponse } from "../types";

export const userService = {
  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<ApiResponse<User>> => {
    return await axiosClient.get(`/users/${userId}`);
  },

  // Update user profile
  updateUserProfile: async (
    userId: string,
    data: Partial<User>,
  ): Promise<ApiResponse<User>> => {
    return await axiosClient.put(`/users/${userId}`, data);
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

    return await axiosClient.get(`/users?${params.toString()}`);
  },

  // Delete user (Admin only)
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    return await axiosClient.delete(`/users/${userId}`);
  },

  // Change user role (Admin only)
  changeUserRole: async (
    userId: string,
    role: "user" | "poster" | "admin",
  ): Promise<ApiResponse<User>> => {
    return await axiosClient.put(`/users/${userId}/role`, { role });
  },
};
