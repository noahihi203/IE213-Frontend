import { useState } from "react";
import { categoryService } from "@/lib/api/category.service";
import { Category } from "@/lib/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    abbreviation: "",
    slug: "",
    description: "",
    icon: "",
  });
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // const loadCategories = async () => {
  //   setIsLoadingCategories(true);
  //   try {
  //     const res = await categoryService.getAllCategories();
  //     setCategories(
  //       Array.isArray(res.metadata)
  //         ? res.metadata
  //         : Array.isArray(res.metadata?.data)
  //           ? res.metadata.data
  //           : [],
  //     );
  //   } catch (err) {
  //     console.error("Failed to load categories:", err);
  //     setCategories([]);
  //   } finally {
  //     setIsLoadingCategories(false);
  //   }
  // };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await categoryService.getAllCategories();
      const meta = res.metadata as Category[] | { data: Category[] } | null;
      setCategories(
        Array.isArray(meta)
          ? meta
          : Array.isArray((meta as { data: Category[] })?.data)
            ? (meta as { data: Category[] }).data
            : [],
      );
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác!",
      )
    )
      return;
    try {
      await categoryService.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi xóa danh mục!");
    }
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategoryId(cat._id);
    setCategoryFormData({
      name: cat.name,
      abbreviation: cat.abbreviation || "",
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "",
    });
    setIsCategoryModalOpen(true);
  };

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryFormData({
      name: "",
      abbreviation: "",
      slug: "",
      description: "",
      icon: "",
    });
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategoryId(null);
    setCategoryFormData({
      name: "",
      abbreviation: "",
      slug: "",
      description: "",
      icon: "",
    });
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }
    if (!categoryFormData.abbreviation.trim()) {
      alert("Vui lòng nhập tên viết tắt!");
      return;
    }
    setIsSubmittingCategory(true);
    try {
      if (editingCategoryId) {
        await categoryService.updateCategory(
          editingCategoryId,
          categoryFormData,
        );
      } else {
        await categoryService.createCategory(categoryFormData);
      }
      await loadCategories();
      closeCategoryModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu danh mục!");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  return {
    categories,
    isLoadingCategories,
    isCategoryModalOpen,
    editingCategoryId,
    categoryFormData,
    setCategoryFormData,
    isSubmittingCategory,
    loadCategories,
    handleDeleteCategory,
    openEditCategory,
    openCreateCategory,
    closeCategoryModal,
    handleSubmitCategory,
  };
}
