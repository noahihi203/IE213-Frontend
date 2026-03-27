"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetailClient from "./PostDetailClient";
import { ApiResponse, Post } from "@/lib/types";
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

const MDPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

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


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/v1/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface PageProps {
  params: {
    slug: string;
  };
}

const stripMarkdown = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~\-|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildCanonicalUrl = (slug: string) => `${SITE_URL}/posts/${slug}`;

async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/slug/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<Post>;
    return payload?.metadata ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = params.slug;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | IE213 Blog",
      description: "The requested post is unavailable.",
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical: `/posts/${slug}`,
      },
    };
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
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
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
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

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
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLiked
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-700"
            }`}
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
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-60"
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
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  Đăng nhập
                </button>
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
                                <img
                                  src={author.avatar}
                                  alt={author.displayName}
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
                            className={`inline-flex items-center space-x-1 transition-colors disabled:opacity-60 ${
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
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Reply
                          </button>
  const description =
    post.excerpt?.trim() ||
    stripMarkdown(post.content).slice(0, 160) ||
    "Read this post on IE213 Blog.";

  const author = typeof post.authorId === "object" ? post.authorId : undefined;

  const isPublished = post.status === "published";

  return {
    title: `${post.title} | IE213 Blog`,
    description,
    robots: {
      index: isPublished,
      follow: isPublished,
    },
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    keywords: post.tags?.map((tag) => tag.name).filter(Boolean),
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/posts/${post.slug}`,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              alt: post.title,
            },
          ]
        : undefined,
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      authors: author ? [author.fullName || author.username] : undefined,
      tags: post.tags?.map((tag) => tag.name),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const slug = params.slug;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const author = typeof post.authorId === "object" ? post.authorId : undefined;

  const description =
    post.excerpt?.trim() ||
    stripMarkdown(post.content).slice(0, 160) ||
    "Read this post on IE213 Blog.";

  const canonicalUrl = buildCanonicalUrl(post.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined,
    dateModified: new Date(post.modifiedOn).toISOString(),
    author: author
      ? {
          "@type": "Person",
          name: author.fullName || author.username,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "IE213 Blog",
      url: SITE_URL,
    },
    mainEntityOfPage: canonicalUrl,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Posts",
        item: `${SITE_URL}/posts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <PostDetailClient slug={slug} initialPost={post} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
    </>
  );
}
