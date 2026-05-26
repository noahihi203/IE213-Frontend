"use client";

import {
  GlobeHemisphereEastIcon,
  HeartIcon,
  RocketLaunchIcon,
  Users,
} from "@phosphor-icons/react";
import Link from "next/link";
import rakko from "../../../public/images/rakko.webp";
import hachiware from "../../../public/images/hachiware.webp";
import usagi from "../../../public/images/usagi.webp";
import momoga from "../../../public/images/momoga.webp";
import chiikawa from "../../../public/images/chiikawa.webp";
const ACCENT_GOLD = "#ED9F00";
const ACCENT_PINK = "#DC0055";
const ACCENT_BLUE = "#0087CE";
import Image from "next/image";
import { commentService } from "../../lib/api/comment.service";
import { useEffect, useState } from "react";

// ─── icons ────────────────────────────────────────────────────────────────────
function StarFill({ color = ACCENT_GOLD }: { color?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill={color}
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="7 1 8.8 5.1 13.3 5.4 10 8.4 11 12.8 7 10.5 3 12.8 4 8.4 0.7 5.4 5.2 5.1 7 1" />
    </svg>
  );
}
function CheckIcon({ color = ACCENT_GOLD }: { color?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 8 6.5 11.5 13 5" />
    </svg>
  );
}
function QuoteIcon({ color = ACCENT_GOLD }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color} opacity={0.8}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}
function MapPinIcon({ color = ACCENT_GOLD }: { color?: string }) {
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ArrowRightIcon({
  color = "white",
  size = 15,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.75 9H14.25M9 3.75L14.25 9L9 14.25" />
    </svg>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: "12K+", label: "Sinh viên tham gia", color: ACCENT_BLUE },
  { value: "86K+", label: "Bài viết", color: ACCENT_GOLD },
  { value: "2.4M", label: "Lượt đọc mỗi tháng", color: ACCENT_PINK },
  {
    value: "2026",
    label: "Thành lập tại cái hóc bò tót TP.HCM",
    color: "#10B981",
  },
];

const principles = [
  {
    icon: (
      <HeartIcon weight="fill" className="text-accent-pink-500" size={24} />
    ),
    color: ACCENT_PINK,
    title: "Chia sẻ thực tế",
    desc: "Nội dung đến từ trải nghiệm thật của sinh viên, không phải lý thuyết chung chung.",
  },
  {
    icon: <Users weight="fill" className="text-accent-orange-500" size={24} />,
    color: ACCENT_GOLD,
    title: "Nội dung đa chủ đề",
    desc: "UniSync cung cấp nhiều nội dung về học tập, học phí, đời sống sinh viên và trải nghiệm quanh trường đại học.",
  },
  {
    icon: (
      <GlobeHemisphereEastIcon
        weight="fill"
        className="text-accent-blue-500"
        size={24}
      />
    ),
    color: ACCENT_BLUE,
    title: "Khám phá dễ dàng",
    desc: "Thông tin được phân loại rõ ràng theo trường học và chủ đề để người dùng dễ dàng tìm kiếm.",
  },
  {
    icon: <RocketLaunchIcon weight="fill" color="#10B981" size={24} />,
    color: "#10B981",
    title: "Cập nhật liên tục",
    desc: "Nội dung trên UniSync được cập nhật thường xuyên để phù hợp với nhu cầu tìm kiếm thông tin của sinh viên.",
  },
];

const storyBullets = [
  "Tìm đọc các thông tin về kinh nghiệm học tập và thi cử",
  "Hỏi đáp về ngành học, môn học",
  "Cập nhật về internship và định hướng nghề nghiệp",
  "Theo dõi đời sống sinh viên",
];

const milestones = [
  {
    year: "2023",
    title: "Thành lập UniSync",
    desc: "Bắt đầu với cộng đồng nhỏ sinh viên tại ĐHQG-HCM.",
    side: "left",
  },
  {
    year: "2024 Q1",
    title: "Ra mắt nền tảng thông tin sinh viên",
    desc: "Cung cấp nội dung về trường học, học phí, review và đời sống quanh các trường đại học.",
    side: "right",
  },
  {
    year: "2024 Q3",
    title: "Mở rộng ra nhiều trường tại TP.HCM",
    desc: "Kết nối sinh viên từ UIT, HCMUS, HCMUSSH, IU, UEL,...",
    side: "left",
  },
  {
    year: "2025",
    title: "Đạt 15,000+ lượt truy cập",
    desc: "UniSync trở thành nền tảng được nhiều sinh viên sử dụng để tìm kiếm thông tin đại học.",
    side: "right",
  },
  {
    year: "2026",
    title: "12K+ Tác giả & Hơn thế nữa",
    desc: "Hơn 12,000 tác giả, 86,000 bài viết và 2.4 triệu độcgiả tin tưởng UniSync mỗi tháng.",
    side: "left",
  },
];

const team = [
  {
    name: "Vũ Quang Huy",
    role: "Leader",
    bio: "Nhóm trưởng của nhóm, có vai trò quan trọng trong quá trình làm dự án.",
    followers: "1.240",
    color: ACCENT_BLUE,
    avatar: rakko,
  },
  {
    name: "Nguyễn Trần Hương Giang",
    role: "Designer",
    bio: "Thành viên kế chính giao diện của toàn bộ trang web.",
    followers: "892",
    color: ACCENT_PINK,
    avatar: momoga,
  },
  {
    name: "Châu Trần Vỹ Linh",
    role: "Co-designer",
    bio: "Thành viên cùng tham gia vào quá trình thiết kế web cùng với Designer.",
    followers: "2.103",
    color: ACCENT_GOLD,
    avatar: chiikawa,
  },
  {
    name: "Chung Kiết Lâm",
    role: "Business Analyst",
    bio: "Thành viên phân tích nghiệp vụ góp ý vào dự án dựa trên góc nhìn người dùng.",
    followers: "678",
    color: "#10B981",
    avatar: usagi,
  },
  {
    name: "Bùi Quốc Lâm",
    role: "Coder",
    bio: "Thành viên viết code trong dự án.",
    followers: "3.401",
    color: "#8B5CF6",
    avatar: hachiware,
  },
  // {
  //   name: "Lee Min Ho",
  //   role: "Head of Community",
  //   bio: "Cựu biên tập viên báo Tuổi Trẻ. Xây dựng và vận hành cộng đồng tác giả UniSync.",
  //   followers: "1.890",
  //   color: "#06B6D4",
  //   initials: "DM",
  // },
];

const testimonials = [
  {
    quote:
      "UniSync đã thay đổi hoàn toàn cách tôi chia sẻ kiến thức. Từ một blog cá nhân ít ai biết, giờ bài viết của tôi đến tay hàng chục nghìn độc giả mỗi tháng.",
    name: "MCK",
    role: "Tác giả công nghệ · 1,240 người theo dõi",
    initials: "NM",
    color: ACCENT_BLUE,
  },
  {
    quote:
      "Giao diện sạch, công cụ mạnh và cộng đồng thực sự quan tâm đến nội dung. UniSync là nơi tôi tự hào gọi là 'nhà' của những bài viết của mình.",
    name: "Obito",
    role: "Tác giả văn học · 892 người theo dõi",
    initials: "TL",
    color: ACCENT_PINK,
  },
  {
    quote:
      "Là một developer, tôi đánh giá cao cách UniSync hỗ trợ Markdown và code syntax highlighting. Viết bài kỹ thuật chưa bao giờ dễ và đẹp đến vậy.",
    name: "Vstra khóc sau cánh gà",
    role: "Tác giả kỹ thuật · 2,103 người theo dõi",
    initials: "PH",
    color: ACCENT_GOLD,
  },
];

const media = [
  "VnExpress",
  "Tuổi Trẻ",
  "Dân Trí",
  "Zing News",
  "Cafef",
  "TechInAsia",
];

const getInitials = (fullName: string) => {
  return fullName
    .split(" ")
    .map((word) => word[0])
    .slice(-2) // lấy 2 chữ cái cuối
    .join("")
    .toUpperCase();
};

export type TopComment = {
  postId: { slug: string };
  userId: {
    fullName: string;
    avatar: string;
    role: string;
    followers: any[];
  };
  content: string;
};

export default function CategoryDetailPage() {
  const [topComments, setTopComments] = useState<TopComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopComments();
  }, []);

  const loadTopComments = async () => {
    try {
      const response = await commentService.getUserTopComments("3");
      setTopComments(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Không thể tải top comments!", error);
      setTopComments([]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="pb-32">
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative overflow-hidden border-b border-[#F0F0F0]">
        {/* decorative blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-30">
            <svg viewBox="0 0 700 500" fill="none" className="w-full h-full">
              <ellipse cx="350" cy="240" rx="320" ry="200" fill="#FFF3CC" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* left text */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{
                  backgroundColor: `${ACCENT_GOLD}12`,
                  border: `1px solid ${ACCENT_GOLD}25`,
                }}
              >
                <span className="text-[11px]">✍️</span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: ACCENT_GOLD }}
                >
                  Nền tảng thông tin đại học TP.HCM
                </span>
              </div>

              <h1 className="text-[34px] md:text-[44px] leading-tight tracking-tight mb-6">
                <span className="font-extrabold text-[#000]">
                  Được Xây Dựng Bởi
                </span>
                <br />
                <span className="font-extrabold" style={{ color: ACCENT_GOLD }}>
                  Sinh Viên,
                </span>
                <br />
                <span className="font-extrabold text-[#000]">
                  Dành Cho Người Viết
                </span>
              </h1>

              <p className="text-[#888] text-[15px] leading-relaxed max-w-md">
                UniSync là nền tảng tổng hợp thông tin về trường đại học tại
                TP.HCM.
              </p>
            </div>

            {/* right image */}
            <div className="relative">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
              >
                <img
                  src="/images/about-us-image-1.webp"
                  alt="Việt Nam"
                  className="w-full object-cover aspect-video"
                />
              </div>
              {/* floating badge */}
              <div
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px]"
                  style={{ backgroundColor: `${ACCENT_GOLD}15` }}
                >
                  🇻🇳
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#000]">
                    Made in Vietnam
                  </p>
                  <p className="text-[11px] text-[#888]">Thành lập 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS BAR ══════════════════════ */}
      <div className="border-b border-[#F0F0F0] bg-[#F8F8F8]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F0F0F0]">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-7 px-4 text-center"
              >
                <span
                  className="text-[28px] font-extrabold tracking-tight"
                  style={{ color: s.color }}
                >
                  {s.value}
                </span>
                <span className="text-[12px] text-[#888] mt-1 leading-tight">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════ ORIGIN STORY ══════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* left: story image */}
          <div className="relative">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <img
                src="/images/about-us-image-2.webp"
                alt="Câu chuyện UniSync"
                className="w-full object-cover aspect-[4/3]"
              />
            </div>
            {/* quote floating card */}
            <div
              className="absolute -bottom-5 right-4 bg-white rounded-2xl p-4 max-w-[260px]"
              style={{
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                border: `1px solid ${ACCENT_GOLD}20`,
              }}
            >
              <div className="mb-2">
                <QuoteIcon color={ACCENT_GOLD} />
              </div>
              <p className="text-[12px] text-[#555] leading-relaxed italic mb-2">
                "Mỗi tác giả xứng đáng có một sân khấu. UniSync là sân khấu đó."
              </p>
              <p
                className="text-[11px] font-semibold"
                style={{ color: ACCENT_GOLD }}
              >
                — Đội ngũ sáng lập UniSync
              </p>
            </div>
          </div>

          {/* right: text */}
          <div className="pt-4 md:pt-0">
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase block mb-3"
              style={{ color: ACCENT_GOLD }}
            >
              Nguồn gốc
            </span>
            <h2 className="text-[26px] md:text-[32px] leading-tight tracking-tight mb-5">
              <span className="font-bold text-[#000]">Từ Nhu Cầu Thực Tế</span>{" "}
              <span className="font-normal text-[#888]">Đến UniSync</span>
            </h2>

            <div className="flex flex-col gap-4 text-[14px] text-[#888] leading-relaxed mb-6">
              <p>
                UniSync được xây dựng với mục tiêu giúp mọi người có thể dễ dàng
                tìm kiếm thông tin về các trường đại học tại TP.HCM một cách
                trực quan và thực tế hơn.
              </p>
              <p>
                Thay vì những thông tin rời rạc, UniSync tập trung tổng hợp
                review trường học, học phí, môi trường học tập, đời sống sinh
                viên và trải nghiệm thực tế vào cùng một nền tảng.{" "}
              </p>
              <p>
                UniSync hướng đến việc giúp người dùng khám phá và so sánh thông
                tin đại học dễ dàng hơn thông qua nội dung được phân loại rõ
                ràng theo từng chủ đề và trường học. Tại UniSync, người dùng có
                thể:
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {storyBullets.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${ACCENT_GOLD}15` }}
                  >
                    <CheckIcon color={ACCENT_GOLD} />
                  </span>
                  <span className="text-[13px] text-[#555]">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ VALUES ══════════════════════ */}
      <section className="bg-[#F8F8F8] border-y border-[#F0F0F0] py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col items-center text-center mb-10">
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
              style={{ color: ACCENT_GOLD }}
            >
              Triết lý
            </span>
            <h2 className="text-[28px] md:text-[34px] leading-tight tracking-tight">
              <span className="font-bold text-[#000]">Những Giá Trị</span>{" "}
              <span className="font-normal text-[#888]">Định Hình UniSync</span>
            </h2>
            <p className="text-[#888] text-[14px] mt-3 max-w-md">
              Những nguyên tắc giúp UniSync xây dựng nền tảng thông tin dành cho
              sinh viên TP.HCM.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {principles.map((p) => (
              <div
                key={p.title}
                className="bg-white flex flex-col p-6 rounded-2xl"
                style={{
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  border: "1px solid #F0F0F0",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-[20px] mb-4 flex-shrink-0"
                  style={{
                    backgroundColor: `${p.color}12`,
                    border: `1px solid ${p.color}20`,
                  }}
                >
                  {p.icon}
                </div>
                <h3 className="text-[#000] text-[16px] font-semibold mb-2">
                  {p.title}
                </h3>
                <p className="text-[#888] text-[13px] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TIMELINE ══════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex flex-col items-center text-center mb-10">
          <span
            className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
            style={{ color: ACCENT_GOLD }}
          >
            Hành trình
          </span>
          <h2 className="text-[28px] md:text-[34px] leading-tight tracking-tight">
            <span className="font-bold text-[#000]">Từng Bước</span>{" "}
            <span className="font-normal text-[#888]">Xây Dựng UniSync</span>
          </h2>
        </div>

        {/* Desktop: alternating timeline */}
        <div className="hidden md:block relative">
          {/* center line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(to bottom, transparent, ${ACCENT_GOLD}50, ${ACCENT_GOLD}50, transparent)`,
            }}
          />

          <div className="flex flex-col gap-16">
            {milestones.map((m, i) => (
              <div
                key={i}
                className={`relative flex items-start ${m.side === "right" ? "flex-row-reverse" : ""}`}
              >
                {/* content */}
                <div className="flex-1 flex justify-end">
                  <div
                    className={`w-[100%] ${m.side === "right" ? "text-left pl-10" : "text-right pr-10"}`}
                  >
                    <div
                      className="inline-flex items-center px-3 py-0.5 rounded-full mb-2"
                      style={{
                        backgroundColor: `${ACCENT_GOLD}18`,
                        border: `1px solid ${ACCENT_GOLD}30`,
                      }}
                    >
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: ACCENT_GOLD }}
                      >
                        {m.year}
                      </span>
                    </div>
                    <h3 className="text-[#000] text-[16px] font-semibold mb-1">
                      {m.title}
                    </h3>
                    <p className="text-[#888] text-[13px] leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>

                {/* dot */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-[3px] border-white flex-shrink-0"
                  style={{
                    backgroundColor: ACCENT_GOLD,
                    top: "6px",
                  }}
                />

                {/* spacer opposite side */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: simple vertical list */}
        <div className="md:hidden flex flex-col gap-6">
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: ACCENT_GOLD }}
                />
                {i < milestones.length - 1 && (
                  <div
                    className="w-px flex-1 mt-2"
                    style={{ backgroundColor: `${ACCENT_GOLD}30` }}
                  />
                )}
              </div>
              <div className="pb-4">
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold mb-1"
                  style={{
                    color: ACCENT_GOLD,
                    backgroundColor: `${ACCENT_GOLD}12`,
                  }}
                >
                  {m.year}
                </span>
                <p className="text-[#000] text-[15px] font-semibold">
                  {m.title}
                </p>
                <p className="text-[#888] text-[13px] leading-relaxed mt-1">
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ TEAM ══════════════════════ */}
      <section className="bg-[#F8F8F8] border-y border-[#F0F0F0] py-16">
        <div className="max-w-6xl mx-auto px-5">
          {/* header row */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
            <div className="flex-1">
              <span
                className="text-[11px] font-bold tracking-[2px] uppercase block mb-3"
                style={{ color: ACCENT_GOLD }}
              >
                Con người
              </span>
              <h2 className="text-[26px] md:text-[32px] leading-tight tracking-tight">
                <span className="font-bold text-[#000]">Đội Ngũ Đằng Sau</span>{" "}
                <span className="font-normal text-[#888]">UniSync</span>
              </h2>
              <p className="text-[#888] text-[14px] mt-3 leading-relaxed max-w-md">
                Chúng mình là sinh viên và những người trẻ (có người cũng đã
                già) đang xây dựng một không gian hữu ích cho cộng đồng.
              </p>
            </div>
            {/* team photo */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              >
                <img
                  src="https://images.alphacoders.com/134/thumb-1920-1345108.png"
                  alt="Đội ngũ UniSync"
                  className="w-full object-cover aspect-video"
                />
              </div>
            </div>
          </div>

          {/* team cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.map((m) => (
              <div
                key={m.name}
                className="bg-white flex flex-col gap-4 p-5 rounded-2xl"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #F0F0F0",
                }}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={m.avatar}
                    alt={m.name}
                    width={48}
                    height={48}
                    className="rounded-full flex-shrink-0 object-cover"
                    style={{ border: `2px solid ${m.color}40` }}
                  />
                  <div>
                    <p className="text-[#000] text-[14px] font-semibold">
                      {m.name}
                    </p>
                    <p
                      className="text-[12px] font-medium"
                      style={{ color: m.color }}
                    >
                      {m.role}
                    </p>
                  </div>
                </div>
                <p className="text-[#888] text-[13px] leading-relaxed flex-1">
                  {m.bio}
                </p>
                <div className="border-t border-[#F0F0F0] pt-3">
                  <span className="text-[12px]">
                    <span className="font-semibold text-[#000]">
                      {m.followers}
                    </span>
                    <span className="text-[#888]"> theo dõi</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex flex-col items-center text-center mb-10">
          <span
            className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
            style={{ color: ACCENT_GOLD }}
          >
            Cộng đồng nói gì
          </span>
          <h2 className="text-[28px] md:text-[34px] leading-tight tracking-tight">
            <span className="font-bold text-[#000]">Mọi người nói gì về</span>{" "}
            <span className="font-extrabold text-[#888]">UniSync</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topComments.map((t, i) => {
            const user = t.userId;
            const hasAvatar = !!user.avatar;

            return (
              <div
                key={i}
                className="bg-white flex flex-col p-6 rounded-2xl"
                style={{
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  border: "1px solid #F0F0F0",
                }}
              >
                {/* stars */}

                <p className="text-[#555] text-[13px] leading-relaxed italic flex-1 mb-5">
                  "{t.content}"
                </p>
                <div className="flex items-center gap-3 border-t border-[#F0F0F0] pt-4">
                  {hasAvatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold"
                      style={{ backgroundColor: ACCENT_BLUE }}
                    >
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <div>
                    <p className="text-[#000] text-[13px] font-semibold">
                      {user.fullName}
                    </p>
                    <p className="text-[#888] text-[11px]">
                      {user?.role === "admin"
                        ? "Quản trị viên"
                        : user?.role === "author"
                          ? "Tác giả"
                          : "Người dùng"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════ MEDIA / PRESS ══════════════════════ */}
      <div className="border-y border-[#F0F0F0] bg-[#F8F8F8] py-8">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-center text-[11px] text-[#888] tracking-[2px] uppercase mb-6">
            Được đề cập trên các phương tiện truyền thông
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {media.map((m) => (
              <span
                key={m}
                className="text-[16px] font-bold text-[#888] opacity-60 hover:opacity-90 transition-opacity cursor-default"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════ OFFICE ══════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* left text */}
          <div>
            <span
              className="text-[11px] font-bold tracking-[2px] uppercase block mb-3"
              style={{ color: ACCENT_GOLD }}
            >
              Vị trí
            </span>
            <h2 className="text-[26px] md:text-[32px] leading-tight tracking-tight mb-4">
              <span className="font-bold text-[#000]">Kết nối từ</span>{" "}
              <span className="font-bold text-[#888]">Hồ Chí Minh</span>
            </h2>
            <p className="text-[#888] text-[14px] leading-relaxed mb-8">
              UniSync được xây dựng và phát triển tại TP.HCM, nơi tập trung
              nhiều trường đại học và cộng đồng sinh viên năng động. Đội ngũ
              UniSync mong muốn tạo ra một không gian tổng hợp thông tin hữu
              ích, giúp sinh viên dễ dàng tìm kiếm kiến thức, khám phá môi
              trường học tập và cập nhật những trải nghiệm thực tế xoay quanh
              đời sống đại học.
            </p>

            <div className="flex flex-col gap-3">
              {[
                {
                  city: "Hà Nội",
                  badge: "Trụ sở chính",
                  addr: "18 Lý Thường Kiệt, Quận Hoàn Kiếm",
                },
                {
                  city: "TP. Hồ Chí Minh",
                  badge: "Văn phòng phía Nam",
                  addr: "72 Lê Thánh Tôn, Quận 1",
                },
              ].map((loc) => (
                <div
                  key={loc.city}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl"
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid #F0F0F0",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${ACCENT_GOLD}12`,
                      border: `1px solid ${ACCENT_GOLD}20`,
                    }}
                  >
                    <MapPinIcon color={ACCENT_GOLD} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[#000] text-[14px] font-semibold">
                        {loc.city}
                      </p>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          color: ACCENT_GOLD,
                          backgroundColor: `${ACCENT_GOLD}12`,
                        }}
                      >
                        {loc.badge}
                      </span>
                    </div>
                    <p className="text-[#888] text-[12px] mt-0.5">{loc.addr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right image */}
          <div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <img
                src="https://images.alphacoders.com/134/thumb-1920-1345108.png"
                alt="Văn phòng UniSync"
                className="w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 pb-8">
        <div className="relative rounded-3xl overflow-hidden px-8 py-16 flex flex-col items-center text-center bg-accent-orange-100">
          {/* blobs */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle, ${ACCENT_GOLD}, transparent 70%)`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full pointer-events-none opacity-10"
            style={{ backgroundColor: ACCENT_BLUE }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full pointer-events-none opacity-10"
            style={{ backgroundColor: "#8B5CF6" }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-xl">
            {/* icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[28px]"
              style={{
                background: `linear-gradient(135deg, ${ACCENT_GOLD}, #8B5CF6)`,
              }}
            >
              🔍
            </div>

            <h2 className="text-[#1A1A1A] text-[30px] md:text-[38px] font-extrabold leading-tight tracking-tight mb-4">
              Khám phá{" "}
              <span style={{ color: ACCENT_GOLD }}>thông tin cùng</span> UniSync
            </h2>
            <p className="text-[#666] text-[15px] leading-relaxed mb-8">
              Bắt đầu tìm kiếm các thông tin hữu ích tại UniSync ngay hôm nay.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dang-ky"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: ACCENT_GOLD }}
              >
                <span>Tạo tài khoản miễn phí</span>
                <span className="w-6 h-6 rounded-lg bg-black/15 flex items-center justify-center">
                  <ArrowRightIcon color="#fff" size={14} />
                </span>
              </Link>
              <Link
                href="/posts"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-[#444] hover:text-[#1A1A1A] border border-[#00000015] hover:border-[#00000030] transition-all"
              >
                <span className="text-[13px]">🔍</span>
                <span>Khám phá bài viết</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
