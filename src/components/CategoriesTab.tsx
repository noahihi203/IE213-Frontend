"use client";

import { useState } from "react";
import { Folder, Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Category } from "@/lib/types";

interface CategoriesTabProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onOpenCreate: () => void;
}

export default function CategoriesTab({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onOpenCreate,
}: CategoriesTabProps) {
  const [search, setSearch] = useState("");
  const [expandedDescIds, setExpandedDescIds] = useState<
    Record<string, boolean>
  >({});

  const toggleDescription = (id: string) => {
    setExpandedDescIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold mb-2">Danh sách danh mục</h1>
          <p className="text-gray-600">Quản lý các danh mục bài viết.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
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
            <span>Thêm Danh Mục</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          Không có danh mục nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["TÊN DANH MỤC", "SLUG", "MÔ TẢ", "HÀNH ĐỘNG"].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      h === "HÀNH ĐỘNG" ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs break-words">
                    {category.description ? (
                      <div>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            expandedDescIds[category._id] ? "" : "line-clamp-2"
                          }`}
                        >
                          {category.description}
                        </div>
                        {category.description.length > 80 && (
                          <button
                            onClick={() => toggleDescription(category._id)}
                            className="text-primary-600 hover:text-primary-800 text-xs font-medium mt-1 inline-flex items-center outline-none"
                          >
                            {expandedDescIds[category._id]
                              ? "Thu gọn"
                              : "... Xem thêm"}
                          </button>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                        title="Sửa danh mục"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(category._id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                        title="Xóa danh mục"
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
