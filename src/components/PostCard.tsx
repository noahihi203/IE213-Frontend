import Link from "next/link";
import { Eye, MessageCircle, Pencil } from "lucide-react";
import { Post, User } from "@/lib/types";

interface PostCardProps {
  post: Post;
  isAuthorOrAdmin: boolean;
  onEdit: (post: Post) => void;
  onOpenComments: (post: Post) => void;
  onStatusChange: (postId: string, status: Post["status"]) => void;
}

const statusClass: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-700",
};

export default function PostCard({
  post,
  isAuthorOrAdmin,
  onEdit,
  onOpenComments,
  onStatusChange,
}: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
      <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-0" />

      <div className="p-6 relative z-10 pointer-events-none">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold hover:text-primary-600 mb-2 pointer-events-auto inline-block">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
          </div>

          {isAuthorOrAdmin ? (
            <select
              className={`pointer-events-auto cursor-pointer outline-none border border-gray-200 px-3 py-1 rounded-full text-xs font-medium focus:ring-2 focus:ring-primary-500 ${statusClass[post.status] ?? statusClass.archived}`}
              value={post.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                onStatusChange(post._id, e.target.value as Post["status"])
              }
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass[post.status] ?? statusClass.archived}`}
            >
              {post.status}
            </span>
          )}
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

          <div className="flex items-center space-x-3 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void onOpenComments(post);
              }}
              className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 p-1.5 rounded-md hover:bg-emerald-100 transition-colors"
              title="Comments"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(post);
              }}
              className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
              title="Edit"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <Link
              href={`/posts/${post.slug}`}
              className="text-gray-600 hover:text-gray-700 bg-gray-50 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              title="View"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
