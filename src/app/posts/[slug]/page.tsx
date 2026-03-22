"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { postService } from "@/lib/api/post.service";
import { commentService } from "@/lib/api/comment.service";
import { useAuthStore } from "@/store/authStore";
import { Comment as PostComment, Post, User } from "@/lib/types";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDots,
  ChatCircleDots,
  Eye,
  Heart,
  PaperPlaneTilt,
  PencilSimple,
  ShareNetwork,
  Trash,
} from "@phosphor-icons/react";

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, authInitialized } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState("");

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
    if (params.slug) {
      loadPost(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    if (!post?._id || !authInitialized) return;

    if (!isAuthenticated) {
      setIsLiked(false);
      return;
    }

    let cancelled = false;

    const loadLikeStatus = async () => {
      try {
        const response = await postService.isPostLikedByUser(post._id);
        if (!cancelled) {
          setIsLiked(Boolean(response.metadata));
        }
      } catch (error) {
        if (!cancelled) {
          setIsLiked(false);
        }
        console.error("Failed to load post like status:", error);
      }
    };

    loadLikeStatus();

    return () => {
      cancelled = true;
    };
  }, [post?._id, isAuthenticated, authInitialized]);

  const loadPost = async (slug: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await postService.getPostBySlug(slug);
      const loadedPost = response.metadata || null;

      setPost(loadedPost);
      setPostComments([]);
      setCommentsError("");
      setNewCommentContent("");
      setActiveReplyCommentId(null);
      setReplyDrafts({});
      setEditingCommentId(null);
      setEditCommentContent("");

      if (loadedPost?._id) {
        const comments = await loadCommentsForPost(loadedPost._id);
        setPost((prev) =>
          prev && prev._id === loadedPost._id
            ? { ...prev, commentsCount: comments.length }
            : prev,
        );
      }
    } catch (err: any) {
      setError(err.message || "Post not found");
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommentsForPost = async (postId: string) => {
    try {
      setIsLoadingComments(true);
      setCommentsError("");

      const response = await commentService.getPostComments(postId);
      const comments = Array.isArray(response.metadata)
        ? (response.metadata as PostCommentItem[])
        : [];

      setPostComments(comments);
      return comments;
    } catch (error: any) {
      console.error("Failed to load comments:", error);
      setPostComments([]);
      setCommentsError(error?.message || "Không thể tải bình luận.");
      return [];
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!post) return;

    try {
      if (isLiked) {
        await postService.unlikePost(post._id);
        setPost((prev) =>
          prev ? { ...prev, likesCount: prev.likesCount - 1 } : null,
        );
      } else {
        await postService.likePost(post._id);
        setPost((prev) =>
          prev ? { ...prev, likesCount: prev.likesCount + 1 } : null,
        );
      }
      setIsLiked((prev) => !prev);
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
    }
  };

  const refreshAfterCommentMutation = async (postId: string) => {
    const comments = await loadCommentsForPost(postId);
    setPost((prev) =>
      prev && prev._id === postId
        ? { ...prev, commentsCount: comments.length }
        : prev,
    );
  };

  const handleCreateComment = async () => {
    if (!post) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const content = newCommentContent.trim();
    if (!content) {
      setCommentsError("Vui lòng nhập nội dung bình luận.");
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentsError("");

      await commentService.createComment({
        postId: post._id,
        content,
      });

      setNewCommentContent("");
      await refreshAfterCommentMutation(post._id);
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể tạo bình luận.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyComment = async (parentCommentId: string) => {
    if (!post) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const replyContent = replyDrafts[parentCommentId]?.trim() || "";
    if (!replyContent) {
      setCommentsError("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    try {
      setReplySubmittingFor(parentCommentId);
      setCommentsError("");

      await commentService.createComment({
        postId: post._id,
        content: replyContent,
        parentCommentId,
      });

      setReplyDrafts((prev) => ({
        ...prev,
        [parentCommentId]: "",
      }));
      setActiveReplyCommentId(null);

      await refreshAfterCommentMutation(post._id);
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
    if (!post || !editingCommentId) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

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

      await refreshAfterCommentMutation(post._id);
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể cập nhật bình luận.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      setCommentsError("");

      await commentService.deleteComment({
        postId: post._id,
        commentId,
      });

      if (editingCommentId === commentId) {
        cancelEditComment();
      }

      await refreshAfterCommentMutation(post._id);
    } catch (error: any) {
      setCommentsError(error?.message || "Không thể xóa bình luận.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleToggleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

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
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link
            href="/posts"
            className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Back to Posts
          </Link>
        </div>
      </div>
    );
  }

  const author =
    typeof post.authorId === "object"
      ? post.authorId
      : typeof (post as any).author === "object"
        ? (post as any).author
        : null;

  const category = typeof post.category === "object" ? post.category : null;

  const isAuthor = user && author && user._id === author._id;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {isAuthor && (
              <Link
                href={`/posts/${post._id}/edit`}
                className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
              >
                <PencilSimple className="w-5 h-5" />
                <span>Edit Post</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cover */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Meta */}
          <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-slate-200">
            <div className="flex items-center space-x-6 text-slate-600">
              <span className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{post.viewCount} views</span>
              </span>

              <span className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>{post.likesCount} likes</span>
              </span>

              <span className="flex items-center space-x-2">
                <ChatCircleDots className="w-5 h-5" />
                <span>{post.commentsCount} comments</span>
              </span>

              {post.publishedAt && (
                <span className="flex items-center space-x-2">
                  <CalendarDots className="w-5 h-5" />
                  <span>
                    {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                  </span>
                </span>
              )}
            </div>

            {/* Author */}
            {author && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {author?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold">
                    {author?.fullName || "Unknown"}
                  </p>
                  <p className="text-sm text-slate-600">
                    @{author?.username || "user"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 🔥 FIXED CONTENT RENDERING */}
        <div
          className="prose prose-lg max-w-none mb-8 prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4 py-6 border-t border-slate-200">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium ${
              isLiked
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>

          <button className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg">
            <ShareNetwork className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        {/* Comments */}
        <section className="py-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Bình luận</h2>
            <span className="text-sm text-slate-500">
              {post.commentsCount} bình luận
            </span>
          </div>

          {commentsError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {commentsError}
            </div>
          )}

          <div className="space-y-4">
            {!authInitialized ? (
              <div className="rounded-lg border border-dashed border-slate-300 py-5 text-center text-slate-500">
                Đang tải trạng thái đăng nhập...
              </div>
            ) : isAuthenticated ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label
                  htmlFor="new-comment"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Thêm bình luận mới
                </label>
                <textarea
                  id="new-comment"
                  rows={3}
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Nhập nội dung bình luận..."
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateComment}
                    disabled={isSubmittingComment}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <PaperPlaneTilt className="w-4 h-4" />
                    <span>{isSubmittingComment ? "Đang gửi..." : "Gửi"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-slate-700 mb-3">
                  Đăng nhập để bình luận bài viết này.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  Đăng nhập
                </button>
              </div>
            )}

            {isLoadingComments ? (
              <div className="py-10 text-center text-slate-500">
                Đang tải bình luận...
              </div>
            ) : commentsWithDepth.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-slate-500">
                Chưa có bình luận nào cho bài viết này.
              </div>
            ) : (
              <div className="space-y-3">
                {commentsWithDepth.map((comment) => {
                  const commentUserId = resolveCommentUserId(comment);
                  const rawCommentUser = comment.userId ?? comment.authorId;
                  const commentUser =
                    rawCommentUser && typeof rawCommentUser === "object"
                      ? (rawCommentUser as User)
                      : null;
                  const isOwnComment = Boolean(
                    user && commentUserId === user._id,
                  );
                  const canManageComment =
                    isOwnComment || user?.role === "admin";
                  const isEditing = editingCommentId === comment._id;
                  const isReplying = activeReplyCommentId === comment._id;
                  const replyValue = replyDrafts[comment._id] || "";
                  const leftIndent = `${Math.min(comment.depth, 6) * 16}px`;

                  return (
                    <div
                      key={comment._id}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                      style={{ marginLeft: leftIndent }}
                    >
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <div className="text-sm text-slate-700">
                          <span className="font-medium">
                            {isOwnComment
                              ? "Bạn"
                              : commentUser?.fullName ||
                                commentUser?.username ||
                                `User ${commentUserId.slice(-6) || "ẩn danh"}`}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {formatCommentDate(comment.createdOn)}
                          </span>
                          {comment.isEdited && (
                            <span className="ml-2 text-xs text-slate-500">
                              (đã chỉnh sửa)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleLikeComment(comment._id)}
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
                              <Trash className="w-3.5 h-3.5" />
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditComment}
                              disabled={isUpdatingComment}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm disabled:opacity-60"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveCommentEdit}
                              disabled={isUpdatingComment}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {isUpdatingComment ? "Đang lưu..." : "Lưu"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}

                      {isReplying && !isEditing && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                          <textarea
                            rows={2}
                            value={replyValue}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [comment._id]: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Viết phản hồi..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveReplyCommentId(null)}
                              disabled={replySubmittingFor === comment._id}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm disabled:opacity-60"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplyComment(comment._id)}
                              disabled={replySubmittingFor === comment._id}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 disabled:opacity-60"
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
        </section>
      </article>
    </div>
  );
}
