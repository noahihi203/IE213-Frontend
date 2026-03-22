import { useState } from "react";
import { userService } from "@/lib/api/user.service";
import { User } from "@/lib/types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await userService.getAllUsers({ page: 1, limit: 20 });
      setUsers(
        Array.isArray(res.metadata)
          ? res.metadata
          : Array.isArray(res.metadata?.data)
            ? res.metadata.data
            : Array.isArray((res.metadata as any)?.users)
              ? (res.metadata as any).users
              : [],
      );
    } catch (err) {
      console.error("Failed to load users:", err);
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
      loadUsers();
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
      loadUsers();
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
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi khôi phục người dùng!");
    }
  };

  return {
    users,
    isLoadingUsers,
    loadUsers,
    handleRoleChange,
    handleDeleteUser,
    handleRestoreUser,
  };
}
