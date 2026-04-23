"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleNotch, X } from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/lib/types";
import { userService } from "@/lib/api/user.service";

type FollowModalType = "followers" | "following";

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
  const [modalType, setModalType] = useState<FollowModalType | null>(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubmittingFollow, setIsSubmittingFollow] = useState(false);

  const userId = String(params.userId || "");

  const loadRelationStats = async (targetUserId: string, username: string) => {
    try {
      const [followersRes, followingRes, myFollowingRes] = await Promise.all([
        userService.getUserFollowers(targetUserId, { page: 1, limit: 1 }),
        userService.getUserFollowing(targetUserId, { page: 1, limit: 1 }),
        userService.getMyFollowing({ page: 1, limit: 50, search: username }),
      ]);

      setFollowersCount(
        Number(followersRes.metadata?.pagination?.totalUsers || 0),
      );
      setFollowingCount(
        Number(followingRes.metadata?.pagination?.totalUsers || 0),
      );

      const myFollowingList = myFollowingRes.metadata?.following || [];
      setIsFollowing(myFollowingList.some((item) => item._id === targetUserId));
    } catch (relationError) {
      console.error("Failed to load relation stats", relationError);
      setFollowersCount(0);
      setFollowingCount(0);
      setIsFollowing(false);
    }
  };

  const openFollowModal = async (type: FollowModalType) => {
    if (!profile) return;

    setModalType(type);
    setIsModalLoading(true);

    try {
      if (type === "followers") {
        const res = await userService.getUserFollowers(profile._id, {
          page: 1,
          limit: 50,
        });
        setModalUsers(res.metadata?.followers || []);
      } else {
        const res = await userService.getUserFollowing(profile._id, {
          page: 1,
          limit: 50,
        });
        setModalUsers(res.metadata?.following || []);
      }
    } catch (modalError) {
      console.error("Failed to load follow modal users", modalError);
      setModalUsers([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeFollowModal = () => {
    setModalType(null);
    setModalUsers([]);
  };

  const handleFollowToggle = async () => {
    if (!profile || !currentUser || currentUser._id === profile._id) return;

    try {
      setIsSubmittingFollow(true);

      if (isFollowing) {
        await userService.unfollowUser(profile._id);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await userService.followUser(profile._id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (followError) {
      console.error("Failed to toggle follow", followError);
    } finally {
      setIsSubmittingFollow(false);
    }
  };

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
        const fetchedProfile = response.metadata || null;
        setProfile(fetchedProfile);

        if (fetchedProfile) {
          await loadRelationStats(fetchedProfile._id, fetchedProfile.username);
        }
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
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border-[0.5px] border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
          Đang tải hồ sơ...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border-[0.5px] border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border-[0.5px] border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
          Không có dữ liệu hồ sơ người dùng.
        </div>
      </div>
    );
  }

  const avatarLetter = (profile.username || profile.fullName || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border-[0.5px] border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>

      <section className="rounded-2xl border-[0.5px] border-slate-300 bg-white p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName || profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-medium text-slate-700">
                {avatarLetter}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-medium text-slate-900">
              {profile.fullName || profile.username}
            </h1>
            <p className="text-sm text-slate-500">@{profile.username}</p>
            <p className="mt-1 text-xs text-slate-500">
              Vai trò: {profile.role}
            </p>
            {currentUser?._id === profile._id && (
              <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                Đây là hồ sơ của bạn
              </p>
            )}

            {currentUser?._id !== profile._id && (
              <button
                onClick={handleFollowToggle}
                disabled={isSubmittingFollow}
                className="mt-3 inline-flex items-center rounded-lg border-[0.5px] border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingFollow
                  ? "Đang xử lý..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </button>
            )}

            <div className="mt-4 grid max-w-xs grid-cols-2 gap-2">
              <button
                onClick={() => openFollowModal("followers")}
                className="rounded-xl bg-slate-100 px-3 py-2 text-center transition-colors hover:bg-slate-200"
              >
                <p className="text-xs text-slate-600">Follower</p>
                <p className="text-2xl font-medium text-slate-900">
                  {followersCount}
                </p>
              </button>
              <button
                onClick={() => openFollowModal("following")}
                className="rounded-xl bg-slate-100 px-3 py-2 text-center transition-colors hover:bg-slate-200"
              >
                <p className="text-xs text-slate-600">Đang follow</p>
                <p className="text-2xl font-medium text-slate-900">
                  {followingCount}
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <h2 className="mb-2 text-sm font-medium text-slate-700">
            Giới thiệu
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
            {profile.bio?.trim() || "Người dùng chưa cập nhật giới thiệu."}
          </p>
        </div>
      </section>

      {modalType && (
        <div
          onClick={closeFollowModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border-[0.5px] border-slate-300 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-medium text-slate-900">
                {modalType === "followers" ? "Người theo dõi" : "Đang theo dõi"}
              </h3>
              <button
                onClick={closeFollowModal}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {isModalLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-500">
                  <CircleNotch size={20} className="mr-2 animate-spin" />
                  Đang tải danh sách...
                </div>
              ) : modalUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Chưa có dữ liệu.
                </div>
              ) : (
                <div className="space-y-2">
                  {modalUsers.map((item) => (
                    <Link
                      key={item._id}
                      href={`/users/${item._id}`}
                      className="flex items-center gap-3 rounded-xl border-[0.5px] border-slate-300 px-3 py-2 transition-colors hover:bg-slate-50"
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.fullName || item.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-medium text-slate-700">
                            {item.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.fullName || "Chưa cập nhật tên"}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          @{item.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
