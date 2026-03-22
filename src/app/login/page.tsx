"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Outfit } from "next/font/google";
import { SignIn } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
      router.push("/");
    } catch (loginError) {
      console.error("Login error:", loginError);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div
      className={`${outfit.className} flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-12`}
    >
      <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
              <SignIn size={28} weight="duotone" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-800"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-800"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-slate-700"
              >
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-emerald-700 hover:text-emerald-800"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
