"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { CheckCheck, Trash2, RefreshCw } from "lucide-react";

type Tab = "all" | "unread";

interface Props {
  onClose: () => void;
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div
        className="w-9 h-9 rounded-full shrink-0"
        style={{ backgroundColor: "#F0F0F0" }}
      />
      <div className="flex-1 space-y-1.5">
        <div
          className="h-3 rounded w-4/5"
          style={{ backgroundColor: "#F0F0F0" }}
        />
        <div
          className="h-3 rounded w-2/5"
          style={{ backgroundColor: "#F0F0F0" }}
        />
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
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #F0F0F0" }}
      >
        <h3 className="font-semibold text-[#000]" style={{ fontSize: "14px" }}>
          Thông báo
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs transition-opacity"
              style={{ color: "#0087CE" }}
              title="Đánh dấu tất cả đã đọc"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đọc hết</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteAllRead}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: "#888" }}
            title="Xóa tất cả đã đọc"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#DC0055")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #F0F0F0" }} className="flex">
        {(["all", "unread"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={{
              color: tab === t ? "#000" : "#888",
              borderBottom: tab === t ? "2px solid #000" : "none",
            }}
          >
            {t === "all"
              ? "Tất cả"
              : `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </>
        ) : error ? (
          <div
            className="flex flex-col items-center justify-center py-10 gap-3 text-sm"
            style={{ color: "#888" }}
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() =>
                fetchNotifications(
                  tab === "unread" ? { isRead: false } : undefined,
                )
              }
              className="flex items-center gap-1 transition-opacity"
              style={{ color: "#0087CE" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12"
            style={{ color: "#888" }}
          >
            <span className="text-4xl mb-3">🔔</span>
            <p className="text-sm">
              {tab === "unread"
                ? "Không có thông báo chưa đọc."
                : "Bạn chưa có thông báo nào."}
            </p>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid #F0F0F0" }}>
            {notifications.map((item, index) => (
              <div
                key={item._id}
                style={{
                  borderBottom:
                    index < notifications.length - 1
                      ? "1px solid #F0F0F0"
                      : "none",
                }}
              >
                <NotificationItem
                  item={item}
                  onMarkRead={markAsRead}
                  onDelete={removeOne}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
