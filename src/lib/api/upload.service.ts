import { axiosClient } from "./client";
import { ApiResponse } from "../types";

export const uploadService = {
  uploadImage: async (file: File): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append("image", file);

    return await axiosClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};