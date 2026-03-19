"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { postService } from "@/lib/api/post.service";
import { userService } from "@/lib/api/user.service";
import { tagService } from "@/lib/api/tag.services";
import { categoryService } from "@/lib/api/category.service";
import { Post, User, Tag, Category } from "@/lib/types";
import { FileText, Settings, LogOut, Users, Tags, Folder } from "lucide-react";

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

  // Posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("posts");

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Tags
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [updatingTagId, setUpdatingTagId] = useState<string | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagFormData, setTagFormData] = useState({ name: "", description: "" });
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // ─── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      setIsLoadingPosts(false);
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

  // ─── Data loaders ─────────────────────────────────────────────────────────
  const loadMyPosts = async () => {
    try {
      const res = await postService.getMyPosts({ page: 1, limit: 10 });
      setPosts(
        Array.isArray(res.metadata)
          ? res.metadata
          : Array.isArray(res.metadata?.data)
            ? res.metadata.data
            : [],
      );
    } catch (err) {
      console.error("Failed to load posts:", err);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await userService.getAllUsers({ page: 1, limit: 20 });
      setUsers(
        Array.isArray(res.metadata)
          ? res.metadata
          : Array.isArray(res.metadata?.data)
            ? res.metadata.data
            : Array.isArray((res.metadata as any)?.users)
              ? (res.metadata as any).users
              : [],
      );
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadTags = async () => {
    setIsLoadingTags(true);
    try {
      const res = await tagService.getAllTag();
      setTags(Array.isArray(res.metadata) ? res.metadata : []);
    } catch (err) {
      console.error("Failed to load tags:", err);
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await categoryService.getAllCategories();
      setCategories(
        Array.isArray(res.metadata)
          ? res.metadata
          : Array.isArray(res.metadata?.data)
            ? res.metadata.data
            : [],
      );
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // ─── User handlers ────────────────────────────────────────────────────────
  const handleRoleChange = async (
    userId: string,
    currentRole: string,
    newRole: string,
  ) => {
    if (currentRole === newRole) return;
    if (!window.confirm(`Bạn có chắc chắn muốn đổi vai trò thành ${newRole}?`))
      return;
    try {
      await userService.changeUserRole(
        userId,
        newRole as "user" | "author" | "admin",
      );
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi đổi vai trò!");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa/xóa người dùng này không?"))
      return;
    try {
      await userService.deleteUser(userId);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi khóa người dùng!");
    }
  };

  const handleRestoreUser = async (userId: string) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn khôi phục người dùng này không?")
    )
      return;
    try {
      await userService.restoreUser(userId);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi khôi phục người dùng!");
    }
  };

  // ─── Tag handlers ─────────────────────────────────────────────────────────
  const handleToggleTagStatus = async (
    tagId: string,
    currentStatus: "active" | "inactive",
  ) => {
    if (updatingTagId === tagId) return;
    setUpdatingTagId(tagId);
    try {
      if (currentStatus === "active") {
        await tagService.updateStatusTagToInActive(tagId);
      } else {
        await tagService.updateStatusTagToActive(tagId);
      }
      setTags((prev) =>
        prev.map((t) =>
          t._id === tagId
            ? {
                ...t,
                status: currentStatus === "active" ? "inactive" : "active",
              }
            : t,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi thay đổi trạng thái tag!");
    } finally {
      setUpdatingTagId(null);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa tag này không? Hành động này không thể hoàn tác!",
      )
    )
      return;
    try {
      await tagService.deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t._id !== tagId));
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi xóa tag!");
    }
  };

  const openEditTag = (tag: Tag) => {
    setEditingTagId(tag._id);
    setTagFormData({ name: tag.name, description: tag.description || "" });
    setIsTagModalOpen(true);
  };

  const openCreateTag = () => {
    setEditingTagId(null);
    setTagFormData({ name: "", description: "" });
    setIsTagModalOpen(true);
  };

  const closeTagModal = () => {
    setIsTagModalOpen(false);
    setEditingTagId(null);
    setTagFormData({ name: "", description: "" });
  };

  const handleSubmitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagFormData.name.trim()) {
      alert("Vui lòng nhập tên tag!");
      return;
    }
    setIsSubmittingTag(true);
    try {
      if (editingTagId) {
        await tagService.updateTag({ tagId: editingTagId, ...tagFormData });
      } else {
        await tagService.createTag(tagFormData);
      }
      await loadTags();
      closeTagModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu tag!");
    } finally {
      setIsSubmittingTag(false);
    }
  };

  // ─── Category handlers ────────────────────────────────────────────────────
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
      description: cat.description || "",
      icon: cat.icon || "",
    });
    setIsCategoryModalOpen(true);
  };

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryFormData({ name: "", description: "", icon: "" });
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategoryId(null);
    setCategoryFormData({ name: "", description: "", icon: "" });
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!authInitialized || !user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  // ─── Sidebar nav items ────────────────────────────────────────────────────
  const navItems: {
    tab: ActiveTab;
    icon: React.ReactNode;
    label: string;
    adminOnly?: boolean;
  }[] = [
    {
      tab: "posts",
      icon: <FileText className="w-5 h-5" />,
      label: "Bài viết của tôi",
    },
    {
      tab: "users",
      icon: <Users className="w-5 h-5" />,
      label: "Quản lý người dùng",
      adminOnly: true,
    },
    {
      tab: "tags",
      icon: <Tags className="w-5 h-5" />,
      label: "Quản lý tag",
      adminOnly: true,
    },
    {
      tab: "categories",
      icon: <Folder className="w-5 h-5" />,
      label: "Quản lý danh mục",
      adminOnly: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{user.fullName}</h2>
                <p className="text-gray-600 text-sm">@{user.username}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  {user.role}
                </span>
              </div>

              <nav className="space-y-2">
                {navItems
                  .filter((item) => !item.adminOnly || user.role === "admin")
                  .map(({ tab, icon, label }) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-primary-50 text-primary-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}

                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
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
