import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretDown, Eye, PencilSimple } from "@phosphor-icons/react";
import { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
  isAuthorOrAdmin: boolean;
  onEdit: (post: Post) => void;
  onStatusChange: (postId: string, status: Post["status"]) => void;
}

const statusClass: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-slate-100 text-slate-700",
};

const statusTextClass: Record<string, string> = {
  published: "text-green-800",
  draft: "text-amber-800",
  archived: "text-slate-700",
};

const statusOptions: Post["status"][] = ["draft", "published", "archived"];

export default function PostCard({
  post,
  isAuthorOrAdmin,
  onEdit,
  onStatusChange,
}: PostCardProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative rounded-2xl border-[0.5px] border-slate-300 bg-white transition-colors hover:bg-slate-50">
      <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-0" />

      <div className="relative z-10 pointer-events-none p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 inline-block text-xl font-medium text-slate-900 transition-colors hover:text-slate-700 pointer-events-auto">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="line-clamp-2 text-slate-600">{post.excerpt}</p>
          </div>

          {isAuthorOrAdmin ? (
            <div ref={statusMenuRef} className="pointer-events-auto relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isStatusOpen}
                className={`inline-flex items-center gap-1 rounded-full border-[0.5px] border-slate-300 bg-white px-3 py-1 text-xs font-medium outline-none transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 ${statusTextClass[post.status] ?? statusTextClass.archived}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsStatusOpen((prev) => !prev);
                }}
              >
                <span>{post.status}</span>
                <CaretDown size={12} className="text-slate-500" />
              </button>

              {isStatusOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-2 w-36 rounded-xl border-[0.5px] border-slate-300 bg-white p-1"
                >
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      role="menuitem"
                      className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                        status === post.status
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onStatusChange(post._id, status);
                        setIsStatusOpen(false);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                onEdit(post);
              }}
              className="rounded-md border-[0.5px] border-slate-300 bg-white p-1.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title="Edit"
            >
              <PencilSimple size={20} weight="duotone" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
