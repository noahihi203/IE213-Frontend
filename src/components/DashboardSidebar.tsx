import {
  Folder,
  GearSix,
  Note,
  SignOut,
  Tag,
  UsersThree,
} from "@phosphor-icons/react";
import { User } from "@/lib/types";

type ActiveTab = "posts" | "users" | "tags" | "categories";
type DashboardTab = ActiveTab | "settings";

interface DashboardSidebarProps {
  user: User;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
}

const navItems: {
  tab: DashboardTab;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}[] = [
  {
    tab: "posts",
    icon: <Note size={18} weight="duotone" />,
    label: "Bài viết của tôi",
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
  return (
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
          {user?.role === "admin" ? "Quản trị viên" : user?.role === "author" ? "Tác giả" : "Người dùng"}
        </span>
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
  );
}
