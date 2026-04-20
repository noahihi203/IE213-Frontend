"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import {
  EnvelopeSimple,
  Eye,
  EyeSlash,
  CircleNotch,
  UserPlus,
} from "@phosphor-icons/react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError("");

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      setIsSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
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
    "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-accent-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent-orange-500/10";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-accent-orange-50 px-4">
      {/* floating background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-accent-orange-200/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur"
      >
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-orange-50 text-accent-orange-600 ring-8 ring-accent-orange-50/50">
              <EnvelopeSimple size={36} weight="duotone" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Kiểm tra email của bạn
            </h2>

            <p className="mt-3 text-slate-600">
              Chúng tôi đã gửi liên kết xác thực đến
              <br />
              <span className="font-semibold text-slate-900">
                {formData.email}
              </span>
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Về trang đăng nhập
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-orange-100 text-accent-orange-600">
                <UserPlus size={24} weight="duotone" />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Tạo tài khoản
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Điền thông tin để bắt đầu sử dụng UniSyncHCM
              </p>
            </motion.div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="username"
                  placeholder="Tên đăng nhập"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClassName}
                />

                <input
                  name="fullName"
                  placeholder="Họ và tên"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <input
                name="email"
                type="email"
                placeholder="Địa chỉ Email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
              />

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
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
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputClassName} pr-10`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirmPassword ? (
                    <EyeSlash size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                >
                  {displayError}
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-accent-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-accent-orange-400 disabled:cursor-not-allowed disabled:bg-accent-orange-200"
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={20} className="mr-2 animate-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  "Tạo tài khoản"
                )}
              </motion.button>

              <p className="text-center text-sm text-slate-500">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-accent-orange-600 hover:text-accent-orange-700"
                >
                  Đăng nhập
                </Link>
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
