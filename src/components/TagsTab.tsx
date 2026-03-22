"use client";

import { useState } from "react";
import {
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Tag as TagIcon,
  Trash,
} from "@phosphor-icons/react";
import { Tag as TagType } from "@/lib/types";

interface TagsTabProps {
  tags: TagType[];
  isLoading: boolean;
  updatingTagId: string | null;
  onToggleStatus: (tagId: string, currentStatus: "active" | "inactive") => void;
  onEdit: (tag: TagType) => void;
  onDelete: (tagId: string) => void;
  onOpenCreate: () => void;
}

export default function TagsTab({
  tags,
  isLoading,
  updatingTagId,
  onToggleStatus,
  onEdit,
  onDelete,
  onOpenCreate,
}: TagsTabProps) {
  const [search, setSearch] = useState("");
  const [expandedDescIds, setExpandedDescIds] = useState<
    Record<string, boolean>
  >({});

  const toggleDescription = (id: string) => {
    setExpandedDescIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">Danh sách tag</h1>
          <p className="text-slate-600">Quản lý các thẻ phân loại bài viết.</p>
        </div>
        <div className="flex w-full space-x-3 md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlass size={18} weight="duotone" className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm leading-5 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={onOpenCreate}
            className="flex flex-shrink-0 items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Plus size={18} weight="duotone" />
            <span>Thêm Tag Mới</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600" />
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <TagIcon size={48} weight="duotone" className="mx-auto mb-3 text-slate-300" />
          Không có tag nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "TÊN TAG",
                  "SLUG",
                  "SỐ BÀI",
                  "MÔ TẢ",
                  "TRẠNG THÁI",
                  "HÀNH ĐỘNG",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${
                      h === "TRẠNG THÁI" || h === "HÀNH ĐỘNG"
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredTags.map((tag) => (
                <tr key={tag._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {tag.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {tag.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {tag.postCount || 0}
                  </td>
                  <td className="max-w-xs break-words px-6 py-4 text-sm text-slate-500">
                    {tag.description ? (
                      <div>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            expandedDescIds[tag._id] ? "" : "line-clamp-2"
                          }`}
                        >
                          {tag.description}
                        </div>
                        {tag.description.length > 60 && (
                          <button
                            onClick={() => toggleDescription(tag._id)}
                            className="mt-1 inline-flex items-center text-xs font-medium text-emerald-600 outline-none hover:text-emerald-800"
                          >
                            {expandedDescIds[tag._id]
                              ? "Thu gọn"
                              : "... Xem thêm"}
                          </button>
                        )}
                      </div>
                    ) : (
                      "Không có mô tả"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tag.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tag.status === "active" ? "Hoạt động" : "Đã ẩn"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      {/* Toggle switch */}
                      <button
                        onClick={() => onToggleStatus(tag._id, tag.status)}
                        disabled={updatingTagId === tag._id}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                          tag.status === "active"
                            ? "bg-emerald-600"
                            : "bg-slate-200"
                        } ${updatingTagId === tag._id ? "opacity-50 cursor-not-allowed" : ""}`}
                        role="switch"
                        aria-checked={tag.status === "active"}
                        title={tag.status === "active" ? "Tắt Tag" : "Bật Tag"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            tag.status === "active"
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => onEdit(tag)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                        title="Sửa Tag"
                      >
                        <PencilSimple size={16} weight="duotone" />
                      </button>

                      <button
                        onClick={() => onDelete(tag._id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                        title="Xóa Tag"
                      >
                        <Trash size={16} weight="duotone" />
                      </button>
                    </div>
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
