"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { Post, Category } from "@/lib/types";
import {
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [currentPage, selectedCategory, searchTerm]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    }
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postService.getAllPosts({
        page: currentPage,
        limit: 9,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: "published",
      });

      // Backend trả về posts trực tiếp trong metadata array
      if (Array.isArray(response.metadata)) {
        setPosts(response.metadata);
        setTotalPages(1); // Backend chưa có pagination
      }
      // Hoặc có thể có format với data nested
      else if (response.metadata?.data) {
        setPosts(
          Array.isArray(response.metadata.data) ? response.metadata.data : [],
        );
        setTotalPages(response.metadata.pagination?.totalPages || 1);
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">All Posts</h1>
          <p className="text-gray-600">
            Discover amazing stories from our community
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">No posts found</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const author = typeof post.authorId === "object" ? post.authorId : null;
  const category = typeof post.category === "object" ? post.category : null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="h-48 bg-gray-200">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Category */}
        {category && (
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mb-3">
            {category.name}
          </span>
        )}

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-bold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.likesCount}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount}</span>
            </span>
          </div>

          {post.publishedAt && (
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(post.publishedAt), "MMM d")}</span>
            </span>
          )}
        </div>

        {/* Author */}
        {author && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {author.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">{author.fullName}</span>
          </div>
        )}
      </div>
    </article>
  );
}
