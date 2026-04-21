"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { categoryService } from "@/lib/api/category.service";
import { Category } from "@/lib/types";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const ACCENT_PINK = "#DC0055";
const ACCENT_BLUE = "#0087CE";
const ACCENT_GOLD = "#ED9F00";

/* ─── TICKER ─── */
const tickerItems = [
  "Viết tự do",
  "12K+ Tác giả",
  "86K+ Bài viết",
  "2.4M Độc giả",
  "Miễn phí mãi mãi",
  "Markdown hỗ trợ đầy đủ",
  "Cộng đồng Việt Nam",
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
    desc: "Đăng ký miễn phí trong 30 giây. Không cần thẻ tín dụng, không ràng buộc.",
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
    title: "Bắt đầu viết",
    desc: "Sử dụng trình soạn thảo Markdown mạnh mẽ, thêm ảnh bìa và chọn danh mục phù hợp.",
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
    title: "Tiếp cận độc giả",
    desc: "Bài viết của bạn tự động hiển thị đến đúng độc giả quan tâm đến chủ đề đó.",
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
    title: "Quy trình biên tập",
    desc: "Hệ thống quản lý nội dung chuyên nghiệp với các công cụ biên tập mạnh mẽ, phù hợp cho cá nhân và nhóm.",
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
    title: "Nhịp tăng trưởng",
    desc: "Theo dõi lượt xem, tương tác và tăng trưởng người theo dõi với bảng phân tích chi tiết theo thời gian thực.",
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
    title: "Cộng đồng tập trung",
    desc: "Kết nối với độc giả và tác giả Việt Nam có cùng đam mê, xây dựng cộng đồng chất lượng cao.",
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
    title: "Xuất bản nhanh",
    desc: "Từ ý tưởng đến bài viết đến tay độc giả trong vài phút. Nền tảng xuất bản nhanh nhất dành cho người Việt.",
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
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

    fetchCategories();
  }, []);

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
            <span className="font-normal text-[#888]">Xuất Bản</span>{" "}
            <br className="hidden md:block" />
            <span className="font-bold text-[#000]">Thế Hệ</span>{" "}
            <span className="font-normal text-[#888]">Mới</span>
          </h1>

          <p className="text-[#888] text-[15px] md:text-[16px] leading-relaxed max-w-lg mb-10">
            Viết, xuất bản và kết nối với cộng đồng độc giả Việt Nam. Miễn phí
            mãi mãi.
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
              src="https://cdn.aptoide.com/imgs/7/3/4/73453f796c1f3a8c5d05a3589da677fb_fgraphic.png"
              alt="Hero image 1"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-video overflow-hidden">
            <img
              src="https://cdn.aptoide.com/imgs/7/3/4/73453f796c1f3a8c5d05a3589da677fb_fgraphic.png"
              alt="Hero image 2"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-video overflow-hidden">
            <img
              src="https://cdn.aptoide.com/imgs/7/3/4/73453f796c1f3a8c5d05a3589da677fb_fgraphic.png"
              alt="Hero image 3"
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
            <span className="font-bold text-[#000]">Chỉ Ba Bước</span>{" "}
            <span className="font-normal text-[#888]">Để Xuất Bản</span>
          </h2>
          <p className="text-[#888] text-[14px] mt-3">
            Không cần kinh nghiệm kỹ thuật. Chỉ cần câu chuyện của bạn.
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
                bạn cần để xuất bản
              </span>
            </h2>
            <p className="text-[#888] text-[14px] mt-3 max-w-md">
              Từ bản nháp đầu tiên đến bài viết lan truyền — IE213 Blog cung cấp
              toàn bộ công cụ bạn cần.
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
            {[
              {
                title: "Tương Lai Của AI Trong Lĩnh Vực Viết Lách Sáng Tạo",
                category: "Công Nghệ",
                catColor: ACCENT_BLUE,
                excerpt:
                  "Trí tuệ nhân tạo đang thay đổi cách chúng ta sáng tác. Liệu đây là mối đe dọa hay cơ hội?",
                author: "Nguyễn Văn Minh",
                initials: "NM",
                authorColor: ACCENT_GOLD,
                date: "15/03/2026",
                readTime: "8 phút",
                views: "3.421",
                tags: ["AI", "Viết lách"],
                tagColor: ACCENT_BLUE,
              },
              {
                title:
                  "Bí Quyết Viết Truyện Ngắn Hay Từ Những Nhà Văn Nổi Tiếng",
                category: "Văn Học",
                catColor: ACCENT_PINK,
                excerpt:
                  "Những kỹ thuật viết truyện ngắn đã được kiểm chứng qua thời gian từ các bậc thầy văn học thế giới.",
                author: "Trần Minh Châu",
                initials: "TC",
                authorColor: ACCENT_PINK,
                date: "12/03/2026",
                readTime: "12 phút",
                views: "2.891",
                tags: ["Văn học", "Truyện ngắn"],
                tagColor: ACCENT_PINK,
              },
              {
                title: "Vũ Trụ Học Và Câu Hỏi Về Sự Sống Ngoài Trái Đất",
                category: "Khoa Học",
                catColor: "#06B6D4",
                excerpt:
                  "Những khám phá thiên văn học gần đây đang làm thay đổi nhận thức của chúng ta về vũ trụ.",
                author: "Lê Hoàng Nam",
                initials: "LN",
                authorColor: "#06B6D4",
                date: "10/03/2026",
                readTime: "11 phút",
                views: "5.102",
                tags: ["Vũ trụ", "Khoa học"],
                tagColor: "#06B6D4",
              },
            ].map((a, i) => (
              <div
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
                  <div className="w-full h-full flex items-center justify-center text-[#888]">
                    <span className="text-[12px]">Article Image {i + 1}</span>
                  </div>
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full"
                    style={{ backgroundColor: a.catColor }}
                  >
                    <span className="text-white text-[11px] font-semibold">
                      {a.category}
                    </span>
                  </div>
                  <div
                    className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                  >
                    <span className="text-white text-[11px]">
                      {a.readTime} đọc
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
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: a.authorColor }}
                    >
                      <span className="text-white text-[9px] font-bold">
                        {a.initials}
                      </span>
                    </div>
                    <span className="text-[#888] text-[12px] font-medium flex-1 truncate">
                      {a.author}
                    </span>
                    <span className="text-[#bbb] text-[11px]">{a.date}</span>
                  </div>
                  <div className="border-t border-[#F0F0F0]" />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#888] text-[11px]">
                      <EyeIcon />
                      <span>{a.views}</span>
                    </div>
                    <div className="ml-auto flex gap-1.5">
                      {a.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                          style={{
                            color: a.tagColor,
                            backgroundColor: `${a.tagColor}15`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              <span className="font-bold text-[#000]">Viết lách</span>{" "}
              <span className="font-normal text-[#888]">
                chưa bao giờ dễ dàng đến thế
              </span>
            </h2>
            <p className="text-[#888] text-[14px] leading-relaxed mb-6">
              IE213 Blog cung cấp trình soạn thảo Markdown mạnh mẽ, hỗ trợ công
              thức toán học, code highlighting và nhúng media linh hoạt. Tập
              trung vào nội dung, chúng tôi lo phần còn lại.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                {
                  text: "Trình soạn thảo Markdown thời gian thực",
                  color: ACCENT_BLUE,
                },
                {
                  text: "Phân tích hiệu suất bài viết chuyên sâu",
                  color: ACCENT_PINK,
                },
                {
                  text: "Kết nối trực tiếp với độc giả qua comment",
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
              <span className="text-[14px] font-bold">Khám phá bài viết</span>
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
                <span className="font-bold text-[#000]">Tổng kết</span>{" "}
                <span className="font-normal text-[#888]">tuần này</span>
              </h2>
              <p className="text-[#888] text-[14px] leading-relaxed">
                Nhận tổng hợp những bài viết hay nhất mỗi tuần, được tuyển chọn
                bởi đội ngũ biên tập IE213 Blog.
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
              Sẵn sàng chưa?
            </span>
            <h2 className="text-white text-[28px] md:text-[36px] font-bold leading-tight tracking-tight mb-3">
              Bắt sáng tác <span style={{ color: ACCENT_GOLD }}>nào nào?</span>
            </h2>
            <p className="text-white/60 text-[14px] leading-relaxed mb-8">
              Tham gia cùng 12,000+ tác giả đang xuất bản trên IE213 Blog. Miễn
              phí, dễ dàng, không ràng buộc.
            </p>
            <button
              onClick={() => router.push("/posts")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[#000] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT_GOLD }}
            >
              <span className="text-[15px]">Bắt đầu ngay hôm nay</span>
              <span className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center">
                <ArrowRight color="#000" />
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
