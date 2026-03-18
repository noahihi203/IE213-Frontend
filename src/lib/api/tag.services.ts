import { axiosClient } from "./client";
import {
  ApiResponse,
  Tag,
  CreateTagData,
  UpdateTagData,
  UpdateTagCountData,
} from "../types";

export const tagService = {
  // Create tag
  createTag: async (data: CreateTagData): Promise<ApiResponse<Tag>> => {
    return await axiosClient.post("/tags", data);
  },

  // Get all tags
  getAllTag: async (): Promise<ApiResponse<Tag[]>> => {
    return await axiosClient.get("/tags");
  },

  // Get tag by ID
  getTagById: async (tagId: string): Promise<ApiResponse<Tag>> => {
    return await axiosClient.get(`/tags/${tagId}`);
  },

  // Update tag
  updateTag: async (data: UpdateTagData): Promise<ApiResponse<Tag>> => {
    return await axiosClient.put("/tags", data);
  },

  // Update status tag to active
  updateStatusTagToActive: async (tagId: string): Promise<ApiResponse<Tag>> => {
    return await axiosClient.put(`/tags/active/${tagId}`);
  },

  // Update status tag to inactive
  updateStatusTagToInActive: async (
    tagId: string,
  ): Promise<ApiResponse<Tag>> => {
    return await axiosClient.put(`/tags/inactive/${tagId}`);
  },

  // Update tag counts
  updateTagCounts: async (
    data: UpdateTagCountData,
  ): Promise<ApiResponse<Tag[]>> => {
    return await axiosClient.put("/tags/count", data);
  },

  // Delete tag (Admin only)
  deleteTag: async (
    tagId: string,
  ): Promise<ApiResponse<{ deleteTag: boolean }>> => {
    return await axiosClient.delete(`/tags/${tagId}`);
  },
};
