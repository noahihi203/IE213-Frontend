"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Home, GraduationCap } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 1. Logo (Bên trái) */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="w-8 h-8 text-sky-600" />
            <span className="hidden sm:inline text-sky-900">UniScope HCM</span>
          </Link>

          {/* 2. Navigation Links (Ở giữa) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`flex items-center space-x-1 hover:text-sky-600 transition-colors ${
                pathname === "/"
                  ? "text-sky-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>

            <Link
              href="/posts"
              className={`hover:text-sky-600 transition-colors ${
                pathname.startsWith("/posts")
                  ? "text-sky-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              Bài viết
            </Link>

            <Link
              href="/categories"
              className={`hover:text-sky-600 transition-colors ${
                pathname.startsWith("/categories")
                  ? "text-sky-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              Trường Đại học
            </Link>
          </div>

          {/* 3. User Menu (Bên phải) */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-6">
                {/* Thông tin User */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-base text-gray-900">
                    {user.username}
                  </span>
                  {/* Container bọc Username và Badge - Xếp ngang */}
                </Link>
                <div className="hidden sm:flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full text-white tracking-wide shadow-sm ${
                      user.role === "admin"
                        ? "bg-rose-600" // Nền đỏ cho Admin
                        : user.role === "author"
                          ? "bg-sky-500" // Nền xanh cho CTV
                          : "bg-gray-500" // Nền xám cho User thường
                    }`}
                  >
                    {user.role === "admin"
                      ? "Admin"
                      : user.role === "author"
                        ? "CTV"
                        : "User"}
                  </span>
                </div>
                {/* Nút Đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              /* Trạng thái chưa đăng nhập */
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-sky-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
