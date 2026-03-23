// src/components/notifications/NotificationItem.tsx
import { useRouter } from "next/navigation";
import {
  NotificationItem as NotiItemType,
  NotificationActor,
} from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash } from "lucide-react";

interface Props {
  item: NotiItemType;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeIcon: Record<string, string> = {
  like: "❤️",
  comment: "💬",
  share: "🔗",
  follow: "👤",
  mention: "📢",
  newPost: "📝",
};

const resolveActor = (
  actorId: NotiItemType["actorId"],
): NotificationActor | null => {
  if (typeof actorId === "object" && actorId !== null)
    return actorId as NotificationActor;
  return null;
};

export default function NotificationItem({
  item,
  onMarkRead,
  onDelete,
}: Props) {
  const router = useRouter();
  const actor = resolveActor(item.actorId);

  const handleClick = () => {
    if (!item.isRead) onMarkRead(item._id);

    switch (item.targetType) {
      case "post":
        router.push(`/posts/${item.targetId}`);
        break;
      case "comment":
        router.push(`/posts/${item.targetId}#comment-${item._id}`);
        break;
      case "user":
        router.push(`/profile/${item.targetId}`);
        break;
    }
  };

  const timeAgo = item.createdOn
    ? formatDistanceToNow(new Date(item.createdOn), {
        addSuffix: true,
        locale: vi,
      })
    : "";

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group ${
        !item.isRead ? "bg-emerald-50" : ""
      }`}
      onClick={handleClick}
    >
      {/* Avatar / Icon */}
      <div className="shrink-0 mt-0.5">
        {actor ? (
          <div className="w-9 h-9 overflow-hidden rounded-full bg-emerald-600">
            {actor.avatar ? (
              <img
                src={actor.avatar}
                alt={actor.fullName || actor.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white text-sm font-bold">
                {actor.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-lg">
            {typeIcon[item.type] ?? "🔔"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${!item.isRead ? "font-medium text-slate-900" : "text-slate-700"}`}
        >
          {actor && (
            <span className="font-semibold">
              {actor.fullName || actor.username}{" "}
            </span>
          )}
          {item.message}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{timeAgo}</p>
      </div>

      {/* Unread dot + delete */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        {!item.isRead && (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item._id);
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
          title="Xóa"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
