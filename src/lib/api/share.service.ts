import { axiosClient } from "./client";
import { ApiResponse } from "../types";

export const shareService = {
  sharePost: async (
    postId: string,
    payload: { platform: string; message?: string },
  ): Promise<ApiResponse> => {
    return await axiosClient.post(`/posts/${postId}/share`, payload);
  },
};
