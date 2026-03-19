"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { postService } from "@/lib/api/post.service";
import { useAuthStore } from "@/store/authStore";
import { Post } from "@/lib/types";
import { format } from "date-fns";
import { Eye, Heart, Share2, Calendar, ArrowLeft, Edit } from "lucide-react";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.slug) {
      loadPost(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    if (!post?._id) return;

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
  }, [post?._id, isAuthenticated]);

  const loadPost = async (slug: string) => {
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
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/posts" className="btn-primary">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {isAuthor && (
              <Link
                href={`/posts/${post._id}/edit`}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Edit className="w-5 h-5" />
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
              className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Meta */}
          <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-gray-200">
            <div className="flex items-center space-x-6 text-gray-600">
              <span className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{post.viewCount} views</span>
              </span>

              <span className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>{post.likesCount} likes</span>
              </span>

              {post.publishedAt && (
                <span className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                  </span>
                </span>
              )}
            </div>

            {/* Author */}
            {author && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {author?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold">
                    {author?.fullName || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    @{author?.username || "user"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 🔥 FIXED CONTENT RENDERING */}
        <div
          className="prose prose-lg max-w-none mb-8 prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4 py-6 border-t border-gray-200">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium ${
              isLiked ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>

          <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </article>
    </div>
  );
}
