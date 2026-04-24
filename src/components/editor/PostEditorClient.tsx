"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  useRef,
  useCallback,
} from "react";
import { notFound, useRouter } from "next/navigation";
import {
  UploadSimple,
  CircleNotch,
  Trash,
  CheckCircle,
  Warning,
  XCircle,
  ChartLineUp,
  Image as ImageIcon,
  Tag as TagIcon,
  Article,
  MagnifyingGlass,
  Lightbulb,
  TextT,
  Link as LinkIcon,
  FloppyDisk,
  CaretLeft,
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  Highlighter,
  Code,
  Palette,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  ListBullets,
  ListNumbers,
  CheckSquare,
  Table,
  Quotes,
  Minus,
} from "@phosphor-icons/react";
import { Category, Tag } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { postService } from "@/lib/api/post.service";
import { categoryService } from "@/lib/api/category.service";
import { tagService } from "@/lib/api/tag.services";
import { uploadService } from "@/lib/api/upload.service";
import { AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

interface PostEditorClientProps {
  postId?: string; // Undefined = Create Mode, String = Edit Mode
}

export default function PostEditorClient({ postId }: PostEditorClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized } = useAuthStore();
  const isEditMode = !!postId;

  // --- STATE ---
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    keyword: "",
    category: "",
    coverImage: "",
    tags: [] as string[],
    status: "draft" as "draft" | "published" | "archived",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [textColor, setTextColor] = useState("#10b981");
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- INIT & RBAC ---
  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated || !user) return router.push("/login");

    const init = async () => {
      setIsLoading(true);
      try {
        const [catRes, tagRes] = await Promise.all([
          categoryService.getAllCategories(),
          tagService.getAllTag(),
        ]);
        setCategories(Array.isArray(catRes.metadata) ? catRes.metadata : []);
        setAvailableTags(Array.isArray(tagRes.metadata) ? tagRes.metadata : []);

        if (isEditMode) {
          const postRes = await postService.getPostById(postId);
          const post = postRes.metadata;
          const postAuthorId =
            typeof post.authorId === "object" && post.authorId !== null
              ? (post.authorId as any)._id
              : post.authorId;

          // SECURE RBAC CHECK
          if (user.role !== "admin" && postAuthorId !== user._id) {
            if (user.role === "user") {
              notFound();
            }
            alert("Bạn không có quyền chỉnh sửa bài viết này.");
            return router.push("/dashboard/posts");
          }

          setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            keyword: post.keyword || "",
            category:
              typeof post.category === "object" && post.category !== null
                ? (post.category as any)._id
                : post.category,
            coverImage: post.coverImage || "",
            tags: post.tags.map((t: any) => t._id || t),
            status: post.status,
          });
        }
      } catch (err: any) {
        setError(err.message || "Lỗi tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [authInitialized, isAuthenticated, user, router, postId, isEditMode]);

  // Auto-generate Slug
  useEffect(() => {
    if (!isEditMode && formData.title && !formData.slug) {
      const genSlug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormData((p) => ({ ...p, slug: genSlug }));
    }
  }, [formData.title, isEditMode]);

  // --- EDITOR FORMATTING ENGINE ---
  const applyFormat = useCallback(
    (prefix: string, suffix: string = "", defaultText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = textarea.value.substring(start, end);
      const textToInsert = selection || defaultText;
      const newText = `${prefix}${textToInsert}${suffix}`;

      let success = false;
      try {
        success = document.execCommand("insertText", false, newText);
      } catch (e) {}
      if (!success) {
        setFormData((p) => ({
          ...p,
          content:
            p.content.substring(0, start) + newText + p.content.substring(end),
        }));
      }

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          selection ? start : start + prefix.length,
          selection
            ? start + newText.length
            : start + prefix.length + textToInsert.length,
        );
      }, 0);
    },
    [],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      applyFormat("  ", "");
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          applyFormat("**", "**", "in đậm");
          break;
        case "i":
          e.preventDefault();
          applyFormat("_", "_", "in nghiêng");
          break;
        case "u":
          e.preventDefault();
          applyFormat("<u>", "</u>", "gạch chân");
          break;
      }
    }
  };

  // --- UPLOAD HANDLERS ---
  const processImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/"))
      return setError("Chỉ hỗ trợ file ảnh.");
    if (file.size > MAX_FILE_SIZE) return setError("Ảnh quá lớn (Max: 5MB).");

    setIsUploading(true);
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const placeholder = `\n![Đang tải ${file.name}...]()\n`;
    applyFormat(placeholder);

    try {
      const res = await uploadService.uploadImage(file);
      const finalImg = `\n![${fileNameWithoutExt}](${res.metadata.imageUrl})\n`;
      setFormData((p) => ({
        ...p,
        content: textareaRef.current!.value.replace(placeholder, finalImg),
      }));
    } catch (err: any) {
      setFormData((p) => ({
        ...p,
        content: textareaRef.current!.value.replace(placeholder, ""),
      }));
      setError(err.message || "Tải ảnh thất bại.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- RANKMATH SEO ENGINE ---
  const seoStats = useMemo(() => {
    let score = 0;
    const basic: { text: string; status: "good" | "warn" | "error" }[] = [];
    const adv: { text: string; status: "good" | "warn" | "error" }[] = [];

    const kw = (formData.keyword || "").trim().toLowerCase();
    const tLower = formData.title.toLowerCase();
    const eLower = formData.excerpt.toLowerCase();
    const cLower = formData.content.toLowerCase();
    const sLower = formData.slug.toLowerCase();

    // BASIC
    if (kw) {
      if (tLower.includes(kw)) {
        score += 10;
        basic.push({ text: "Từ khóa trong Tiêu đề", status: "good" });
      } else
        basic.push({ text: "Thiếu từ khóa trong Tiêu đề", status: "error" });

      if (eLower.includes(kw)) {
        score += 10;
        basic.push({ text: "Từ khóa trong Meta Description", status: "good" });
      } else
        basic.push({
          text: "Thiếu từ khóa trong Meta Description",
          status: "error",
        });

      if (sLower.includes(kw.replace(/\s+/g, "-"))) {
        score += 10;
        basic.push({ text: "Từ khóa trong URL Slug", status: "good" });
      } else basic.push({ text: "URL Slug chưa chứa từ khóa", status: "warn" });

      if (cLower.substring(0, 200).includes(kw)) {
        score += 5;
        basic.push({ text: "Từ khóa xuất hiện ở đầu bài", status: "good" });
      } else
        basic.push({
          text: "Nên đặt từ khóa ở 10% đầu bài viết",
          status: "warn",
        });

      const wordCount = cLower.trim().split(/\s+/).length || 1;
      const kwMatches = (cLower.match(new RegExp(kw, "g")) || []).length;
      const density = ((kwMatches * kw.split(" ").length) / wordCount) * 100;

      if (density === 0)
        basic.push({ text: "Nội dung chưa chứa từ khóa", status: "error" });
      else if (density >= 1 && density <= 2.5) {
        score += 15;
        basic.push({
          text: `Mật độ từ khóa hoàn hảo (${density.toFixed(1)}%)`,
          status: "good",
        });
      } else if (density > 2.5)
        basic.push({
          text: `Nhồi nhét từ khóa (${density.toFixed(1)}%). Nên giảm bớt!`,
          status: "error",
        });
      else {
        score += 5;
        basic.push({
          text: `Mật độ từ khóa thấp (${density.toFixed(1)}%)`,
          status: "warn",
        });
      }
    } else {
      basic.push({ text: "Chưa thiết lập Focus Keyword", status: "error" });
    }

    const tLen = formData.title.trim().length;
    if (tLen >= 40 && tLen <= 60) {
      score += 10;
      basic.push({ text: `Độ dài tiêu đề tốt (${tLen}/60)`, status: "good" });
    } else if (tLen > 0) {
      score += 5;
      basic.push({ text: "Tiêu đề quá dài hoặc ngắn", status: "warn" });
    } else basic.push({ text: "Thiếu tiêu đề", status: "error" });

    const eLen = formData.excerpt.trim().length;
    if (eLen >= 120 && eLen <= 160) {
      score += 10;
      basic.push({ text: `Mô tả Meta tốt (${eLen}/160)`, status: "good" });
    } else if (eLen > 0) {
      score += 5;
      basic.push({ text: "Mô tả Meta quá dài/ngắn", status: "warn" });
    } else basic.push({ text: "Thiếu Meta Description", status: "error" });

    // ADVANCED
    const wCount = formData.content.trim()
      ? formData.content.trim().split(/\s+/).length
      : 0;
    if (wCount >= 600) {
      score += 10;
      adv.push({ text: `Nội dung đủ dài (${wCount} từ)`, status: "good" });
    } else if (wCount >= 300) {
      score += 5;
      adv.push({ text: `Nội dung tạm ổn (${wCount} từ)`, status: "warn" });
    } else adv.push({ text: "Nội dung quá ngắn (< 300 từ)", status: "error" });

    if (/\[.+?\]\(.+?\)/.test(formData.content)) {
      score += 5;
      adv.push({ text: "Có chứa Links (Internal/External)", status: "good" });
    } else adv.push({ text: "Nên chèn thêm Links vào bài", status: "warn" });

    if (/#{2,3}\s/.test(formData.content)) {
      score += 5;
      adv.push({ text: "Sử dụng Heading (H2, H3) tốt", status: "good" });
    } else
      adv.push({ text: "Bài viết chưa có Heading (H2, H3)", status: "error" });

    if (formData.coverImage) {
      score += 5;
      adv.push({ text: "Có ảnh đại diện bài viết", status: "good" });
    } else adv.push({ text: "Thiếu ảnh đại diện", status: "error" });

    score = Math.min(100, score);
    let colorClass = "text-rose-500";
    let strokeClass = "stroke-rose-500";
    let bgClass = "bg-rose-50";
    if (score >= 80) {
      colorClass = "text-emerald-500";
      strokeClass = "stroke-emerald-500";
      bgClass = "bg-emerald-50";
    } else if (score >= 50) {
      colorClass = "text-amber-500";
      strokeClass = "stroke-amber-500";
      bgClass = "bg-amber-50";
    }

    return {
      score,
      basic,
      adv,
      tLen,
      eLen,
      wCount,
      colorClass,
      strokeClass,
      bgClass,
    };
  }, [formData]);

  // --- SUBMIT ---
  const handleSubmit = async (status: "draft" | "published") => {
    setIsSaving(true);
    setError("");
    try {
      const postData = { ...formData, status };
      if (isEditMode) {
        await postService.updatePost(postId, postData);
        alert("Cập nhật bài viết thành công!");
      } else {
        const res = await postService.createPost(postData);
        router.push(`/dashboard/posts/edit/${res.metadata._id}`);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi lưu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <CircleNotch size={50} className="animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* STICKY TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold">
                <span
                  className={`px-2 py-0.5 rounded ${formData.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {formData.status === "published" ? "Đã Xuất Bản" : "Bản Nháp"}
                </span>
                <span className="text-slate-500">
                  {seoStats.score >= 80
                    ? "SEO: Xuất Sắc"
                    : seoStats.score >= 50
                      ? "SEO: Ổn"
                      : "SEO: Cần Cải Thiện"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={isSaving || isUploading}
              className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-2 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              <FloppyDisk size={18} weight="bold" />{" "}
              {isSaving ? "Đang lưu..." : "Lưu Nháp"}
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={isSaving || isUploading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Article size={18} weight="bold" />{" "}
              {isEditMode ? "Cập Nhật Bài Viết" : "Xuất Bản Ngay"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[1600px] px-6">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700">
            <AlertCircle size={24} />
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          {/* LEFT: MAIN EDITOR (FULL-PAGE STYLE) */}
          <div className="flex-1 w-full space-y-6 min-w-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 lg:p-12 relative overflow-hidden">
            {/* Title & Slug */}
            <div className="space-y-4 relative z-10">
              <input
                type="text"
                placeholder="Nhập tiêu đề bài viết..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full text-5xl font-black text-slate-900 border-none bg-transparent p-0 outline-none focus:ring-0 placeholder:text-slate-300 transition-all"
              />
              <div className="flex items-center group">
                <span className="text-slate-400 font-mono text-sm py-2">
                  yourdomain.com/
                </span>
                <input
                  type="text"
                  placeholder="url-bai-viet"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, slug: e.target.value }))
                  }
                  className="flex-1 text-slate-600 font-mono text-sm border-none bg-transparent p-0 py-2 outline-none focus:ring-0 group-hover:bg-slate-50 transition-colors"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="relative z-10 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Mô tả Meta (SEO Excerpt)
              </label>
              <textarea
                rows={2}
                placeholder="Viết mô tả tóm tắt để hiển thị trên Google..."
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, excerpt: e.target.value }))
                }
                className="w-full text-lg font-medium text-slate-700 border-none bg-transparent p-0 outline-none focus:ring-0 placeholder:text-slate-300 resize-none leading-relaxed"
              />
            </div>

            {/* SEAMLESS TOOLBAR */}
            <div className="sticky top-[73px] z-30 -mx-12 px-12 py-3 bg-white/95 backdrop-blur-md border-y border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                <ToolGroup>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        applyFormat(`\n${e.target.value} `, "\n");
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="h-8 bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Định dạng
                    </option>
                    <option value="##">H2 - Đề mục</option>
                    <option value="###">H3 - Mục con</option>
                    <option value="####">H4 - Ý chính</option>
                  </select>
                </ToolGroup>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <ToolGroup>
                  <ToolBtn
                    icon={<TextB />}
                    onClick={() => applyFormat("**", "**")}
                    title="In đậm"
                  />
                  <ToolBtn
                    icon={<TextItalic />}
                    onClick={() => applyFormat("_", "_")}
                    title="In nghiêng"
                  />
                  <ToolBtn
                    icon={<TextUnderline />}
                    onClick={() => applyFormat("<u>", "</u>")}
                    title="Gạch chân"
                  />
                  <ToolBtn
                    icon={<Highlighter />}
                    onClick={() => applyFormat("<mark>", "</mark>")}
                    title="Dạ quang"
                  />
                  <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-slate-600 hover:bg-slate-100">
                    <Palette size={18} />
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        applyFormat(
                          `<span style="color: ${e.target.value}">`,
                          `</span>`,
                        );
                      }}
                      className="absolute opacity-0 w-0 h-0"
                    />
                  </label>
                </ToolGroup>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <ToolGroup>
                  <ToolBtn
                    icon={<TextAlignLeft />}
                    onClick={() =>
                      applyFormat('<div align="left">\n\n', "\n\n</div>")
                    }
                    title="Căn trái"
                  />
                  <ToolBtn
                    icon={<TextAlignCenter />}
                    onClick={() =>
                      applyFormat('<div align="center">\n\n', "\n\n</div>")
                    }
                    title="Căn giữa"
                  />
                  <ToolBtn
                    icon={<TextAlignRight />}
                    onClick={() =>
                      applyFormat('<div align="right">\n\n', "\n\n</div>")
                    }
                    title="Căn phải"
                  />
                </ToolGroup>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <ToolGroup>
                  <ToolBtn
                    icon={<ListBullets />}
                    onClick={() => applyFormat("\n- ", "")}
                    title="Bullet List"
                  />
                  <ToolBtn
                    icon={<ListNumbers />}
                    onClick={() => applyFormat("\n1. ", "")}
                    title="Numbered List"
                  />
                  <ToolBtn
                    icon={<Quotes />}
                    onClick={() => applyFormat("\n> ", "")}
                    title="Blockquote"
                  />
                  <ToolBtn
                    icon={<Code />}
                    onClick={() => applyFormat("```\n", "\n```")}
                    title="Code Block"
                  />
                  <ToolBtn
                    icon={<LinkIcon />}
                    onClick={() => applyFormat("[", "](https://)")}
                    title="Link"
                  />
                  <label
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                    title="Tải ảnh"
                  >
                    {isUploading ? (
                      <CircleNotch
                        size={18}
                        className="animate-spin text-indigo-500"
                      />
                    ) : (
                      <ImageIcon size={18} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        processImageUpload(e.target.files[0])
                      }
                    />
                  </label>
                </ToolGroup>
              </div>

              {/* View Toggle */}
              <div className="flex items-center rounded-lg bg-slate-100 p-1 shrink-0">
                <button
                  onClick={() => setViewMode("write")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "write" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
                >
                  Viết
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "preview" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
                >
                  Xem trước
                </button>
              </div>
            </div>

            {/* SEAMLESS TEXTAREA */}
            <div className="relative min-h-[600px] w-full mt-4">
              {viewMode === "write" ? (
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, content: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                  onPaste={(e) => {
                    const f = e.clipboardData?.items[0]?.getAsFile();
                    if (f && f.type.startsWith("image/")) {
                      e.preventDefault();
                      processImageUpload(f);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer?.files[0];
                    if (f && f.type.startsWith("image/")) processImageUpload(f);
                  }}
                  placeholder="Bắt đầu viết nội dung tuyệt vời của bạn tại đây..."
                  className="absolute inset-0 w-full h-full resize-none bg-transparent border-none text-lg font-mono leading-[1.8] text-slate-800 focus:ring-0 outline-none placeholder:text-slate-300"
                />
              ) : (
                <div className="prose prose-lg prose-slate prose-indigo max-w-none prose-img:rounded-2xl">
                  {formData.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="italic text-slate-400">Chưa có nội dung...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RANKMATH SEO & METADATA SIDEBAR */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-6 sticky top-[100px]">
            {/* SEO SCORE CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 w-full h-2 ${seoStats.bgClass.replace("50", "500")}`}
              ></div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <ChartLineUp size={24} className="text-indigo-600" /> RankMath
                SEO
              </h3>

              <div className="flex justify-center mb-8">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-slate-50 shadow-inner">
                  <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="376.99"
                      strokeDashoffset={
                        376.99 - (376.99 * seoStats.score) / 100
                      }
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${seoStats.strokeClass}`}
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-5xl font-black ${seoStats.colorClass}`}
                    >
                      {seoStats.score}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      / 100
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 border-b border-slate-100 pb-6">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Từ khóa chính (Focus Keyword)
                </label>
                <div className="relative">
                  <MagnifyingGlass
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="text"
                    value={formData.keyword}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, keyword: e.target.value }))
                    }
                    placeholder="Nhập từ khóa..."
                    className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                    <Lightbulb size={16} /> Cơ Bản
                  </h4>
                  <ul className="space-y-3">
                    {seoStats.basic.map((c, i) => (
                      <ChecklistItem key={i} check={c} />
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                    <TextT size={16} /> Nâng Cao
                  </h4>
                  <ul className="space-y-3">
                    {seoStats.adv.map((c, i) => (
                      <ChecklistItem key={i} check={c} />
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* TAXONOMY & MEDIA */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                <TagIcon size={20} className="text-indigo-600" /> Siêu dữ liệu
              </h3>

              <div className="space-y-5">
                {/* Image */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Ảnh bìa (Cover)
                  </label>
                  {formData.coverImage ? (
                    <div className="relative h-40 w-full rounded-xl overflow-hidden group">
                      <img
                        src={formData.coverImage}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        alt="cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          onClick={() =>
                            setFormData((p) => ({ ...p, coverImage: "" }))
                          }
                          className="bg-rose-500 text-white p-2 rounded-full"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50">
                      {isUploading ? (
                        <CircleNotch
                          size={28}
                          className="animate-spin text-indigo-500"
                        />
                      ) : (
                        <UploadSimple
                          size={28}
                          className="text-slate-400 mb-1"
                        />
                      )}
                      <span className="text-sm font-bold text-slate-600">
                        Tải ảnh lên
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          processImageUpload(e.target.files[0])
                        }
                      />
                    </label>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Danh mục <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      -- Chọn --
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Thẻ (Tags)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            tags: p.tags.includes(tag._id)
                              ? p.tags.filter((id) => id !== tag._id)
                              : [...p.tags, tag._id],
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${formData.tags.includes(tag._id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function ToolGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-white p-1">
      {children}
    </div>
  );
}

function ToolBtn({
  icon,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement, { size: 18 })
        : icon}
    </button>
  );
}

function ChecklistItem({
  check,
}: {
  check: { status: "good" | "warn" | "error"; text: string };
}) {
  return (
    <li className="flex items-start gap-3 text-sm leading-snug">
      {check.status === "good" && (
        <CheckCircle
          size={20}
          weight="fill"
          className="text-emerald-500 shrink-0"
        />
      )}
      {check.status === "warn" && (
        <Warning size={20} weight="fill" className="text-amber-500 shrink-0" />
      )}
      {check.status === "error" && (
        <XCircle size={20} weight="fill" className="text-rose-500 shrink-0" />
      )}
      <span
        className={
          check.status === "error"
            ? "text-slate-900 font-bold"
            : "text-slate-600 font-medium"
        }
      >
        {check.text}
      </span>
    </li>
  );
}
