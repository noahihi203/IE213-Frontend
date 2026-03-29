"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { useAuthStore } from "@/store/authStore";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { tagService } from "@/lib/api/tag.services";
import { uploadService } from "@/lib/api/upload.service"; // Added upload service
import { Category, Tag } from "@/lib/types";
import {
  Eye,
  FloppyDisk,
  UploadSimple,
  CircleNotch,
} from "@phosphor-icons/react"; // Added upload icons

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false); // Added state for image upload
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    coverImage: "",
    tags: [] as string[],
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "author" && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    loadCategories();
    loadTags();
  }, [authInitialized, isAuthenticated, user, router]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (loadError) {
      console.error("Failed to load categories:", loadError);
      setCategories([]);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getAllTag();
      setAvailableTags(
        Array.isArray(response.metadata) ? response.metadata : [],
      );
    } catch (loadError) {
      console.error("Failed to load tags:", loadError);
      setAvailableTags([]);
    }
  };

  // Added handler for image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError("");
    try {
      const response = await uploadService.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        coverImage: response.metadata.imageUrl,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: "draft" | "published",
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const postData = {
        ...formData,
        status,
        tags: formData.tags,
      };

      const response = await postService.createPost(postData);
      const post = response.metadata;

      router.push(`/posts/${post.slug}`);
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const currentTags = prev.tags;
      if (currentTags.includes(tagId)) {
        return { ...prev, tags: currentTags.filter((id) => id !== tagId) };
      }
      return { ...prev, tags: [...currentTags, tagId] };
    });
  };

  if (!authInitialized || !user) {
    return null;
  }

  if (user.role !== "author" && user.role !== "admin") {
    return null;
  }

  return (
    <div className={`${montserrat.className} min-h-[100dvh] bg-slate-50 py-8`}>
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tighter text-slate-950">
            Create New Post
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Share practical knowledge with a clean draft-to-publish flow.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form className="space-y-6 rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] md:p-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid gap-2">
              <label
                htmlFor="title"
                className="text-sm font-semibold text-slate-800"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter post title"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="excerpt"
                className="text-sm font-semibold text-slate-800"
              >
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Brief description of your post"
              />
            </div>

            <div className="grid gap-2 md:max-w-sm">
              <label
                htmlFor="category"
                className="text-sm font-semibold text-slate-800"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="content"
                className="text-sm font-semibold text-slate-800"
              >
                Content * (Markdown supported)
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={15}
                value={formData.content}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-mono text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Write your post content here... You can use Markdown formatting."
              />
            </div>

            {/* Updated Cover Image section */}
            <div className="grid gap-2">
              <label
                htmlFor="coverImage"
                className="text-sm font-semibold text-slate-800"
              >
                Cover Image
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="https://example.com/image.jpg"
                />
                <span className="text-sm font-medium text-slate-500">hoặc</span>
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                  {isUploadingImage ? (
                    <CircleNotch
                      size={18}
                      className="animate-spin text-emerald-600"
                    />
                  ) : (
                    <UploadSimple
                      size={18}
                      weight="duotone"
                      className="text-emerald-600"
                    />
                  )}
                  <span>Tải ảnh lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              </div>

              {/* Optional: Show a preview if an image is selected */}
              {formData.coverImage && (
                <div className="mt-3 h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:max-w-md">
                  <img
                    src={formData.coverImage}
                    alt="Cover Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-800">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = formData.tags.includes(tag._id);
                  return (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => handleTagToggle(tag._id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {availableTags.length === 0 && (
                  <span className="text-sm text-slate-500">
                    No tags available.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isLoading || isUploadingImage}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-slate-100 disabled:opacity-50"
            >
              <FloppyDisk size={18} weight="duotone" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isLoading || isUploadingImage}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:-translate-y-[1px] disabled:opacity-50"
            >
              <Eye size={18} weight="duotone" />
              <span>Publish Now</span>
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading || isUploadingImage}
              className="ml-auto rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
