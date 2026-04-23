import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Category, Post, Tag } from "@/lib/types";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { tagService } from "@/lib/api/tag.services";

export interface PostFormData {
  title: string;
  excerpt: string;
  keyword: string;
  content: string;
  category: string;
  coverImage: string;
  tags: string[];
}

const createEmptyPostForm = (): PostFormData => ({
  title: "",
  excerpt: "",
  keyword: "",
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
    .filter((id): id is string => Boolean(id));
};

export function usePostForm(onPostsRefresh?: () => Promise<void> | void) {
  const router = useRouter();

  // Form options (shared between create/edit)
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingFormOptions, setIsLoadingFormOptions] = useState(false);
  const [formOptionsError, setFormOptionsError] = useState("");

  // Create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createFormData, setCreateFormData] = useState<PostFormData>(
    createEmptyPostForm(),
  );

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [editError, setEditError] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<PostFormData>(
    createEmptyPostForm(),
  );

  // Load categories + tags lazily when either modal opens
  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen) return;
    if (categories.length > 0 && availableTags.length > 0) return;

    let isMounted = true;

    const load = async () => {
      setIsLoadingFormOptions(true);
      setFormOptionsError("");
      try {
        const [catRes, tagRes] = await Promise.all([
          categoryService.getAllCategories(),
          tagService.getAllTag(),
        ]);
        if (!isMounted) return;
        setCategories(Array.isArray(catRes.metadata) ? catRes.metadata : []);
        setAvailableTags(Array.isArray(tagRes.metadata) ? tagRes.metadata : []);
      } catch {
        if (isMounted) {
          setCategories([]);
          setAvailableTags([]);
          setFormOptionsError("Không thể tải danh mục hoặc tag.");
        }
      } finally {
        if (isMounted) setIsLoadingFormOptions(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [
    isCreateModalOpen,
    isEditModalOpen,
    categories.length,
    availableTags.length,
  ]);

  // ── Create ──────────────────────────────────────────────────────────────
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

  const handleCreateInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) =>
    setCreateFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateTagToggle = (tagId: string) =>
    setCreateFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));

  const handleCreatePost = async (status: "draft" | "published") => {
    const title = createFormData.title.trim();
    const content = createFormData.content.trim();
    const keyword = createFormData.keyword.trim();
    const category = createFormData.category;

    if (!title || !content || !category) {
      setCreateError("Vui lòng nhập tiêu đề, nội dung và chọn danh mục.");
      return;
    }

    const excerpt =
      createFormData.excerpt.trim() || `${content.slice(0, 200).trim()}...`;
    const postData: Parameters<typeof postService.createPost>[0] = {
      title,
      content,
      keyword,
      excerpt,
      category,
      tags: createFormData.tags,
      status,
    };
    const coverImage = createFormData.coverImage.trim();
    if (coverImage) postData.coverImage = coverImage;

    try {
      setIsCreatingPost(true);
      setCreateError("");
      await postService.createPost(postData);
      closeCreateModal(true);
      onPostsRefresh ? await onPostsRefresh() : router.refresh();
    } catch (err: any) {
      setCreateError(err?.message || "Không thể tạo bài viết.");
    } finally {
      setIsCreatingPost(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────
  const openEditModal = (post: Post) => {
    setFormOptionsError("");
    setEditError("");
    setEditingPostId(post._id);
    setEditFormData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      keyword: post.keyword || "",
      content: post.content || "",
      category: resolveCategoryId(post.category),
      coverImage: post.coverImage || "",
      tags: resolveTagIds((post as any).tags),
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

  const handleEditInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) =>
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEditTagToggle = (tagId: string) =>
    setEditFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));

  const handleUpdatePost = async () => {
    if (!editingPostId) {
      setEditError("Không xác định được bài viết để chỉnh sửa.");
      return;
    }

    const title = editFormData.title.trim();
    const content = editFormData.content.trim();
    const keyword = editFormData.keyword.trim();
    const category = editFormData.category;

    if (!title || !content || !category) {
      setEditError("Vui lòng nhập tiêu đề, nội dung và chọn danh mục.");
      return;
    }

    const excerpt =
      editFormData.excerpt.trim() || `${content.slice(0, 200).trim()}...`;
    const updateData: Parameters<typeof postService.updatePost>[1] = {
      title,
      content,
      excerpt,
      keyword,
      category,
      tags: editFormData.tags,
    };
    const coverImage = editFormData.coverImage.trim();
    if (coverImage) updateData.coverImage = coverImage;

    try {
      setIsUpdatingPost(true);
      setEditError("");
      await postService.updatePost(editingPostId, updateData);
      closeEditModal(true);
      onPostsRefresh ? await onPostsRefresh() : router.refresh();
    } catch (err: any) {
      setEditError(err?.message || "Không thể cập nhật bài viết.");
    } finally {
      setIsUpdatingPost(false);
    }
  };

  // ── Status change ────────────────────────────────────────────────────────
  const handleStatusChange = async (
    postId: string,
    newStatus: Post["status"],
  ) => {
    try {
      await postService.changePostStatus(postId, newStatus);
      onPostsRefresh ? await onPostsRefresh() : router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return {
    // options
    categories,
    availableTags,
    isLoadingFormOptions,
    formOptionsError,
    // create
    isCreateModalOpen,
    isCreatingPost,
    createError,
    createFormData,
    openCreateModal,
    closeCreateModal,
    handleCreateInputChange,
    handleCreateTagToggle,
    handleCreatePost,
    // edit
    isEditModalOpen,
    isUpdatingPost,
    editError,
    editFormData,
    setEditFormData,
    editingPostId,
    openEditModal,
    closeEditModal,
    handleEditInputChange,
    handleEditTagToggle,
    handleUpdatePost,
    // create (content setter cho markdown editor)
    setCreateFormData,
    // status
    handleStatusChange,
  };
}
