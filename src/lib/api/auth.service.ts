import apiClient, { axiosClient } from "./client";
import { ApiResponse, LoginData, RegisterData, LoginResponse } from "../types";

export const authService = {
  register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    return await axiosClient.post("/register", data);
  },

  login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    const response = (await axiosClient.post(
      "/login",
      data,
    )) as unknown as ApiResponse<LoginResponse>;

    if (
      response.metadata?.tokens?.accessToken &&
      response.metadata?.user?._id
    ) {
      apiClient.setTokens(
        response.metadata.tokens.accessToken,
        response.metadata.user._id,
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.metadata.user));
      }
    }

    return response;
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      const response = (await axiosClient.post(
        "/logout",
      )) as unknown as ApiResponse;
      return response;
    } finally {
      apiClient.clearTokens();
    }
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<ApiResponse<LoginResponse>> => {
    const response = (await axiosClient.post(
      "/refresh-token",
      {},
      {
        headers: {
          Authorization: refreshToken,
        },
      },
    )) as unknown as ApiResponse<LoginResponse>;

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

  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return apiClient.isAuthenticated();
  },

  verifyEmail: async (data: { token: string }): Promise<ApiResponse> => {
    return (await axiosClient.post(
      "/verify-email",
      data,
    )) as unknown as ApiResponse;
  },

  forgotPassword: async (data: { email: string }): Promise<ApiResponse> => {
    return (await axiosClient.post(
      "/forgot-password",
      data,
    )) as unknown as ApiResponse;
  },

  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    return (await axiosClient.post(
      "/reset-password",
      data,
    )) as unknown as ApiResponse;
  },
};
