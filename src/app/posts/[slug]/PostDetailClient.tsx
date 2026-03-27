"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
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
  ShareNetwork,
  Trash,
} from "@phosphor-icons/react";

import { usePostForm } from "../../../hooks/usePostForm";
import {
  useComments,
  formatCommentDate,
  resolveCommentAuthorSummary,
} from "../../../hooks/useComments";
import CommentContent from "../../../components/CommentContent";

const MDPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
      Đang tải nội dung bài viết...
    </div>
  ),
});

const PostFormModal = dynamic(
  () => import("../../../components/PostFormModal"),
  {
    ssr: false,
  },
);

interface PostDetailClientProps {
  slug: string;
  initialPost: Post | null;
}

export default function PostDetailClient({
  slug,
  initialPost,
}: PostDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized } = useAuthStore();

  const [post, setPost] = useState<Post | null>(initialPost);
  const [isLoading, setIsLoading] = useState(!initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState("");
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // ── useComments — inline mode, truyền postId khi đã có post ──────────────
  const comments = useComments(user as User | null, {
    postId: post?._id,
    onPostsRefresh: async () => {
      await loadPost(post?.slug || slug);
    },
  });

  // ── usePostForm ───────────────────────────────────────────────────────────
  const postForm = usePostForm(async () => {
    await loadPost(post?.slug || slug);
  });

  const handleOpenEditModal = () => {
    if (post) postForm.openEditModal(post);
  };

  // ── Load post ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setPost(initialPost);

    if (initialPost) {
      setIsLoading(false);
      setError("");
      return;
    }

    void loadPost(slug);
  }, [slug, initialPost]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-slate-600 mb-4">{error}</p>
          <Link
            href="/posts"
            className="tap-target inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="tap-target flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="tap-target flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
              >
                <PencilSimple className="w-5 h-5" />
                <span>Edit Post</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <header className="mb-8">
          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="tap-target inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

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

        <div className="flex items-center space-x-4 py-6 border-t border-slate-200">
          <button
            onClick={handleLike}
            className={`tap-target flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLiked
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>
          <button className="tap-target flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg">
            <ShareNetwork className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        {/* ── Comments section ────────────────────────────────────────────── */}
        <section className="py-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Bình luận</h2>
            <span className="text-sm text-slate-500">
              {post.commentsCount} bình luận
            </span>
          </div>

          {comments.commentsError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {comments.commentsError}
            </div>
          )}

          <div className="space-y-4">
            {/* Comment composer */}
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
                  value={comments.newCommentContent}
                  onChange={(e) =>
                    comments.setNewCommentContent(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Nhập nội dung bình luận..."
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={comments.handleCreateComment}
                    disabled={comments.isSubmittingComment}
                    className="tap-target inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <PaperPlaneTilt className="w-4 h-4" />
                    <span>
                      {comments.isSubmittingComment ? "Đang gửi..." : "Gửi"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-slate-700 mb-3">
                  Đăng nhập để bình luận bài viết này.
                </p>
                <Link
                  href="/login"
                  className="tap-target inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  Đăng nhập
                </Link>
              </div>
            )}

            {/* Comment list */}
            {comments.isLoadingComments ? (
              <div className="py-10 text-center text-slate-500">
                Đang tải bình luận...
              </div>
            ) : comments.commentsWithDepth.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-slate-500">
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
                      className="rounded-lg border border-slate-200 bg-white p-3"
                      style={{ marginLeft: leftIndent }}
                    >
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <div className="flex min-w-0 items-center gap-3 text-sm text-slate-700">
                          {author.profileHref ? (
                            <Link
                              href={author.profileHref}
                              className="h-9 w-9 overflow-hidden rounded-full bg-slate-200"
                            >
                              {author.avatar ? (
                                <Image
                                  src={author.avatar}
                                  alt={author.displayName}
                                  width={36}
                                  height={36}
                                  loading="lazy"
                                  sizes="36px"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-700">
                                  {avatarLetter}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                              {avatarLetter}
                            </div>
                          )}

                          <div className="min-w-0">
                            {author.profileHref ? (
                              <Link
                                href={author.profileHref}
                                className="font-medium text-slate-800 hover:text-blue-700 hover:underline"
                              >
                                {author.displayName}
                              </Link>
                            ) : (
                              <span className="font-medium text-slate-800">
                                {author.displayName}
                              </span>
                            )}
                            <span className="text-slate-400 ml-2">
                              {formatCommentDate(comment.createdOn)}
                            </span>
                            {comment.isEdited && (
                              <span className="ml-2 text-xs text-slate-500">
                                (đã chỉnh sửa)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Like button — đổi màu đỏ khi đã like */}
                          <button
                            type="button"
                            onClick={() =>
                              comments.handleToggleLikeComment(comment._id)
                            }
                            disabled={comments.likingCommentId === comment._id}
                            className={`tap-target inline-flex items-center space-x-1 transition-colors disabled:opacity-60 ${
                              isLikedComment
                                ? "text-red-500"
                                : "text-slate-400 hover:text-rose-400"
                            }`}
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
                            className="tap-target px-2 text-xs text-blue-600 hover:text-blue-700"
                          >
                            Reply
                          </button>

                          {!isOwnComment && (
                            <button
                              type="button"
                              onClick={() =>
                                comments.handleReportComment(comment._id)
                              }
                              className="tap-target px-2 text-xs text-orange-600 hover:text-orange-700"
                            >
                              Report
                            </button>
                          )}

                          {canManageComment && !isEditing && (
                            <button
                              type="button"
                              onClick={() => comments.startEditComment(comment)}
                              className="tap-target px-2 text-xs text-indigo-600 hover:text-indigo-700"
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
                              className="tap-target inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={comments.cancelEditComment}
                              disabled={comments.isUpdatingComment}
                              className="tap-target px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm disabled:opacity-60"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={comments.handleSaveCommentEdit}
                              disabled={comments.isUpdatingComment}
                              className="tap-target px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 disabled:opacity-60"
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
                            className="text-sm text-slate-700 whitespace-pre-wrap break-words"
                          />
                          {canViewReplies && (
                            <button
                              type="button"
                              onClick={() =>
                                comments.toggleRepliesForComment(comment._id)
                              }
                              disabled={isLoadingReplies}
                              className="tap-target mt-2 px-2 text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-60"
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
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                          <textarea
                            rows={2}
                            value={replyValue}
                            onChange={(e) =>
                              comments.setReplyDrafts((prev) => ({
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
                              onClick={() =>
                                comments.setActiveReplyCommentId(null)
                              }
                              disabled={
                                comments.replySubmittingFor === comment._id
                              }
                              className="tap-target px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm disabled:opacity-60"
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
                              className="tap-target px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 disabled:opacity-60"
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
                    className="py-4 text-center text-sm text-slate-500"
                  >
                    {comments.isLoadingMoreTopLevelComments
                      ? "Đang tải thêm bình luận..."
                      : "Kéo xuống để tải thêm bình luận"}
                  </div>
                )}

                {!comments.hasMoreTopLevelComments &&
                  comments.topLevelComments.length > 0 && (
                    <div className="py-4 text-center text-xs text-slate-400">
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
