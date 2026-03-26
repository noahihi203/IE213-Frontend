"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Outfit } from "next/font/google";

import { usePosts } from "../../hooks/usePosts";
import { useUsers } from "../../hooks/useUsers";
import { useTags } from "../../hooks/useTags";
import { useCategories } from "../../hooks/useCategories";

import DashboardSidebar from "../../components/DashboardSidebar";
import PostsTab from "../../components/PostsTab";
import UsersTab from "../../components/UsersTab";
import TagsTab from "../../components/TagsTab";
import CategoriesTab from "../../components/CategoriesTab";
import SettingsTab from "../../components/SettingsTab";
import TagModal from "../../components/TagModal";
import CategoryModal from "../../components/CategoryModal";

type ActiveTab = "posts" | "users" | "tags" | "categories" | "settings";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("posts");

  const { posts, isLoadingPosts, loadMyPosts } = usePosts();
  const {
    users,
    isLoadingUsers,
    actionError,
    pagination,
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
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className={`${outfit.className} min-h-[100dvh] bg-slate-50`}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
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
          <div className="lg:col-span-3 rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-5">
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
                pagination={pagination}
                isLoading={isLoadingUsers}
                actionError={actionError}
                onPageChange={loadUsers}
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

            {activeTab === "settings" && <SettingsTab user={user} />}
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
