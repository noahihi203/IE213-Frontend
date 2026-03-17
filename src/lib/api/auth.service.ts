import apiClient, { axiosClient } from "./client";
import { ApiResponse, LoginData, RegisterData, LoginResponse } from "../types";

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    return await axiosClient.post("/register", data);
  },

  // Login user
  login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post("/login", data);

    // Store tokens after successful login
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
      const response = await axiosClient.post("/logout");
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
    const response = await axiosClient.post(
      "/refresh-token",
      {},
      {
        headers: {
          Authorization: refreshToken,
        },
      },
    );

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
