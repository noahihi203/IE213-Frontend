import apiClient, { axiosClient } from "./client";
import { ApiResponse, LoginData, RegisterData, LoginResponse } from "../types";

export const authService = {
  // Register new user
  register: async (
    data: RegisterData
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post("/register", data);
    return response.data;
  },

  // Login user
  login: async (
    data: LoginData
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post("/login", data);

    const dataRes = response.data as ApiResponse<LoginResponse>;

    // Store tokens after successful login
    if (
      dataRes?.metadata?.tokens?.accessToken &&
      dataRes?.metadata?.user?._id
    ) {
      apiClient.setTokens(
        dataRes.metadata.tokens.accessToken,
        dataRes.metadata.user._id
      );

      // Store user data (client only)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(dataRes.metadata.user));
      }
    }

    return dataRes;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await axiosClient.post("/logout");
      return response.data;
    } finally {
      // Always clear tokens
      apiClient.clearTokens();
    }
  },

  // Refresh token
  refreshToken: async (
    refreshToken: string
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post(
      "/refresh-token",
      {},
      {
        headers: {
          Authorization: refreshToken,
        },
      }
    );

    const dataRes = response.data as ApiResponse<LoginResponse>;

    if (
      dataRes?.metadata?.tokens?.accessToken &&
      dataRes?.metadata?.user?._id
    ) {
      apiClient.setTokens(
        dataRes.metadata.tokens.accessToken,
        dataRes.metadata.user._id
      );
    }

    return dataRes;
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