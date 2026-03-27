"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignIn, Eye, EyeSlash, CircleNotch } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <SignIn size={24} weight="duotone" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Chào mừng quay lại
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Đăng nhập để tiếp tục sử dụng UniSync
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            value={formData.email}
            onChange={handleChange}
            className={inputClassName}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`${inputClassName} pr-10`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? (
                <EyeSlash size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isLoading ? (
              <>
                <CircleNotch
                  size={20}
                  className="mr-2 animate-spin"
                />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </motion.button>

          <p className="text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Đăng ký
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
