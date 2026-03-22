import { Heart, PaperPlaneTilt, Trash, X } from "@phosphor-icons/react";
import { Post, User } from "@/lib/types";
import {
  CommentRenderItem,
  PostCommentItem,
  formatCommentDate,
  resolveCommentUserId,
} from "../hooks/useComments";

interface CommentsModalProps {
  isOpen: boolean;
  targetPost: Post | null;
  currentUser: User;
  commentsWithDepth: CommentRenderItem[];
  isLoadingComments: boolean;
  commentsError: string;
  newCommentContent: string;
  isSubmittingComment: boolean;
  activeReplyCommentId: string | null;
  replyDrafts: Record<string, string>;
  replySubmittingFor: string | null;
  editingCommentId: string | null;
  editCommentContent: string;
  isUpdatingComment: boolean;
  deletingCommentId: string | null;
  likingCommentId: string | null;
  onClose: () => void;
  onNewCommentChange: (value: string) => void;
  onCreateComment: () => void;
  onReplyComment: (parentId: string) => void;
  onSetActiveReply: (id: string | null) => void;
  onReplyDraftChange: (commentId: string, value: string) => void;
  onStartEdit: (comment: PostCommentItem) => void;
  onCancelEdit: () => void;
  onEditContentChange: (value: string) => void;
  onSaveEdit: () => void;
  onDeleteComment: (commentId: string) => void;
  onToggleLike: (commentId: string) => void;
  onReportComment: (commentId: string) => void;
}

export default function CommentsModal({
  isOpen,
  targetPost,
  currentUser,
  commentsWithDepth,
  isLoadingComments,
  commentsError,
  newCommentContent,
  isSubmittingComment,
  activeReplyCommentId,
  replyDrafts,
  replySubmittingFor,
  editingCommentId,
  editCommentContent,
  isUpdatingComment,
  deletingCommentId,
  likingCommentId,
  onClose,
  onNewCommentChange,
  onCreateComment,
  onReplyComment,
  onSetActiveReply,
  onReplyDraftChange,
  onStartEdit,
  onCancelEdit,
  onEditContentChange,
  onSaveEdit,
  onDeleteComment,
  onToggleLike,
  onReportComment,
}: CommentsModalProps) {
  if (!isOpen || !targetPost) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Bình luận bài viết
            </h2>
            <p className="line-clamp-1 text-sm text-slate-500">
              {targetPost.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 transition-colors hover:text-slate-700"
            aria-label="Close comments modal"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {commentsError && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {commentsError}
            </div>
          )}

          {/* New comment box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label
              htmlFor="new-comment"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Thêm bình luận mới
            </label>
            <textarea
              id="new-comment"
              rows={3}
              value={newCommentContent}
              onChange={(e) => onNewCommentChange(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập nội dung bình luận..."
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onCreateComment}
                disabled={isSubmittingComment}
                className="inline-flex items-center space-x-2 rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <PaperPlaneTilt size={16} weight="fill" />
                <span>{isSubmittingComment ? "Đang gửi..." : "Gửi"}</span>
              </button>
            </div>
          </div>

          {/* Comments list */}
          {isLoadingComments ? (
            <div className="py-10 text-center text-slate-500">
              Đang tải bình luận...
            </div>
          ) : commentsWithDepth.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-500">
              Chưa có bình luận nào cho bài viết này.
            </div>
          ) : (
            <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
              {commentsWithDepth.map((comment) => {
                const commentUserId = resolveCommentUserId(comment);
                const isOwnComment = commentUserId === currentUser._id;
                const canManage = isOwnComment || currentUser.role === "admin";
                const isEditing = editingCommentId === comment._id;
                const isReplying = activeReplyCommentId === comment._id;
                const replyValue = replyDrafts[comment._id] || "";
                const leftIndent = `${Math.min(comment.depth, 6) * 16}px`;

                return (
                  <div
                    key={comment._id}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                    style={{ marginLeft: leftIndent }}
                  >
                    {/* Comment header */}
                    <div className="flex items-center justify-between mb-2 gap-4">
                      <div className="text-sm text-slate-700">
                        <span className="font-medium">
                          {isOwnComment
                            ? "Bạn"
                            : `User ${commentUserId.slice(-6) || "ẩn danh"}`}
                        </span>
                        <span className="ml-2 text-slate-400">
                          {formatCommentDate(comment.createdOn)}
                        </span>
                        {comment.isEdited && (
                          <span className="ml-2 text-xs text-slate-500">
                            (đã chỉnh sửa)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => onToggleLike(comment._id)}
                          disabled={likingCommentId === comment._id}
                          className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-700 disabled:opacity-60"
                        >
                          <Heart size={15} weight="fill" />
                          <span className="text-xs">
                            {comment.likesCount || 0}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSetActiveReply(
                              activeReplyCommentId === comment._id
                                ? null
                                : comment._id,
                            );
                          }}
                          className="text-xs text-emerald-700 hover:text-emerald-800"
                        >
                          Reply
                        </button>

                        {!isOwnComment && (
                          <button
                            type="button"
                            onClick={() => onReportComment(comment._id)}
                            className="text-xs text-orange-600 hover:text-orange-700"
                          >
                            Report
                          </button>
                        )}

                        {canManage && !isEditing && (
                          <button
                            type="button"
                            onClick={() => onStartEdit(comment)}
                            className="text-xs text-sky-700 hover:text-sky-800"
                          >
                            Sửa
                          </button>
                        )}

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => onDeleteComment(comment._id)}
                            disabled={deletingCommentId === comment._id}
                            className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
                          >
                            <Trash size={14} weight="bold" />
                            <span>
                              {deletingCommentId === comment._id
                                ? "Đang xóa"
                                : "Xóa"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Edit mode */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={editCommentContent}
                          onChange={(e) => onEditContentChange(e.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={onCancelEdit}
                            disabled={isUpdatingComment}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={onSaveEdit}
                            disabled={isUpdatingComment}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {isUpdatingComment ? "Đang lưu..." : "Lưu"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {comment.content}
                      </p>
                    )}

                    {/* Reply box */}
                    {isReplying && !isEditing && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                        <textarea
                          rows={2}
                          value={replyValue}
                          onChange={(e) =>
                            onReplyDraftChange(comment._id, e.target.value)
                          }
                          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Viết phản hồi..."
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onSetActiveReply(null)}
                            disabled={replySubmittingFor === comment._id}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => onReplyComment(comment._id)}
                            disabled={replySubmittingFor === comment._id}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {replySubmittingFor === comment._id
                              ? "Đang gửi..."
                              : "Gửi phản hồi"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
