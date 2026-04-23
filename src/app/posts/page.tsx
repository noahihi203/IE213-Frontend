"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { Category, Post } from "@/lib/types";
import { GridFour } from "@phosphor-icons/react";


const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const DEFAULT_AVATAR_URL =
  "https://i.pinimg.com/736x/a5/78/d9/a578d9499607489c0124cc5fba613c23.jpg";

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

export default function PostsPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

      const nextTotalPages = Number(metadata?.pagination?.total || 1);
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

  const compactPosts = useMemo(() => posts, [posts]);

  return (
    <div className={`${montserrat.className} min-h-[100dvh] bg-slate-50`}>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl leading-tight tracking-tight">
            <span className="font-bold text-[#000]">Bài</span>
            <span className="font-normal text-[#888]"> viết</span>
          </h1>
          <p className="text-[#888] text-[14px] mt-1.5">
            Khám phá {totalPages} bài viết từ các tác giả hàng đầu
          </p>
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-6">
          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Trường đại học
            </label>

            <div className="overflow-x-auto pb-3 -mx-5 px-5 mb-7 no-scrollbar">
              <div className="flex items-center gap-5 w-max">
                {/* Nút "Tất cả" */}
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden border-2"
                    style={{
                      backgroundColor:
                        selectedCategory === "" ? "#F0F0F0" : "#F8F8F8",
                      borderColor: selectedCategory === "" ? "#000" : "#E5E7EB",
                      boxShadow:
                        selectedCategory === ""
                          ? "0 4px 12px rgba(0,0,0,0.08)"
                          : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <GridFour
                      size={32}
                      weight={selectedCategory === "" ? "bold" : "regular"}
                      className="group-hover:scale-110 transition-transform duration-200"
                      style={{
                        color: selectedCategory === "" ? "#000" : "#888",
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="text-[12px] font-semibold whitespace-nowrap transition-colors"
                      style={{
                        color: selectedCategory === "" ? "#000" : "#888",
                      }}
                    >
                      Tất cả
                    </span>
                    {selectedCategory === "" && (
                      <span className="w-5 h-1 rounded-full bg-black transition-all" />
                    )}
                  </div>
                </button>

                {/* Danh sách các trường đại học */}
                {categories.map((category) => {
                  const isActive = selectedCategory === category._id;
                  return (
                    <button
                      key={category._id}
                      onClick={() => {
                        setSelectedCategory(category._id);
                        setCurrentPage(1);
                      }}
                      className="flex flex-col items-center gap-2 flex-shrink-0 group"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden border-2"
                        style={{
                          backgroundColor: isActive ? "#F0F0F0" : "#F8F8F8",
                          borderColor: isActive ? "#000" : "#E5E7EB",
                          boxShadow: isActive
                            ? "0 4px 12px rgba(0,0,0,0.08)"
                            : "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                      >
                        {category.icon ? (
                          <img
                            src={category.icon}
                            alt={category.name}
                            className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <span className="text-[24px] group-hover:scale-110 transition-transform duration-200">
                            {category.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="text-[12px] font-semibold whitespace-nowrap transition-colors"
                          style={{ color: isActive ? "#000" : "#888" }}
                        >
                          {category.abbreviation}
                        </span>
                        {isActive && (
                          <span className="w-5 h-1 rounded-full bg-black transition-all" />
                        )}
                      </div>
                    </button>
                  );
                })}
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
  const colors = ["#DC0055", "#0087CE", "#ED9F00"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="bg-white flex flex-col overflow-hidden cursor-pointer group"
      style={{ borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/10" }}
      >
        <img
          src={
            post.coverImage
              ? post.coverImage
              : "https://chiikawa-merch.com/cdn/shop/articles/Is_Chiikawa_a_kids_show_5d5255c9-1da6-4e1a-b710-39e4368c51b8.jpg"
          }
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-white text-[11px] font-semibold tracking-wide">
            {category?.abbreviation}
          </span>
        </div>
        <div
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <span className="text-white text-[11px]">
            {Math.floor(Math.random() * 1000)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <h3 className="text-[#000] text-[15px] font-semibold leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-[#888] text-[13px] leading-relaxed line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={
                typeof author?.avatar === "string" &&
                author.avatar.trim().startsWith("http")
                  ? author.avatar
                  : DEFAULT_AVATAR_URL
              }
              alt={author?.fullName || author?.username || "Author"}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[#888] text-[12px] font-medium flex-1 truncate">
            {author?.fullName}
          </span>
          <span className="text-[#bbb] text-[11px]">
            {new Date(post.createdOn).toLocaleDateString("vi-VN")}
          </span>
        </div>

        <div className="border-t border-[#F0F0F0]" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#888] text-[11px]">
            <EyeIcon />
            <span>{post.viewCount}</span>
          </div>
          <div className="flex items-center gap-1 text-[#888] text-[11px]">
            <HeartIcon />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1 text-[#888] text-[11px]">
            <CommentIcon />
            <span>{post.commentsCount}</span>
          </div>
          <div className="ml-auto flex gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag._id}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                style={{
                  color: color,
                  backgroundColor: `${color}15`,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
