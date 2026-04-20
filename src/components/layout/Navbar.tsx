"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const ACCENT_PINK = "#DC0055";
const ACCENT_GOLD = "#ED9F00";

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
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
function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const navLinks = [
  { label: "Trang chủ", path: "/" },
  { label: "Bài viết", path: "/posts" },
  { label: "Danh mục", path: "/categories" },
  { label: "Về chúng tôi", path: "/about" },
];

const getInitials = (value?: string) => {
  if (!value) return "U";
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleBg = user
    ? ({ admin: ACCENT_PINK, author: ACCENT_GOLD, user: "#10B981" }[
        user.role
      ] ?? "#888")
    : "#888";

  const roleLabel = user
    ? ({ admin: "Admin", author: "Author", user: "User" }[user.role] ?? "User")
    : "";

  const displayName = user?.fullName || user?.username || "";
  const compactName = displayName
    ? displayName.split(" ").slice(-2).join(" ")
    : "";
  const initials = getInitials(displayName || user?.username);
  const avatarBg = user
    ? ({ admin: ACCENT_PINK, author: ACCENT_GOLD, user: "#10B981" }[
        user.role
      ] ?? "#888")
    : "#888";

  return (
    <nav
      className={`${montserrat.className} sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F0F0F0]`}
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
            <span className="text-white text-[14px] font-bold">U</span>
          </div>
          <span className="text-[#000] text-[17px] font-bold tracking-tight">
            UniSync
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="relative px-4 py-2 text-[14px] font-medium transition-colors hover:text-accent-pink-950"
                style={{ color: isActive ? "#000" : "#888" }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                    style={{ backgroundColor: ACCENT_PINK }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 max-w-xs hidden md:flex items-center gap-2.5 bg-[#F8F8F8] rounded-full px-4 py-2.5">
          <SearchIcon />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="bg-transparent text-[13px] text-[#000] placeholder-[#888] outline-none flex-1 min-w-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-[#F8F8F8] flex items-center justify-center md:hidden">
            <SearchIcon />
          </button>

          {isAuthenticated && user ? (
            <>
              <button className="relative w-9 h-9 rounded-full bg-[#F8F8F8] flex items-center justify-center">
                <BellIcon />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: ACCENT_PINK }}
                />
              </button>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-colors hover:bg-[#F0F0F0]"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
                    style={{ backgroundColor: avatarBg }}
                  >
                    {initials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-[12px] font-semibold text-[#000] leading-tight">
                      {compactName}
                    </p>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: roleBg }}
                    >
                      {roleLabel}
                    </span>
                  </div>
                  <ChevronIcon />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div
                      className="absolute right-0 top-12 w-48 bg-white rounded-2xl py-2 z-50"
                      style={{
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        border: "1px solid #F0F0F0",
                      }}
                    >
                      <div className="px-3 py-2 border-b border-[#F8F8F8] mb-1">
                        <p className="text-[12px] font-semibold text-[#000]">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-[#888]">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[13px] text-[#000] hover:bg-[#F8F8F8] transition-colors flex items-center gap-2"
                      >
                        Dashboard
                      </button>
                      <div className="border-t border-[#F8F8F8] mt-1 pt-1">
                        <button
                          onClick={async () => {
                            await logout();
                            setDropdownOpen(false);
                            router.push("/login");
                          }}
                          className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#F8F8F8] transition-colors flex items-center gap-2"
                          style={{ color: ACCENT_PINK }}
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/login")}
                className="hidden md:block px-4 py-2 rounded-full text-[13px] font-semibold text-[#000] hover:bg-[#F0F0F0] transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => router.push("/register")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#000" }}
              >
                Đăng ký
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6h8M6 2l4 4-4 4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
