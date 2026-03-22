"use client";

import { Archive, Trash, UsersThree } from "@phosphor-icons/react";
import { User } from "@/lib/types";

interface UsersTabProps {
  currentUser: User;
  users: User[];
  isLoading: boolean;
  onRoleChange: (userId: string, currentRole: string, newRole: string) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
}

export default function UsersTab({
  currentUser,
  users,
  isLoading,
  onRoleChange,
  onDelete,
  onRestore,
}: UsersTabProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">
        Danh sách người dùng
      </h1>
      <p className="mb-6 text-slate-600">Quản lý người dùng trong hệ thống.</p>

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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 font-bold text-emerald-700">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {u.fullName}
                        </div>
                        <div className="text-sm text-slate-500">
                          @{u.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.isActive ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {u._id !== currentUser._id && (
                      <div className="flex items-center justify-end space-x-3">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            onRoleChange(u._id, u.role, e.target.value)
                          }
                          className="block w-28 rounded-md border border-slate-300 py-1 pl-2 pr-6 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                        >
                          <option value="user">Người dùng</option>
                          <option value="author">Tác giả</option>
                          <option value="admin">Admin</option>
                        </select>

                        {u.isActive ? (
                          <button
                            onClick={() => onDelete(u._id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                            title="Khóa/Xóa người dùng"
                          >
                            <Trash size={16} weight="duotone" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onRestore(u._id)}
                            className="bg-emerald-50 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-900 rounded-md"
                            title="Khôi phục người dùng"
                          >
                            <Archive size={16} weight="duotone" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
