"use client";

import { X } from "@phosphor-icons/react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl border-[0.5px] border-slate-300 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-medium text-slate-900">
            {editingTagId ? "Sửa Tag" : "Thêm Tag Mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tên Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tagData.name}
              onChange={(e) => onChange({ ...tagData, name: e.target.value })}
              className="w-full rounded-md border-[0.5px] border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Nhập tên tag..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              value={tagData.description}
              onChange={(e) =>
                onChange({ ...tagData, description: e.target.value })
              }
              className="w-full rounded-md border-[0.5px] border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Nhập mô tả tag (tùy chọn)..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-md border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 ${
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
