"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Archive,
  CaretLeft,
  CaretRight,
  Trash,
  UsersThree,
} from "@phosphor-icons/react";
import { User } from "@/lib/types";

interface UsersPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersTabProps {
  currentUser: User;
  users: User[];
  pagination: UsersPagination;
  isLoading: boolean;
  actionError: string | null;
  onPageChange: (page: number) => void;
  onRoleChange: (userId: string, currentRole: string, newRole: string) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
}

interface PendingRoleChange {
  userId: string;
  currentRole: string;
  newRole: string;
  displayName: string;
}

const getVisiblePages = (currentPage: number, totalPages: number): number[] => {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  return Array.from(pages).sort((a, b) => a - b);
};

const CURRENT_ACCOUNT_OPTION_VALUE = "__current_account__";

const ROLE_SELECT_STYLES: Record<User["role"], string> = {
  user: "border-[0.5px] border-slate-300 bg-white text-slate-700 focus:ring-slate-200",
  author:
    "border-[0.5px] border-emerald-300 bg-white text-emerald-800 focus:ring-emerald-200",
  admin:
    "border-[0.5px] border-rose-300 bg-white text-rose-800 focus:ring-rose-200",
};

export default function UsersTab({
  currentUser,
  users,
  pagination,
  isLoading,
  actionError,
  onPageChange,
  onRoleChange,
  onDelete,
  onRestore,
}: UsersTabProps) {
  const [pendingRoleChange, setPendingRoleChange] =
    useState<PendingRoleChange | null>(null);

  const {
    currentPage,
    totalPages,
    totalUsers,
    hasNextPage,
    hasPrevPage,
    limit,
  } = pagination;

  const startIndex = totalUsers === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex =
    totalUsers === 0 ? 0 : Math.min(currentPage * limit, totalUsers);
  const pageNumbers = getVisiblePages(currentPage, totalPages);

  const roleLabel: Record<string, string> = {
    user: "Người dùng",
    author: "Tác giả",
    admin: "Quản trị viên",
  };

  const handleOpenRoleConfirm = (
    userId: string,
    currentRole: string,
    newRole: string,
    displayName: string,
  ) => {
    if (currentRole === newRole) return;
    setPendingRoleChange({
      userId,
      currentRole,
      newRole,
      displayName,
    });
  };

  const handleConfirmRoleChange = () => {
    if (!pendingRoleChange) return;
    onRoleChange(
      pendingRoleChange.userId,
      pendingRoleChange.currentRole,
      pendingRoleChange.newRole,
    );
    setPendingRoleChange(null);
  };

  return (
    <div className="rounded-3xl border-[0.5px] border-slate-300 bg-white p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">
            Danh sách người dùng
          </h1>
          <p className="text-slate-600">Quản lý người dùng trong hệ thống.</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Tổng số:{" "}
          <span className="font-medium text-slate-900">{totalUsers}</span>
        </div>
      </div>

      {actionError ? (
        <div className="mb-4 rounded-xl border-[0.5px] border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-slate-700" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 py-8 text-center text-slate-500">
          <UsersThree
            size={48}
            weight="duotone"
            className="mx-auto mb-3 text-slate-300"
          />
          Không có người dùng nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border-[0.5px] border-slate-300 bg-white">
            <table className="min-w-[760px] w-full table-auto divide-y divide-slate-200">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th className="w-[38%] px-3 py-3 text-left text-xs font-medium text-slate-600 md:px-4">
                    Người dùng
                  </th>
                  <th className="w-[28%] px-3 py-3 text-left text-xs font-medium text-slate-600 md:px-4">
                    Vai trò
                  </th>
                  <th className="w-[16%] px-3 py-3 text-left text-xs font-medium text-slate-600 md:px-4">
                    Trạng thái
                  </th>
                  <th className="w-[18%] px-3 py-3 text-right text-xs font-medium text-slate-600 md:px-4">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="align-top transition-colors hover:bg-slate-50"
                  >
                    <td className="px-3 py-4 md:px-4">
                      <Link
                        href={`/users/${u._id}`}
                        className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                      >
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-[0.5px] border-slate-300 bg-slate-200">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.fullName || u.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-medium text-slate-700">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="break-words text-sm font-medium text-slate-900 transition-colors group-hover:text-slate-700">
                            {u.fullName || "Chưa cập nhật tên"}
                          </div>
                          <div className="break-words text-sm text-slate-500">
                            @{u.username}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="px-3 py-4 md:px-4">
                      <div className="flex flex-col items-start gap-2">
                        {u._id !== currentUser._id ? (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleOpenRoleConfirm(
                                u._id,
                                u.role,
                                e.target.value,
                                u.fullName || u.username,
                              )
                            }
                            className={`w-auto max-w-full rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 ${ROLE_SELECT_STYLES[u.role]}`}
                          >
                            <option value="user">Người dùng</option>
                            <option value="author">Tác giả</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        ) : (
                          <select
                            value={CURRENT_ACCOUNT_OPTION_VALUE}
                            disabled
                            className="w-auto max-w-full cursor-not-allowed rounded-lg border-[0.5px] border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500"
                            aria-label="Tài khoản hiện tại"
                          >
                            <option value={CURRENT_ACCOUNT_OPTION_VALUE}>
                              Tài khoản hiện tại
                            </option>
                          </select>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-4 md:px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-right text-sm font-medium md:px-4">
                      {u._id !== currentUser._id ? (
                        <div className="flex items-center justify-end">
                          {u.isActive ? (
                            <button
                              type="button"
                              onClick={() => onDelete(u._id)}
                              className="rounded-lg border-[0.5px] border-rose-200 bg-white p-2 text-rose-700 transition-colors hover:bg-rose-50 hover:text-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                              title="Khóa/Xóa người dùng"
                            >
                              <Trash size={16} weight="duotone" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onRestore(u._id)}
                              className="rounded-lg border-[0.5px] border-slate-300 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                              title="Khôi phục người dùng"
                            >
                              <Archive size={16} weight="duotone" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-300">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border-[0.5px] border-slate-300 bg-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Hiển thị{" "}
              <span className="font-medium text-slate-800">{startIndex}</span>-
              <span className="font-medium text-slate-800">{endIndex}</span>{" "}
              trên
              <span className="font-medium text-slate-800">
                {" "}
                {totalUsers}
              </span>{" "}
              người dùng
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage || isLoading}
                className="inline-flex items-center gap-1 rounded-lg border-[0.5px] border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CaretLeft size={14} />
                Trước
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  disabled={page === currentPage || isLoading}
                  className={`min-w-9 rounded-lg border-[0.5px] px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    page === currentPage
                      ? "border-slate-400 bg-slate-200 text-slate-900"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage || isLoading}
                className="inline-flex items-center gap-1 rounded-lg border-[0.5px] border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
                <CaretRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingRoleChange ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-2xl border-[0.5px] border-slate-300 bg-white p-5">
            <h3 className="text-lg font-medium text-slate-900">
              Xác nhận thay đổi vai trò
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Bạn có chắc chắn muốn đổi vai trò của
              <span className="font-medium text-slate-900">
                {` ${pendingRoleChange.displayName}`}
              </span>{" "}
              sang
              <span className="font-medium text-slate-900">
                {` ${roleLabel[pendingRoleChange.newRole] || pendingRoleChange.newRole}`}
              </span>
              ?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingRoleChange(null)}
                className="rounded-lg border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Không
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="rounded-lg border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                Có, xác nhận
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
