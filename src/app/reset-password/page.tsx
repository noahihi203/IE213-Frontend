"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/api/auth.service";
import { CircleNotch, Eye, EyeSlash } from "@phosphor-icons/react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setError("Token không hợp lệ.");
    if (password !== confirmPassword) return setError("Mật khẩu không khớp.");
    if (password.length < 8) return setError("Mật khẩu phải có ít nhất 8 ký tự.");

    setIsLoading(true);
    setError("");

    try {
      await authService.resetPassword({ token, newPassword: password });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra. Token có thể đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
        <p className="text-rose-600 font-medium">Thiếu token xác thực. Vui lòng kiểm tra lại liên kết trong email.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
        {isSuccess ? (
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-semibold text-slate-900">Hoàn tất!</h2>
            <p className="mb-6 text-slate-600">Mật khẩu của bạn đã được đặt lại thành công.</p>
            <Link href="/login" className="inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700">
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Đặt lại mật khẩu</h2>
              <p className="mt-2 text-sm text-slate-600">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-800">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-10 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-800">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-10 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><CircleNotch size={32} className="animate-spin text-emerald-600" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}