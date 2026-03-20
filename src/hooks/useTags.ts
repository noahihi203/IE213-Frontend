import { useState } from "react";
import { tagService } from "@/lib/api/tag.services";
import { Tag } from "@/lib/types";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [updatingTagId, setUpdatingTagId] = useState<string | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagFormData, setTagFormData] = useState({ name: "", description: "" });
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  const loadTags = async () => {
    setIsLoadingTags(true);
    try {
      const res = await tagService.getAllTag();
      setTags(Array.isArray(res.metadata) ? res.metadata : []);
    } catch (err) {
      console.error("Failed to load tags:", err);
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleToggleTagStatus = async (
    tagId: string,
    currentStatus: "active" | "inactive",
  ) => {
    if (updatingTagId === tagId) return;
    setUpdatingTagId(tagId);
    try {
      if (currentStatus === "active") {
        await tagService.updateStatusTagToInActive(tagId);
      } else {
        await tagService.updateStatusTagToActive(tagId);
      }
      setTags((prev) =>
        prev.map((t) =>
          t._id === tagId
            ? {
                ...t,
                status: currentStatus === "active" ? "inactive" : "active",
              }
            : t,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi thay đổi trạng thái tag!");
    } finally {
      setUpdatingTagId(null);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa tag này không? Hành động này không thể hoàn tác!",
      )
    )
      return;
    try {
      await tagService.deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t._id !== tagId));
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi xóa tag!");
    }
  };

  const openEditTag = (tag: Tag) => {
    setEditingTagId(tag._id);
    setTagFormData({ name: tag.name, description: tag.description || "" });
    setIsTagModalOpen(true);
  };

  const openCreateTag = () => {
    setEditingTagId(null);
    setTagFormData({ name: "", description: "" });
    setIsTagModalOpen(true);
  };

  const closeTagModal = () => {
    setIsTagModalOpen(false);
    setEditingTagId(null);
    setTagFormData({ name: "", description: "" });
  };

  const handleSubmitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagFormData.name.trim()) {
      alert("Vui lòng nhập tên tag!");
      return;
    }
    setIsSubmittingTag(true);
    try {
      if (editingTagId) {
        await tagService.updateTag({ tagId: editingTagId, ...tagFormData });
      } else {
        await tagService.createTag(tagFormData);
      }
      await loadTags();
      closeTagModal();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu tag!");
    } finally {
      setIsSubmittingTag(false);
    }
  };

  return {
    tags,
    isLoadingTags,
    updatingTagId,
    isTagModalOpen,
    editingTagId,
    tagFormData,
    setTagFormData,
    isSubmittingTag,
    loadTags,
    handleToggleTagStatus,
    handleDeleteTag,
    openEditTag,
    openCreateTag,
    closeTagModal,
    handleSubmitTag,
  };
}
