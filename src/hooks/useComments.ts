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
  currentUser: User,
  onPostsRefresh?: () => Promise<void> | void,
) {
  const router = useRouter();

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
    } catch (err: any) {
      setPostComments([]);
      setCommentsError(err?.message || "Không thể tải bình luận.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const refreshAfterMutation = async (postId: string) => {
    await loadCommentsForPost(postId);
    onPostsRefresh ? await onPostsRefresh() : router.refresh();
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
      await refreshAfterMutation(commentTargetPost._id);
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể tạo bình luận.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyComment = async (parentCommentId: string) => {
    if (!commentTargetPost) return;
    const content = replyDrafts[parentCommentId]?.trim() || "";
    if (!content) {
      setCommentsError("Vui lòng nhập nội dung phản hồi.");
      return;
    }
    try {
      setReplySubmittingFor(parentCommentId);
      setCommentsError("");
      await commentService.createComment({
        postId: commentTargetPost._id,
        content,
        parentCommentId,
      });
      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: "" }));
      setActiveReplyCommentId(null);
      await refreshAfterMutation(commentTargetPost._id);
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
      await refreshAfterMutation(commentTargetPost._id);
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể cập nhật bình luận.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!commentTargetPost) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?"))
      return;
    try {
      setDeletingCommentId(commentId);
      setCommentsError("");
      await commentService.deleteComment({
        postId: commentTargetPost._id,
        commentId,
      });
      if (editingCommentId === commentId) cancelEditComment();
      await refreshAfterMutation(commentTargetPost._id);
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể xóa bình luận.");
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
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likesCount:
                  typeof nextLikesCount === "number"
                    ? nextLikesCount
                    : c.likesCount,
              }
            : c,
        ),
      );
    } catch (err: any) {
      setCommentsError(err?.message || "Không thể cập nhật lượt thích.");
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleReportComment = async (commentId: string) => {
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
    commentsWithDepth,
    isLoadingComments,
    commentsError,
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
    openCommentsModal,
    closeCommentsModal,
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
