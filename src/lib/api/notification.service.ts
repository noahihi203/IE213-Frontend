import { axiosClient } from "./client";
import {
  ApiResponse,
  NotificationFilter,
  NotificationItem,
  NotificationListMetadata,
} from "../types";

const BASE = "/notifications";

interface MarkAsReadMetadata {
  updated: boolean;
  updateNoti: NotificationItem;
}

interface MutationMetadata {
  updated?: boolean;
  deleted?: boolean;
  updatedCount?: number;
  deletedCount?: number;
}

export const notificationService = {
  /**
   * Lấy danh sách notification.
   * NOTE: Backend đang đọc filter từ req.body (không chuẩn với GET).
   * Nếu backend chưa sửa sang req.query, dùng params + data cùng lúc.
   * Khi backend đã đổi sang req.query thì chỉ cần params là đủ.
   */
  getNotifications: async (
    filter?: NotificationFilter,
  ): Promise<ApiResponse<NotificationListMetadata>> => {
    return await axiosClient.get(BASE, {
      params: filter, // dùng khi backend đọc req.query
      data: filter, // fallback nếu backend vẫn đọc req.body
    });
  },

  markAsRead: async (
    notificationId: string,
  ): Promise<ApiResponse<MarkAsReadMetadata>> => {
    return await axiosClient.put(`${BASE}/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<ApiResponse<MutationMetadata>> => {
    return await axiosClient.put(`${BASE}/read-all`);
  },

  deleteNotification: async (
    notificationId: string,
  ): Promise<ApiResponse<MutationMetadata>> => {
    return await axiosClient.delete(`${BASE}/${notificationId}`);
  },

  deleteAllRead: async (): Promise<ApiResponse<MutationMetadata>> => {
    return await axiosClient.delete(`${BASE}/read`);
  },
};
