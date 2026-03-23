"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/lib/types";
import { userService } from "@/lib/api/user.service";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const {
    user: currentUser,
    isAuthenticated,
    authInitialized,
  } = useAuthStore();

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = String(params.userId || "");

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      if (!userId) {
        setError("Không tìm thấy người dùng.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await userService.getUserProfile(userId);
        setProfile(response.metadata || null);
      } catch (err: any) {
        setError(err?.message || "Không thể tải hồ sơ người dùng.");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [authInitialized, isAuthenticated, router, userId]);

  if (!authInitialized || isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-slate-600">
        Đang tải hồ sơ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-slate-600">
        Không có dữ liệu hồ sơ người dùng.
      </div>
    );
  }

  const avatarLetter = (profile.username || profile.fullName || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-5">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} weight="bold" />
          Quay lại bài viết
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName || profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-700">
                {avatarLetter}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {profile.fullName || profile.username}
            </h1>
            <p className="text-sm text-slate-500">@{profile.username}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Vai trò: {profile.role}
            </p>
            {currentUser?._id === profile._id && (
              <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Đây là hồ sơ của bạn
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Giới thiệu
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
            {profile.bio?.trim() || "Người dùng chưa cập nhật giới thiệu."}
          </p>
        </div>
      </section>
    </div>
  );
}
