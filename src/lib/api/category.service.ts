import { axiosClient } from "./client";
import { ApiResponse, Category, CreateCategoryData, Post } from "../types";

export interface CategoryPostsBySlugResponse {
  category: Category;
  posts: Post[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const categoryService = {
  // Get all categories
  getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
    return await axiosClient.get("/categories");
  },

  // Get all categories
  getFeaturedCategories: async (): Promise<ApiResponse<Category[]>> => {
    return await axiosClient.get("/categories/featured-categories");
  },

  // Get single category by ID
  getCategoryById: async (
    categoryId: string,
  ): Promise<ApiResponse<Category>> => {
    return await axiosClient.get(`/categories/${categoryId}`);
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    return await axiosClient.get(`/categories/slug/${slug}`);
  },

  // Get published posts by category slug
  getPostsByCategorySlug: async (
    catSlug: string,
  ): Promise<ApiResponse<CategoryPostsBySlugResponse>> => {
    return await axiosClient.get(`/categories/posts/${catSlug}`);
  },

  // Create category (Admin only)
  createCategory: async (
    data: CreateCategoryData,
  ): Promise<ApiResponse<Category>> => {
    return await axiosClient.post("/categories", data);
  },

  // Update category (Admin only)
  updateCategory: async (
    categoryId: string,
    data: Partial<CreateCategoryData>,
  ): Promise<ApiResponse<Category>> => {
    return await axiosClient.put(`/categories/${categoryId}`, data);
  },

  // Delete category (Admin only)
  deleteCategory: async (categoryId: string): Promise<ApiResponse> => {
    return await axiosClient.delete(`/categories/${categoryId}`);
  },
};
