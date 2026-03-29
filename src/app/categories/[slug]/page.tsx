"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Montserrat } from "next/font/google";
import { categoryService } from "@/lib/api/category.service";
import { Category, Post } from "@/lib/types";
import {
  ArrowLeft,
  CalendarDots,
  ChatCircleDots,
  Eye,
  FileText,
  Funnel,
  Heart,
} from "@phosphor-icons/react";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

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
    <div className={`${montserrat.className} min-h-[100dvh] bg-slate-50`}>
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft size={18} weight="duotone" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 opacity-80"
            >
              <Funnel size={16} weight="duotone" />
              <span>Filter</span>
            </button>
          </div>

          <div className="mt-5">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {category?.name || "Category"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {category?.description ||
                "Danh sách bài viết thuộc danh mục này."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-10">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((slot) => (
              <div
                key={slot}
                className="rounded-[1.25rem] border border-slate-200 bg-white p-6"
              >
                <div className="mb-4 h-36 animate-pulse rounded-xl bg-slate-200" />
                <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
            <FileText
              size={54}
              className="mx-auto mb-4 text-slate-300"
              weight="duotone"
            />
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              Không thể tải danh mục
            </h2>
            <p className="mb-6 text-slate-600">{error}</p>
            <Link
              href="/categories"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Quay lại danh mục
            </Link>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
            <FileText
              size={54}
              className="mx-auto mb-4 text-slate-300"
              weight="duotone"
            />
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              Chưa có bài viết nào
            </h2>
            <p className="text-slate-600">
              Danh mục này hiện chưa có bài viết đã xuất bản.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-slate-500">
              {posts.length} bài viết
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
    <article className="overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_20px_40px_-18px_rgba(15,23,42,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:shadow-[0_24px_44px_-18px_rgba(15,23,42,0.14)]">
      {post.coverImage && (
        <div className="h-48 bg-slate-200">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {category && (
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {category.name}
          </span>
        )}

        <Link href={`/posts/${post.slug}`}>
          <h2 className="mb-2 line-clamp-2 text-xl font-semibold tracking-tight text-slate-900 transition-colors hover:text-emerald-700">
            {post.title}
          </h2>
        </Link>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Eye size={15} weight="duotone" />
              <span>{post.viewCount}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={15} weight="duotone" />
              <span>{post.likesCount}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <ChatCircleDots size={15} weight="duotone" />
              <span>{post.commentsCount}</span>
            </span>
          </div>

          {post.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <CalendarDots size={15} weight="duotone" />
              <span>{format(new Date(post.publishedAt), "MMM d")}</span>
            </span>
          )}
        </div>

        {author && (
          <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-emerald-600">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.fullName || author.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                  {author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm text-slate-700">{author.fullName}</span>
          </div>
        )}
      </div>
    </article>
  );
}
