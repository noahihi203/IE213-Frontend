import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Comment as PostComment, Post, User } from "@/lib/types";
import { commentService } from "@/lib/api/comment.service";

type ReportReason =
  | "spam"
  | "harassment"
  | "misinformation"
  | "offensive"
  | "other";

export type PostCommentItem = PostComment & {
  userId?: string | User;
  parentId?: string | null;
  commentLeft?: number;
  commentRight?: number;
  likesCount?: number;
};

export interface CommentRenderItem extends PostCommentItem {
  depth: number;
}

export const resolveCommentUserId = (comment: PostCommentItem): string => {
  const userId = comment.userId ?? comment.authorId;
  if (typeof userId === "string") return userId;
  if (userId && typeof userId === "object" && "_id" in userId) {
    return String((userId as User)._id || "");
  }
  return "";
};

export const formatCommentDate = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN");
};

export function useComments(
  currentUser: User | null,
  options?: {
    /**
     * Truyền vào khi dùng inline (PostDetailPage).
     * Không cần truyền khi dùng qua modal — postId sẽ lấy từ commentTargetPost.
     */
    postId?: string;
    onPostsRefresh?: () => Promise<void> | void;
  },
) {
  const router = useRouter();
  const { postId: inlinePostId, onPostsRefresh } = options ?? {};

  // ── Modal state (chỉ dùng khi không có inlinePostId) ─────────────────────
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentTargetPost, setCommentTargetPost] = useState<Post | null>(null);

  // postId thực tế dùng cho mọi operation
  const activePostId = inlinePostId ?? commentTargetPost?._id ?? null;

  // ── Comment state ─────────────────────────────────────────────────────────
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

  // ── liked comment ids để track trạng thái tim ─────────────────────────────
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(
    new Set(),
  );

  // ── Computed ──────────────────────────────────────────────────────────────
  const commentsWithDepth = useMemo<CommentRenderItem[]>(() => {
    if (postComments.length === 0) return [];
    const stack: number[] = [];
    return postComments.map((comment) => {
      const left = comment.commentLeft ?? 0;
      const right = comment.commentRight ?? Number.MAX_SAFE_INTEGER;
      while (stack.length > 0 && left > stack[stack.length - 1]) stack.pop();
      const depth = stack.length;
      stack.push(right);
      return { ...comment, depth };
    });
  }, [postComments]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetCommentForm = () => {
    setNewCommentContent("");
    setActiveReplyCommentId(null);
    setReplyDrafts({});
    setEditingCommentId(null);
    setEditCommentContent("");
    setCommentsError("");
  };

  // ── Core loaders ──────────────────────────────────────────────────────────
  const loadCommentsForPost = async (postId: string) => {
    try {
      setIsLoadingComments(true);
      setCommentsError("");
      const response = await commentService.getPostTopComments(postId);
      setPostComments(
        Array.isArray(response.metadata)
          ? (response.metadata as PostCommentItem[])
          : [],
      );
    } catch (err: any) {
      setPostComments([]);
      setCommentsError(err?.message || "Không thể tải bình luận.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const refreshAfterMutation = async () => {
    if (!activePostId) return;
    await loadCommentsForPost(activePostId);
    if (onPostsRefresh) {
      await onPostsRefresh();
    } else {
      router.refresh();
    }
  };

  // ── Modal controls (chỉ dùng khi không có inlinePostId) ──────────────────
  const openCommentsModal = async (post: Post) => {
    setCommentTargetPost(post);
    setIsCommentsModalOpen(true);
    resetCommentForm();
    await loadCommentsForPost(post._id);
  };

  const closeCommentsModal = (force = false) => {
    const pending =
      isSubmittingComment ||
      Boolean(replySubmittingFor) ||
      isUpdatingComment ||
      Boolean(deletingCommentId) ||
      Boolean(likingCommentId);
    if (pending && !force) return;

    setIsCommentsModalOpen(false);
    setCommentTargetPost(null);
    setPostComments([]);
    resetCommentForm();
    setReplySubmittingFor(null);
    setIsUpdatingComment(false);
    setDeletingCommentId(null);
    setLikingCommentId(null);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateComment = async () => {
    if (!activePostId) return;
    const content = newCommentContent.trim();
    if (!content) {
      setCommentsError("Vui lòng nhập nội dung bình luận.");
      return;
    }
    try {
      setIsSubmittingComment(true);
      setCommentsError("");
      await commentService.createComment({ postId: activePostId, content });
      setNewCommentContent("");
      await refreshAfterMutation();
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể tạo bình luận.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyComment = async (parentCommentId: string) => {
    if (!activePostId) return;
    const content = replyDrafts[parentCommentId]?.trim() || "";
    if (!content) {
      setCommentsError("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    try {
      setReplySubmittingFor(parentCommentId);
      setCommentsError("");
      await commentService.createComment({
        postId: activePostId,
        content,
        parentCommentId,
      });
      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: "" }));
      setActiveReplyCommentId(null);
      await refreshAfterMutation();
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể gửi phản hồi.");
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
    if (!activePostId || !editingCommentId) return;
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
      await refreshAfterMutation();
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể cập nhật bình luận.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activePostId) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?"))
      return;
    try {
      setDeletingCommentId(commentId);
      setCommentsError("");
      await commentService.deleteComment({ postId: activePostId, commentId });
      if (editingCommentId === commentId) cancelEditComment();
      await refreshAfterMutation();
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể xóa bình luận.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleToggleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const wasLiked = likedCommentIds.has(commentId);

    // Optimistic update
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    setPostComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? { ...c, likesCount: (c.likesCount ?? 0) + (wasLiked ? -1 : 1) }
          : c,
      ),
    );

    try {
      setLikingCommentId(commentId);
      setCommentsError("");
      const response = await commentService.toggleLikeComment(commentId);
      const nextLikesCount = response.metadata?.likesCount;
      if (typeof nextLikesCount === "number") {
        setPostComments((prev) =>
          prev.map((c) =>
            c._id === commentId ? { ...c, likesCount: nextLikesCount } : c,
          ),
        );
      }
    } catch (err: any) {
      // Rollback nếu API thất bại
      setLikedCommentIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(commentId) : next.delete(commentId);
        return next;
      });
      setPostComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likesCount: (c.likesCount ?? 0) + (wasLiked ? 1 : -1) }
            : c,
        ),
      );
      setCommentsError(err?.message || "Không thể cập nhật lượt thích.");
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const validReasons: ReportReason[] = [
      "spam",
      "harassment",
      "misinformation",
      "offensive",
      "other",
    ];
    const reasonInput = window
      .prompt(
        "Nhập lý do report (spam, harassment, misinformation, offensive, other)",
        "other",
      )
      ?.trim()
      .toLowerCase();

    if (!reasonInput) return;
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
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể report bình luận.");
    }
  };

  return {
    // Modal state
    isCommentsModalOpen,
    commentTargetPost,
    openCommentsModal,
    closeCommentsModal,

    // Comment data
    commentsWithDepth,
    isLoadingComments,
    commentsError,
    likedCommentIds,

    // New comment
    newCommentContent,
    setNewCommentContent,
    isSubmittingComment,

    // Reply
    activeReplyCommentId,
    setActiveReplyCommentId,
    replyDrafts,
    setReplyDrafts,
    replySubmittingFor,

    // Edit
    editingCommentId,
    editCommentContent,
    setEditCommentContent,
    isUpdatingComment,

    // Delete / like
    deletingCommentId,
    likingCommentId,

    // Actions
    loadCommentsForPost,
    handleCreateComment,
    handleReplyComment,
    startEditComment,
    cancelEditComment,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleToggleLikeComment,
    handleReportComment,
  };
}
