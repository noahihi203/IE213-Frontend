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
    <div className="rounded-3xl border-[0.5px] border-slate-300 bg-white p-6">
      <div className="mb-6 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="mb-2 text-2xl font-medium text-slate-900">
            Danh sách danh mục
          </h1>
          <p className="text-slate-600">Quản lý các danh mục bài viết.</p>
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
              placeholder="Tìm kiếm danh mục..."
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
            <span>Thêm Danh Mục</span>
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-slate-700" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 py-8 text-center text-slate-500">
          <Folder
            size={48}
            weight="duotone"
            className="mx-auto mb-3 text-slate-300"
          />
          Không có danh mục nào hoặc không thể tải dữ liệu
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-[0.5px] border-slate-300">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Tên danh mục", "Mô tả", "Hành động"].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium text-slate-600 ${
                      h === "Hành động" ? "text-center" : "text-left"
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
                  <td className="max-w-2xl break-words px-6 py-4 text-sm text-slate-500">
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
                            type="button"
                            onClick={() => toggleDescription(category._id)}
                            className="mt-1 inline-flex items-center text-xs font-medium text-slate-600 outline-none hover:text-slate-900"
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
                        type="button"
                        onClick={() => onEdit(category)}
                        className="rounded-md border-[0.5px] border-slate-300 bg-white p-1.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        title="Sửa danh mục"
                      >
                        <PencilSimple size={16} weight="duotone" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category._id)}
                        className="rounded-md border-[0.5px] border-rose-200 bg-white p-1.5 text-rose-700 transition-colors hover:bg-rose-50 hover:text-rose-900"
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
