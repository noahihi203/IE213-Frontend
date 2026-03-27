import { create } from "zustand";
import { User, LoginData, RegisterData } from "@/lib/types";
import { authService } from "@/lib/api/auth.service";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";

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
      set({
        user: response.metadata.user,
        isAuthenticated: true,
        authInitialized: true,
        isLoading: false,
      });
      toast.success("Đăng nhập thành công!"); // Success notification
    } catch (error: any) {
      const errorMsg = error.message || "Đăng nhập thất bại";
      set({
        error: errorMsg,
        isLoading: false,
      });
      toast.error(errorMsg); 
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      set({
        isLoading: false,
      });
      // We don't need a toast here because the UI changes to the "Check your email" screen
    } catch (error: any) {
      const errorMsg = error.message || "Đăng ký thất bại";
      set({
        error: errorMsg,
        isLoading: false,
      });
      toast.error(errorMsg); // Validation errors (like Zod password requirements) will show up here!
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      toast.success("Đã đăng xuất thành công");
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