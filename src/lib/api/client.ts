import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/v1/api";

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
        if (error.response?.status === 401) {
          // Token expired or invalid - redirect to login
          this.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error.response?.data || error.message);
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
