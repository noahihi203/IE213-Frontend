"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Eye,
  FileText,
  Filter,
  Heart,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { categoryService } from "@/lib/api/category.service";
import { Category, Post } from "@/lib/types";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const slugParam = params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    if (typeof slug !== "string" || slug.trim() === "") {
      setCategory(null);
      setPosts([]);
      setError("Slug danh mục không hợp lệ.");
      setIsLoading(false);
      return;
    }

    void loadCategoryPosts(slug);
  }, [params.slug]);

  const loadCategoryPosts = async (slug: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await categoryService.getPostsByCategorySlug(slug);
      const metadata = response.metadata;

      setCategory(metadata?.category || null);
      setPosts(Array.isArray(metadata?.posts) ? metadata.posts : []);
    } catch (err: any) {
      setCategory(null);
      setPosts([]);
      setError(err?.message || "Không thể tải bài viết theo danh mục.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled
              className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-gray-500 bg-gray-100 opacity-70 cursor-not-allowed"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {category?.name || "Category"}
            </h1>
            <p className="text-gray-600 mt-1">
              {category?.description ||
                "Danh sách bài viết thuộc danh mục này."}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không thể tải danh mục
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/categories"
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
            >
              Quay lại danh mục
            </Link>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có bài viết nào
            </h2>
            <p className="text-gray-600">
              Danh mục này hiện chưa có bài viết đã xuất bản.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {posts.length} bài viết
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const author = typeof post.authorId === "object" ? post.authorId : null;
  const category = typeof post.category === "object" ? post.category : null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {post.coverImage && (
        <div className="h-48 bg-gray-200">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {category && (
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mb-3">
            {category.name}
          </span>
        )}

        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-bold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.likesCount}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount}</span>
            </span>
          </div>

          {post.publishedAt && (
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.publishedAt), "MMM d")}</span>
            </span>
          )}
        </div>

        {author && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {author.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">{author.fullName}</span>
          </div>
        )}
      </div>
    </article>
  );
}
