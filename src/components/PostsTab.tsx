"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Category, Comment as PostComment, Post, Tag, User } from "@/lib/types";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { tagService } from "@/lib/api/tag.services";
import { commentService } from "@/lib/api/comment.service";

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

type ReportReason =
  | "spam"
  | "harassment"
  | "misinformation"
  | "offensive"
  | "other";

type PostCommentItem = PostComment & {
  userId?: string | User;
  parentId?: string | null;
  commentLeft?: number;
  commentRight?: number;
  likesCount?: number;
};

interface CommentRenderItem extends PostCommentItem {
  depth: number;
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

const resolveCommentUserId = (comment: PostCommentItem): string => {
  const userId = comment.userId ?? comment.authorId;
  if (typeof userId === "string") return userId;
  if (userId && typeof userId === "object" && "_id" in userId) {
    return String((userId as User)._id || "");
  }
  return "";
};

const formatCommentDate = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN");
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

  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentTargetPost, setCommentTargetPost] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<PostCommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<
    string | null
  >(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replySubmittingFor, setReplySubmittingFor] = useState<string | null>(
    null,
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);

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

  const commentsWithDepth = useMemo<CommentRenderItem[]>(() => {
    if (postComments.length === 0) return [];

    const stack: number[] = [];

    return postComments.map((comment) => {
      const left = comment.commentLeft ?? 0;
      const right = comment.commentRight ?? Number.MAX_SAFE_INTEGER;

      while (stack.length > 0 && left > stack[stack.length - 1]) {
        stack.pop();
      }

      const depth = stack.length;
      stack.push(right);

      return {
        ...comment,
        depth,
      };
    });
  }, [postComments]);

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

  const loadCommentsForPost = async (postId: string) => {
    try {
      setIsLoadingComments(true);
      setCommentsError("");

      const response = await commentService.getPostComments(postId);
      setPostComments(
        Array.isArray(response.metadata)
          ? (response.metadata as PostCommentItem[])
          : [],
      );
    } catch (error: any) {
      console.error("Failed to load comments:", error);
      setPostComments([]);
      setCommentsError(error?.message || "Không thể tải bình luận.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const openCommentsModal = async (post: Post) => {
    setCommentTargetPost(post);
    setIsCommentsModalOpen(true);
    setCommentsError("");
    setNewCommentContent("");
    setActiveReplyCommentId(null);
    setReplyDrafts({});
    setEditingCommentId(null);
    setEditCommentContent("");

    await loadCommentsForPost(post._id);
  };

  const closeCommentsModal = (force = false) => {
    const hasPendingAction =
      isSubmittingComment ||
      Boolean(replySubmittingFor) ||
      isUpdatingComment ||
      Boolean(deletingCommentId) ||
      Boolean(likingCommentId);

    if (hasPendingAction && !force) return;

    setIsCommentsModalOpen(false);
    setCommentTargetPost(null);
    setPostComments([]);
    setCommentsError("");
    setNewCommentContent("");
    setActiveReplyCommentId(null);
    setReplyDrafts({});
    setReplySubmittingFor(null);
    setEditingCommentId(null);
    setEditCommentContent("");
    setIsUpdatingComment(false);
    setDeletingCommentId(null);
    setLikingCommentId(null);
  };

  const refreshAfterCommentMutation = async (postId: string) => {
    await loadCommentsForPost(postId);

    if (onPostsRefresh) {
      await onPostsRefresh();
    } else {
      router.refresh();
    }
  };

  const handleCreateComment = async () => {
    if (!commentTargetPost) return;

    const content = newCommentContent.trim();
    if (!content) {
      setCommentsError("Vui lòng nhập nội dung bình luận.");
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentsError("");

      await commentService.createComment({
        postId: commentTargetPost._id,
        content,
      });

      setNewCommentContent("");
      await refreshAfterCommentMutation(commentTargetPost._id);
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể tạo bình luận.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyComment = async (parentCommentId: string) => {
    if (!commentTargetPost) return;

    const replyContent = replyDrafts[parentCommentId]?.trim() || "";
    if (!replyContent) {
      setCommentsError("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    try {
      setReplySubmittingFor(parentCommentId);
      setCommentsError("");

      await commentService.createComment({
        postId: commentTargetPost._id,
        content: replyContent,
        parentCommentId,
      });

      setReplyDrafts((prev) => ({
        ...prev,
        [parentCommentId]: "",
      }));
      setActiveReplyCommentId(null);

      await refreshAfterCommentMutation(commentTargetPost._id);
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể gửi phản hồi.");
    } finally {
      setReplySubmittingFor(null);
    }
  };

  const startEditComment = (comment: PostCommentItem) => {
    setCommentsError("");
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content || "");
    setActiveReplyCommentId(null);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  const handleSaveCommentEdit = async () => {
    if (!commentTargetPost || !editingCommentId) return;

    const content = editCommentContent.trim();
    if (!content) {
      setCommentsError("Nội dung bình luận không được để trống.");
      return;
    }

    try {
      setIsUpdatingComment(true);
      setCommentsError("");

      await commentService.updateComment({
        commentId: editingCommentId,
        content,
      });

      setEditingCommentId(null);
      setEditCommentContent("");

      await refreshAfterCommentMutation(commentTargetPost._id);
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể cập nhật bình luận.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!commentTargetPost) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      setCommentsError("");

      await commentService.deleteComment({
        postId: commentTargetPost._id,
        commentId,
      });

      if (editingCommentId === commentId) {
        cancelEditComment();
      }

      await refreshAfterCommentMutation(commentTargetPost._id);
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể xóa bình luận.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleToggleLikeComment = async (commentId: string) => {
    try {
      setLikingCommentId(commentId);
      setCommentsError("");

      const response = await commentService.toggleLikeComment(commentId);
      const nextLikesCount = response.metadata?.likesCount;

      setPostComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                likesCount:
                  typeof nextLikesCount === "number"
                    ? nextLikesCount
                    : comment.likesCount,
              }
            : comment,
        ),
      );
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể cập nhật lượt thích.");
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleReportComment = async (commentId: string) => {
    const reasonInput = window
      .prompt(
        "Nhập lý do report (spam, harassment, misinformation, offensive, other)",
        "other",
      )
      ?.trim()
      .toLowerCase();

    if (!reasonInput) return;

    const validReasons: ReportReason[] = [
      "spam",
      "harassment",
      "misinformation",
      "offensive",
      "other",
    ];

    if (!validReasons.includes(reasonInput as ReportReason)) {
      setCommentsError("Lý do report không hợp lệ.");
      return;
    }

    try {
      setCommentsError("");
      await commentService.reportComment(
        commentId,
        reasonInput as ReportReason,
      );
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể report bình luận.");
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
                        void openCommentsModal(post);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 p-1.5 rounded-md hover:bg-emerald-100 transition-colors"
                      title="Comments"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
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

      {isCommentsModalOpen && commentTargetPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => closeCommentsModal()}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Bình luận bài viết</h2>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {commentTargetPost.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeCommentsModal()}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close comments modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {commentsError && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                  {commentsError}
                </div>
              )}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label
                  htmlFor="new-comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Thêm bình luận mới
                </label>
                <textarea
                  id="new-comment"
                  rows={3}
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Nhập nội dung bình luận..."
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateComment}
                    disabled={isSubmittingComment}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingComment ? "Đang gửi..." : "Gửi"}</span>
                  </button>
                </div>
              </div>

              {isLoadingComments ? (
                <div className="py-10 text-center text-gray-500">
                  Đang tải bình luận...
                </div>
              ) : commentsWithDepth.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-gray-500">
                  Chưa có bình luận nào cho bài viết này.
                </div>
              ) : (
                <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                  {commentsWithDepth.map((comment) => {
                    const commentUserId = resolveCommentUserId(comment);
                    const isOwnComment = commentUserId === user._id;
                    const canManageComment =
                      isOwnComment || user.role === "admin";
                    const isEditing = editingCommentId === comment._id;
                    const isReplying = activeReplyCommentId === comment._id;
                    const replyValue = replyDrafts[comment._id] || "";
                    const leftIndent = `${Math.min(comment.depth, 6) * 16}px`;

                    return (
                      <div
                        key={comment._id}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                        style={{ marginLeft: leftIndent }}
                      >
                        <div className="flex items-center justify-between mb-2 gap-4">
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">
                              {isOwnComment
                                ? "Bạn"
                                : `User ${commentUserId.slice(-6) || "ẩn danh"}`}
                            </span>
                            <span className="text-gray-400 ml-2">
                              {formatCommentDate(comment.createdOn)}
                            </span>
                            {comment.isEdited && (
                              <span className="ml-2 text-xs text-gray-500">
                                (đã chỉnh sửa)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleLikeComment(comment._id)
                              }
                              disabled={likingCommentId === comment._id}
                              className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-700 disabled:opacity-60"
                            >
                              <Heart className="w-4 h-4" />
                              <span className="text-xs">
                                {comment.likesCount || 0}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCommentsError("");
                                setEditingCommentId(null);
                                setActiveReplyCommentId((prev) =>
                                  prev === comment._id ? null : comment._id,
                                );
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Reply
                            </button>

                            {!isOwnComment && (
                              <button
                                type="button"
                                onClick={() => handleReportComment(comment._id)}
                                className="text-xs text-orange-600 hover:text-orange-700"
                              >
                                Report
                              </button>
                            )}

                            {canManageComment && !isEditing && (
                              <button
                                type="button"
                                onClick={() => startEditComment(comment)}
                                className="text-xs text-indigo-600 hover:text-indigo-700"
                              >
                                Sửa
                              </button>
                            )}

                            {canManageComment && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={deletingCommentId === comment._id}
                                className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>
                                  {deletingCommentId === comment._id
                                    ? "Đang xóa"
                                    : "Xóa"}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={editCommentContent}
                              onChange={(e) =>
                                setEditCommentContent(e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditComment}
                                disabled={isUpdatingComment}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-60"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveCommentEdit}
                                disabled={isUpdatingComment}
                                className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-60"
                              >
                                {isUpdatingComment ? "Đang lưu..." : "Lưu"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        )}

                        {isReplying && !isEditing && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                            <textarea
                              rows={2}
                              value={replyValue}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [comment._id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                              placeholder="Viết phản hồi..."
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveReplyCommentId(null)}
                                disabled={replySubmittingFor === comment._id}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-60"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReplyComment(comment._id)}
                                disabled={replySubmittingFor === comment._id}
                                className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-60"
                              >
                                {replySubmittingFor === comment._id
                                  ? "Đang gửi..."
                                  : "Gửi phản hồi"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
