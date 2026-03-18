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
import {
  PenTool,
  FileText,
  Eye,
  Settings,
  LogOut,
  Users,
  Tags,
  Folder,
  Trash2,
  ArchiveRestore,
  Plus,
  Search,
  Edit2,
  X,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized, logout } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "posts" | "users" | "tags" | "categories"
  >("posts");

  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Tag states
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [searchTag, setSearchTag] = useState("");
  const [updatingTagId, setUpdatingTagId] = useState<string | null>(null);

  // Tag Modal states
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagData, setNewTagData] = useState({ name: "", description: "" });
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  // Category states
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");

  // Category Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Description expanded state maps
  const [expandedDescIds, setExpandedDescIds] = useState<
    Record<string, boolean>
  >({});

  const toggleDescription = (id: string) => {
    setExpandedDescIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (!isAuthenticated) {
      setIsLoading(false);
      router.push("/login");
      return;
    }

    loadMyPosts();
  }, [authInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (activeTab === "users" && user?.role === "admin") {
      loadUsers();
    } else if (activeTab === "tags" && user?.role === "admin") {
      loadTags();
    } else if (activeTab === "categories" && user?.role === "admin") {
      loadCategories();
    }
  }, [activeTab, user?.role]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await categoryService.getAllCategories();
      if (Array.isArray(response.metadata)) {
        setCategories(response.metadata);
      } else if (Array.isArray(response.metadata?.data)) {
        setCategories(response.metadata.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadTags = async () => {
    setIsLoadingTags(true);
    try {
      const response = await tagService.getAllTag();
      if (Array.isArray(response.metadata)) {
        setTags(response.metadata);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error("Failed to load tags:", error);
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await userService.getAllUsers({ page: 1, limit: 20 });
      if (Array.isArray(response.metadata)) {
        setUsers(response.metadata);
      } else if (Array.isArray(response.metadata?.data)) {
        setUsers(response.metadata.data);
      } else if (
        response.metadata &&
        typeof response.metadata === "object" &&
        Array.isArray((response.metadata as any).users)
      ) {
        setUsers((response.metadata as any).users); // Fallback for some common backend paginated shapes
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
      loadUsers(); // Refresh sau khi đổi thành công
    } catch (error) {
      console.error("Failed to change role:", error);
      alert("Có lỗi xảy ra khi đổi vai trò!");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa/xóa người dùng này không?"))
      return;
    try {
      await userService.deleteUser(userId);
      loadUsers(); // Refresh sau khi khóa thành công
    } catch (error) {
      console.error("Failed to delete user:", error);
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
      loadUsers(); // Refresh sau khi khôi phục thành công
    } catch (error) {
      console.error("Failed to restore user:", error);
      alert("Có lỗi xảy ra khi khôi phục người dùng!");
    }
  };

  const handleToggleTagStatus = async (
    tagId: string,
    currentStatus: "active" | "inactive",
  ) => {
    if (updatingTagId === tagId) return; // Prevent multiple clicks

    setUpdatingTagId(tagId);
    try {
      if (currentStatus === "active") {
        await tagService.updateStatusTagToInActive(tagId);
      } else {
        await tagService.updateStatusTagToActive(tagId);
      }

      // Update local state smoothly
      setTags(
        tags.map((t) =>
          t._id === tagId
            ? {
                ...t,
                status: currentStatus === "active" ? "inactive" : "active",
              }
            : t,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle tag status:", error);
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
      setTags(tags.filter((t) => t._id !== tagId));
    } catch (error) {
      console.error("Failed to delete tag:", error);
      alert("Có lỗi xảy ra khi xóa tag!");
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
      setCategories(categories.filter((c) => c._id !== categoryId));
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Có lỗi xảy ra khi xóa danh mục!");
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagData.name.trim()) {
      alert("Vui lòng nhập tên tag!");
      return;
    }
    setIsSubmittingTag(true);
    try {
      const res = await tagService.createTag({
        name: newTagData.name,
        description: newTagData.description,
      });
      if (res.metadata) {
        setTags([...tags, res.metadata]);
      }
      setIsTagModalOpen(false);
      setNewTagData({ name: "", description: "" });
    } catch (error: any) {
      console.error("Failed to create tag:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo tag!");
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryData.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }
    setIsSubmittingCategory(true);
    try {
      const res = await categoryService.createCategory({
        name: newCategoryData.name,
        description: newCategoryData.description,
        icon: newCategoryData.icon,
      });
      if (res.metadata) {
        setCategories([...categories, res.metadata]);
      }
      setIsCategoryModalOpen(false);
      setNewCategoryData({ name: "", description: "", icon: "" });
    } catch (error: any) {
      console.error("Failed to create category:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo danh mục!");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const loadMyPosts = async () => {
    try {
      const response = await postService.getMyPosts({ page: 1, limit: 10 });

      // Backend có thể trả về array trực tiếp hoặc nested trong data
      if (Array.isArray(response.metadata)) {
        setPosts(response.metadata);
      } else if (Array.isArray(response.metadata?.data)) {
        setPosts(response.metadata.data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Sidebar */}
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
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "posts"
                      ? "bg-primary-50 text-primary-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Bài viết của tôi</span>
                </button>

                {/* {(user.role === "author" || user.role === "admin") && (
                  <Link
                    href="/posts/create"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <PenTool className="w-5 h-5" />
                    <span>Create Post</span>
                  </Link>
                )} */}

                {/* check role nếu là admin thì sẽ cho quản lý người dùng, quản lý tag, quản lý category */}
                {user.role === "admin" && (
                  <>
                    <button
                      onClick={() => setActiveTab("users")}
                      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeTab === "users"
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      <span>Quản lý người dùng</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("tags")}
                      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeTab === "tags"
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Tags className="w-5 h-5" />
                      <span>Quản lý tag</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("categories")}
                      className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeTab === "categories"
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Folder className="w-5 h-5" />
                      <span>Quản lý category</span>
                    </button>
                  </>
                )}

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

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "posts" && (
              <>
                {user.role === "author" || user.role === "admin" ? (
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">
                      Bài viết của tôi
                    </h1>
                    <p className="text-gray-600">
                      Quản lý bài viết đã đăng và bản nháp
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">
                      Bài viết đã thích
                    </h1>
                    <p className="text-gray-600">Quản lý bài viết đã thích</p>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    {user.role === "author" || user.role === "admin" ? (
                      <>
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Bạn chưa có bài viết nào
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Hãy bắt đầu viết bài đăng blog đầu tiên của bạn.
                        </p>
                        <Link
                          href="/posts/create"
                          className="btn-primary inline-block"
                        >
                          Create Your First Post
                        </Link>
                      </>
                    ) : (
                      <>
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Bạn chưa thích bài viết nào
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Hãy đọc và like một số bài viết.
                        </p>
                        <Link
                          href="/posts"
                          className="btn-primary inline-block"
                        >
                          Bài viết
                        </Link>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Link href={`/posts/${post.slug}`}>
                              <h3 className="text-xl font-bold hover:text-primary-600 mb-2">
                                {post.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              post.status === "published"
                                ? "bg-green-100 text-green-700"
                                : post.status === "draft"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.viewCount} views</span>
                            </span>
                            <span>{post.likesCount} likes</span>
                            <span>{post.commentsCount} comments</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/posts/${post._id}/edit`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/posts/${post.slug}`}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-4">
                  Danh sách người dùng
                </h1>
                <p className="text-gray-600 mb-6">
                  Quản lý người dùng trong hệ thống.
                </p>

                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    Không có người dùng nào hoặc không thể tải dữ liệu
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Người dùng
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vai trò
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>

                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                                  {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {u.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    @{u.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {u.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  u.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : u.role === "author"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {u.role === "admin"
                                  ? "Quản trị viên"
                                  : u.role === "author"
                                    ? "Tác giả"
                                    : "Người dùng"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  u.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {u.isActive ? "Hoạt động" : "Bị khóa"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-3">
                                {u._id !== user?._id && (
                                  <>
                                    <select
                                      value={u.role}
                                      onChange={(e) =>
                                        handleRoleChange(
                                          u._id,
                                          u.role,
                                          e.target.value,
                                        )
                                      }
                                      className="block w-28 text-sm pl-2 py-1 pr-6 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                      disabled={u._id === user?._id}
                                    >
                                      <option value="user">Người dùng</option>
                                      <option value="author">Tác giả</option>
                                      <option value="admin">Admin</option>
                                    </select>

                                    {u.isActive ? (
                                      <button
                                        onClick={() => handleDeleteUser(u._id)}
                                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                                        title="Khóa/Xóa người dùng"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleRestoreUser(u._id)}
                                        className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md hover:bg-green-100 transition-colors"
                                        title="Khôi phục người dùng"
                                      >
                                        <ArchiveRestore className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tags" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Danh sách tag</h1>
                    <p className="text-gray-600">
                      Quản lý các thẻ phân loại bài viết.
                    </p>
                  </div>
                  <div className="flex space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Tìm kiếm tag..."
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setIsTagModalOpen(true)}
                      className="flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Thêm Tag Mới</span>
                    </button>
                  </div>
                </div>

                {isLoadingTags ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Tags className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    Không có tag nào hoặc không thể tải dữ liệu
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            TÊN TAG
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SLUG
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SỐ BÀI
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            TRẠNG THÁI
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            HÀNH ĐỘNG
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tags
                          .filter((t) =>
                            t.name
                              .toLowerCase()
                              .includes(searchTag.toLowerCase()),
                          )
                          .map((tag) => (
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
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    tag.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {tag.status === "active"
                                    ? "Hoạt động"
                                    : "Đã ẩn"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex items-center justify-center space-x-3">
                                  <button
                                    onClick={() =>
                                      handleToggleTagStatus(tag._id, tag.status)
                                    }
                                    disabled={updatingTagId === tag._id}
                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                                      tag.status === "active"
                                        ? "bg-primary-600"
                                        : "bg-gray-200"
                                    } ${updatingTagId === tag._id ? "opacity-50 cursor-not-allowed" : ""}`}
                                    role="switch"
                                    aria-checked={tag.status === "active"}
                                    title={
                                      tag.status === "active"
                                        ? "Tắt Tag"
                                        : "Bật Tag"
                                    }
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
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                    title="Sửa Tag"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteTag(tag._id)}
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
            )}

            {activeTab === "categories" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      Danh sách category
                    </h1>
                    <p className="text-gray-600">
                      Quản lý các danh mục bài viết.
                    </p>
                  </div>
                  <div className="flex space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Thêm Danh Mục</span>
                    </button>
                  </div>
                </div>

                {isLoadingCategories ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    Không có danh mục nào hoặc không thể tải dữ liệu
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            TÊN DANH MỤC
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SLUG
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            MÔ TẢ
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            HÀNH ĐỘNG
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categories
                          .filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(searchCategory.toLowerCase()),
                          )
                          .map((category) => (
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
                                      className={`overflow-hidden transition-all duration-300 ${expandedDescIds[category._id] ? "" : "line-clamp-2"}`}
                                    >
                                      {category.description}
                                    </div>
                                    {category.description.length > 80 && (
                                      <button
                                        onClick={() =>
                                          toggleDescription(category._id)
                                        }
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
                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                    title="Sửa danh mục"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteCategory(category._id)
                                    }
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
            )}
          </div>
        </div>
      </div>

      {/* Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Thêm Tag Mới</h2>
              <button
                onClick={() => setIsTagModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTag} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTagData.name}
                  onChange={(e) =>
                    setNewTagData({ ...newTagData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Nhập tên tag..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newTagData.description}
                  onChange={(e) =>
                    setNewTagData({
                      ...newTagData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Nhập mô tả tag (tùy chọn)..."
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTagModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTag}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 ${isSubmittingTag ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmittingTag ? "Đang lưu..." : "Lưu Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Thêm Danh Mục Mới</h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Danh Mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryData.name}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryData.icon}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      icon: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Nhập icon (ví dụ: lucide-icon-name)..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newCategoryData.description}
                  onChange={(e) =>
                    setNewCategoryData({
                      ...newCategoryData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Nhập mô tả danh mục (tùy chọn)..."
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 ${isSubmittingCategory ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmittingCategory ? "Đang lưu..." : "Lưu Danh Mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
