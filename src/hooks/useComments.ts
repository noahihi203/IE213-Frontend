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

const TOP_LEVEL_PAGE_SIZE = 5;

export type PostCommentItem = PostComment & {
  userId?: string | User;
  parentId?: string | null;
  commentLeft?: number;
  commentRight?: number;
  likesCount?: number;
  replyCount?: number;
};

export interface CommentRenderItem extends PostCommentItem {
  depth: number;
}

export interface CommentAuthorSummary {
  userId: string;
  profileHref: string | null;
  displayName: string;
  username: string;
  mentionLabel: string;
  avatar: string | null;
}

type UseCommentsOptions = {
  postId?: string;
  onPostsRefresh?: () => Promise<void> | void;
};

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

export const resolveCommentAuthorSummary = (
  comment: PostCommentItem,
  currentUser?: User | null,
): CommentAuthorSummary => {
  const commentUserId = resolveCommentUserId(comment);
  const rawCommentUser = comment.userId ?? comment.authorId;
  const commentUser =
    rawCommentUser && typeof rawCommentUser === "object"
      ? (rawCommentUser as User)
      : null;

  const username = (commentUser?.username || "").trim();
  const fullName = (commentUser?.fullName || "").trim();
  const isOwnComment = Boolean(
    currentUser && commentUserId === currentUser._id,
  );
  const mentionLabel =
    fullName || username || `User ${commentUserId.slice(-6) || "ẩn danh"}`;

  return {
    userId: commentUserId,
    profileHref: commentUserId ? `/users/${commentUserId}` : null,
    displayName: isOwnComment ? "Bạn" : mentionLabel,
    username,
    mentionLabel,
    avatar: commentUser?.avatar || null,
  };
};

export function useComments(
  currentUser: User | null,
  optionsOrRefresh?: UseCommentsOptions | (() => Promise<void> | void),
) {
  const router = useRouter();
  const options: UseCommentsOptions =
    typeof optionsOrRefresh === "function"
      ? { onPostsRefresh: optionsOrRefresh }
      : (optionsOrRefresh ?? {});
  const { postId: inlinePostId, onPostsRefresh } = options;

  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentTargetPost, setCommentTargetPost] = useState<Post | null>(null);

  const activePostId = inlinePostId ?? commentTargetPost?._id ?? null;

  const [topLevelComments, setTopLevelComments] = useState<PostCommentItem[]>(
    [],
  );
  const [repliesByParent, setRepliesByParent] = useState<
    Record<string, PostCommentItem[]>
  >({});
  const [expandedReplyParentIds, setExpandedReplyParentIds] = useState<
    Set<string>
  >(new Set());
  const [loadingRepliesFor, setLoadingRepliesFor] = useState<string | null>(
    null,
  );

  const [hasMoreTopLevelComments, setHasMoreTopLevelComments] = useState(false);
  const [isLoadingMoreTopLevelComments, setIsLoadingMoreTopLevelComments] =
    useState(false);

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

  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(
    new Set(),
  );

  const commentsWithDepth = useMemo<CommentRenderItem[]>(() => {
    if (topLevelComments.length === 0) return [];

    const merged: PostCommentItem[] = [];
    topLevelComments.forEach((topComment) => {
      merged.push(topComment);
      if (expandedReplyParentIds.has(topComment._id)) {
        const replies = repliesByParent[topComment._id] || [];
        merged.push(...replies);
      }
    });

    return merged.map((comment) => ({
      ...comment,
      depth: comment.parentId ? 1 : 0,
    }));
  }, [topLevelComments, repliesByParent, expandedReplyParentIds]);

  const resetCommentForm = () => {
    setNewCommentContent("");
    setActiveReplyCommentId(null);
    setReplyDrafts({});
    setEditingCommentId(null);
    setEditCommentContent("");
    setCommentsError("");
    setRepliesByParent({});
    setExpandedReplyParentIds(new Set());
    setLoadingRepliesFor(null);
  };

  const toTopLevelPayload = (metadata: unknown) => {
    if (Array.isArray(metadata)) {
      return {
        comments: metadata as PostCommentItem[],
        total: metadata.length,
        hasMore: false,
      };
    }

    if (
      metadata &&
      typeof metadata === "object" &&
      "comments" in metadata &&
      Array.isArray((metadata as { comments?: unknown }).comments)
    ) {
      const payload = metadata as {
        comments: PostCommentItem[];
        total?: number;
        hasMore?: boolean;
      };

      return {
        comments: payload.comments,
        total:
          typeof payload.total === "number"
            ? payload.total
            : payload.comments.length,
        hasMore: typeof payload.hasMore === "boolean" ? payload.hasMore : false,
      };
    }

    return { comments: [] as PostCommentItem[], total: 0, hasMore: false };
  };

  const toCommentArray = (metadata: unknown): PostCommentItem[] => {
    if (Array.isArray(metadata)) return metadata as PostCommentItem[];
    return [];
  };

  const upsertCommentLikes = (
    targetId: string,
    nextValue: (current: number) => number,
  ) => {
    setTopLevelComments((prev) =>
      prev.map((comment) =>
        comment._id === targetId
          ? { ...comment, likesCount: nextValue(comment.likesCount ?? 0) }
          : comment,
      ),
    );

    setRepliesByParent((prev) => {
      const next: Record<string, PostCommentItem[]> = {};
      Object.entries(prev).forEach(([parentId, replies]) => {
        next[parentId] = replies.map((comment) =>
          comment._id === targetId
            ? { ...comment, likesCount: nextValue(comment.likesCount ?? 0) }
            : comment,
        );
      });
      return next;
    });
  };

  const loadTopLevelComments = async ({
    postId,
    skip,
    append,
  }: {
    postId: string;
    skip: number;
    append: boolean;
  }) => {
    const response = await commentService.getPostTopComments(postId, {
      limit: TOP_LEVEL_PAGE_SIZE,
      skip,
    });

    const payload = toTopLevelPayload(response.metadata);
    setTopLevelComments((prev) => {
      if (!append) return payload.comments;
      const existing = new Set(prev.map((comment) => comment._id));
      const chunk = payload.comments.filter(
        (comment) => !existing.has(comment._id),
      );
      return [...prev, ...chunk];
    });
    setHasMoreTopLevelComments(payload.hasMore);
  };

  const loadCommentsForPost = async (postId: string) => {
    try {
      setIsLoadingComments(true);
      setCommentsError("");
      setRepliesByParent({});
      setExpandedReplyParentIds(new Set());
      await loadTopLevelComments({ postId, skip: 0, append: false });
    } catch (err: any) {
      setTopLevelComments([]);
      setCommentsError(err?.message || "Không thể tải bình luận.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadMoreTopLevelComments = async () => {
    if (!activePostId || isLoadingComments || isLoadingMoreTopLevelComments) {
      return;
    }
    if (!hasMoreTopLevelComments) return;

    try {
      setIsLoadingMoreTopLevelComments(true);
      setCommentsError("");
      await loadTopLevelComments({
        postId: activePostId,
        skip: topLevelComments.length,
        append: true,
      });
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể tải thêm bình luận.");
    } finally {
      setIsLoadingMoreTopLevelComments(false);
    }
  };

  const loadRepliesForComment = async (parentCommentId: string) => {
    if (!activePostId) return;

    try {
      setLoadingRepliesFor(parentCommentId);
      setCommentsError("");
      const response = await commentService.getNextLevelPostComments(
        activePostId,
        parentCommentId,
      );
      const replies = toCommentArray(response.metadata).sort(
        (a, b) => (a.commentLeft ?? 0) - (b.commentLeft ?? 0),
      );

      setRepliesByParent((prev) => ({ ...prev, [parentCommentId]: replies }));
      setExpandedReplyParentIds((prev) => {
        const next = new Set(prev);
        next.add(parentCommentId);
        return next;
      });
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể tải phản hồi.");
    } finally {
      setLoadingRepliesFor(null);
    }
  };

  const toggleRepliesForComment = async (parentCommentId: string) => {
    if (expandedReplyParentIds.has(parentCommentId)) {
      setExpandedReplyParentIds((prev) => {
        const next = new Set(prev);
        next.delete(parentCommentId);
        return next;
      });
      return;
    }

    if (repliesByParent[parentCommentId]) {
      setExpandedReplyParentIds((prev) => {
        const next = new Set(prev);
        next.add(parentCommentId);
        return next;
      });
      return;
    }

    await loadRepliesForComment(parentCommentId);
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
    setTopLevelComments([]);
    resetCommentForm();
    setReplySubmittingFor(null);
    setIsUpdatingComment(false);
    setDeletingCommentId(null);
    setLikingCommentId(null);
    setHasMoreTopLevelComments(false);
    setIsLoadingMoreTopLevelComments(false);
  };

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

    const parentComment =
      topLevelComments.find((item) => item._id === parentCommentId) ||
      Object.values(repliesByParent)
        .flat()
        .find((item) => item._id === parentCommentId);

    const mentionPrefix = parentComment
      ? `@${resolveCommentAuthorSummary(parentComment).mentionLabel} `
      : "";
    const normalizedContent = mentionPrefix
      ? content.startsWith(mentionPrefix)
        ? content
        : `${mentionPrefix}${content}`
      : content;

    try {
      setReplySubmittingFor(parentCommentId);
      setCommentsError("");
      await commentService.createComment({
        postId: activePostId,
        content: normalizedContent,
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

  const toggleReplyComposerForComment = (comment: PostCommentItem) => {
    const nextReplyCommentId =
      activeReplyCommentId === comment._id ? null : comment._id;
    setActiveReplyCommentId(nextReplyCommentId);

    if (!nextReplyCommentId) return;

    const author = resolveCommentAuthorSummary(comment);
    const mentionPrefix = author.mentionLabel ? `@${author.mentionLabel} ` : "";
    if (!mentionPrefix) return;

    setReplyDrafts((prev) => {
      const currentDraft = prev[comment._id] || "";
      if (currentDraft.trim().length > 0) return prev;
      return {
        ...prev,
        [comment._id]: mentionPrefix,
      };
    });
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
      return;
    }
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

    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    upsertCommentLikes(commentId, (current) => current + (wasLiked ? -1 : 1));

    try {
      setLikingCommentId(commentId);
      setCommentsError("");
      const response = await commentService.toggleLikeComment(commentId);
      const nextLikesCount = response.metadata?.likesCount;
      if (typeof nextLikesCount === "number") {
        upsertCommentLikes(commentId, () => nextLikesCount);
      }
    } catch (err: any) {
      setLikedCommentIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(commentId) : next.delete(commentId);
        return next;
      });
      upsertCommentLikes(commentId, (current) => current + (wasLiked ? 1 : -1));
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
    isCommentsModalOpen,
    commentTargetPost,
    openCommentsModal,
    closeCommentsModal,

    commentsWithDepth,
    topLevelComments,
    isLoadingComments,
    hasMoreTopLevelComments,
    isLoadingMoreTopLevelComments,
    commentsError,
    likedCommentIds,
    expandedReplyParentIds,
    loadingRepliesFor,

    newCommentContent,
    setNewCommentContent,
    isSubmittingComment,

    activeReplyCommentId,
    setActiveReplyCommentId,
    replyDrafts,
    setReplyDrafts,
    replySubmittingFor,

    editingCommentId,
    editCommentContent,
    setEditCommentContent,
    isUpdatingComment,

    deletingCommentId,
    likingCommentId,

    loadCommentsForPost,
    loadMoreTopLevelComments,
    loadRepliesForComment,
    toggleRepliesForComment,
    handleCreateComment,
    handleReplyComment,
    toggleReplyComposerForComment,
    startEditComment,
    cancelEditComment,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleToggleLikeComment,
    handleReportComment,
  };
}
