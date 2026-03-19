"use client";

import { useState } from "react";
import { Tags, Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Tag } from "@/lib/types";

interface TagsTabProps {
  tags: Tag[];
  isLoading: boolean;
  updatingTagId: string | null;
  onToggleStatus: (tagId: string, currentStatus: "active" | "inactive") => void;
  onEdit: (tag: Tag) => void;
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold mb-2">Danh sách tag</h1>
          <p className="text-gray-600">Quản lý các thẻ phân loại bài viết.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <button
            onClick={onOpenCreate}
            className="flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm Tag Mới</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Tags className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          Không có tag nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
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
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTags.map((tag) => (
                <tr key={tag._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tag.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tag.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tag.postCount || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs break-words">
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
                            className="text-primary-600 hover:text-primary-800 text-xs font-medium mt-1 inline-flex items-center outline-none"
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
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
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
                            ? "bg-primary-600"
                            : "bg-gray-200"
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
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(tag._id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                        title="Xóa Tag"
                      >
                        <Trash2 className="w-4 h-4" />
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
