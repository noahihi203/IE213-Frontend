"use client";

import { useEffect, useState } from "react";
import {
  CircleNotch,
  Folder,
  GearSix,
  Note,
  SignOut,
  Tag,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { User } from "@/lib/types";
import { userService } from "@/lib/api/user.service";

type ActiveTab = "posts" | "users" | "tags" | "categories";
type DashboardTab = ActiveTab | "settings";

interface DashboardSidebarProps {
  user: User;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
}

type FollowModalType = "followers" | "following";

const navItems: {
  tab: DashboardTab;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}[] = [
  {
    tab: "posts",
    icon: <Note size={18} weight="duotone" />,
    label: "Bài viết",
  },
  {
    tab: "users",
    icon: <UsersThree size={18} weight="duotone" />,
    label: "Quản lý người dùng",
    adminOnly: true,
  },
  {
    tab: "tags",
    icon: <Tag size={18} weight="duotone" />,
    label: "Quản lý tag",
    adminOnly: true,
  },
  {
    tab: "categories",
    icon: <Folder size={18} weight="duotone" />,
    label: "Quản lý danh mục",
    adminOnly: true,
  },
  {
    tab: "settings",
    icon: <GearSix size={18} weight="duotone" />,
    label: "Cài đặt",
  },
];

export default function DashboardSidebar({
  user,
  activeTab,
  onTabChange,
  onLogout,
}: DashboardSidebarProps) {
  const [modalType, setModalType] = useState<FollowModalType | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const loadFollowStats = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        userService.getMyFollowers({ page: 1, limit: 1 }),
        userService.getMyFollowing({ page: 1, limit: 1 }),
      ]);

      setFollowersCount(
        Number(followersRes.metadata?.pagination?.totalUsers || 0),
      );
      setFollowingCount(
        Number(followingRes.metadata?.pagination?.totalUsers || 0),
      );
    } catch (error) {
      console.error("Failed to load follow stats", error);
      setFollowersCount(0);
      setFollowingCount(0);
    }
  };

  const openFollowModal = async (type: FollowModalType) => {
    setModalType(type);
    setIsModalLoading(true);

    try {
      if (type === "followers") {
        const res = await userService.getMyFollowers({ page: 1, limit: 50 });
        setModalUsers(res.metadata?.followers || []);
        setFollowersCount(Number(res.metadata?.pagination?.totalUsers || 0));
      } else {
        const res = await userService.getMyFollowing({ page: 1, limit: 50 });
        setModalUsers(res.metadata?.following || []);
        setFollowingCount(Number(res.metadata?.pagination?.totalUsers || 0));
      }
    } catch (error) {
      console.error("Failed to load follow list", error);
      setModalUsers([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeFollowModal = () => {
    setModalType(null);
    setModalUsers([]);
  };

  useEffect(() => {
    loadFollowStats();
  }, []);

  return (
    <>
      <div className="sticky top-20 rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-emerald-600">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {user.fullName}
          </h2>
          <p className="text-sm text-slate-600">@{user.username}</p>
          <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {user?.role === "admin"
              ? "Quản trị viên"
              : user?.role === "author"
                ? "Tác giả"
                : "Người dùng"}
          </span>

          <div className="mt-4 grid grid-cols-2 gap-2 text-left">
            <button
              onClick={() => openFollowModal("followers")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center transition-colors hover:bg-slate-100"
            >
              <p className="text-xs font-medium text-slate-500">Follower</p>
              <p className="text-base font-semibold text-slate-900">
                {followersCount}
              </p>
            </button>
            <button
              onClick={() => openFollowModal("following")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center transition-colors hover:bg-slate-100"
            >
              <p className="text-xs font-medium text-slate-500">Đang follow</p>
              <p className="text-base font-semibold text-slate-900">
                {followingCount}
              </p>
            </button>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems
            .filter((item) => !item.adminOnly || user.role === "admin")
            .map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex w-full items-center space-x-2 rounded-xl px-4 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  activeTab === tab
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}

          <button
            onClick={onLogout}
            className="flex w-full items-center space-x-2 rounded-xl px-4 py-2.5 text-rose-600 transition-colors hover:bg-rose-50"
          >
            <SignOut size={18} weight="duotone" />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </div>

      {modalType && (
        <div
          onClick={closeFollowModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {modalType === "followers"
                  ? "Người theo dõi bạn"
                  : "Người bạn đang theo dõi"}
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
                    <div
                      key={item._id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.fullName || item.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-emerald-700">
                            {item.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.fullName || "Chưa cập nhật tên"}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          @{item.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
