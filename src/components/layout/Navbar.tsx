"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, LogOut, User, PenTool, Home } from "lucide-react";

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
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-primary-600 font-bold text-xl"
          >
            <BookOpen className="w-8 h-8" />
            <span>IE213 Blog</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center space-x-1 hover:text-primary-600 transition-colors ${
                pathname === "/"
                  ? "text-primary-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              href="/posts"
              className={`hover:text-primary-600 transition-colors ${
                pathname.startsWith("/posts")
                  ? "text-primary-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              All Posts
            </Link>

            <Link
              href="/categories"
              className={`hover:text-primary-600 transition-colors ${
                pathname.startsWith("/categories")
                  ? "text-primary-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              Categories
            </Link>

            {isAuthenticated &&
              (user?.role === "poster" || user?.role === "admin") && (
                <Link
                  href="/posts/create"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Write</span>
                </Link>
              )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 hover:text-primary-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user.username}</span>
                </Link>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="hidden md:inline bg-primary-100 text-primary-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-200 transition-colors"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
