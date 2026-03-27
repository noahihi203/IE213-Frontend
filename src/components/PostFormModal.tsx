"use client";

import { type ChangeEvent } from "react";
import { X } from "@phosphor-icons/react";
import { Category, Tag } from "@/lib/types";
import { PostFormData } from "../hooks/usePostForm";
import MarkdownEditor from "./MarkdownEditor";

interface PostFormModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  formData: PostFormData;
  categories: Category[];
  availableTags: Tag[];
  isLoadingFormOptions: boolean;
  formOptionsError: string;
  error: string;
  isSubmitting: boolean;
  onClose: () => void;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onContentChange: (markdown: string) => void;
  onTagToggle: (tagId: string) => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onSave?: () => void;
}

const LABELS = {
  create: {
    title: "Thêm Bài Viết Mới",
    subtitle: "Tạo bài viết mới trực tiếp từ trang quản lý.",
  },
  edit: {
    title: "Sửa Bài Viết",
    subtitle: "Cập nhật nội dung bài viết ngay trong dashboard.",
  },
};

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500";

export default function PostFormModal({
  mode,
  isOpen,
  formData,
  categories,
  availableTags,
  isLoadingFormOptions,
  formOptionsError,
  error,
  isSubmitting,
  onClose,
  onInputChange,
  onContentChange,
  onTagToggle,
  onSaveDraft,
  onPublish,
  onSave,
}: PostFormModalProps) {
  if (!isOpen) return null;

  const { title: modalTitle, subtitle } = LABELS[mode];
  const idPrefix = mode === "edit" ? "edit-" : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/*
        Modal rộng hơn (max-w-5xl) để editor split view có đủ không gian
      */}
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {modalTitle}
            </h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 transition-colors hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {formOptionsError && <ErrorBanner message={formOptionsError} />}
          {error && <ErrorBanner message={error} />}

          {isLoadingFormOptions ? (
            <div className="py-10 text-center text-slate-500">
              Đang tải danh mục và tag...
            </div>
          ) : (
            <>
              <Field label="Tiêu đề *" htmlFor={`${idPrefix}title`}>
                <input
                  id={`${idPrefix}title`}
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={onInputChange}
                  className={inputCls}
                  placeholder="Nhập tiêu đề bài viết"
                />
              </Field>

              <Field label="Mô tả ngắn" htmlFor={`${idPrefix}excerpt`}>
                <textarea
                  id={`${idPrefix}excerpt`}
                  name="excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={onInputChange}
                  className={inputCls}
                  placeholder="Tóm tắt ngắn cho bài viết"
                />
              </Field>

              <Field label="Danh mục *" htmlFor={`${idPrefix}category`}>
                <select
                  id={`${idPrefix}category`}
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                  className={inputCls}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Field>

              {/* ── Markdown editor split view ── */}
              <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nội dung *
                </label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={onContentChange}
                  minHeight={420}
                />
              </div>

              <Field label="Cover image URL" htmlFor={`${idPrefix}coverImage`}>
                <input
                  id={`${idPrefix}coverImage`}
                  name="coverImage"
                  type="text"
                  value={formData.coverImage}
                  onChange={onInputChange}
                  className={inputCls}
                  placeholder="https://example.com/image.jpg"
                />
              </Field>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.length === 0 ? (
                    <span className="text-sm text-slate-500">
                      Chưa có tag khả dụng.
                    </span>
                  ) : (
                    availableTags.map((tag) => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => onTagToggle(tag._id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.tags.includes(tag._id)
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isLoadingFormOptions && (
          <div className="flex shrink-0 flex-wrap justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Hủy
            </button>

            {mode === "create" && onSaveDraft && onPublish && (
              <>
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={isSubmitting}
                  className="rounded-md bg-slate-100 px-4 py-2 font-medium text-slate-800 hover:bg-slate-200 disabled:opacity-60"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={isSubmitting}
                  className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Đang đăng..." : "Đăng bài"}
                </button>
              </>
            )}

            {mode === "edit" && onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={isSubmitting}
                className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu chỉnh sửa"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
      {message}
    </div>
  );
}
