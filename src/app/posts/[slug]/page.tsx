"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { postService } from "@/lib/api/post.service";
import { useAuthStore } from "@/store/authStore";
import { Post, User } from "@/lib/types";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDots,
  ChatCircleDots,
  Eye,
  Heart,
  PaperPlaneTilt,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";

import { usePostForm } from "../../../hooks/usePostForm";
import PostFormModal from "../../../components/PostFormModal";
import {
  useComments,
  formatCommentDate,
  resolveCommentAuthorSummary,
} from "../../../hooks/useComments";
import CommentContent from "../../../components/CommentContent";
import PostShareActions from "@/components/post/PostShareActions";
import { getReadingTime } from "../page";

const MDPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

function AuthorCard({ author }: { author: User }) {
  const initials =
    author.fullName?.split(" ").pop()?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#F0F0F0] bg-white p-4">
      {/* Avatar */}
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-base font-medium text-white"
        style={{ backgroundColor: "#DC0055" }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-[#000]">{author.fullName}</p>
        <p className="text-[13px]" style={{ color: "#DC0055" }}>
          Tác giả UniSync
        </p>
        <p className="text-[13px] text-[#888]">{author.bio}</p>
      </div>

      {/* Follow button */}
      <button
        className="flex-shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all"
        style={{
          border: "1.5px solid #DC0055",
          color: "#DC0055",
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#DC0055";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#DC0055";
        }}
      >
        + Theo dõi
      </button>
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, authInitialized } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState("");
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // ── useComments — inline mode, truyền postId khi đã có post ──────────────
  const comments = useComments(user as User | null, {
    postId: post?._id,
    onPostsRefresh: async () => {
      if (post?.slug) await loadPost(post.slug);
    },
  });

  // ── usePostForm ───────────────────────────────────────────────────────────
  const postForm = usePostForm(async () => {
    if (post?.slug) await loadPost(post.slug);
  });

  const handleOpenEditModal = () => {
    if (post) postForm.openEditModal(post);
  };

  // ── Load post ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (params.slug) loadPost(params.slug as string);
  }, [params.slug]);

  // Load comments khi post._id sẵn sàng
  useEffect(() => {
    if (post?._id) void comments.loadCommentsForPost(post._id);
  }, [post?._id]);

  useEffect(() => {
    if (!comments.hasMoreTopLevelComments) return;
    if (comments.isLoadingComments || comments.isLoadingMoreTopLevelComments) {
      return;
    }

    const node = loadMoreTriggerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          void comments.loadMoreTopLevelComments();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    comments.hasMoreTopLevelComments,
    comments.isLoadingComments,
    comments.isLoadingMoreTopLevelComments,
    comments.loadMoreTopLevelComments,
  ]);

  const commentById = useMemo(() => {
    return new Map(comments.commentsWithDepth.map((item) => [item._id, item]));
  }, [comments.commentsWithDepth]);

  // Check xem user đã like post chưa
  useEffect(() => {
    if (!post?._id || !authInitialized) return;
    if (!isAuthenticated) {
      setIsLiked(false);
      return;
    }
    let cancelled = false;
    postService
      .isPostLikedByUser(post._id)
      .then((res) => {
        if (!cancelled) setIsLiked(Boolean(res.metadata));
      })
      .catch(() => {
        if (!cancelled) setIsLiked(false);
      });
    return () => {
      cancelled = true;
    };
  }, [post?._id, isAuthenticated, authInitialized]);

  const loadPost = async (slug: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await postService.getPostBySlug(slug);
      setPost(response.metadata || null);
    } catch (err: any) {
      setError(err.message || "Post not found");
      setPost(null);
    } finally {
      setIsLoading(false);
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
    } catch (err) {
      console.error("Failed to like/unlike post:", err);
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#000" }}
        />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-[#000]">
            Post Not Found
          </h2>
          <p className="text-[#888] mb-4">{error}</p>
          <Link
            href="/posts"
            className="inline-flex rounded-full bg-[#000] px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-95"
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

  const canEdit =
    user && ((author && user._id === author._id) || user.role === "admin");

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="bg-white">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-[#888] hover:text-[#000] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Tất cả bài viết</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="flex items-center space-x-2 text-[#000] hover:opacity-70 transition-opacity"
              >
                <PencilSimple className="w-5 h-5" />
                <span>Chỉnh sửa bài viết</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {category && (
              <span
                className="px-3 py-2 text-[#fff] rounded-full text-sm border bg-accent-blue-500"
                style={{ borderColor: "#F0F0F0" }}
              >
                {category.abbreviation}
              </span>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 text-accent-blue-500 bg-accent-blue-500/15  rounded-full text-sm border border-accent-blue-500/10"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#000]">
            {post.title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4 py-4">
            {author && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#000] rounded-full flex items-center justify-center text-white font-bold">
                  {author?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-[#000]">
                    {author?.fullName || "Unknown"}
                  </p>
                  <p className="text-sm text-[#888]">
                    {post.modifiedOn && (
                      <span className="flex items-center space-x-2">
                        <span>
                          {format(new Date(post.modifiedOn), "MMMM d, yyyy")}
                        </span>
                        <span> - {getReadingTime(post.content)} phút đọc</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-6 text-[#888]">
              <span className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{post.viewCount}</span>
              </span>
              <span className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>{post.likesCount}</span>
              </span>
              <span className="flex items-center space-x-2">
                <ChatCircleDots className="w-5 h-5" />
                <span>{post.commentsCount}</span>
              </span>
            </div>
          </div>
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={
                post.coverImage
                  ? post.coverImage
                  : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
              }
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        </header>

        <div className="mb-8" data-color-mode="light">
          <MDPreview
            source={post.content}
            style={{
              background: "transparent",
              fontSize: "1.05rem",
              lineHeight: "1.75",
            }}
          />
        </div>

        <div
          className="flex items-center space-x-4 py-6"
          style={{ borderTop: "1px solid #F0F0F0" }}
        >
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all"
            style={{
              backgroundColor: isLiked ? "#DC0055" : "#F8F8F8",
              color: isLiked ? "#FFFFFF" : "#000",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.97)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>

          <PostShareActions
            postId={post._id}
            title={post.title}
            excerpt={post.excerpt}
            slug={post.slug}
            isAuthenticated={isAuthenticated}
          />
        </div>
        {post.authorId && <AuthorCard author={post.authorId} />}
        {/* ── Comments section ────────────────────────────────────────────── */}
        <section className="py-6" style={{ borderTop: "1px solid #F0F0F0" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#000]">Bình luận</h2>
            <span className="text-sm text-[#888]">
              {post.commentsCount} bình luận
            </span>
          </div>

          {comments.commentsError && (
            <div
              className="mb-4 rounded-lg px-3 py-2 text-sm"
              style={{
                backgroundColor: "#F8F8F8",
                color: "#DC0055",
                border: "1px solid #F0F0F0",
              }}
            >
              {comments.commentsError}
            </div>
          )}

          <div className="space-y-4">
            {/* Comment composer */}
            {!authInitialized ? (
              <div
                className="rounded-lg py-5 text-center text-[#888] border border-dashed"
                style={{ borderColor: "#F0F0F0" }}
              >
                Đang tải trạng thái đăng nhập...
              </div>
            ) : isAuthenticated ? (
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "#F8F8F8",
                  border: "1px solid #F0F0F0",
                }}
              >
                <label
                  htmlFor="new-comment"
                  className="block text-sm font-medium text-[#000] mb-2"
                >
                  Thêm bình luận mới
                </label>
                <textarea
                  id="new-comment"
                  rows={3}
                  value={comments.newCommentContent}
                  onChange={(e) =>
                    comments.setNewCommentContent(e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none text-[#000]"
                  style={{ borderColor: "#F0F0F0" }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)")
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  placeholder="Nhập nội dung bình luận..."
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={comments.handleCreateComment}
                    disabled={comments.isSubmittingComment}
                    className="inline-flex items-center space-x-2 px-6 py-2 bg-[#000] text-white rounded-full font-medium transition-all disabled:opacity-60"
                    onMouseDown={(e) =>
                      !comments.isSubmittingComment &&
                      (e.currentTarget.style.transform = "scale(0.97)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <PaperPlaneTilt className="w-4 h-4" />
                    <span>
                      {comments.isSubmittingComment ? "Đang gửi..." : "Gửi"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="rounded-lg p-5 text-center"
                style={{
                  backgroundColor: "#F8F8F8",
                  border: "1px solid #F0F0F0",
                }}
              >
                <p className="text-[#000] mb-3">
                  Đăng nhập để bình luận bài viết này.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center rounded-full bg-[#000] px-6 py-2 text-white transition-all"
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.97)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Đăng nhập
                </button>
              </div>
            )}

            {/* Comment list */}
            {comments.isLoadingComments ? (
              <div className="py-10 text-center text-[#888]">
                Đang tải bình luận...
              </div>
            ) : comments.commentsWithDepth.length === 0 ? (
              <div
                className="rounded-lg py-10 text-center text-[#888] border border-dashed"
                style={{ borderColor: "#F0F0F0" }}
              >
                Chưa có bình luận nào cho bài viết này.
              </div>
            ) : (
              <div className="space-y-3">
                {comments.commentsWithDepth.map((comment) => {
                  const author = resolveCommentAuthorSummary(comment, user);
                  const isOwnComment = Boolean(
                    user && author.userId === user._id,
                  );
                  const canManageComment =
                    isOwnComment || user?.role === "admin";
                  const isEditing = comments.editingCommentId === comment._id;
                  const isReplying =
                    comments.activeReplyCommentId === comment._id;
                  const isLikedComment = comments.likedCommentIds.has(
                    comment._id,
                  );
                  const isTopLevelComment = !comment.parentId;
                  const replyCount = Number(comment.replyCount ?? 0);
                  const canViewReplies = isTopLevelComment && replyCount > 0;
                  const isRepliesExpanded = comments.expandedReplyParentIds.has(
                    comment._id,
                  );
                  const isLoadingReplies =
                    comments.loadingRepliesFor === comment._id;
                  const replyValue = comments.replyDrafts[comment._id] || "";
                  const leftIndent = `${Math.min(comment.depth, 6) * 16}px`;
                  const parentComment = comment.parentId
                    ? commentById.get(comment.parentId)
                    : undefined;
                  const parentAuthor = parentComment
                    ? resolveCommentAuthorSummary(parentComment, user)
                    : null;
                  const avatarLetter = (
                    author.username ||
                    author.displayName ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <div
                      key={comment._id}
                      className="rounded-lg bg-white p-4"
                      style={{
                        marginLeft: leftIndent,
                        border: "1px solid #F0F0F0",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <div className="flex min-w-0 items-center gap-3 text-sm text-[#000]">
                          {author.profileHref ? (
                            <Link
                              href={author.profileHref}
                              className="h-9 w-9 overflow-hidden rounded-full"
                              style={{ backgroundColor: "#F0F0F0" }}
                            >
                              {author.avatar ? (
                                <img
                                  src={author.avatar}
                                  alt={author.displayName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#888]">
                                  {avatarLetter}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: "#F0F0F0",
                                color: "#888",
                              }}
                            >
                              {avatarLetter}
                            </div>
                          )}

                          <div className="min-w-0">
                            {author.profileHref ? (
                              <Link
                                href={author.profileHref}
                                className="font-medium text-[#000] hover:text-[#0087CE] hover:underline"
                              >
                                {author.displayName}
                              </Link>
                            ) : (
                              <span className="font-medium text-[#000]">
                                {author.displayName}
                              </span>
                            )}
                            <span className="text-[#888] ml-2">
                              {formatCommentDate(comment.createdOn)}
                            </span>
                            {comment.isEdited && (
                              <span className="ml-2 text-xs text-[#888]">
                                (đã chỉnh sửa)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Like button */}
                          <button
                            type="button"
                            onClick={() =>
                              comments.handleToggleLikeComment(comment._id)
                            }
                            disabled={comments.likingCommentId === comment._id}
                            className="inline-flex items-center space-x-1 transition-colors disabled:opacity-60"
                            style={{
                              color: isLikedComment ? "#DC0055" : "#888",
                            }}
                            onMouseEnter={(e) =>
                              !isLikedComment &&
                              (e.currentTarget.style.color = "#000")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = isLikedComment
                                ? "#DC0055"
                                : "#888")
                            }
                          >
                            <Heart
                              className="w-4 h-4"
                              weight={isLikedComment ? "fill" : "regular"}
                            />
                            <span className="text-xs">
                              {comment.likesCount ?? 0}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              comments.toggleReplyComposerForComment(comment)
                            }
                            className="text-xs font-medium transition-opacity"
                            style={{ color: "#0087CE" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.7")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            Reply
                          </button>

                          {!isOwnComment && (
                            <button
                              type="button"
                              onClick={() =>
                                comments.handleReportComment(comment._id)
                              }
                              className="text-xs font-medium transition-opacity"
                              style={{ color: "#ED9F00" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.7")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                            >
                              Report
                            </button>
                          )}

                          {canManageComment && !isEditing && (
                            <button
                              type="button"
                              onClick={() => comments.startEditComment(comment)}
                              className="text-xs font-medium transition-opacity"
                              style={{ color: "#0087CE" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.7")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                            >
                              Sửa
                            </button>
                          )}

                          {canManageComment && (
                            <button
                              type="button"
                              onClick={() =>
                                comments.handleDeleteComment(comment._id)
                              }
                              disabled={
                                comments.deletingCommentId === comment._id
                              }
                              className="inline-flex items-center space-x-1 text-xs font-medium transition-opacity disabled:opacity-60"
                              style={{ color: "#DC0055" }}
                            >
                              <Trash className="w-3.5 h-3.5" />
                              <span>
                                {comments.deletingCommentId === comment._id
                                  ? "Đang xóa"
                                  : "Xóa"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Edit mode */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={comments.editCommentContent}
                            onChange={(e) =>
                              comments.setEditCommentContent(e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none text-[#000]"
                            style={{ borderColor: "#F0F0F0" }}
                            onFocus={(e) =>
                              (e.target.style.boxShadow =
                                "0 0 0 2px rgba(0,0,0,0.1)")
                            }
                            onBlur={(e) => (e.target.style.boxShadow = "none")}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={comments.cancelEditComment}
                              disabled={comments.isUpdatingComment}
                              className="px-4 py-2 border rounded-full text-[#000] text-sm font-medium disabled:opacity-60"
                              style={{ borderColor: "#F0F0F0" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#F8F8F8")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={comments.handleSaveCommentEdit}
                              disabled={comments.isUpdatingComment}
                              className="px-4 py-2 bg-[#000] text-white rounded-full text-sm font-medium disabled:opacity-60 transition-all"
                              onMouseDown={(e) =>
                                !comments.isUpdatingComment &&
                                (e.currentTarget.style.transform =
                                  "scale(0.97)")
                              }
                              onMouseUp={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            >
                              {comments.isUpdatingComment
                                ? "Đang lưu..."
                                : "Lưu"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CommentContent
                            content={comment.content}
                            mentionLabel={parentAuthor?.mentionLabel}
                            mentionHref={parentAuthor?.profileHref}
                            className="text-sm text-[#000] whitespace-pre-wrap break-words"
                          />
                          {canViewReplies && (
                            <button
                              type="button"
                              onClick={() =>
                                comments.toggleRepliesForComment(comment._id)
                              }
                              disabled={isLoadingReplies}
                              className="mt-2 text-xs font-medium text-[#0087CE] disabled:opacity-60 transition-opacity"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.7")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                            >
                              {isLoadingReplies
                                ? "Đang tải phản hồi..."
                                : isRepliesExpanded
                                  ? "Ẩn phản hồi"
                                  : `Xem ${replyCount} phản hồi`}
                            </button>
                          )}
                        </>
                      )}

                      {/* Reply box */}
                      {isReplying && !isEditing && (
                        <div
                          className="mt-3 pt-3 space-y-2"
                          style={{ borderTop: "1px solid #F0F0F0" }}
                        >
                          <textarea
                            rows={2}
                            value={replyValue}
                            onChange={(e) =>
                              comments.setReplyDrafts((prev) => ({
                                ...prev,
                                [comment._id]: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none text-[#000]"
                            style={{ borderColor: "#F0F0F0" }}
                            onFocus={(e) =>
                              (e.target.style.boxShadow =
                                "0 0 0 2px rgba(0,0,0,0.1)")
                            }
                            onBlur={(e) => (e.target.style.boxShadow = "none")}
                            placeholder="Viết phản hồi..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                comments.setActiveReplyCommentId(null)
                              }
                              disabled={
                                comments.replySubmittingFor === comment._id
                              }
                              className="px-4 py-2 border rounded-full text-[#000] text-sm font-medium disabled:opacity-60"
                              style={{ borderColor: "#F0F0F0" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#F8F8F8")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                comments.handleReplyComment(comment._id)
                              }
                              disabled={
                                comments.replySubmittingFor === comment._id
                              }
                              className="px-4 py-2 bg-[#000] text-white rounded-full text-sm font-medium disabled:opacity-60 transition-all"
                              onMouseDown={(e) =>
                                !comments.replySubmittingFor &&
                                (e.currentTarget.style.transform =
                                  "scale(0.97)")
                              }
                              onMouseUp={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            >
                              {comments.replySubmittingFor === comment._id
                                ? "Đang gửi..."
                                : "Gửi phản hồi"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {comments.hasMoreTopLevelComments && (
                  <div
                    ref={loadMoreTriggerRef}
                    className="py-4 text-center text-sm text-[#888]"
                  >
                    {comments.isLoadingMoreTopLevelComments
                      ? "Đang tải thêm bình luận..."
                      : "Kéo xuống để tải thêm bình luận"}
                  </div>
                )}

                {!comments.hasMoreTopLevelComments &&
                  comments.topLevelComments.length > 0 && (
                    <div className="py-4 text-center text-xs text-[#888]">
                      Đã hiển thị tất cả bình luận gốc.
                    </div>
                  )}
              </div>
            )}
          </div>
        </section>
      </article>

      {/* Edit Post Modal */}
      <PostFormModal
        mode="edit"
        isOpen={postForm.isEditModalOpen}
        formData={postForm.editFormData}
        categories={postForm.categories}
        availableTags={postForm.availableTags}
        isLoadingFormOptions={postForm.isLoadingFormOptions}
        formOptionsError={postForm.formOptionsError}
        error={postForm.editError}
        isSubmitting={postForm.isUpdatingPost}
        onClose={() => postForm.closeEditModal()}
        onInputChange={postForm.handleEditInputChange}
        onContentChange={(md) =>
          postForm.setEditFormData((prev) => ({ ...prev, content: md }))
        }
        onTagToggle={postForm.handleEditTagToggle}
        onSave={() => void postForm.handleUpdatePost()}
      />
    </div>
  );
}
