"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { categoryService } from "@/lib/api/category.service";
import { Category, Post, Tag, TrendingPosts } from "@/lib/types";
import { postService } from "@/lib/api/post.service";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const ACCENT_PINK = "#DC0055";
const ACCENT_BLUE = "#0087CE";
const ACCENT_GOLD = "#ED9F00";

/* ─── TICKER ─── */
const tickerItems = [
  "Cộng đồng Sinh Viên",
  "Kết nối đa trường",
  "Không gian thảo luận",
  "CHIA SẺ & HỌC HỎI",
  "SINH VIÊN TP.HCM",
  "DIỄN ĐÀN TRAO ĐỔI",
  "TRẢI NGHIỆM THỰC TẾ",
  "ĐÁNG TIN CẬY",
  "ĐẠI HỌC QUỐC GIA",
  "86K+ Bài viết",
  "2.4M Độc giả",
];

/* ─── STEPS ─── */
const steps = [
  {
    num: "01",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={ACCENT_GOLD}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20H21" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Tạo tài khoản",
    desc: "Đăng ký nhanh chóng để tham gia thảo luận và chia sẻ bài viết.",
    color: ACCENT_GOLD,
  },
  {
    num: "02",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={ACCENT_BLUE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M12 3v18" />
      </svg>
    ),
    title: "Đăng bài / Thảo luận",
    desc: "Đặt câu hỏi, chia sẻ kinh nghiệm học tập, đời sống sinh viên.",
    color: ACCENT_BLUE,
  },
  {
    num: "03",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={ACCENT_PINK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 010 20" />
      </svg>
    ),
    title: "Kết nối & tương tác",
    desc: "Nhận phản hồi, trao đổi và mở rộng network của bạn.",
    color: ACCENT_PINK,
  },
];

/* ─── FEATURES ─── */
const features = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke={ACCENT_GOLD}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 5.83V17.5" />
        <path d="M3.33 10h13.34" />
      </svg>
    ),
    title: "Chia sẻ kiến thức",
    desc: "Học tập, tài liệu, tips học hiệu quả từ sinh viên khác.",
    color: ACCENT_GOLD,
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke={ACCENT_BLUE}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: "Hỏi đáp nhanh chóng",
    desc: "Đặt câu hỏi và nhận câu trả lời từ cộng đồng.",
    color: ACCENT_BLUE,
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke={ACCENT_PINK}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10" cy="10" r="8" />
        <path d="M6 10a4 4 0 008 0" />
      </svg>
    ),
    title: "Cộng đồng đa trường",
    desc: "Kết nối sinh viên từ nhiều trường đại học tại TP.HCM.",
    color: ACCENT_PINK,
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke={ACCENT_GOLD}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 1L9 9M9 9L3 7l14-6-6 14-2-6z" />
      </svg>
    ),
    title: "Cập nhật xu hướng",
    desc: "Theo dõi các chủ đề hot trong sinh viên.",
    color: ACCENT_GOLD,
  },
];

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

function ArrowRight({
  color = "white",
  size = 16,
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

export default function HomePage() {
  const router = useRouter();
  const [trendingPosts, setTrendingPosts] = useState<TrendingPosts[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTrendingPosts, setIsLoadingTrendingPosts] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchTrendingPosts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.metadata) {
        setCategories(response.metadata);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      const response = await postService.getTrendingPosts();
      if (response.metadata) {
        setTrendingPosts(response.metadata);
      }
    } catch (error) {
      console.error("Failed to fetch trending posts:", error);
    } finally {
      setIsLoadingTrendingPosts(false);
    }
  };

  return (
    <div className={`${montserrat.className} overflow-hidden`}>
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative max-w-6xl mx-auto px-5 pt-16 pb-20">
        {/* Blob behind hero */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          aria-hidden="true"
          style={{ zIndex: 0 }}
        >
          <svg viewBox="0 0 700 500" fill="none" className="w-full h-full">
            <ellipse cx="350" cy="250" rx="340" ry="220" fill="#F0F0F0" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              backgroundColor: `${ACCENT_GOLD}15`,
              border: `1px solid ${ACCENT_GOLD}30`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: ACCENT_GOLD }}
            />
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase"
              style={{ color: ACCENT_GOLD }}
            >
              Nền tảng xuất bản thế hệ mới
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[36px] md:text-[52px] leading-tight tracking-tight mb-6 max-w-3xl">
            <span className="font-bold text-[#000]">Nền Tảng</span>{" "}
            <span className="font-normal text-[#888]">kết nối</span>{" "}
            <br className="hidden md:block" />
            <span className="font-bold text-[#000]">Sinh viên</span>{" "}
            <span className="font-normal text-[#888]">TP.HCM</span>
          </h1>

          <p className="text-[#888] text-[15px] md:text-[16px] leading-relaxed max-w-lg mb-10">
            Nơi sinh viên các trường đại học chia sẻ kiến thức, kinh nghiệm và
            câu chuyện thực tế.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={() => router.push("/posts")}
              className="flex-1 flex items-center justify-between px-6 py-3.5 rounded-2xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#000" }}
            >
              <span className="text-[14px] font-bold">Bắt đầu viết</span>
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight />
              </span>
            </button>
            <button
              onClick={() => router.push("/posts")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[#E0E0E0] bg-white text-[14px] font-semibold text-[#000] hover:bg-[#F8F8F8] transition-colors"
            >
              Khám phá bài viết
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-10 pt-8 border-t border-[#F0F0F0] w-full max-w-sm justify-center">
            {[
              { value: "12K+", label: "Tác giả", color: ACCENT_BLUE },
              { value: "86K+", label: "Bài viết", color: ACCENT_PINK },
              { value: "2.4M", label: "Độc giả", color: ACCENT_GOLD },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span
                  className="text-[22px] font-bold"
                  style={{ color: s.color }}
                >
                  {s.value}
                </span>
                <span className="text-[11px] text-[#888]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image strip */}
        <div
          className="relative z-10 mt-12 grid grid-cols-3 gap-3 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}
        >
          <div className="aspect-video overflow-hidden">
            <img
              src="https://www.uit.edu.vn/_next/image?url=%2Fmedia%2Fimage_c688fa93b3.png&w=1536&q=75"
              alt="uit"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-video overflow-hidden">
            <img
              src="https://i2-vnexpress.vnecdn.net/2025/08/19/tnt-7659-1-1755593935-17555939-7697-3234-1755614479.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=utH400WGrR8THEyLpRGu5w"
              alt="uel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-video overflow-hidden">
            <img
              src="https://oisp.hcmut.edu.vn/en/wp-content/uploads/2018/12/BachKhoaUniversity.jpg"
              alt="hcmut"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TICKER
      ══════════════════════════════════════ */}
      <div className="bg-white border-y border-[#F0F0F0] py-3.5 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap w-max">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="text-[12px] font-medium tracking-[1.5px] uppercase text-[#888] flex items-center gap-3"
            >
              {item}
              <span className="w-1 h-1 rounded-full bg-[#E0E0E0]" />
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          3 STEPS
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span
            className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
            style={{ color: ACCENT_GOLD }}
          >
            Bắt đầu dễ dàng
          </span>
          <h2 className="text-[28px] md:text-[36px] leading-tight tracking-tight">
            <span className="font-bold text-[#000]">Chỉ 3 bước</span>{" "}
            <span className="font-normal text-[#888]">để tham gia</span>
          </h2>
          <p className="text-[#888] text-[14px] mt-3">
            Bắt đầu chia sẻ và kết nối cùng cộng đồng sinh viên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white relative flex flex-col p-6 overflow-hidden group cursor-default"
              style={{
                borderRadius: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Big number watermark */}
              <span
                className="absolute top-4 right-5 text-[42px] font-bold select-none pointer-events-none"
                style={{ color: `${step.color}18`, letterSpacing: "-2px" }}
              >
                {step.num}
              </span>

              {/* Blob spot */}
              <div
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full pointer-events-none transition-transform duration-500 group-hover:scale-150"
                style={{ backgroundColor: `${step.color}10` }}
                aria-hidden="true"
              />

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                style={{
                  backgroundColor: `${step.color}12`,
                  border: `1.5px solid ${step.color}25`,
                }}
              >
                {step.icon}
              </div>
              <h3 className="text-[#000] text-[16px] font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-[#888] text-[13px] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA under steps */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/posts")}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#000" }}
          >
            <span className="text-[15px] font-bold">Bắt đầu ngay hôm nay</span>
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${ACCENT_GOLD}30` }}
            >
              <ArrowRight color={ACCENT_GOLD} />
            </span>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section className="bg-white border-y border-[#F0F0F0] py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col items-center text-center mb-12">
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
              style={{ color: ACCENT_BLUE }}
            >
              Tính năng nổi bật
            </span>
            <h2 className="text-[28px] md:text-[36px] leading-tight tracking-tight">
              <span className="font-bold text-[#000]">Mọi thứ</span>{" "}
              <span className="font-normal text-[#888]">
                bạn cần để kết nối sinh viên
              </span>
            </h2>
            <p className="text-[#888] text-[14px] mt-3 max-w-md">
              UniSync giúp bạn học hỏi, chia sẻ và phát triển.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex flex-col p-5 rounded-2xl bg-[#F8F8F8] group cursor-default"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${f.color}12`,
                    border: `1px solid ${f.color}20`,
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-[#000] text-[14px] font-semibold mb-1.5">
                  {f.title}
                </h3>
                <p className="text-[#888] text-[12px] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase block mb-2"
              style={{ color: ACCENT_GOLD }}
            >
              Danh mục
            </span>
            <h2 className="text-[26px] md:text-[32px] leading-tight tracking-tight">
              <span className="font-bold text-[#000]">Khám Phá</span>{" "}
              <span className="font-normal text-[#888]">Theo Chủ Đề</span>
            </h2>
          </div>
          <button
            onClick={() => router.push("/categories")}
            className="hidden md:flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity"
            style={{ color: ACCENT_GOLD }}
          >
            Tất cả danh mục
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 12L10 8L6 4"
                stroke={ACCENT_GOLD}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {isLoadingCategories ? (
            <div className="col-span-full text-center text-[#888] py-8">
              Đang tải danh mục...
            </div>
          ) : categories.length > 0 ? (
            categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => router.push(`/categories/${cat.slug}`)}
                className="bg-white flex flex-col items-center gap-2 py-5 px-3 rounded-2xl group transition-all hover:-translate-y-0.5"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden bg-[#F0F0F0]"
                  style={{
                    border: "1px solid #E0E0E0",
                  }}
                >
                  {cat.icon ? (
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[18px]">📁</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-[#000]">
                    {cat.abbreviation}
                  </p>
                  <p className="text-[11px] text-[#888] mt-0.5">
                    {cat.postCount || 0} bài
                  </p>
                </div>
                <div
                  className="w-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "#000" }}
                />
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-[#888] py-8">
              Không có danh mục
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED ARTICLES
      ══════════════════════════════════════ */}
      <section className="bg-[#F8F8F8] border-y border-[#F0F0F0] py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span
                className="text-[11px] font-bold tracking-[2px] uppercase block mb-2"
                style={{ color: ACCENT_PINK }}
              >
                Mới nhất
              </span>
              <h2 className="text-[26px] md:text-[32px] leading-tight tracking-tight">
                <span className="font-bold text-[#000]">Bài viết</span>{" "}
                <span className="font-normal text-[#888]">nổi bật</span>
              </h2>
            </div>
            <button
              onClick={() => router.push("/posts")}
              className="hidden md:flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70 transition-opacity"
              style={{ color: ACCENT_PINK }}
            >
              Xem tất cả
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 12L10 8L6 4"
                  stroke={ACCENT_PINK}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingPosts.map((a, i) => {
              const colors = ["#DC0055", "#0087CE", "#ED9F00"];
              const rawDate = a.publishedAt
                ? new Date(a.publishedAt)
                : new Date();

              // Kiểm tra xem object Date vừa tạo có hợp lệ không (tránh trường hợp string rác)
              const date = isNaN(rawDate.getTime())
                ? new Intl.DateTimeFormat("vi-VN").format(new Date()) // Nếu lỗi thì lấy ngày hiện tại
                : new Intl.DateTimeFormat("vi-VN").format(rawDate); // Nếu đúng thì định dạng
              const tagColor =
                colors[Math.floor(Math.random() * colors.length)];
              return (
                <Link
                  href={`/posts/${a.slug}`}
                  key={i}
                  className="bg-white flex flex-col overflow-hidden cursor-pointer group"
                  style={{
                    borderRadius: "18px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    className="relative overflow-hidden bg-gradient-to-br from-[#F0F0F0] to-[#E0E0E0]"
                    style={{ aspectRatio: "16/10" }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img src={`${a.coverImage}`} alt={`${a.slug}`} />
                    </div>
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          colors[Math.floor(Math.random() * colors.length)],
                      }}
                    >
                      <span className="text-white text-[11px] font-semibold">
                        {a.categoryAbbreviation}
                      </span>
                    </div>
                    <div
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                    >
                      <span className="text-white text-[11px]">
                        {a.readingTime} phút đọc
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 p-4 flex-1">
                    <h3 className="text-[#000] text-[15px] font-semibold leading-snug line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-[#888] text-[13px] leading-relaxed line-clamp-2 flex-1">
                      {a.excerpt}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={`${a.authorAvatar ? a.authorAvatar : "https://a.storyblok.com/f/178900/960x540/8f1554c4f8/chiikawa-movie-hero.png"}`}
                        alt={`${a.authorName}`}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="text-[#888] text-[12px] font-medium flex-1 truncate">
                        {a.authorName}
                      </span>
                      <span className="text-[#bbb] text-[11px]">{date}</span>
                    </div>
                    <div className="border-t border-[#F0F0F0]" />
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[#888] text-[11px]">
                        <EyeIcon />
                        <span>{a.viewCount}</span>
                      </div>
                      <div className="ml-auto flex gap-1.5">
                        {a.tags.map((tag: Tag) => (
                          <span
                            key={tag._id}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                            style={{
                              color: tagColor,
                              backgroundColor: `${tagColor}15`,
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
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTENT CREATOR SPOTLIGHT
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Image */}
          <div className="w-full md:w-1/2 relative flex-shrink-0">
            <div
              className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#F0F0F0] to-[#E0E0E0]"
              style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                aspectRatio: "16/9",
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-[#888]">
                <span className="text-[12px]">Creator Image</span>
              </div>
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -right-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${ACCENT_BLUE}15` }}
              >
                <span className="text-[18px]">✍️</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#000]">
                  12K+ Tác giả
                </p>
                <p className="text-[11px] text-[#888]">Đang hoạt động</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 md:pl-4">
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase block mb-4"
              style={{ color: ACCENT_PINK }}
            >
              Tính năng dành cho tác giả
            </span>
            <h2 className="text-[26px] md:text-[32px] leading-tight tracking-tight mb-4">
              <span className="font-bold text-[#000]">Viết</span>{" "}
              <span className="font-normal text-[#888]">
                và chia sẻ dễ dàng
              </span>
            </h2>
            <p className="text-[#888] text-[14px] leading-relaxed mb-6">
              Chia sẻ kinh nghiệm, kiến thức hoặc câu chuyện của bạn với cộng
              đồng chỉ trong vài bước.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                {
                  text: "Trình soạn thảo đơn giản, dễ sử dụng",
                  color: ACCENT_BLUE,
                },
                {
                  text: "Hỗ trợ Markdown cơ bản",
                  color: ACCENT_PINK,
                },
                {
                  text: "Nhận phản hồi từ cộng đồng",
                  color: ACCENT_GOLD,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2 2 4-4"
                        stroke={item.color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[13px] text-[#555]">{item.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/posts")}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#000" }}
            >
              <span className="text-[14px] font-bold">Bắt đầu viết</span>
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEWSLETTER / WEEKLY DIGEST
      ══════════════════════════════════════ */}
      <section className="bg-[#F8F8F8] border-t border-[#F0F0F0] py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Text */}
            <div className="flex-1">
              <span
                className="text-[11px] font-bold tracking-[2px] uppercase block mb-3"
                style={{ color: ACCENT_GOLD }}
              >
                Newsletter
              </span>
              <h2 className="text-[24px] md:text-[28px] leading-tight tracking-tight mb-3">
                <span className="font-bold text-[#000]">Tổng hợp</span>{" "}
                <span className="font-normal text-[#888]">
                  nổi bật tuần này
                </span>
              </h2>
              <p className="text-[#888] text-[14px] leading-relaxed">
                Nhận các bài viết và thảo luận đáng chú ý từ UniSync.
              </p>
            </div>

            {/* Subscribe form */}
            <div className="w-full md:w-auto flex-shrink-0">
              <div
                className="bg-white rounded-2xl p-5 flex flex-col gap-3"
                style={{
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  minWidth: "300px",
                }}
              >
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="w-full bg-[#F8F8F8] rounded-xl px-4 py-3 text-[13px] text-[#000] placeholder-[#888] outline-none border border-[#F0F0F0] focus:border-[#000] transition-colors"
                />
                <button
                  className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#000" }}
                >
                  <span className="text-[14px] font-bold">
                    Đăng ký nhận bản tin
                  </span>
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight size={13} />
                  </span>
                </button>
                <p className="text-[11px] text-[#888] text-center">
                  Miễn phí · Hủy bất kỳ lúc nào
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BIG CTA
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div
          className="relative rounded-3xl overflow-hidden px-8 py-14 flex flex-col items-center text-center"
          style={{ backgroundColor: "#000" }}
        >
          {/* Blobs */}
          <div
            className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none opacity-15"
            style={{
              backgroundColor: ACCENT_BLUE,
              transform: "translate(-50%, -50%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full pointer-events-none opacity-10"
            style={{
              backgroundColor: ACCENT_PINK,
              transform: "translate(50%, 50%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full pointer-events-none opacity-10"
            style={{
              backgroundColor: ACCENT_GOLD,
              transform: "translate(50%, -50%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-lg">
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase mb-4 block"
              style={{ color: ACCENT_GOLD }}
            >
              Sẵn sàng CHIA SẺ chưa?
            </span>
            <h2 className="text-white text-[28px] md:text-[36px] font-bold leading-tight tracking-tight mb-3">
              Tham gia <span style={{ color: ACCENT_GOLD }}>UniSync</span>
            </h2>
            <p className="text-white/60 text-[14px] leading-relaxed mb-8">
              Tham gia cộng đồng sinh viên UniSync ngay hôm nay.
            </p>
            <button
              onClick={() => router.push("/posts")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[#fff] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT_GOLD }}
            >
              <span className="text-[15px]">Bắt đầu ngay hôm nay</span>
              <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <ArrowRight color="#fff" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 24s linear infinite;
        }
      `}</style>
    </div>
  );
}
