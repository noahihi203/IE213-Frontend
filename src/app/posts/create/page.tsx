"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { tagService } from "@/lib/api/tag.services";
import { Category, Tag } from "@/lib/types";
import { Save, Eye } from "lucide-react";

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getAllTag();
      setAvailableTags(
        Array.isArray(response.metadata) ? response.metadata : [],
      );
    } catch (error) {
      console.error("Failed to load tags:", error);
      setAvailableTags([]);
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
      } else {
        return { ...prev, tags: [...currentTags, tagId] };
      }
    });
  };

  if (!authInitialized || !user) {
    return null;
  }

  if (user.role !== "author" && user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-gray-600">
            Share your knowledge with the community
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="input-field"
              placeholder="Enter post title"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="input-field"
              placeholder="Brief description of your post"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="input-field font-mono text-sm"
              placeholder="Write your post content here... You can use Markdown formatting."
            />
          </div>

          {/* Cover Image */}
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cover Image URL
            </label>
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {availableTags.length === 0 && (
                <span className="text-gray-500 text-sm">
                  No tags available.
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isLoading}
              className="flex items-center space-x-2 btn-secondary disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isLoading}
              className="flex items-center space-x-2 btn-primary disabled:opacity-50"
            >
              <Eye className="w-5 h-5" />
              <span>Publish Now</span>
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="ml-auto px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
