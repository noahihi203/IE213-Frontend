import { type ChangeEvent } from "react";
import { X } from "lucide-react";
import { Category, Tag } from "@/lib/types";
import { PostFormData } from "../hooks/usePostForm";
import MarkdownEditor from "./Markdowneditor";

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
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/*
        Modal rộng hơn (max-w-5xl) để editor split view có đủ không gian
      */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-bold">{modalTitle}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {formOptionsError && <ErrorBanner message={formOptionsError} />}
          {error && <ErrorBanner message={error} />}

          {isLoadingFormOptions ? (
            <div className="py-10 text-center text-gray-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.length === 0 ? (
                    <span className="text-sm text-gray-500">
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
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          <div className="px-6 py-4 border-t shrink-0 flex flex-wrap gap-3 justify-end bg-white rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-60"
            >
              Hủy
            </button>

            {mode === "create" && onSaveDraft && onPublish && (
              <>
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium disabled:opacity-60"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-60"
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
                className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-60"
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
        className="block text-sm font-medium text-gray-700 mb-2"
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
