"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { Category, Post, Posts } from "@/lib/types";
import { GridFour } from "@phosphor-icons/react";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const DEFAULT_AVATAR_URL =
  "https://i.pinimg.com/736x/a5/78/d9/a578d9499607489c0124cc5fba613c23.jpg";

const CATEGORY_COLORS = ["#DC0055", "#0087CE", "#ED9F00"];

function getCategoryColor(id: string) {
  // Dùng id để màu luôn nhất quán, không random mỗi render
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export function getReadingTime(text: string) {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / 200);
}

// ─── Icon Components ───────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function PostGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 md:p-4"
        >
          <div className="mb-2 h-28 animate-pulse rounded-lg bg-slate-200 md:h-32" />
          <div className="mb-2 h-3 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mb-1 h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;
type SortOption = "createdOn" | "viewCount" | "commentsCount";

const EMPTY_POSTS: Posts = {
  data: [],
  pagination: {
    hasNextPage: false,
    hasPrevPage: false,
    limit: PAGE_SIZE,
    page: 1,
    total: 0,
    totalPages: 1,
  },
};

function PostsPageContent() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const [posts, setPosts] = useState<Posts>(EMPTY_POSTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("createdOn");

  // Trạng thái loading tách biệt: lần đầu vs load thêm
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Load categories 1 lần khi mount
  useEffect(() => {
    categoryService
      .getAllCategories()
      .then((res) =>
        setCategories(Array.isArray(res.metadata) ? res.metadata : []),
      )
      .catch(() => setCategories([]));
  }, []);

  // Reset và load lại từ trang 1 khi filter thay đổi
  useEffect(() => {
    setPosts(EMPTY_POSTS);
    void fetchPosts({ page: 1, append: false });
  }, [selectedCategory, searchTerm, sortBy]);

  // Infinite scroll: khi phần tử cuối xuất hiện → load trang tiếp
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !posts.pagination.hasNextPage || isLoading || isLoadingMore)
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void fetchPosts({ page: posts.pagination.page + 1, append: true });
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [posts.pagination, isLoading, isLoadingMore]);

  // ─── Fetch Posts ─────────────────────────────────────────────────────────

  async function fetchPosts({
    page,
    append,
  }: {
    page: number;
    append: boolean;
  }) {
    append ? setIsLoadingMore(true) : setIsLoading(true);

    try {
      const res = await postService.getAllPosts({
        page,
        limit: PAGE_SIZE,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        sort: sortBy,
        status: "published",
      });

      const fetched = res.metadata as Posts;

      setPosts((prev) =>
        append
          ? { ...fetched, data: [...prev.data, ...fetched.data] }
          : fetched,
      );
    } catch (error) {
      console.error("Failed to load posts:", error);
      if (!append) setPosts(EMPTY_POSTS);
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false);
    }
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleSelectCategory(categoryId: string) {
    setSelectedCategory(categoryId);
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={`${montserrat.className} min-h-[100dvh] bg-slate-50`}>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl leading-tight tracking-tight">
            <span className="font-bold text-[#000]">Bài</span>
            <span className="font-normal text-[#888]"> viết</span>
          </h1>
          <p className="mt-1.5 text-[14px] text-[#888]">
            Khám phá các bài viết từ sinh viên các trường đại học tại TP.HCM
          </p>
        </div>

        {/* Category Filter */}
        <div className="no-scrollbar -mx-5 mb-7 overflow-x-auto px-5 pb-3">
          <div className="flex w-max items-center gap-5">
            <CategoryButton
              label="Tất cả"
              isActive={selectedCategory === ""}
              onClick={() => handleSelectCategory("")}
              icon={
                <GridFour
                  size={32}
                  weight={selectedCategory === "" ? "bold" : "regular"}
                  style={{ color: selectedCategory === "" ? "#000" : "#888" }}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              }
            />
            {categories.map((category) => (
              <CategoryButton
                key={category._id}
                label={category.abbreviation}
                isActive={selectedCategory === category._id}
                onClick={() => handleSelectCategory(category._id)}
                icon={
                  category.icon ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-[24px] transition-transform duration-200 group-hover:scale-110">
                      {category.name.charAt(0)}
                    </span>
                  )
                }
              />
            ))}
          </div>
        </div>

        <div className="mb-8 w-full flex place-content-between items-center">
          <div>
            <span className="font-normal text-[#888]">Hiển thị</span>
            <span className="font-bold text-[#000]">
              {" "}
              {posts.pagination.total}{" "}
            </span>
            <span className="font-normal text-[#888]">bài viết</span>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="post-sort"
              className="text-sm font-medium text-[#888]"
            >
              Sắp xếp
            </label>
            <select
              id="post-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-slate-500"
            >
              <option value="createdOn">Mới nhất</option>
              <option value="viewCount">Nổi bật</option>
              <option value="commentsCount">Nhiều thảo luận</option>
            </select>
          </div>
        </div>

        {/* Post Grid */}
        {isLoading ? (
          <PostGridSkeleton count={PAGE_SIZE} />
        ) : posts.data.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-medium text-slate-800">
              Không tìm thấy bài viết
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Thử từ khoá khác hoặc chọn danh mục khác.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {posts.data.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            {posts.pagination.hasNextPage && (
              <div
                ref={loadMoreRef}
                className="py-6 text-center text-sm text-slate-500"
              >
                {isLoadingMore
                  ? "Đang tải thêm bài viết..."
                  : "Kéo xuống để tải thêm"}
              </div>
            )}

            {!posts.pagination.hasNextPage && (
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

// ─── Category Button ───────────────────────────────────────────────────────

function CategoryButton({
  label,
  isActive,
  onClick,
  icon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-shrink-0 flex-col items-center gap-2"
    >
      <div
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-200"
        style={{
          backgroundColor: isActive ? "#F0F0F0" : "#F8F8F8",
          borderColor: isActive ? "#000" : "#E5E7EB",
          boxShadow: isActive
            ? "0 4px 12px rgba(0,0,0,0.08)"
            : "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span
          className="whitespace-nowrap text-[12px] font-semibold transition-colors"
          style={{ color: isActive ? "#000" : "#888" }}
        >
          {label}
        </span>
        {isActive && <span className="h-1 w-5 rounded-full bg-black" />}
      </div>
    </button>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const author = typeof post.authorId === "object" ? post.authorId : null;
  const category = typeof post.category === "object" ? post.category : null;

  // Màu nhất quán theo category id, không random mỗi render
  const color = getCategoryColor(category?._id ?? post._id);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex cursor-pointer flex-col overflow-hidden bg-white"
      style={{ borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Thumbnail */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/10" }}
      >
        <img
          src={
            post.coverImage ||
            "https://chiikawa-merch.com/cdn/shop/articles/Is_Chiikawa_a_kids_show_5d5255c9-1da6-4e1a-b710-39e4368c51b8.jpg"
          }
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute left-3 top-3 rounded-full px-3 py-1"
          style={{ backgroundColor: color }}
        >
          <span className="text-[11px] font-semibold tracking-wide text-white">
            {category?.abbreviation}
          </span>
        </div>
        <div
          className="absolute bottom-3 right-3 rounded-md px-2.5 py-1"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <span className="text-[11px] text-white">
            {getReadingTime(post.content)} phút đọc
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#000]">
          {post.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-[#888]">
          {post.excerpt}
        </p>

        {/* Author row */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full">
            <img
              src={
                typeof author?.avatar === "string" &&
                author.avatar.trim().startsWith("http")
                  ? author.avatar
                  : DEFAULT_AVATAR_URL
              }
              alt={author?.fullName || author?.username || "Author"}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="flex-1 truncate text-[12px] font-medium text-[#888]">
            {author?.fullName}
          </span>
          <span className="text-[11px] text-[#bbb]">
            {new Date(post.createdOn).toLocaleDateString("vi-VN")}
          </span>
        </div>

        <div className="border-t border-[#F0F0F0]" />

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-[#888]">
            <EyeIcon />
            <span>{post.viewCount}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#888]">
            <HeartIcon />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#888]">
            <CommentIcon />
            <span>{post.commentsCount}</span>
          </div>
          <div className="ml-auto">
            {post.tags?.[0] && (
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                style={{ color, backgroundColor: `${color}15` }}
              >
                {post.tags[0].name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page Wrapper ──────────────────────────────────────────────────────────

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className={`${montserrat.className} min-h-[100dvh] bg-slate-50`}>
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
            <PostGridSkeleton count={12} />
          </div>
        </div>
      }
    >
      <PostsPageContent />
    </Suspense>
  );
}
