"use client";

import { X } from "@phosphor-icons/react";

interface CategoryModalProps {
  isOpen: boolean;
  editingCategoryId?: string | null;
  categoryData: {
    name: string;
    slug: string;
    abbreviation: string;
    description: string;
    icon: string;
  };
  isSubmitting: boolean;
  onChange: (data: {
    name: string;
    slug: string;
    abbreviation: string;
    description: string;
    icon: string;
  }) => void;
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

  // Generate slug from name (including Vietnamese accents)
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (newName: string) => {
    onChange({
      ...categoryData,
      name: newName,
      slug: generateSlug(newName),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4">
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-lg"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-black">
            {editingCategoryId ? (
              <>
                <span className="font-bold text-black">Sửa</span>{" "}
                <span className="font-normal text-slate-500">Danh Mục</span>
              </>
            ) : (
              <>
                <span className="font-bold text-black">Thêm</span>{" "}
                <span className="font-normal text-slate-500">Danh Mục</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-black transition-colors hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          {/* Name Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">
              Tên Danh Mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-black placeholder-slate-400 transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Nhập tên danh mục..."
            />
          </div>

          {/* Slug Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryData.slug}
              onChange={(e) =>
                onChange({ ...categoryData, slug: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-black placeholder-slate-400 transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Auto-generated từ tên danh mục..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Tự động tạo từ tên danh mục
            </p>
          </div>

          {/* Abbreviation Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">
              Tên viết tắt <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={categoryData.abbreviation}
              onChange={(e) =>
                onChange({ ...categoryData, abbreviation: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-black placeholder-slate-400 transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="VD: Tech, Food..."
            />
          </div>

          {/* Icon Field - URL Link */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">
              Icon Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={categoryData.icon}
              onChange={(e) =>
                onChange({ ...categoryData, icon: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-black placeholder-slate-400 transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="https://example.com/icon.svg"
            />
            <p className="mt-1 text-xs text-slate-500">
              Nhập URL của icon (SVG, PNG, etc.)
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">
              Mô tả <span className="text-slate-400">(Tùy chọn)</span>
            </label>
            <textarea
              value={categoryData.description}
              onChange={(e) =>
                onChange({ ...categoryData, description: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-black placeholder-slate-400 transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Nhập mô tả danh mục..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-black transition-all hover:bg-slate-50 active:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 rounded-2xl bg-black px-4 py-3 font-semibold text-white transition-all ${
                isSubmitting
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-slate-900 active:bg-black"
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
