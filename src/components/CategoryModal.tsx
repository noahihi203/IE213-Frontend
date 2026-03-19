"use client";

import { X } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  editingCategoryId?: string | null;
  categoryData: { name: string; description: string; icon: string };
  isSubmitting: boolean;
  onChange: (data: { name: string; description: string; icon: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function CategoryModal({
  isOpen,
  editingCategoryId,
  categoryData,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">
            {editingCategoryId ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Danh Mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryData.name}
              onChange={(e) =>
                onChange({ ...categoryData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Nhập tên danh mục..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryData.icon}
              onChange={(e) =>
                onChange({ ...categoryData, icon: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Nhập icon (ví dụ: lucide-icon-name)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={categoryData.description}
              onChange={(e) =>
                onChange({ ...categoryData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Nhập mô tả danh mục (tùy chọn)..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Danh Mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
