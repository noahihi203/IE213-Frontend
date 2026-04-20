"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { categoryService } from "@/lib/api/category.service";
import { Category, Tag, User } from "@/lib/types";
import { FolderOpen } from "@phosphor-icons/react";
import { tagService } from "@/lib/api/tag.services";
import { userService } from "@/lib/api/user.service";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const ACCENT_PINK = "#DC0055";
const ACCENT_BLUE = "#0087CE";
const ACCENT_GOLD = "#ED9F00";
const DEFAULT_AVATAR_URL =
  "https://a.storyblok.com/f/178900/960x540/8f1554c4f8/chiikawa-movie-hero.png";

// ── icon helpers ──────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg
      width="11"
      height="11"
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
function ArrowRight({
  color = "white",
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M8 3l5 5-5 5"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function StarIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function UserGroupIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function ArticleIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function TrendingIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const stats = [
  { icon: <ArticleIcon color={ACCENT_GOLD} />, value: "6", label: "Danh mục" },
  {
    icon: <TrendingIcon color={ACCENT_GOLD} />,
    value: "212+",
    label: "Bài viết",
  },
  {
    icon: <UserGroupIcon color={ACCENT_GOLD} />,
    value: "12K+",
    label: "Tác giả",
  },
  { icon: <EyeIcon />, value: "2.4M", label: "Lượt đọc / tháng" },
  {
    icon: <StarIcon color={ACCENT_GOLD} />,
    value: "240+",
    label: "Bài mới mỗi ngày",
  },
];

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function FeaturedCard({ cat }: { cat: Category }) {
  return (
    <div
      className="bg-white flex flex-col overflow-hidden rounded-2xl group cursor-pointer"
      style={{
        boxShadow: `0 2px 16px ${cat.accentColor}18, 0 1px 4px rgba(0,0,0,0.06)`,
        border: `1px solid ${cat.accentColor}20`,
      }}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden" style={{ height: "160px" }}>
        <img
          src={cat.image}
          alt={cat.slug}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, white 0%, ${cat.gradientColor} 100%)`,
          }}
        />
        {/* Rank badge */}
        <div
          className="absolute top-3 left-3 w-9 h-7 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: cat.color }}
        >
          <span className="text-white text-[11px] font-black">{cat.rank}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col p-5 gap-3 flex-1">
        {/* Icon + title row */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] flex-shrink-0 overflow-hidden"
            style={{
              backgroundColor: `${cat.accentColor}12`,
              border: `1px solid ${cat.accentColor}20`,
            }}
          >
            {typeof cat.icon === "string" && cat.icon.startsWith("http") ? (
              <img
                src={cat.icon}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            ) : (
              cat.icon
            )}
          </div>
          <div>
            <p className="text-[#000] text-[15px] font-semibold leading-tight">
              {cat.name}
            </p>
          </div>
        </div>

        <p className="text-[#888] text-[13px] leading-relaxed">
          {cat.description}
        </p>

        {/* Article preview */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: "#F8F8F8", border: "1px solid #F0F0F0" }}
        >
          <img
            src={cat.topPost?.coverImage}
            alt=""
            className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[#000] text-[12px] font-medium line-clamp-2 leading-snug">
              {cat.topPost?.tittle}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <EyeIcon />
              <span className="text-[#888] text-[11px]">
                {cat.topPost?.viewCount} lượt xem
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{
              color: cat.accentColor,
              backgroundColor: `${cat.accentColor}12`,
              border: `1px solid ${cat.accentColor}20`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: cat.accentColor }}
            />
            {cat.postCount} bài viết
          </div>
          <button
            className="flex items-center gap-1.5 text-[12px] font-semibold transition-all group-hover:gap-2.5"
            style={{ color: cat.accentColor }}
          >
            Xem tất cả
            <ArrowRight color={cat.accentColor} size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AllCategoryCard({ cat }: { cat: Category }) {
  return (
    <Link
      href={`categories/${cat.slug}`}
      className="bg-white flex flex-col p-5 rounded-2xl cursor-pointer group relative overflow-hidden"
      style={{
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        border: "1px solid #F0F0F0",
      }}
    >
      {/* Blob spot */}
      <div
        className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full pointer-events-none transition-transform duration-500 group-hover:scale-150"
        style={{ backgroundColor: `${cat.color}10` }}
        aria-hidden="true"
      />

      {/* Top row: icon + count */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] overflow-hidden"
          style={{
            backgroundColor: `${cat.color}12`,
            border: `1px solid ${cat.color}20`,
          }}
        >
          {typeof cat.icon === "string" && cat.icon.startsWith("http") ? (
            <img
              src={cat.icon}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          ) : (
            cat.icon
          )}
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ color: cat.color, backgroundColor: `${cat.color}10` }}
        >
          {cat.postCount} bài
        </span>
      </div>

      {/* Title + subtitle */}
      <p className="text-[#000] text-[15px] font-semibold">{cat.name}</p>

      <p className="text-[#888] text-[13px] leading-relaxed flex-1 mb-4">
        {cat.description}
      </p>

      {/* Footer */}
      <div className="border-t border-[#F0F0F0] pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#888] text-[11px]">
          <EyeIcon />
          <span>{cat.view} lượt xem</span>
        </div>
        <button
          className="flex items-center gap-1 text-[11px] font-medium transition-all group-hover:gap-1.5"
          style={{ color: cat.color }}
        >
          Xem <ArrowRight color={cat.color} size={11} />
        </button>
      </div>
    </Link>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [topAuthors, setTopAuthors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    loadCategories();
    loadFeaturedCategories();
    loadTags();
    loadTopAuthors();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Không thể tải danh mục:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedCategories = async () => {
    try {
      const response = await categoryService.getFeaturedCategories();
      setFeaturedCategories(
        Array.isArray(response.metadata) ? response.metadata : [],
      );
    } catch (error) {
      console.error("Không thể tải danh mục:", error);
      setFeaturedCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getAllTag();
      setTags(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Không thể tải tag!", error);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTopAuthors = async () => {
    try {
      const response = await userService.getTopAuthors();
      setTopAuthors(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Không thể top authors!", error);
      setTopAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const colors = ["#DC0055", "#0087CE", "#ED9F00"];
  const gradientColors = [
    "rgba(220,0,85,0.2)",
    "rgba(0,135,206,0.2)",
    "rgba(237,159,0,0.2)",
  ];

  const enrichedCategories = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      postCount: cat.postCount ?? Math.floor(Math.random() * 1000),
      view: cat.view ?? Math.floor(Math.random() * 1000),
      color: cat.color ?? colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [categories]);

  const enrichedFeaturedCategories = useMemo(() => {
    return featuredCategories.map((cat, index) => ({
      ...cat,
      rank: index + 1,
      color: colors[index],
      rankBg: colors[index],
      accentColor: colors[index],
      gradientColor: gradientColors[index],
      image: "https://images.alphacoders.com/134/thumb-1920-1345108.png",

      // postCount: cat.postCount ?? Math.floor(Math.random() * 1000),
      view: cat.view ?? Math.floor(Math.random() * 1000),
    }));
  }, [featuredCategories]);

  const enrichedTopAuthors = useMemo(() => {
    return topAuthors.map((author, index) => ({
      ...author,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [topAuthors]);

  return (
    <div className="pb-32">
      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden bg-white border-b border-[#F0F0F0]">
        {/* blobs */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 600 400"
            fill="none"
            className="w-full h-full opacity-50"
          >
            <ellipse cx="300" cy="180" rx="280" ry="160" fill="#F4F0FF" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-12 flex flex-col items-center text-center">
          {/* pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              backgroundColor: `${ACCENT_GOLD}12`,
              border: `1px solid ${ACCENT_GOLD}25`,
            }}
          >
            <StarIcon color={ACCENT_GOLD} />
            <span
              className="text-[11px] font-semibold"
              style={{ color: ACCENT_GOLD }}
            >
              6 danh mục · 212+ bài viết
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[34px] md:text-[48px] leading-tight tracking-tight mb-5">
            <span className="font-bold text-[#000]">Khám Phá</span>{" "}
            <span className="font-bold" style={{ color: ACCENT_GOLD }}>
              Theo Chủ Đề
            </span>
          </h1>

          <p className="text-[#888] text-[15px] leading-relaxed max-w-lg mb-8">
            Từ công nghệ đến văn chương, từ khởi nghiệp đến khoa học — InkFlow
            quy tụ những bài viết chất lượng nhất trong từng lĩnh vực.
          </p>

          {/* Search */}
          <div
            className="flex items-center gap-3 w-full max-w-md bg-[#F8F8F8] rounded-2xl px-4 py-3"
            style={{ border: "1.5px solid #E8E8E8" }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="Tìm danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#000] placeholder-[#888] outline-none"
            />
          </div>
        </div>
      </section>

      {/* ══════════ STATS BAR ══════════ */}
      <div className="bg-white border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center gap-6 md:gap-10 py-4 overflow-x-auto no-scrollbar justify-center">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
                {s.icon}
                <span className="text-[#000] text-[13px] font-bold">
                  {s.value}
                </span>
                <span className="text-[#888] text-[12px]">{s.label}</span>
                {i < stats.length - 1 && (
                  <span className="hidden md:block w-px h-4 bg-[#E8E8E8] ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ FEATURED CATEGORIES ══════════ */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-8">
        <div className="flex items-center gap-2.5 mb-8">
          <StarIcon color={ACCENT_GOLD} />
          <h2 className="text-[20px] font-bold text-[#000] tracking-tight">
            Danh Mục Nổi Bật
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedFeaturedCategories.map((cat) => (
            <FeaturedCard key={cat._id} cat={cat} />
          ))}
        </div>
      </section>

      {/* ══════════ ALL CATEGORIES ══════════ */}
      <section className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#000] tracking-tight">
            Tất Cả Danh Mục
          </h2>
          <span className="text-[13px] text-[#888]">6 danh mục</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedCategories
            .filter(
              (c) =>
                !search || c.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((cat) => (
              <AllCategoryCard key={cat._id} cat={cat} />
            ))}
        </div>
      </section>

      {/* ══════════ TRENDING TAGS ══════════ */}
      <section className="border-t border-[#F0F0F0] bg-[#F8F8F8]">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="flex items-center gap-2.5 mb-6">
            <TrendingIcon color={ACCENT_GOLD} />
            <h2 className="text-[20px] font-bold text-[#000] tracking-tight">
              Thẻ Phổ Biến
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = activeTag === tag.name;
              return (
                <button
                  key={tag._id}
                  onClick={() => setActiveTag(isActive ? "" : tag.name)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? "#000" : "white",
                    color: isActive ? "white" : "#555",
                    border: `1px solid ${isActive ? "#000" : "#E8E8E8"}`,
                    boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURED AUTHORS ══════════ */}
      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex items-center gap-2.5 mb-6">
          <UserGroupIcon color={ACCENT_GOLD} />
          <h2 className="text-[20px] font-bold text-[#000] tracking-tight">
            Tác Giả Nổi Bật
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {enrichedTopAuthors.map((author) => (
            <div
              key={author._id}
              className="bg-white flex items-center gap-3 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #F0F0F0",
              }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[13px] font-bold overflow-hidden"
                style={{ backgroundColor: author.color }}
              >
                <img
                  src={
                    typeof author.avatar === "string" &&
                    author.avatar.trim().startsWith("http")
                      ? author.avatar
                      : DEFAULT_AVATAR_URL
                  }
                  alt={author.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#000] text-[13px] font-semibold truncate">
                  {author.fullName}
                </p>
                <p className="text-[#888] text-[11px] truncate">
                  {author.role}
                </p>
                <p
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: author.color }}
                >
                  {author.postCount} bài viết
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="max-w-6xl mx-auto px-5 pb-8">
        <div
          className="relative rounded-3xl overflow-hidden px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: "#000" }}
        >
          {/* blobs */}
          <div
            className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none opacity-10"
            style={{
              backgroundColor: ACCENT_GOLD,
              transform: "translate(-30%, -30%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none opacity-10"
            style={{
              backgroundColor: ACCENT_BLUE,
              transform: "translate(30%, 30%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p
              className="text-[11px] font-bold tracking-[2px] uppercase mb-2"
              style={{ color: ACCENT_GOLD }}
            >
              Đóng góp nội dung
            </p>
            <h2 className="text-white text-[22px] font-bold leading-snug mb-1">
              Muốn đóng góp nội dung?
            </h2>
            <p className="text-white/60 text-[13px] leading-relaxed max-w-sm">
              Bắt đầu viết và chia sẻ bài viết của bạn tới cộng đồng InkFlow.
              Hoàn toàn miễn phí.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
            <Link
              href={`/posts`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[#000] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT_GOLD }}
            >
              Bắt đầu viết
              <span className="w-5 h-5 rounded-lg bg-black/15 flex items-center justify-center">
                <ArrowRight color="#000" size={11} />
              </span>
            </Link>
            <Link
              href={`/posts`}
              className="px-5 py-3 rounded-xl text-[13px] font-semibold text-white/80 hover:text-white border border-white/15 hover:border-white/30 transition-all"
            >
              Đọc bài viết
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
