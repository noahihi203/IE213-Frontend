"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Outfit } from "next/font/google";
import {
  CompassTool,
  House,
  SignOut,
  SquaresFour,
  Student,
  UserCircle,
} from "@phosphor-icons/react";
import NotificationBell from "../NotificationBell";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const navItems = [
  {
    href: "/",
    label: "Trang chủ",
    icon: House,
    match: (path: string) => path === "/",
  },
  {
    href: "/posts",
    label: "Bài viết",
    icon: SquaresFour,
    match: (path: string) => path.startsWith("/posts"),
  },
  {
    href: "/categories",
    label: "Trường đại học",
    icon: Student,
    match: (path: string) => path.startsWith("/categories"),
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const roleStyle =
    user?.role === "admin"
      ? "bg-rose-600"
      : user?.role === "author"
        ? "bg-emerald-600"
        : "bg-slate-500";

  const roleLabel =
    user?.role === "admin"
      ? "Quản trị viên"
      : user?.role === "author"
        ? "Tác giả"
        : "Người dùng";

  return (
    <nav
      className={`${outfit.className} sticky top-0 z-40 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-lg font-semibold tracking-tight text-slate-900 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white active:scale-[0.98]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Student size={20} weight="duotone" />
            </span>
            <span className="hidden sm:inline">UniScope HCM</span>
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
                    active
                      ? "bg-emerald-100 text-emerald-800"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon size={16} weight="duotone" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white active:scale-[0.98]"
                >
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-emerald-600 shadow-[0_8px_20px_-10px_rgba(5,150,105,0.7)]">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.fullName || user.username}
                        width={36}
                        height={36}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="hidden text-sm font-medium text-slate-900 md:inline">
                    {user.username}
                  </span>
                </Link>
                <div className="hidden sm:flex items-center">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide text-white ${roleStyle}`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-rose-200 hover:text-rose-600 active:scale-[0.98]"
                >
                  <SignOut size={16} weight="duotone" />
                  <span className="hidden xl:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white hover:text-slate-900 active:scale-[0.98]"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:-translate-y-[1px]"
                >
                  <UserCircle size={16} weight="duotone" />
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-slate-200/80 py-2 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
                  active
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <Icon size={14} weight="duotone" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center justify-between border-t border-slate-200/80 py-2 text-xs text-slate-500 md:flex lg:hidden">
          <span className="inline-flex items-center gap-1.5">
            <CompassTool size={14} weight="duotone" />
            Navigation compact mode
          </span>
          <Link
            href="/dashboard"
            className="font-medium text-emerald-700 transition-colors hover:text-emerald-800"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
