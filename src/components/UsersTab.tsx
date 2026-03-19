"use client";

import { Users, Trash2, ArchiveRestore } from "lucide-react";
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-2">Danh sách người dùng</h1>
      <p className="text-gray-600 mb-6">Quản lý người dùng trong hệ thống.</p>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          Không có người dùng nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{u.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "author"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
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
                          ? "bg-green-100 text-green-800"
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
                          className="block w-28 text-sm pl-2 py-1 pr-6 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
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
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onRestore(u._id)}
                            className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md hover:bg-green-100 transition-colors"
                            title="Khôi phục người dùng"
                          >
                            <ArchiveRestore className="w-4 h-4" />
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
