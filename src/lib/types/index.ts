// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  status: number;
  metadata: T;
}

// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string | null;
  bio?: string | null;
  role: "user" | "author" | "admin";
  isActive: boolean;
  tokenVersion?: number;
  createdOn: Date;
  modifiedOn: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Post Types
export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string | null;
  authorId: string | User;
  category: string | Category;
  status: "draft" | "published" | "archived";
  tags: Tag[];
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  publishedAt?: Date | null;
  createdOn: Date;
  modifiedOn: Date;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  status?: "draft" | "published";
}

export interface UpdatePostData extends Partial<CreatePostData> {}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string | null;
  createdOn: Date;
  modifiedOn: Date;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
}

// Tag Types
export interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  status: "active" | "inactive";
  createdOn: Date;
  modifiedOn: Date;
}

export interface CreateTagData {
  name: string;
  description?: string;
}

export interface UpdateTagData {
  tagId: string;
  name: string;
  description?: string;
}

export interface UpdateTagCountData {
  tagIds: string[];
  inc: number;
}

// Comment Types
export interface Comment {
  _id: string;
  postId: string;
  userId?: string | User;
  authorId?: string | User;
  content: string;
  parentId?: string | null;
  commentLeft?: number;
  commentRight?: number;
  likesCount?: number;
  isEdited: boolean;
  createdOn: Date | string;
  modifiedOn: Date | string;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentCommentId?: string;
  parentId?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface PostFilters extends PaginationParams {
  status?: "draft" | "published" | "archived";
  category?: string;
  authorId?: string;
}

export interface UserFilters extends PaginationParams {
  role?: "user" | "poster" | "admin";
  status?: "active" | "inactive";
}
