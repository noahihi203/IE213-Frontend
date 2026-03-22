"use client";

import { X } from "@phosphor-icons/react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {editingCategoryId ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 transition-colors hover:text-slate-700"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tên Danh Mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryData.name}
              onChange={(e) =>
                onChange({ ...categoryData, name: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập tên danh mục..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Icon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryData.icon}
              onChange={(e) =>
                onChange({ ...categoryData, icon: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập icon..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              value={categoryData.description}
              onChange={(e) =>
                onChange({ ...categoryData, description: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập mô tả danh mục (tùy chọn)..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 ${
                isSubmitting ? "cursor-not-allowed opacity-50" : ""
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
