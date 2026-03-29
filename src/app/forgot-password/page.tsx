"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EnvelopeSimple, ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import { authService } from "@/lib/api/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authService.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4">
      {/* floating glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur"
      >
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} /> Quay lại
        </Link>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <EnvelopeSimple size={36} weight="duotone" />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              Kiểm tra email
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi liên kết
              đặt lại mật khẩu đến
              <br />
              <span className="font-semibold text-slate-900">{email}</span>
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Quên mật khẩu?
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="Email address"
              />

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
                    Đang gửi liên kết...
                  </>
                ) : (
                  "Gửi liên kết khôi phục"
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
