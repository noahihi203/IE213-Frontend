import Link from "next/link";
import { FileText, Settings, LogOut, Users, Tags, Folder } from "lucide-react";
import { User } from "@/lib/types";

type ActiveTab = "posts" | "users" | "tags" | "categories";

interface DashboardSidebarProps {
  user: User;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

const navItems: {
  tab: ActiveTab;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}[] = [
  {
    tab: "posts",
    icon: <FileText className="w-5 h-5" />,
    label: "Bài viết của tôi",
  },
  {
    tab: "users",
    icon: <Users className="w-5 h-5" />,
    label: "Quản lý người dùng",
    adminOnly: true,
  },
  {
    tab: "tags",
    icon: <Tags className="w-5 h-5" />,
    label: "Quản lý tag",
    adminOnly: true,
  },
  {
    tab: "categories",
    icon: <Folder className="w-5 h-5" />,
    label: "Quản lý danh mục",
    adminOnly: true,
  },
];

export default function DashboardSidebar({
  user,
  activeTab,
  onTabChange,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold">{user.fullName}</h2>
        <p className="text-gray-600 text-sm">@{user.username}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
          {user.role}
        </span>
      </div>

      <nav className="space-y-2">
        {navItems
          .filter((item) => !item.adminOnly || user.role === "admin")
          .map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}

        <Link
          href="/dashboard/profile"
          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
