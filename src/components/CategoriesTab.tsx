"use client";

import { useState } from "react";
import {
  Folder,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";
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
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">Danh sách danh mục</h1>
          <p className="text-slate-600">Quản lý các danh mục bài viết.</p>
        </div>
        <div className="flex w-full space-x-3 md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlass size={18} weight="duotone" className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
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
            <span>Thêm Danh Mục</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <Folder size={48} weight="duotone" className="mx-auto mb-3 text-slate-300" />
          Không có danh mục nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["TÊN DANH MỤC", "SLUG", "MÔ TẢ", "HÀNH ĐỘNG"].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${
                      h === "HÀNH ĐỘNG" ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {category.slug}
                  </td>
                  <td className="max-w-xs break-words px-6 py-4 text-sm text-slate-500">
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
                            className="mt-1 inline-flex items-center text-xs font-medium text-emerald-600 outline-none hover:text-emerald-800"
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
                        <PencilSimple size={16} weight="duotone" />
                      </button>
                      <button
                        onClick={() => onDelete(category._id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                        title="Xóa danh mục"
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
