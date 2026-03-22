// src/components/notifications/NotificationDropdown.tsx
"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { CheckCheck, Trash2, RefreshCw } from "lucide-react";

type Tab = "all" | "unread";

interface Props {
  onClose: () => void;
}

// Skeleton placeholder
function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-200 rounded w-2/5" />
      </div>
    </div>
  );
}

export default function NotificationDropdown({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("all");

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeOne,
    removeAllRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications(tab === "unread" ? { isRead: false } : undefined);
  }, [tab]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAllRead = async () => {
    await removeAllRead();
    if (tab === "all") fetchNotifications();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Thông báo</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đọc hết</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteAllRead}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
            title="Xóa tất cả đã đọc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(["all", "unread"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "all"
              ? "Tất cả"
              : `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-sm text-slate-500">
            <p>{error}</p>
            <button
              type="button"
              onClick={() =>
                fetchNotifications(
                  tab === "unread" ? { isRead: false } : undefined,
                )
              }
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="text-4xl mb-3">🔔</span>
            <p className="text-sm">
              {tab === "unread"
                ? "Không có thông báo chưa đọc."
                : "Bạn chưa có thông báo nào."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <NotificationItem
                key={item._id}
                item={item}
                onMarkRead={markAsRead}
                onDelete={removeOne}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
