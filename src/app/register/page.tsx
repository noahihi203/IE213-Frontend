"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { ArrowRight, UserPlus } from "@phosphor-icons/react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const displayError = error || validationError;
  const inputClassName =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="min-h-[100dvh] bg-slate-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_40px_-20px_rgba(15,23,42,0.15)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between border-b border-slate-200 bg-slate-100/70 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div>
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <UserPlus size={28} weight="duotone" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Bắt đầu hồ sơ tác giả mới
            </h1>
            <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-slate-600">
              Tạo tài khoản để quản lý bài viết, theo dõi phản hồi và xây dựng nhịp xuất bản riêng của bạn.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Không gian làm việc</p>
              <p className="mt-1 text-sm font-medium text-slate-800">Dashboard tác giả</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Bảo mật</p>
              <p className="mt-1 text-sm font-medium text-slate-800">Xác thực tài khoản an toàn</p>
            </div>
          </div>
        </section>

        <section className="p-6 md:p-8 lg:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Tạo tài khoản
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Điền thông tin bên dưới để truy cập hệ thống biên tập.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={inputClassName}
                placeholder="linh-phan"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Minh Khoa Tran"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
                placeholder="you@studio-mail.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Minimum 6 characters"
              />
              <p className="text-xs text-slate-500">Tối thiểu 6 ký tự.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Re-enter your password"
              />
            </div>

            {displayError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition active:scale-[0.98] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex w-full items-center justify-center gap-2">
                  <span className="h-2 w-20 animate-pulse rounded bg-emerald-300" />
                  <span className="h-2 w-12 animate-pulse rounded bg-emerald-300" />
                </span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-700 transition-colors hover:text-emerald-800"
              >
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
