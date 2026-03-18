import apiClient, { axiosClient } from "./client";
import { ApiResponse, LoginData, RegisterData, LoginResponse } from "../types";

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    return await axiosClient.post("/register", data);
  },

  // Login user
  login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    // 1. Ép kiểu trực tiếp (Type Assertion) để TypeScript hiểu cấu trúc thực sự của response
    const response = (await axiosClient.post(
      "/login",
      data,
    )) as unknown as ApiResponse<LoginResponse>;

    // 2. Sử dụng response.metadata bình thường như code ban đầu của bạn!
    if (
      response.metadata?.tokens?.accessToken &&
      response.metadata?.user?._id
    ) {
      apiClient.setTokens(
        response.metadata.tokens.accessToken,
        response.metadata.user._id,
      );

      // Store user data
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.metadata.user));
      }
    }

    return response;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    try {
      // Ép kiểu trực tiếp về ApiResponse và bỏ qua .data
      const response = (await axiosClient.post(
        "/logout",
      )) as unknown as ApiResponse;
      return response;
    } finally {
      // Clear tokens regardless of API response
      apiClient.clearTokens();
    }
  },

  // Refresh token
  refreshToken: async (
    refreshToken: string,
  ): Promise<ApiResponse<LoginResponse>> => {
    // Ép kiểu trực tiếp về ApiResponse<LoginResponse>
    const response = (await axiosClient.post(
      "/refresh-token",
      {},
      {
        headers: {
          Authorization: refreshToken,
        },
      },
    )) as unknown as ApiResponse<LoginResponse>;

    // Dùng thẳng response.metadata, không qua biến result nữa
    // Update stored tokens
    if (
      response.metadata?.tokens?.accessToken &&
      response.metadata?.user?._id
    ) {
      apiClient.setTokens(
        response.metadata.tokens.accessToken,
        response.metadata.user._id,
      );
    }

    return response;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return apiClient.isAuthenticated();
  },
};
