import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Attach tokens
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Auto-restore tokens from localStorage on every request to ensure they are available
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("accessToken");
          const userId = localStorage.getItem("userId");
          if (token && userId) {
            this.accessToken = token;
            this.userId = userId;
          }
        }

        if (this.accessToken && this.userId) {
          config.headers["Authorization"] = this.accessToken;
          config.headers["x-client-id"] = this.userId;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response.data, // Return only data
      async (error: AxiosError) => {
        const responseData = error.response?.data as any;
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            const publicPaths = [
              "/login",
              "/register",
              "/verify-email",
              "/forgot-password",
              "/reset-password",
            ];
            if (!publicPaths.includes(window.location.pathname)) {
              this.clearTokens();
              window.location.href = "/login";
            }
          }
        }

        // 2. Safely extract the exact error message from the backend
        let errorMessage = "Đã có lỗi xảy ra từ máy chủ. Vui lòng thử lại.";
        
        if (responseData) {
          if (typeof responseData.message === "string") {
            errorMessage = responseData.message;
          } else if (Array.isArray(responseData.errors) && responseData.errors[0]?.message) {
            // Handle Zod array errors if backend sends them under 'errors'
            errorMessage = responseData.errors[0].message;
          } else if (responseData.message && Array.isArray(responseData.message)) {
            // Handle Zod array errors if backend sends them under 'message'
            errorMessage = responseData.message[0]?.message || responseData.message[0];
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Reject with a standard Javascript Error object so Zustand can read `error.message`
        return Promise.reject(new Error(errorMessage));
      },
    );
  }

  setTokens(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userId", userId);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.userId = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
    }
  }

  restoreTokens() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        this.accessToken = token;
        this.userId = userId;
      }
    }
  }

  getClient() {
    return this.client;
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.userId);
  }
}

// Singleton instance
const apiClient = new ApiClient();

// Restore tokens on initialization
if (typeof window !== "undefined") {
  apiClient.restoreTokens();
}

export default apiClient;
export const axiosClient = apiClient.getClient();