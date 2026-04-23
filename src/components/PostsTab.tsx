"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { Post, User } from "@/lib/types";

import { usePostForm } from "../hooks/usePostForm";
import { useComments } from "../hooks/useComments";

import PostCard from "../components/PostCard";
import PostFormModal from "../components/PostFormModal";
import CommentsModal from "../components/CommentsModal";

interface PostsTabProps {
  user: User;
  myPosts: Post[];
  likedPosts: Post[];
  isLoading: boolean;
  onPostsRefresh?: () => Promise<void> | void;
}

export default function PostsTab({
  user,
  myPosts,
  likedPosts,
  isLoading,
  onPostsRefresh,
}: PostsTabProps) {
  const isAuthorOrAdmin = user.role === "author" || user.role === "admin";
  const [listMode, setListMode] = useState<"written" | "liked">(
    isAuthorOrAdmin ? "written" : "liked",
  );
  const [search, setSearch] = useState("");

  const postForm = usePostForm(onPostsRefresh);
  const comments = useComments(user, onPostsRefresh);

  const posts = listMode === "written" ? myPosts : likedPosts;
  const canManagePosts = isAuthorOrAdmin && listMode === "written";

  const filteredPosts = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return posts;
    return posts.filter((p) =>
      [p.title, p.excerpt, p.content].some((s) =>
        s?.toLowerCase().includes(kw),
      ),
    );
  }, [posts, search]);

  const totalPosts = posts.length;
  const visiblePosts = filteredPosts.length;

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-2xl font-medium text-slate-900 md:text-[28px]">
              {listMode === "written"
                ? "Bài viết của tôi"
                : "Bài viết đã thích"}
            </h1>
            <p className="text-sm text-slate-600 md:text-base">
              {listMode === "written"
                ? "Quản lý bài viết đã đăng và bản nháp"
                : "Danh sách các bài viết bạn đã thích"}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            {isAuthorOrAdmin && (
              <div className="inline-flex rounded-lg border-[0.5px] border-slate-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setListMode("written")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    listMode === "written"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  Đã viết
                </button>
                <button
                  type="button"
                  onClick={() => setListMode("liked")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    listMode === "liked"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  Đã thích
                </button>
              </div>
            )}

            <div className="relative flex-1 md:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlass size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-lg border-[0.5px] border-slate-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:text-sm"
              />
            </div>

            {canManagePosts && (
              <button
                type="button"
                onClick={postForm.openCreateModal}
                className="flex flex-shrink-0 items-center justify-center space-x-2 rounded-lg border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                <Plus size={18} weight="bold" />
                <span>Viết bài</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-md">
          <div className="rounded-lg bg-slate-100 px-4 py-3">
            <p className="text-xs text-slate-600">Tổng bài viết</p>
            <p className="mt-1 text-2xl font-medium text-slate-900">
              {totalPosts}
            </p>
          </div>
          <div className="rounded-lg bg-slate-100 px-4 py-3">
            <p className="text-xs text-slate-600">Hiển thị sau lọc</p>
            <p className="mt-1 text-2xl font-medium text-slate-900">
              {visiblePosts}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-slate-700" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          isAuthorOrAdmin={isAuthorOrAdmin}
          onOpenCreate={postForm.openCreateModal}
        />
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border-[0.5px] border-slate-300 bg-white p-12 text-center">
          <FileText size={56} className="mx-auto mb-4 text-slate-300" />
          <h3 className="mb-2 text-xl font-medium text-slate-900">
            Không tìm thấy bài viết
          </h3>
          <p className="text-slate-600">
            Không có bài viết nào khớp với từ khóa bạn vừa tìm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isAuthorOrAdmin={canManagePosts}
              onEdit={postForm.openEditModal}
              onStatusChange={postForm.handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <PostFormModal
        mode="create"
        isOpen={postForm.isCreateModalOpen}
        formData={postForm.createFormData}
        categories={postForm.categories}
        availableTags={postForm.availableTags}
        isLoadingFormOptions={postForm.isLoadingFormOptions}
        formOptionsError={postForm.formOptionsError}
        error={postForm.createError}
        isSubmitting={postForm.isCreatingPost}
        postId={postForm.editingPostId ?? undefined}
        onClose={() => postForm.closeCreateModal()}
        onInputChange={postForm.handleCreateInputChange}
        onTagToggle={postForm.handleCreateTagToggle}
        onSaveDraft={() => void postForm.handleCreatePost("draft")}
        onPublish={() => void postForm.handleCreatePost("published")}
        onContentChange={(html) =>
          postForm.setCreateFormData((prev) => ({ ...prev, content: html }))
        }
      />

      <PostFormModal
        mode="edit"
        isOpen={postForm.isEditModalOpen}
        formData={postForm.editFormData}
        categories={postForm.categories}
        availableTags={postForm.availableTags}
        isLoadingFormOptions={postForm.isLoadingFormOptions}
        formOptionsError={postForm.formOptionsError}
        error={postForm.editError}
        isSubmitting={postForm.isUpdatingPost}
        postId={postForm.editingPostId ?? undefined}
        onClose={() => postForm.closeEditModal()}
        onInputChange={postForm.handleEditInputChange}
        onTagToggle={postForm.handleEditTagToggle}
        onSave={() => void postForm.handleUpdatePost()}
        onContentChange={(html) =>
          postForm.setEditFormData((prev) => ({ ...prev, content: html }))
        }
      />

      <CommentsModal
        isOpen={comments.isCommentsModalOpen}
        targetPost={comments.commentTargetPost}
        currentUser={user}
        commentsWithDepth={comments.commentsWithDepth}
        isLoadingComments={comments.isLoadingComments}
        commentsError={comments.commentsError}
        newCommentContent={comments.newCommentContent}
        isSubmittingComment={comments.isSubmittingComment}
        activeReplyCommentId={comments.activeReplyCommentId}
        replyDrafts={comments.replyDrafts}
        replySubmittingFor={comments.replySubmittingFor}
        editingCommentId={comments.editingCommentId}
        editCommentContent={comments.editCommentContent}
        isUpdatingComment={comments.isUpdatingComment}
        deletingCommentId={comments.deletingCommentId}
        likingCommentId={comments.likingCommentId}
        expandedReplyParentIds={comments.expandedReplyParentIds}
        loadingRepliesFor={comments.loadingRepliesFor}
        onClose={() => comments.closeCommentsModal()}
        onNewCommentChange={comments.setNewCommentContent}
        onCreateComment={() => void comments.handleCreateComment()}
        onReplyComment={(id) => void comments.handleReplyComment(id)}
        onSetActiveReply={comments.setActiveReplyCommentId}
        onToggleReplyComposer={comments.toggleReplyComposerForComment}
        onReplyDraftChange={(id, val) =>
          comments.setReplyDrafts((prev) => ({ ...prev, [id]: val }))
        }
        onStartEdit={comments.startEditComment}
        onCancelEdit={comments.cancelEditComment}
        onEditContentChange={comments.setEditCommentContent}
        onSaveEdit={() => void comments.handleSaveCommentEdit()}
        onDeleteComment={(id) => void comments.handleDeleteComment(id)}
        onToggleLike={(id) => void comments.handleToggleLikeComment(id)}
        onReportComment={(id) => void comments.handleReportComment(id)}
        onToggleReplies={(id) => void comments.toggleRepliesForComment(id)}
      />
    </>
  );
}

function EmptyState({
  isAuthorOrAdmin,
  onOpenCreate,
}: {
  isAuthorOrAdmin: boolean;
  onOpenCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border-[0.5px] border-slate-300 bg-white p-12 text-center">
      <FileText size={64} className="mx-auto mb-4 text-slate-300" />
      {isAuthorOrAdmin ? (
        <>
          <h3 className="mb-2 text-xl font-medium text-slate-900">
            Bạn chưa có bài viết nào
          </h3>
          <p className="mb-6 text-slate-600">
            Hãy bắt đầu viết bài đăng blog đầu tiên của bạn.
          </p>
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center space-x-2 rounded-lg border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            <Plus size={18} weight="bold" />
            <span>Viết bài đầu tiên</span>
          </button>
        </>
      ) : (
        <>
          <h3 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
            Bạn chưa thích bài viết nào
          </h3>
          <p className="mb-6 text-slate-600">
            Hãy đọc và like một số bài viết.
          </p>
          <Link
            href="/posts"
            className="inline-block rounded-md border-[0.5px] border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
          >
            Bài viết
          </Link>
        </>
      )}
    </div>
  );
}
