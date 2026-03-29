"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { format } from "date-fns";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { Category, Post } from "@/lib/types";
import {
  CalendarDots,
  ChatCircleDots,
  Eye,
  Funnel,
  Heart,
  MagnifyingGlass,
} from "@phosphor-icons/react";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const PAGE_SIZE = 12;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setPosts([]);
    setHasMorePosts(true);
    void loadPosts(1, false);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMorePosts || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const nextPage = currentPage + 1;
          if (nextPage <= totalPages) {
            void loadPosts(nextPage, true);
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [currentPage, hasMorePosts, isLoading, isLoadingMore, totalPages]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    }
  };

  const loadPosts = async (pageToLoad: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await postService.getAllPosts({
        page: pageToLoad,
        limit: PAGE_SIZE,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: "published",
      });

      const metadata = response.metadata as any;
      const nextPosts: Post[] = Array.isArray(metadata)
        ? metadata
        : Array.isArray(metadata?.data)
          ? metadata.data
          : [];

      const nextTotalPages = Number(metadata?.pagination?.totalPages || 1);

      if (Array.isArray(response.metadata)) {
        setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
        setTotalPages(1);
        setCurrentPage(pageToLoad);
        setHasMorePosts(false);
      } else if (response.metadata?.data) {
        setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
        setTotalPages(nextTotalPages);
        setCurrentPage(pageToLoad);
        setHasMorePosts(pageToLoad < nextTotalPages);
      } else {
        if (!append) setPosts([]);
        setTotalPages(1);
        setCurrentPage(pageToLoad);
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      if (!append) setPosts([]);
      setTotalPages(1);
      setHasMorePosts(false);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setPosts([]);
    setHasMorePosts(true);
    void loadPosts(1, false);
  };

  const compactPosts = useMemo(() => posts, [posts]);

  return (
    <div className={`${montserrat.className} min-h-[100dvh] bg-slate-50`}>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tighter text-slate-950 md:text-5xl">
            Tất cả bài viết{" "}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Duyệt các bài viết đã xuất bản từ cộng đồng với bộ lọc tinh gọn và
            siêu dữ liệu giúp lướt xem nhanh.
          </p>
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form onSubmit={handleSearch}>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tìm kiếm bài viết
              </label>
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                  weight="duotone"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </form>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trường đại học
              </label>
              <div className="relative">
                <Funnel
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                  weight="duotone"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Tất cả</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 md:p-4"
              >
                <div className="mb-2 h-28 animate-pulse rounded-lg bg-slate-200 md:h-32" />
                <div className="mb-2 h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mb-1 h-3 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-slate-800">No posts found</p>
            <p className="mt-2 text-sm text-slate-600">
              Try a different keyword or choose another category.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {compactPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {hasMorePosts && (
              <div
                ref={loadMoreRef}
                className="py-6 text-center text-sm text-slate-500"
              >
                {isLoadingMore
                  ? "Đang tải thêm bài viết..."
                  : "Kéo xuống để tải thêm"}
              </div>
            )}

            {!hasMorePosts && compactPosts.length > 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                Đã hiển thị tất cả bài viết.
              </div>
            )}
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
    <Link
      href={`/posts/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.2)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:shadow-[0_20px_34px_-18px_rgba(15,23,42,0.24)]"
    >
      <article>
        {post.coverImage && (
          <div className="h-32 bg-slate-200 md:h-36">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-3 md:p-4">
          {category && (
            <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              {category.name}
            </span>
          )}

          <h2 className="mb-1 line-clamp-2 text-sm font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700 md:text-base">
            {post.title}
          </h2>

          <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-slate-600 md:mb-3 md:text-sm">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500 md:text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5">
                <Eye size={12} weight="duotone" />
                <span>{post.viewCount}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5">
                <Heart size={12} weight="duotone" />
                <span>{post.likesCount}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5">
                <ChatCircleDots size={12} weight="duotone" />
                <span>{post.commentsCount}</span>
              </span>
            </div>

            {post.publishedAt && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 md:text-xs">
                <CalendarDots size={12} weight="duotone" />
                <span>{format(new Date(post.publishedAt), "MMM d")}</span>
              </span>
            )}
          </div>

          {author && (
            <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-2">
              <div className="h-6 w-6 overflow-hidden rounded-full bg-emerald-600">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.fullName || author.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white">
                    {author.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="line-clamp-1 text-xs text-slate-700">
                {author.fullName}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
