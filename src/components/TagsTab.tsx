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
    <div className="rounded-3xl border-[0.5px] border-slate-300 bg-white p-6">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="mb-2 text-2xl font-medium text-slate-900">
            Danh sách tag
          </h1>
          <p className="text-slate-600">Quản lý các thẻ phân loại bài viết.</p>
        </div>
        <div className="flex w-full space-x-3 md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlass
                size={18}
                weight="duotone"
                className="text-slate-400"
              />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-[0.5px] border-slate-300 bg-white py-2 pl-10 pr-3 text-sm leading-5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex flex-shrink-0 items-center justify-center space-x-2 rounded-lg border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            <Plus size={18} weight="duotone" />
            <span>Thêm Tag Mới</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-slate-700" />
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 py-8 text-center text-slate-500">
          <TagIcon
            size={48}
            weight="duotone"
            className="mx-auto mb-3 text-slate-300"
          />
          Không có tag nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-[0.5px] border-slate-300">
          <table className="min-w-full divide-y divide-slate-200 bg-white">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Tên tag",
                  "Slug",
                  "Số bài",
                  "Mô tả",
                  "Trạng thái",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium text-slate-600 ${
                      h === "Trạng thái" || h === "Hành động"
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
                            type="button"
                            onClick={() => toggleDescription(tag._id)}
                            className="mt-1 inline-flex items-center text-xs font-medium text-slate-600 outline-none hover:text-slate-900"
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
                      <button
                        type="button"
                        onClick={() => onToggleStatus(tag._id, tag.status)}
                        disabled={updatingTagId === tag._id}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-[0.5px] border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          tag.status === "active"
                            ? "bg-slate-700"
                            : "bg-slate-200"
                        } ${updatingTagId === tag._id ? "opacity-50 cursor-not-allowed" : ""}`}
                        role="switch"
                        aria-checked={tag.status === "active"}
                        title={tag.status === "active" ? "Tắt Tag" : "Bật Tag"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out ${
                            tag.status === "active"
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(tag)}
                        className="rounded-md border-[0.5px] border-slate-300 bg-white p-1.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        title="Sửa Tag"
                      >
                        <PencilSimple size={16} weight="duotone" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(tag._id)}
                        className="rounded-md border-[0.5px] border-rose-200 bg-white p-1.5 text-rose-700 transition-colors hover:bg-rose-50 hover:text-rose-900"
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
