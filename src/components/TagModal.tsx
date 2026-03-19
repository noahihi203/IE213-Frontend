"use client";

import { X } from "lucide-react";

interface TagModalProps {
  isOpen: boolean;
  editingTagId: string | null;
  tagData: { name: string; description: string };
  isSubmitting: boolean;
  onChange: (data: { name: string; description: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function TagModal({
  isOpen,
  editingTagId,
  tagData,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: TagModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">
            {editingTagId ? "Sửa Tag" : "Thêm Tag Mới"}
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
              Tên Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tagData.name}
              onChange={(e) => onChange({ ...tagData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Nhập tên tag..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={tagData.description}
              onChange={(e) =>
                onChange({ ...tagData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Nhập mô tả tag (tùy chọn)..."
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
              {isSubmitting ? "Đang lưu..." : "Lưu Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
