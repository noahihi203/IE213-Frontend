"use client";

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
  onPageChange: (page: number) => void;
  onRoleChange: (userId: string, currentRole: string, newRole: string) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
}

const getVisiblePages = (currentPage: number, totalPages: number): number[] => {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  return Array.from(pages).sort((a, b) => a - b);
};

export default function UsersTab({
  currentUser,
  users,
  pagination,
  isLoading,
  onPageChange,
  onRoleChange,
  onDelete,
  onRestore,
}: UsersTabProps) {
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

  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Danh sách người dùng
          </h1>
          <p className="text-slate-600">Quản lý người dùng trong hệ thống.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Tổng số:{" "}
          <span className="font-semibold text-slate-900">{totalUsers}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <UsersThree
            size={48}
            weight="duotone"
            className="mx-auto mb-3 text-slate-300"
          />
          Không có người dùng nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200">
            <table className="w-full table-auto divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[38%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 md:px-4">
                    Người dùng
                  </th>
                  <th className="w-[18%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 md:px-4">
                    Vai trò
                  </th>
                  <th className="w-[16%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 md:px-4">
                    Trạng thái
                  </th>
                  <th className="w-[28%] px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 md:px-4">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((u) => (
                  <tr key={u._id} className="align-top hover:bg-slate-50/80">
                    <td className="px-3 py-4 md:px-4">
                      <Link
                        href={`/users/${u._id}`}
                        className="group flex items-start gap-3 rounded-xl p-1 transition-colors hover:bg-emerald-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-emerald-200 bg-emerald-100">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.fullName || u.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-emerald-700">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="break-words text-sm font-semibold text-slate-900 transition-colors group-hover:text-emerald-700">
                            {u.fullName || "Chưa cập nhật tên"}
                          </div>
                          <div className="break-words text-sm text-slate-500">
                            @{u.username}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="px-3 py-4 md:px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-rose-100 text-rose-700"
                            : u.role === "author"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role === "admin"
                          ? "Quản trị viên"
                          : u.role === "author"
                            ? "Tác giả"
                            : "Người dùng"}
                      </span>
                    </td>

                    <td className="px-3 py-4 md:px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
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
                        <div className="flex flex-col items-end gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              onRoleChange(u._id, u.role, e.target.value)
                            }
                            className="w-24 rounded-md border border-slate-300 py-1 pl-2 pr-6 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 lg:w-28"
                          >
                            <option value="user">Người dùng</option>
                            <option value="author">Tác giả</option>
                            <option value="admin">Admin</option>
                          </select>

                          {u.isActive ? (
                            <button
                              onClick={() => onDelete(u._id)}
                              className="rounded-md bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 hover:text-red-900"
                              title="Khóa/Xóa người dùng"
                            >
                              <Trash size={16} weight="duotone" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onRestore(u._id)}
                              className="rounded-md bg-emerald-50 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-900"
                              title="Khôi phục người dùng"
                            >
                              <Archive size={16} weight="duotone" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Tài khoản hiện tại
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Hiển thị{" "}
              <span className="font-semibold text-slate-800">{startIndex}</span>
              -<span className="font-semibold text-slate-800">{endIndex}</span>{" "}
              trên
              <span className="font-semibold text-slate-800">
                {" "}
                {totalUsers}
              </span>{" "}
              người dùng
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage || isLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CaretLeft size={14} />
                Trước
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={page === currentPage || isLoading}
                  className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    page === currentPage
                      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage || isLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
                <CaretRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
