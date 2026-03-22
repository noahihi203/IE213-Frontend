import Link from "next/link";
import { ChatCircleText, Eye, PencilSimple } from "@phosphor-icons/react";
import { Post } from "@/lib/types";

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
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-0" />

      <div className="relative z-10 pointer-events-none p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 inline-block text-xl font-semibold tracking-tight text-slate-900 transition-colors hover:text-emerald-700 pointer-events-auto">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="line-clamp-2 text-slate-600">{post.excerpt}</p>
          </div>

          {isAuthorOrAdmin ? (
            <select
              className={`pointer-events-auto cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 ${statusClass[post.status] ?? statusClass.archived}`}
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

        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Eye size={16} weight="duotone" />
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
              <ChatCircleText size={20} weight="duotone" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(post);
              }}
              className="rounded-md bg-sky-50 p-1.5 text-sky-700 transition-colors hover:bg-sky-100 hover:text-sky-900"
              title="Edit"
            >
              <PencilSimple size={20} weight="duotone" />
            </button>
            <Link
              href={`/posts/${post.slug}`}
              className="rounded-md bg-slate-100 p-1.5 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-700"
              title="View"
            >
              <Eye size={20} weight="duotone" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
