import { axiosClient } from "./client";
import { ApiResponse, Comment } from "../types";

export interface CreateCommentPayload {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentPayload {
  commentId: string;
  content: string;
}

export interface DeleteCommentPayload {
  postId: string;
  commentId: string;
}

export interface ToggleLikeCommentResponse {
  liked: boolean;
  likesCount: number;
}

export interface ReportCommentResponse {
  message: string;
  reportCount: number;
}

export interface TopLevelCommentsMetadata {
  comments: Comment[];
  total: number;
  hasMore: boolean;
}

export interface GetTopLevelCommentsParams {
  parentCommentId?: string;
  limit?: number;
  skip?: number;
}

export const commentService = {
  getPostTopComments: async (
    postId: string,
    options?: GetTopLevelCommentsParams,
  ): Promise<ApiResponse<TopLevelCommentsMetadata | Comment[]>> => {
    const { parentCommentId, limit, skip } = options ?? {};
    const params = new URLSearchParams();
    if (parentCommentId) {
      params.append("parentCommentId", parentCommentId);
    }
    if (typeof limit === "number") {
      params.append("limit", String(limit));
    }
    if (typeof skip === "number") {
      params.append("skip", String(skip));
    }

    const query = params.toString();
    const endpoint = query
      ? `/posts/${postId}/comments?${query}`
      : `/posts/${postId}/comments`;

    return await axiosClient.get(endpoint);
  },

  getNextLevelPostComments: async (
    postId: string,
    parentCommentId?: string,
  ): Promise<ApiResponse<Comment[]>> => {
    const params = new URLSearchParams();
    if (parentCommentId) {
      params.append("parentCommentId", parentCommentId);
    }

    const query = params.toString();
    const endpoint = query
      ? `/posts/${postId}/next-comments?${query}`
      : `/posts/${postId}/next-comments`;

    return await axiosClient.get(endpoint);
  },

  getPostCommentCount: async (
    postId: string,
    parentCommentId?: string,
  ): Promise<ApiResponse<number>> => {
    const params = new URLSearchParams();
    if (parentCommentId) {
      params.append("parentCommentId", parentCommentId);
    }

    const query = params.toString();
    const endpoint = query
      ? `/posts/${postId}/comment-count?${query}`
      : `/posts/${postId}/comment-count`;

    return await axiosClient.get(endpoint);
  },

  createComment: async (
    payload: CreateCommentPayload,
  ): Promise<ApiResponse<Comment>> => {
    return await axiosClient.post("/comments", payload);
  },

  getCommentById: async (commentId: string): Promise<ApiResponse<Comment>> => {
    return await axiosClient.get(`/comments/${commentId}`);
  },

  updateComment: async (
    payload: UpdateCommentPayload,
  ): Promise<ApiResponse<Comment>> => {
    return await axiosClient.put("/comments", payload);
  },

  deleteComment: async (
    payload: DeleteCommentPayload,
  ): Promise<ApiResponse<boolean>> => {
    return await axiosClient.delete("/comments", { data: payload });
  },

  toggleLikeComment: async (
    commentId: string,
  ): Promise<ApiResponse<ToggleLikeCommentResponse>> => {
    return await axiosClient.post(`/comments/${commentId}/like`);
  },

  reportComment: async (
    commentId: string,
    reason: "spam" | "harassment" | "misinformation" | "offensive" | "other",
  ): Promise<ApiResponse<ReportCommentResponse>> => {
    return await axiosClient.post(`/comments/${commentId}/report`, { reason });
  },
};
