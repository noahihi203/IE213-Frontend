// src/hooks/useNotifications.ts
"use client";

import { useCallback, useState } from "react";
import { notificationService } from "@/lib/api/notification.service";
import { NotificationFilter, NotificationItem } from "@/lib/types";

interface NotificationState {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  total: 0,
  unreadCount: 0,
  loading: false,
  error: null,
};

export function useNotifications() {
  const [state, setState] = useState<NotificationState>(initialState);

  const setLoading = (loading: boolean) =>
    setState((prev) => ({ ...prev, loading }));

  const setError = (error: string | null) =>
    setState((prev) => ({ ...prev, error }));

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(
    async (filter?: NotificationFilter) => {
      setLoading(true);
      setError(null);
      try {
        const res = await notificationService.getNotifications(filter);
        const meta = res.metadata;
        setState({
          notifications: Array.isArray(meta.notifications)
            ? meta.notifications
            : [],
          total: meta.total ?? 0,
          unreadCount: meta.unreadCount ?? 0,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || "Không thể tải thông báo.",
        }));
      }
    },
    [],
  );

  // Chỉ refresh unreadCount (dùng cho bell badge poll)
  const refreshUnread = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications({
        isRead: false,
      });
      setState((prev) => ({
        ...prev,
        unreadCount: res.metadata.unreadCount ?? 0,
      }));
    } catch {
      // silent fail cho background poll
    }
  }, []);

  // ── Mark as read (optimistic) ────────────────────────────────────────────
  const markAsRead = useCallback(async (notificationId: string) => {
    // optimistic update
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));

    try {
      await notificationService.markAsRead(notificationId);
    } catch (err: any) {
      // rollback nếu thất bại
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: false } : n,
        ),
        unreadCount: prev.unreadCount + 1,
        error: err?.message || "Không thể đánh dấu đã đọc.",
      }));
    }
  }, []);

  // ── Mark all as read ─────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    const prevNotifications = state.notifications;
    const prevUnread = state.unreadCount;

    // optimistic update
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));

    try {
      await notificationService.markAllAsRead();
    } catch (err: any) {
      // rollback
      setState((prev) => ({
        ...prev,
        notifications: prevNotifications,
        unreadCount: prevUnread,
        error: err?.message || "Không thể đánh dấu tất cả đã đọc.",
      }));
    }
  }, [state.notifications, state.unreadCount]);

  // ── Delete one (optimistic) ──────────────────────────────────────────────
  const removeOne = useCallback(
    async (notificationId: string) => {
      const removed = state.notifications.find((n) => n._id === notificationId);

      // optimistic update
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.filter(
          (n) => n._id !== notificationId,
        ),
        total: Math.max(0, prev.total - 1),
        unreadCount:
          removed && !removed.isRead
            ? Math.max(0, prev.unreadCount - 1)
            : prev.unreadCount,
      }));

      try {
        await notificationService.deleteNotification(notificationId);
      } catch (err: any) {
        // rollback
        setState((prev) => ({
          ...prev,
          notifications: removed
            ? [removed, ...prev.notifications]
            : prev.notifications,
          total: prev.total + 1,
          unreadCount:
            removed && !removed.isRead
              ? prev.unreadCount + 1
              : prev.unreadCount,
          error: err?.message || "Không thể xóa thông báo.",
        }));
      }
    },
    [state.notifications],
  );

  // ── Delete all read ──────────────────────────────────────────────────────
  const removeAllRead = useCallback(async () => {
    const prevNotifications = state.notifications;
    const prevTotal = state.total;

    // optimistic update
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => !n.isRead),
      total: prev.notifications.filter((n) => !n.isRead).length,
    }));

    try {
      await notificationService.deleteAllRead();
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        notifications: prevNotifications,
        total: prevTotal,
        error: err?.message || "Không thể xóa thông báo đã đọc.",
      }));
    }
  }, [state.notifications, state.total]);

  return {
    ...state,
    fetchNotifications,
    refreshUnread,
    markAsRead,
    markAllAsRead,
    removeOne,
    removeAllRead,
  };
}
