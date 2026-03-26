import { useState } from "react";
import { userService } from "@/lib/api/user.service";
import { User } from "@/lib/types";
import { toast } from "sonner";

interface ApiErrorPayload {
  status?: number;
  code?: string;
  message?: string;
}

const parseApiError = (
  error: unknown,
  fallbackMessage: string,
): Required<ApiErrorPayload> => {
  if (error && typeof error === "object") {
    const payload = error as ApiErrorPayload;
    return {
      status: typeof payload.status === "number" ? payload.status : 500,
      code: typeof payload.code === "string" ? payload.code : "UNKNOWN_ERROR",
      message:
        typeof payload.message === "string" && payload.message.trim().length > 0
          ? payload.message
          : fallbackMessage,
    };
  }

  return {
    status: 500,
    code: "UNKNOWN_ERROR",
    message: fallbackMessage,
  };
};

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  MAXIMUM_ADMINS_REACHED:
    "Không thể cấp quyền quản trị vì hệ thống đã đủ số lượng quản trị viên.",
  MINIMUM_ADMINS_REQUIRED:
    "Không thể hạ quyền quản trị vì hệ thống cần ít nhất một quản trị viên.",
  SELF_DEMOTION_FORBIDDEN: "Bạn không thể tự hạ quyền của chính mình.",
  SUPER_ADMIN_PROTECTED: "Không thể thay đổi quyền của tài khoản Super Admin.",
  INSUFFICIENT_ADMIN_PERMISSION:
    "Chỉ Super Admin mới có quyền thay đổi vai trò của admin khác.",
};

const getFriendlyErrorMessage = (error: ApiErrorPayload, fallback: string) => {
  if (error.code && FRIENDLY_ERROR_MESSAGES[error.code]) {
    return FRIENDLY_ERROR_MESSAGES[error.code];
  }

  if (error.message && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

interface UsersPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const DEFAULT_LIMIT = 20;

const DEFAULT_PAGINATION: UsersPagination = {
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  limit: DEFAULT_LIMIT,
  hasNextPage: false,
  hasPrevPage: false,
};

const parseUsersPayload = (metadata: unknown): User[] => {
  if (Array.isArray(metadata)) {
    return metadata as User[];
  }

  if (metadata && typeof metadata === "object") {
    const root = metadata as {
      data?: unknown;
      users?: unknown;
    };

    if (Array.isArray(root.data)) {
      return root.data as User[];
    }

    if (Array.isArray(root.users)) {
      return root.users as User[];
    }
  }

  return [];
};

const parsePaginationPayload = (
  metadata: unknown,
  fallbackPage: number,
): UsersPagination => {
  if (!metadata || typeof metadata !== "object") {
    return {
      ...DEFAULT_PAGINATION,
      currentPage: fallbackPage,
    };
  }

  const root = metadata as {
    pagination?: {
      page?: number;
      currentPage?: number;
      limit?: number;
      total?: number;
      totalUsers?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
    };
  };

  const raw = root.pagination;

  const currentPage = Number(raw?.currentPage ?? raw?.page ?? fallbackPage);
  const totalPages = Math.max(1, Number(raw?.totalPages ?? 1));
  const limit = Math.max(1, Number(raw?.limit ?? DEFAULT_LIMIT));
  const totalUsers = Math.max(0, Number(raw?.totalUsers ?? raw?.total ?? 0));

  return {
    currentPage: Number.isFinite(currentPage) ? currentPage : fallbackPage,
    totalPages: Number.isFinite(totalPages) ? totalPages : 1,
    limit: Number.isFinite(limit) ? limit : DEFAULT_LIMIT,
    totalUsers: Number.isFinite(totalUsers) ? totalUsers : 0,
    hasNextPage:
      typeof raw?.hasNextPage === "boolean"
        ? raw.hasNextPage
        : currentPage < totalPages,
    hasPrevPage:
      typeof raw?.hasPrevPage === "boolean" ? raw.hasPrevPage : currentPage > 1,
  };
};

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<UsersPagination>(DEFAULT_PAGINATION);

  const loadUsers = async (page = 1) => {
    const normalizedPage = Math.max(1, page);

    setIsLoadingUsers(true);
    try {
      const res = await userService.getAllUsers({
        page: normalizedPage,
        limit: DEFAULT_LIMIT,
      });
      setUsers(parseUsersPayload(res.metadata));
      setPagination(parsePaginationPayload(res.metadata, normalizedPage));
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
      setPagination((prev) => ({
        ...prev,
        currentPage: normalizedPage,
      }));
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    currentRole: string,
    newRole: string,
  ) => {
    if (currentRole === newRole) return;
    try {
      setActionError(null);
      await userService.changeUserRole(
        userId,
        newRole as "user" | "author" | "admin",
      );
      await loadUsers(pagination.currentPage);
      toast.success("Đã cập nhật vai trò người dùng thành công.");
    } catch (err) {
      console.error(err);
      const parsed = parseApiError(err, "Có lỗi xảy ra khi đổi vai trò!");
      const friendlyMessage = getFriendlyErrorMessage(
        parsed,
        "Có lỗi xảy ra khi đổi vai trò!",
      );
      setActionError(friendlyMessage);
      toast.error(friendlyMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa/xóa người dùng này không?"))
      return;
    try {
      setActionError(null);
      await userService.deleteUser(userId);
      await loadUsers(pagination.currentPage);
    } catch (err) {
      console.error(err);
      const parsed = parseApiError(err, "Có lỗi xảy ra khi khóa người dùng!");
      const friendlyMessage = getFriendlyErrorMessage(
        parsed,
        "Có lỗi xảy ra khi khóa người dùng!",
      );
      setActionError(friendlyMessage);
      toast.error(friendlyMessage);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn khôi phục người dùng này không?")
    )
      return;
    try {
      setActionError(null);
      await userService.restoreUser(userId);
      await loadUsers(pagination.currentPage);
    } catch (err) {
      console.error(err);
      const parsed = parseApiError(
        err,
        "Có lỗi xảy ra khi khôi phục người dùng!",
      );
      const friendlyMessage = getFriendlyErrorMessage(
        parsed,
        "Có lỗi xảy ra khi khôi phục người dùng!",
      );
      setActionError(friendlyMessage);
      toast.error(friendlyMessage);
    }
  };

  return {
    users,
    isLoadingUsers,
    actionError,
    pagination,
    loadUsers,
    handleRoleChange,
    handleDeleteUser,
    handleRestoreUser,
  };
}
