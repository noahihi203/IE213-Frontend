import { create } from "zustand";
import { User, LoginData, RegisterData } from "@/lib/types";
import { authService } from "@/lib/api/auth.service";
import apiClient from "@/lib/api/client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  authInitialized: false,
  isLoading: false,
  error: null,

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(data);
      console.log("data:::", data);
      set({
        user: response.metadata.user,
        isAuthenticated: true,
        authInitialized: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      set({
        user: response.metadata.user,
        isAuthenticated: true,
        authInitialized: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        authInitialized: true,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: () => {
    apiClient.restoreTokens();
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();

    if (user && isAuthenticated) {
      set({ user, isAuthenticated: true, authInitialized: true });
    } else {
      set({ user: null, isAuthenticated: false, authInitialized: true });
    }
  },

  clearError: () => set({ error: null }),
}));
