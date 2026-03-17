"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { postService } from "@/lib/api/post.service";
import { Post } from "@/lib/types";
import { PenTool, FileText, Eye, Settings, LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized, logout } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (!isAuthenticated) {
      setIsLoading(false);
      router.push("/login");
      return;
    }

    loadMyPosts();
  }, [authInitialized, isAuthenticated, router]);

  const loadMyPosts = async () => {
    try {
      const response = await postService.getMyPosts({ page: 1, limit: 10 });

      // Backend có thể trả về array trực tiếp hoặc nested trong data
      if (Array.isArray(response.metadata)) {
        setPosts(response.metadata);
      } else if (Array.isArray(response.metadata?.data)) {
        setPosts(response.metadata.data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!authInitialized || !user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{user.fullName}</h2>
                <p className="text-gray-600 text-sm">@{user.username}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  {user.role}
                </span>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                >
                  <FileText className="w-5 h-5" />
                  <span>My Posts</span>
                </Link>

                {(user.role === "author" || user.role === "admin") && (
                  <Link
                    href="/posts/create"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <PenTool className="w-5 h-5" />
                    <span>Create Post</span>
                  </Link>
                )}

                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">My Posts</h1>
              <p className="text-gray-600">
                Manage your published and draft posts
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">
                  Start writing your first blog post
                </p>
                {(user.role === "author" || user.role === "admin") && (
                  <Link
                    href="/posts/create"
                    className="btn-primary inline-block"
                  >
                    Create Your First Post
                  </Link>
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
                        <p className="text-gray-600 line-clamp-2">
                          {post.excerpt}
                        </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
