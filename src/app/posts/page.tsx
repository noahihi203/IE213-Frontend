"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Outfit } from "next/font/google";
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

const outfit = Outfit({
  subsets: ["latin"],
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

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [currentPage, selectedCategory, searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    }
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postService.getAllPosts({
        page: currentPage,
        limit: 9,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: "published",
      });

      if (Array.isArray(response.metadata)) {
        setPosts(response.metadata);
        setTotalPages(1);
      } else if (response.metadata?.data) {
        setPosts(
          Array.isArray(response.metadata.data) ? response.metadata.data : [],
        );
        setTotalPages(response.metadata.pagination?.totalPages || 1);
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  return (
    <div className={`${outfit.className} min-h-[100dvh] bg-slate-50`}>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tighter text-slate-950 md:text-5xl">
            All Posts
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Browse published writing from the community with clean filtering and
            quick scan metadata.
          </p>
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form onSubmit={handleSearch}>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                  weight="duotone"
                />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </form>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
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
                  <option value="">All Categories</option>
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((slot) => (
              <div
                key={slot}
                className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 h-40 animate-pulse rounded-xl bg-slate-200" />
                <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mb-2 h-3 w-full animate-pulse rounded bg-slate-200" />
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
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
