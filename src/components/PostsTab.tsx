"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Eye, Pencil, Plus, Search, X } from "lucide-react";
import { Category, Post, Tag, User } from "@/lib/types";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { tagService } from "@/lib/api/tag.services";

interface PostsTabProps {
  user: User;
  posts: Post[];
  isLoading: boolean;
  onPostsRefresh?: () => Promise<void> | void;
}

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  tags: string[];
}

const createEmptyPostForm = (): PostFormData => ({
  title: "",
  excerpt: "",
  content: "",
  category: "",
  coverImage: "",
  tags: [],
});

const resolveCategoryId = (category: Post["category"]) => {
  if (typeof category === "string") return category;
  return category?._id || "";
};

const resolveTagIds = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (
        tag &&
        typeof tag === "object" &&
        "_id" in tag &&
        typeof (tag as { _id?: unknown })._id === "string"
      ) {
        return (tag as { _id: string })._id;
      }
      return "";
    })
    .filter((tagId): tagId is string => Boolean(tagId));
};

export default function PostsTab({
  user,
  posts,
  isLoading,
  onPostsRefresh,
}: PostsTabProps) {
  const isAuthorOrAdmin = user.role === "author" || user.role === "admin";
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingFormOptions, setIsLoadingFormOptions] = useState(false);
  const [formOptionsError, setFormOptionsError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createFormData, setCreateFormData] = useState<PostFormData>(
    createEmptyPostForm(),
  );

  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [editError, setEditError] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<PostFormData>(
    createEmptyPostForm(),
  );

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((post) => {
      const title = post.title?.toLowerCase() || "";
      const excerpt = post.excerpt?.toLowerCase() || "";
      const content = post.content?.toLowerCase() || "";
      return (
        title.includes(keyword) ||
        excerpt.includes(keyword) ||
        content.includes(keyword)
      );
    });
  }, [posts, search]);

  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen) return;
    if (categories.length > 0 && availableTags.length > 0) return;

    let isMounted = true;

    const loadPostFormOptions = async () => {
      setIsLoadingFormOptions(true);
      setFormOptionsError("");

      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          categoryService.getAllCategories(),
          tagService.getAllTag(),
        ]);

        if (!isMounted) return;

        setCategories(
          Array.isArray(categoriesRes.metadata) ? categoriesRes.metadata : [],
        );
        setAvailableTags(
          Array.isArray(tagsRes.metadata) ? tagsRes.metadata : [],
        );
      } catch (error) {
        console.error("Failed to load post form options:", error);
        if (isMounted) {
          setCategories([]);
          setAvailableTags([]);
          setFormOptionsError("Không thể tải danh mục hoặc tag.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingFormOptions(false);
        }
      }
    };

    loadPostFormOptions();

    return () => {
      isMounted = false;
    };
  }, [
    isCreateModalOpen,
    isEditModalOpen,
    categories.length,
    availableTags.length,
  ]);

  const openCreateModal = () => {
    setFormOptionsError("");
    setCreateError("");
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = (force = false) => {
    if (isCreatingPost && !force) return;

    setIsCreateModalOpen(false);
    setFormOptionsError("");
    setCreateError("");
    setCreateFormData(createEmptyPostForm());
  };

  const openEditModal = (post: Post) => {
    setFormOptionsError("");
    setEditError("");
    setEditingPostId(post._id);
    setEditFormData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: resolveCategoryId(post.category),
      coverImage: post.coverImage || "",
      tags: resolveTagIds((post as unknown as { tags?: unknown }).tags),
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = (force = false) => {
    if (isUpdatingPost && !force) return;

    setIsEditModalOpen(false);
    setFormOptionsError("");
    setEditError("");
    setEditingPostId(null);
    setEditFormData(createEmptyPostForm());
  };

  const handleCreateInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setCreateFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateTagToggle = (tagId: string) => {
    setCreateFormData((prev) => {
      const isSelected = prev.tags.includes(tagId);
      return {
        ...prev,
        tags: isSelected
          ? prev.tags.filter((id) => id !== tagId)
          : [...prev.tags, tagId],
      };
    });
  };

  const handleEditInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditTagToggle = (tagId: string) => {
    setEditFormData((prev) => {
      const isSelected = prev.tags.includes(tagId);
      return {
        ...prev,
        tags: isSelected
          ? prev.tags.filter((id) => id !== tagId)
          : [...prev.tags, tagId],
      };
    });
  };

  const handleCreatePost = async (status: "draft" | "published") => {
    const title = createFormData.title.trim();
    const content = createFormData.content.trim();
    const category = createFormData.category;

    if (!title || !content || !category) {
      setCreateError("Vui lòng nhập tiêu đề, nội dung và chọn danh mục.");
      return;
    }

    const excerpt =
      createFormData.excerpt.trim() || `${content.slice(0, 200).trim()}...`;

    const postData: {
      title: string;
      content: string;
      excerpt: string;
      category: string;
      tags: string[];
      status: "draft" | "published";
      coverImage?: string;
    } = {
      title,
      content,
      excerpt,
      category,
      tags: createFormData.tags,
      status,
    };

    const coverImage = createFormData.coverImage.trim();
    if (coverImage) {
      postData.coverImage = coverImage;
    }

    try {
      setIsCreatingPost(true);
      setCreateError("");

      await postService.createPost(postData);
      closeCreateModal(true);

      if (onPostsRefresh) {
        await onPostsRefresh();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      setCreateError(error?.message || "Không thể tạo bài viết.");
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPostId) {
      setEditError("Không xác định được bài viết để chỉnh sửa.");
      return;
    }

    const title = editFormData.title.trim();
    const content = editFormData.content.trim();
    const category = editFormData.category;

    if (!title || !content || !category) {
      setEditError("Vui lòng nhập tiêu đề, nội dung và chọn danh mục.");
      return;
    }

    const excerpt =
      editFormData.excerpt.trim() || `${content.slice(0, 200).trim()}...`;

    const updateData: {
      title: string;
      content: string;
      excerpt: string;
      category: string;
      tags: string[];
      coverImage?: string;
    } = {
      title,
      content,
      excerpt,
      category,
      tags: editFormData.tags,
    };

    const coverImage = editFormData.coverImage.trim();
    if (coverImage) {
      updateData.coverImage = coverImage;
    }

    try {
      setIsUpdatingPost(true);
      setEditError("");

      await postService.updatePost(editingPostId, updateData);
      closeEditModal(true);

      if (onPostsRefresh) {
        await onPostsRefresh();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      setEditError(error?.message || "Không thể cập nhật bài viết.");
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const handleStatusChange = async (
    postId: string,
    newStatus: Post["status"],
  ) => {
    try {
      await postService.changePostStatus(postId, newStatus);
      if (onPostsRefresh) {
        await onPostsRefresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <>
      {isAuthorOrAdmin ? (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bài viết của tôi</h1>
            <p className="text-gray-600">
              Quản lý bài viết đã đăng và bản nháp
            </p>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Viết bài</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Bài viết đã thích</h1>
          <p className="text-gray-600">Quản lý bài viết đã thích</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          {isAuthorOrAdmin ? (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Bạn chưa có bài viết nào
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy bắt đầu viết bài đăng blog đầu tiên của bạn.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="flex-shrink-0 inline-flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                <span>Viết bài đầu tiên</span>
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Bạn chưa thích bài viết nào
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy đọc và like một số bài viết.
              </p>
              <Link href="/posts" className="btn-primary inline-block">
                Bài viết
              </Link>
            </>
          )}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy bài viết
          </h3>
          <p className="text-gray-600">
            Không có bài viết nào khớp với từ khóa bạn vừa tìm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="absolute inset-0 z-0"
              />
              <div className="p-6 relative z-10 pointer-events-none">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold hover:text-primary-600 mb-2 pointer-events-auto inline-block">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                  </div>
                  {isAuthorOrAdmin ? (
                    <select
                      className={`pointer-events-auto cursor-pointer outline-none border border-gray-200 px-3 py-1 rounded-full text-xs font-medium focus:ring-2 focus:ring-primary-500 ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : post.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                      value={post.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusChange(
                          post._id,
                          e.target.value as Post["status"],
                        )
                      }
                    >
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                      <option value="archived">archived</option>
                    </select>
                  ) : (
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
                  )}
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
                  <div className="flex items-center space-x-3 pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(post);
                      }}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-gray-600 hover:text-gray-700 bg-gray-50 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => closeCreateModal()}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Thêm Bài Viết Mới</h2>
                <p className="text-sm text-gray-500">
                  Tạo bài viết mới trực tiếp từ trang quản lý.
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeCreateModal()}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {formOptionsError && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {formOptionsError}
                </div>
              )}

              {createError && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {createError}
                </div>
              )}

              {isLoadingFormOptions ? (
                <div className="py-10 text-center text-gray-500">
                  Đang tải danh mục và tag...
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tiêu đề *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={createFormData.title}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Nhập tiêu đề bài viết"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="excerpt"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mô tả ngắn
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      rows={3}
                      value={createFormData.excerpt}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Tóm tắt ngắn cho bài viết"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Danh mục *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={createFormData.category}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nội dung *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={12}
                      value={createFormData.content}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-sm"
                      placeholder="Viết nội dung bài tại đây..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="coverImage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Cover image URL
                    </label>
                    <input
                      id="coverImage"
                      name="coverImage"
                      type="text"
                      value={createFormData.coverImage}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = createFormData.tags.includes(
                          tag._id,
                        );
                        return (
                          <button
                            key={tag._id}
                            type="button"
                            onClick={() => handleCreateTagToggle(tag._id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                      {availableTags.length === 0 && (
                        <span className="text-sm text-gray-500">
                          Chưa có tag khả dụng.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => closeCreateModal()}
                      disabled={isCreatingPost}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-60"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreatePost("draft")}
                      disabled={isCreatingPost}
                      className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium disabled:opacity-60"
                    >
                      {isCreatingPost ? "Đang lưu..." : "Lưu nháp"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreatePost("published")}
                      disabled={isCreatingPost}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-60"
                    >
                      {isCreatingPost ? "Đang đăng..." : "Đăng bài"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => closeEditModal()}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Sửa Bài Viết</h2>
                <p className="text-sm text-gray-500">
                  Cập nhật nội dung bài viết ngay trong dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeEditModal()}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {formOptionsError && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {formOptionsError}
                </div>
              )}

              {editError && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {editError}
                </div>
              )}

              {isLoadingFormOptions ? (
                <div className="py-10 text-center text-gray-500">
                  Đang tải danh mục và tag...
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="edit-title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tiêu đề *
                    </label>
                    <input
                      id="edit-title"
                      name="title"
                      type="text"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Nhập tiêu đề bài viết"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-excerpt"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mô tả ngắn
                    </label>
                    <textarea
                      id="edit-excerpt"
                      name="excerpt"
                      rows={3}
                      value={editFormData.excerpt}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Tóm tắt ngắn cho bài viết"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Danh mục *
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-content"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nội dung *
                    </label>
                    <textarea
                      id="edit-content"
                      name="content"
                      rows={12}
                      value={editFormData.content}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-sm"
                      placeholder="Viết nội dung bài tại đây..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-coverImage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Cover image URL
                    </label>
                    <input
                      id="edit-coverImage"
                      name="coverImage"
                      type="text"
                      value={editFormData.coverImage}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = editFormData.tags.includes(tag._id);
                        return (
                          <button
                            key={tag._id}
                            type="button"
                            onClick={() => handleEditTagToggle(tag._id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                      {availableTags.length === 0 && (
                        <span className="text-sm text-gray-500">
                          Chưa có tag khả dụng.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => closeEditModal()}
                      disabled={isUpdatingPost}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-60"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdatePost}
                      disabled={isUpdatingPost}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-60"
                    >
                      {isUpdatingPost ? "Đang lưu..." : "Lưu chỉnh sửa"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
