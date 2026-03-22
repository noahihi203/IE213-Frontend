"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { Post, User } from "@/lib/types";

import { usePostForm } from "../hooks/usePostForm";
import { useComments } from "../hooks/useComments";

import PostCard from "../components/PostCard";
import PostFormModal from "../components/PostFormModal";
import CommentsModal from "../components/CommentsModal";

interface PostsTabProps {
  user: User;
  posts: Post[];
  isLoading: boolean;
  onPostsRefresh?: () => Promise<void> | void;
}

export default function PostsTab({
  user,
  posts,
  isLoading,
  onPostsRefresh,
}: PostsTabProps) {
  const isAuthorOrAdmin = user.role === "author" || user.role === "admin";
  const [search, setSearch] = useState("");

  const postForm = usePostForm(onPostsRefresh);
  const comments = useComments(user, onPostsRefresh);

  const filteredPosts = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return posts;
    return posts.filter((p) =>
      [p.title, p.excerpt, p.content].some((s) =>
        s?.toLowerCase().includes(kw),
      ),
    );
  }, [posts, search]);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      {isAuthorOrAdmin ? (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bài viết của tôi</h1>
            <p className="text-gray-600">
              Quản lý bài viết đã đăng và bản nháp
            </p>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <button
              type="button"
              onClick={postForm.openCreateModal}
              className="flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Viết bài</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Bài viết đã thích</h1>
          <p className="text-gray-600">Quản lý bài viết đã thích</p>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          isAuthorOrAdmin={isAuthorOrAdmin}
          onOpenCreate={postForm.openCreateModal}
        />
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy bài viết
          </h3>
          <p className="text-gray-600">
            Không có bài viết nào khớp với từ khóa bạn vừa tìm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isAuthorOrAdmin={isAuthorOrAdmin}
              onEdit={postForm.openEditModal}
              onOpenComments={(p) => void comments.openCommentsModal(p)}
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
        onClose={() => comments.closeCommentsModal()}
        onNewCommentChange={comments.setNewCommentContent}
        onCreateComment={() => void comments.handleCreateComment()}
        onReplyComment={(id) => void comments.handleReplyComment(id)}
        onSetActiveReply={comments.setActiveReplyCommentId}
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
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Viết bài đầu tiên</span>
          </button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-2">
            Bạn chưa thích bài viết nào
          </h3>
          <p className="text-gray-600 mb-6">Hãy đọc và like một số bài viết.</p>
          <Link href="/posts" className="btn-primary inline-block">
            Bài viết
          </Link>
        </>
      )}
    </div>
  );
}
