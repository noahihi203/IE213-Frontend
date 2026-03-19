"use client";

import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { Post, User } from "@/lib/types";

interface PostsTabProps {
  user: User;
  posts: Post[];
  isLoading: boolean;
}

export default function PostsTab({ user, posts, isLoading }: PostsTabProps) {
  const isAuthorOrAdmin = user.role === "author" || user.role === "admin";

  return (
    <>
      <div className="mb-6">
        {isAuthorOrAdmin ? (
          <>
            <h1 className="text-3xl font-bold mb-2">Bài viết của tôi</h1>
            <p className="text-gray-600">
              Quản lý bài viết đã đăng và bản nháp
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Bài viết đã thích</h1>
            <p className="text-gray-600">Quản lý bài viết đã thích</p>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          {isAuthorOrAdmin ? (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Bạn chưa có bài viết nào
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy bắt đầu viết bài đăng blog đầu tiên của bạn.
              </p>
              <Link href="/posts/create" className="btn-primary inline-block">
                Create Your First Post
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-2">
                Bạn chưa thích bài viết nào
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy đọc và like một số bài viết.
              </p>
              <Link href="/posts" className="btn-primary inline-block">
                Bài viết
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link href={`/posts/${post.slug}`}>
                    <h3 className="text-xl font-bold hover:text-primary-600 mb-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === "published"
                      ? "bg-green-100 text-green-700"
                      : post.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {post.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewCount} views</span>
                  </span>
                  <span>{post.likesCount} likes</span>
                  <span>{post.commentsCount} comments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/posts/${post._id}/edit`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
