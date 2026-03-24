import { useState } from "react";
import { userService } from "@/lib/api/user.service";
import { User } from "@/lib/types";

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
    if (!window.confirm(`Bạn có chắc chắn muốn đổi vai trò thành ${newRole}?`))
      return;
    try {
      await userService.changeUserRole(
        userId,
        newRole as "user" | "author" | "admin",
      );
      await loadUsers(pagination.currentPage);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi đổi vai trò!");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa/xóa người dùng này không?"))
      return;
    try {
      await userService.deleteUser(userId);
      await loadUsers(pagination.currentPage);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi khóa người dùng!");
    }
  };

  const handleRestoreUser = async (userId: string) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn khôi phục người dùng này không?")
    )
      return;
    try {
      await userService.restoreUser(userId);
      await loadUsers(pagination.currentPage);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi khôi phục người dùng!");
    }
  };

  return {
    users,
    isLoadingUsers,
    pagination,
    loadUsers,
    handleRoleChange,
    handleDeleteUser,
    handleRestoreUser,
  };
}
