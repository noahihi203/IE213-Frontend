"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import { authService } from "@/lib/api/auth.service";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const [message, setMessage] = useState(
    "Đang xác thực email của bạn..."
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn."
      );
      return;
    }

    const verifyToken = async () => {
      try {
        await authService.verifyEmail({ token });

        setStatus("success");

        setMessage(
          "Xác thực email thành công! Bạn hiện có thể đăng nhập."
        );
      } catch (error: any) {
        setStatus("error");

        setMessage(
          error.message || "Token không hợp lệ hoặc đã hết hạn."
        );
      }
    };

    verifyToken();
  }, [token]);

  const iconMap = {
    loading: (
      <CircleNotch
        size={64}
        className="animate-spin text-emerald-600"
      />
    ),

    success: (
      <CheckCircle
        size={64}
        weight="fill"
        className="text-emerald-600"
      />
    ),

    error: (
      <XCircle
        size={64}
        weight="fill"
        className="text-rose-600"
      />
    ),
  };

  const titleMap = {
    loading: "Đang xử lý",
    success: "Thành công!",
    error: "Xác thực thất bại",
  };

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
        className="relative w-full max-w-md rounded-3xl border border-slate-200/60 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur"
      >
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex justify-center"
        >
          {iconMap[status]}
        </motion.div>

        <motion.h2
          key={titleMap[status]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-2 text-2xl font-bold text-slate-900"
        >
          {titleMap[status]}
        </motion.h2>

        <motion.p
          key={message}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-slate-600 leading-relaxed"
        >
          {message}
        </motion.p>

        {status !== "loading" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Đi đến Đăng nhập
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <CircleNotch
            size={32}
            className="animate-spin text-emerald-600"
          />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
