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

export async function generateMetadata() {
  const baseUrl = "https://your-domain.com";

  return {
    title: {
      template: "%s | UniSync",
      default: "Về chúng tôi | UniSync",
    },

    description:
      "Tìm hiểu về UniSync – nền tảng blog dành cho sinh viên Việt Nam, nơi chia sẻ câu chuyện, kiến thức và định hướng nghề nghiệp trong môi trường đại học.",

    keywords: [
      "about unisync",
      "về chúng tôi",
      "blog sinh viên",
      "nền tảng viết lách",
      "định hướng đại học",
      "câu chuyện startup việt",
    ],

    openGraph: {
      title: "Về UniSync - Nền tảng viết lách cho sinh viên Việt Nam",
      description:
        "Khám phá hành trình xây dựng UniSync, sứ mệnh và giá trị cốt lõi trong việc phát triển cộng đồng viết lách và chia sẻ tri thức cho sinh viên.",

      url: `${baseUrl}/about`,
      siteName: "UniSync",

      images: [
        {
          url: `./chikawa.webp`,
          width: 1200,
          height: 630,
          alt: "UniSync - Câu chuyện và sứ mệnh",
        },
      ],

      locale: "vi_VN",
      type: "website",
      countryName: "Việt Nam",
    },

    alternates: {
      canonical: `${baseUrl}/about`,
    },

    metadataBase: new URL(`${baseUrl}/about`),
  };
}

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
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-xl border-[0.5px] border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft size={18} weight="duotone" />
              <span>Quay lại</span>
            </button>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl border-[0.5px] border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 opacity-80"
            >
              <Funnel size={16} weight="duotone" />
              <span>Lọc</span>
            </button>
          </div>

          <div className="mt-5">
            <h1 className="text-3xl font-medium text-slate-900 md:text-4xl">
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
          <div className="flex flex-wrap gap-5">
            {[1, 2, 3, 4].map((slot) => (
              <div
                key={slot}
                className="w-full flex-none rounded-[1.25rem] border-[0.5px] border-slate-300 bg-white p-6 sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
              >
                <div className="mb-4 h-36 animate-pulse rounded-xl bg-slate-200" />
                <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border-[0.5px] border-slate-300 bg-white p-10 text-center">
            <FileText
              size={54}
              className="mx-auto mb-4 text-slate-300"
              weight="duotone"
            />
            <h2 className="mb-2 text-xl font-medium text-slate-900">
              Không thể tải danh mục
            </h2>
            <p className="mb-6 text-slate-600">{error}</p>
            <Link
              href="/categories"
              className="inline-flex items-center rounded-xl border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Quay lại danh mục
            </Link>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[1.5rem] border-[0.5px] border-slate-300 bg-white p-10 text-center">
            <FileText
              size={54}
              className="mx-auto mb-4 text-slate-300"
              weight="duotone"
            />
            <h2 className="mb-2 text-xl font-medium text-slate-900">
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

            <div className="flex flex-wrap gap-5">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="w-full flex-none sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
                >
                  <PostCard post={post} />
                </div>
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
    <Link
      href={`/posts/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Cover image */}
      <div className="relative h-44 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={
            post.coverImage ||
            "https://images5.alphacoders.com/134/thumb-1920-1347069.png"
          }
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title */}
        <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">
          {post.title}
        </h2>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer row 1 — author */}
        {author && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-slate-200">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.fullName || author.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-600">
                  {author.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="truncate text-[12px] font-medium text-slate-600">
              {author.fullName || author.username}
            </span>
          </div>
        )}

        {/* Footer row 2 — stats + date */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          {/* Stats */}
          <div className="flex items-center gap-3 text-slate-400">
            <span className="inline-flex items-center gap-1 text-[12px]">
              <Eye size={13} weight="duotone" />
              {post.viewCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px]">
              <Heart size={13} weight="duotone" />
              {post.likesCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px]">
              <ChatCircleDots size={13} weight="duotone" />
              {post.commentsCount}
            </span>
          </div>

          {/* Date */}
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
              <CalendarDots size={13} weight="duotone" />
              {format(new Date(post.publishedAt), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
