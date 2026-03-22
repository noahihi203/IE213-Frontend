"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

import { usePosts } from "../../hooks/usePosts";
import { useUsers } from "../../hooks/useUsers";
import { useTags } from "../../hooks/useTags";
import { useCategories } from "../../hooks/useCategories";

import DashboardSidebar from "../../components/DashboardSidebar";
import PostsTab from "../../components/PostsTab";
import UsersTab from "../../components/UsersTab";
import TagsTab from "../../components/TagsTab";
import CategoriesTab from "../../components/CategoriesTab";
import TagModal from "../../components/TagModal";
import CategoryModal from "../../components/CategoryModal";

type ActiveTab = "posts" | "users" | "tags" | "categories";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("posts");

  const { posts, isLoadingPosts, loadMyPosts } = usePosts();
  const {
    users,
    isLoadingUsers,
    loadUsers,
    handleRoleChange,
    handleDeleteUser,
    handleRestoreUser,
  } = useUsers();
  const {
    tags,
    isLoadingTags,
    updatingTagId,
    isTagModalOpen,
    editingTagId,
    tagFormData,
    setTagFormData,
    isSubmittingTag,
    loadTags,
    handleToggleTagStatus,
    handleDeleteTag,
    openEditTag,
    openCreateTag,
    closeTagModal,
    handleSubmitTag,
  } = useTags();
  const {
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
  } = useCategories();

  // ─── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadMyPosts();
  }, [authInitialized, isAuthenticated, router]);

  // ─── Lazy-load tab data ───────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "admin") return;
    if (activeTab === "users") loadUsers();
    else if (activeTab === "tags") loadTags();
    else if (activeTab === "categories") loadCategories();
  }, [activeTab, user?.role]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!authInitialized || !user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <DashboardSidebar
              user={user}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
            />
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-3">
            {activeTab === "posts" && (
              <PostsTab
                user={user}
                posts={posts}
                isLoading={isLoadingPosts}
                onPostsRefresh={loadMyPosts}
              />
            )}

            {activeTab === "users" && (
              <UsersTab
                currentUser={user}
                users={users}
                isLoading={isLoadingUsers}
                onRoleChange={handleRoleChange}
                onDelete={handleDeleteUser}
                onRestore={handleRestoreUser}
              />
            )}

            {activeTab === "tags" && (
              <TagsTab
                tags={tags}
                isLoading={isLoadingTags}
                updatingTagId={updatingTagId}
                onToggleStatus={handleToggleTagStatus}
                onEdit={openEditTag}
                onDelete={handleDeleteTag}
                onOpenCreate={openCreateTag}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesTab
                categories={categories}
                isLoading={isLoadingCategories}
                onEdit={openEditCategory}
                onDelete={handleDeleteCategory}
                onOpenCreate={openCreateCategory}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <TagModal
        isOpen={isTagModalOpen}
        editingTagId={editingTagId}
        tagData={tagFormData}
        isSubmitting={isSubmittingTag}
        onChange={setTagFormData}
        onSubmit={handleSubmitTag}
        onClose={closeTagModal}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        editingCategoryId={editingCategoryId}
        categoryData={categoryFormData}
        isSubmitting={isSubmittingCategory}
        onChange={setCategoryFormData}
        onSubmit={handleSubmitCategory}
        onClose={closeCategoryModal}
      />
    </div>
  );
}
