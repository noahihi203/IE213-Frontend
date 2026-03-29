import { type ChangeEvent, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; // <-- Added for routing
import { 
  X, UploadSimple, CircleNotch, Trash, CheckCircle, Warning, 
  XCircle, ChartLineUp, Image as ImageIcon, Tag as TagIcon, Article,
  MagnifyingGlass, Lightbulb, TextT, Link as LinkIcon, ArrowSquareOut // <-- Added ArrowSquareOut
} from "@phosphor-icons/react";
import { Category, Tag } from "@/lib/types";
import { PostFormData } from "../hooks/usePostForm";
import MarkdownEditor from "./MarkdownEditor";
import { uploadService } from "@/lib/api/upload.service";
import { AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for cover image

interface PostFormModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  formData: PostFormData;
  categories: Category[];
  availableTags: Tag[];
  isLoadingFormOptions: boolean;
  formOptionsError: string;
  error: string;
  isSubmitting: boolean;
  postId?: string; // <-- Added to identify the post for the full-page edit route
  onClose: () => void;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onContentChange: (markdown: string) => void;
  onTagToggle: (tagId: string) => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onSave?: () => void;
}

const LABELS = {
  create: {
    title: "Thêm Bài Viết Mới",
    subtitle: "Trình soạn thảo chuyên nghiệp tích hợp công cụ chấm điểm SEO tự động.",
  },
  edit: {
    title: "Sửa Bài Viết",
    subtitle: "Cập nhật nội dung và tối ưu hóa thứ hạng tìm kiếm.",
  },
};

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] font-medium transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:font-normal placeholder:text-slate-400";

export default function PostFormModal({
  mode,
  isOpen,
  formData,
  categories,
  availableTags,
  isLoadingFormOptions,
  formOptionsError,
  error,
  isSubmitting,
  postId,
  onClose,
  onInputChange,
  onContentChange,
  onTagToggle,
  onSaveDraft,
  onPublish,
  onSave,
}: PostFormModalProps) {
  const router = useRouter(); // <-- Added router
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // SEO Focus Keyword State
  const [focusKeyword, setFocusKeyword] = useState("");

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting && !isUploading) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, isUploading, onClose]);

  
  const seoStats = useMemo(() => {
    let score = 0;
    const basicChecks: { text: string; status: "good" | "warn" | "error" }[] = [];
    const advancedChecks: { text: string; status: "good" | "warn" | "error" }[] = [];
    
    const kw = focusKeyword.trim().toLowerCase();
    const tLower = formData.title.toLowerCase();
    const eLower = formData.excerpt.toLowerCase();
    const cLower = formData.content.toLowerCase();
    
    // -- BASIC SEO --
    // 1. Focus Keyword Checks
    if (kw) {
      if (tLower.includes(kw)) { score += 15; basicChecks.push({ text: "Từ khóa chính xuất hiện trong Tiêu đề SEO", status: "good" }); }
      else { basicChecks.push({ text: "Thêm Từ khóa chính vào Tiêu đề SEO", status: "error" }); }

      if (eLower.includes(kw)) { score += 10; basicChecks.push({ text: "Từ khóa chính xuất hiện trong Mô tả Meta", status: "good" }); }
      else { basicChecks.push({ text: "Thêm Từ khóa chính vào Mô tả Meta", status: "error" }); }

      const first10Percent = cLower.substring(0, Math.max(100, cLower.length * 0.1));
      if (first10Percent.includes(kw)) { score += 10; basicChecks.push({ text: "Từ khóa xuất hiện ở đầu bài viết", status: "good" }); }
      else { basicChecks.push({ text: "Nên đặt Từ khóa chính ở 10% nội dung đầu tiên", status: "warn" }); }
    } else {
      basicChecks.push({ text: "Chưa đặt Từ khóa chính (Focus Keyword)", status: "error" });
    }

    // 2. Title & Excerpt Length
    const tLen = formData.title.trim().length;
    if (tLen >= 40 && tLen <= 60) { score += 10; basicChecks.push({ text: `Độ dài tiêu đề tuyệt vời (${tLen}/60 ký tự)`, status: "good" }); }
    else if (tLen > 0) { score += 5; basicChecks.push({ text: "Tiêu đề quá ngắn hoặc quá dài (Tối ưu: 40-60 ký tự)", status: "warn" }); }
    else { basicChecks.push({ text: "Thiếu tiêu đề bài viết", status: "error" }); }

    const eLen = formData.excerpt.trim().length;
    if (eLen >= 120 && eLen <= 160) { score += 10; basicChecks.push({ text: `Mô tả Meta chuẩn SEO (${eLen}/160 ký tự)`, status: "good" }); }
    else if (eLen > 0) { score += 5; basicChecks.push({ text: "Mô tả Meta chưa tối ưu (Tối ưu: 120-160 ký tự)", status: "warn" }); }
    else { basicChecks.push({ text: "Thiếu mô tả Meta (Excerpt)", status: "error" }); }

    // -- ADVANCED SEO --
    // 3. Content Length
    const wCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
    if (wCount >= 600) { score += 15; advancedChecks.push({ text: `Độ dài bài viết tuyệt vời (${wCount} từ)`, status: "good" }); }
    else if (wCount >= 300) { score += 5; advancedChecks.push({ text: `Độ dài tạm ổn (${wCount} từ). Đề xuất > 600 từ`, status: "warn" }); }
    else { advancedChecks.push({ text: "Nội dung quá ngắn (Cần > 300 từ)", status: "error" }); }

    // 4. Formatting & Readability
    const hasLinks = /\[.+?\]\(.+?\)/.test(formData.content);
    if (hasLinks) { score += 10; advancedChecks.push({ text: "Tuyệt! Bài viết có chứa các liên kết (Links)", status: "good" }); }
    else { advancedChecks.push({ text: "Nên thêm Internal/External links để tăng SEO", status: "warn" }); }

    const hasHeadings = /#{2,6}\s/.test(formData.content);
    if (hasHeadings) { score += 10; advancedChecks.push({ text: "Đã sử dụng các thẻ Heading (H2, H3...) tốt", status: "good" }); }
    else { advancedChecks.push({ text: "Bài viết chưa sử dụng thẻ Heading (H2, H3)", status: "error" }); }

    // 5. Taxonomy & Media
    if (formData.coverImage) { score += 5; advancedChecks.push({ text: "Đã thiết lập Ảnh đại diện bài viết", status: "good" }); }
    else { advancedChecks.push({ text: "Thiếu Ảnh đại diện (Gây giảm CTR mxh)", status: "error" }); }

    if (formData.tags.length > 0 && formData.category) { score += 5; advancedChecks.push({ text: "Đã thiết lập Danh mục và Thẻ Tag", status: "good" }); }
    else { advancedChecks.push({ text: "Cần chọn ít nhất 1 Danh mục và Tag", status: "warn" }); }

    // Normalizing Score to Max 100
    score = Math.min(100, score);

    // Color Logic
    let colorClass = "text-rose-500";
    let strokeClass = "stroke-rose-500";
    let bgClass = "bg-rose-50";
    if (score >= 80) { colorClass = "text-emerald-500"; strokeClass = "stroke-emerald-500"; bgClass = "bg-emerald-50"; }
    else if (score >= 50) { colorClass = "text-amber-500"; strokeClass = "stroke-amber-500"; bgClass = "bg-amber-50"; }

    return { score, basicChecks, advancedChecks, tLen, eLen, wCount, colorClass, strokeClass, bgClass };
  }, [formData, focusKeyword]);

  if (!isOpen) return null;

  const { title: modalTitle, subtitle } = LABELS[mode];
  const idPrefix = mode === "edit" ? "edit-" : "create-";
  const isFormDisabled = isSubmitting || isUploading || isLoadingFormOptions;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return setUploadError("Vui lòng chọn tệp hình ảnh hợp lệ.");
    if (file.size > MAX_FILE_SIZE) return setUploadError("Kích thước ảnh vượt quá 5MB.");

    setIsUploading(true);
    setUploadError("");
    
    try {
      const response = await uploadService.uploadImage(file);
      onInputChange({
        target: { name: "coverImage", value: response.metadata.imageUrl },
      } as React.ChangeEvent<HTMLInputElement>);
    } catch (err: any) {
      setUploadError(err.message || "Tải ảnh thất bại. Kiểm tra kết nối mạng.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // --- Redirect to Full Page Route ---
  const handleOpenFullPage = () => {
    onClose(); // Close the modal first
    if (mode === "create") {
      router.push("/dashboard/posts/create");
    } else {
      // Use explicitly passed postId, or fallback to formData slug
      const idToRoute = postId || (formData as any).slug || (formData as any)._id; 
      router.push(`/dashboard/posts/${idToRoute}/edit`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isFormDisabled) onClose();
      }}
    >
      <div
        className="flex h-[96vh] w-[98vw] max-w-[1600px] flex-col overflow-hidden rounded-[1.5rem] bg-slate-50 shadow-2xl ring-1 ring-black/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
        role="dialog"
        aria-modal="true"
      >
        {/* TOP HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Article size={28} weight="duotone" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{modalTitle}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Open Full Page Button */}
            <button
              type="button"
              onClick={handleOpenFullPage}
              className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-100 hover:text-indigo-700"
            >
              <ArrowSquareOut size={18} weight="bold" />
              <span className="hidden sm:inline">Mở giao diện toàn trang</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isFormDisabled}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:rotate-90 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT: EDITOR WORKSPACE (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-300">
            <div className="mx-auto max-w-4xl space-y-8">
              
              {formOptionsError && <ErrorBanner message={formOptionsError} />}
              {error && <ErrorBanner message={error} />}
              {uploadError && <ErrorBanner message={uploadError} />}

              {isLoadingFormOptions ? (
                <div className="flex flex-col items-center justify-center py-40 text-slate-500">
                  <CircleNotch size={48} className="animate-spin text-indigo-500 mb-4" />
                  <p className="font-semibold text-lg">Đang khởi tạo môi trường...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Title & Excerpt Group */}
                  <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label htmlFor={`${idPrefix}title`} className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Tiêu đề bài viết (H1) <span className="text-rose-500">*</span></label>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${seoStats.tLen >= 40 && seoStats.tLen <= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {seoStats.tLen} / 60
                        </span>
                      </div>
                      <input
                        id={`${idPrefix}title`}
                        name="title"
                        type="text"
                        required
                        disabled={isFormDisabled}
                        value={formData.title}
                        onChange={onInputChange}
                        className={`${inputCls} text-xl font-bold text-slate-900`}
                        placeholder="VD: Hướng dẫn Next.js toàn tập cho người mới..."
                      />
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label htmlFor={`${idPrefix}excerpt`} className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Mô tả Meta (SEO Excerpt) <span className="text-rose-500">*</span></label>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${seoStats.eLen >= 120 && seoStats.eLen <= 160 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {seoStats.eLen} / 160
                        </span>
                      </div>
                      <textarea
                        id={`${idPrefix}excerpt`}
                        name="excerpt"
                        rows={3}
                        required
                        disabled={isFormDisabled}
                        value={formData.excerpt}
                        onChange={onInputChange}
                        className={`${inputCls} resize-none leading-relaxed`}
                        placeholder="Tóm tắt nội dung hấp dẫn để hiển thị trên Google & Mạng xã hội..."
                      />
                    </div>
                  </div>

                  {/* Markdown Editor */}
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="border-b border-slate-200 bg-slate-50 px-7 py-4">
                      <label className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Trình soạn thảo nội dung <span className="text-rose-500">*</span></label>
                    </div>
                    <MarkdownEditor
                      value={formData.content}
                      onChange={onContentChange}
                      minHeight={650}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RANKMATH SEO & PUBLISH SIDEBAR (Sticky/Independent Scroll) */}
          <div className="w-[450px] shrink-0 border-l border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 space-y-6">
              
              {/* SEO SCORE CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${seoStats.bgClass.replace('bg-', 'bg-').replace('50', '500')}`}></div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChartLineUp size={24} className="text-indigo-600" weight="duotone" />
                    <h3 className="text-lg font-black text-slate-900">ANALYZE SEO</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${seoStats.bgClass} ${seoStats.colorClass.replace('500', '700')}`}>
                    {seoStats.score >= 80 ? 'Tuyệt vời' : seoStats.score >= 50 ? 'Chấp nhận được' : 'Cần cải thiện'}
                  </span>
                </div>
                
                {/* Score Ring */}
                <div className="flex justify-center mb-6">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-50 shadow-inner">
                    <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                      <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle 
                        cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray="339.29" 
                        strokeDashoffset={339.29 - (339.29 * seoStats.score) / 100} 
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${seoStats.strokeClass}`} 
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className={`text-4xl font-black ${seoStats.colorClass}`}>{seoStats.score}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Focus Keyword Input */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-bold text-slate-700">Từ khóa tập trung (Focus Keyword)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MagnifyingGlass size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="Nhập từ khóa cần SEO..."
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* SEO Checklist Accordion-Style */}
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3"><Lightbulb size={16}/> SEO Cơ Bản</h4>
                    <ul className="space-y-2.5">
                      {seoStats.basicChecks.map((check, idx) => (
                        <ChecklistItem key={idx} check={check} />
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3"><TextT size={16}/> SEO Nâng Cao</h4>
                    <ul className="space-y-2.5">
                      {seoStats.advancedChecks.map((check, idx) => (
                        <ChecklistItem key={idx} check={check} />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* TAXONOMY CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <TagIcon size={20} className="text-slate-700" weight="duotone" />
                  <h3 className="text-lg font-black text-slate-900">Phân loại</h3>
                </div>

                <div className="mb-5">
                  <label htmlFor={`${idPrefix}category`} className="mb-2 block text-sm font-bold text-slate-700">Danh mục <span className="text-rose-500">*</span></label>
                  <select
                    id={`${idPrefix}category`}
                    name="category"
                    required
                    disabled={isFormDisabled}
                    value={formData.category}
                    onChange={onInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Thẻ (Tags)</label>
                  <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 scrollbar-thin scrollbar-thumb-slate-300">
                    {availableTags.length === 0 ? (
                      <span className="text-sm italic text-slate-400">Hệ thống chưa có tag nào.</span>
                    ) : (
                      availableTags.map((tag) => {
                        const isSelected = formData.tags.includes(tag._id);
                        return (
                          <button
                            key={tag._id}
                            type="button"
                            disabled={isFormDisabled}
                            onClick={() => onTagToggle(tag._id)}
                            className={`flex items-center rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                : "bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* MEDIA CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ImageIcon size={20} className="text-slate-700" weight="duotone" />
                  <h3 className="text-lg font-black text-slate-900">Ảnh đại diện</h3>
                </div>

                <div className="flex flex-col gap-4">
                  {formData.coverImage ? (
                    <div className="group relative h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
                      <img src={formData.coverImage} alt="Cover" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onInputChange({ target: { name: "coverImage", value: "" } } as React.ChangeEvent<HTMLInputElement>)}
                          disabled={isFormDisabled}
                          className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-xl transition-transform hover:scale-110 hover:bg-rose-600"
                        >
                          <Trash size={18} weight="bold" /> Gỡ ảnh
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-indigo-400 hover:bg-indigo-50/50">
                      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                      {isUploading ? (
                        <CircleNotch size={36} className="animate-spin text-indigo-500 mb-3" />
                      ) : (
                        <UploadSimple size={36} className="text-slate-400 mb-3 transition-transform group-hover:-translate-y-1" weight="duotone" />
                      )}
                      <p className="text-[15px] font-bold text-slate-700">{isUploading ? 'Đang tải lên...' : 'Click hoặc Kéo thả ảnh vào đây'}</p>
                      <p className="text-xs font-medium text-slate-400 mt-1.5">Hỗ trợ JPG, PNG, WEBP (Max: 5MB)</p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/gif"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleImageUpload}
                        disabled={isFormDisabled}
                      />
                    </div>
                  )}
                  
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Hoặc dán Link</span></div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LinkIcon size={18} className="text-slate-400" />
                    </div>
                    <input
                      id={`${idPrefix}coverImage`}
                      name="coverImage"
                      type="url"
                      disabled={isFormDisabled}
                      value={formData.coverImage}
                      onChange={onInputChange}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* PUBLISH ACTION BAR (Sticky Bottom) */}
            <div className="border-t border-slate-200 bg-white p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-3">
                {mode === "create" && onSaveDraft && onPublish && (
                  <>
                    <button
                      type="button"
                      onClick={onPublish}
                      disabled={isFormDisabled}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-black tracking-wide text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/40 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <Article size={20} weight="bold" />
                      {isSubmitting ? "ĐANG XUẤT BẢN..." : "XUẤT BẢN BÀI VIẾT"}
                    </button>
                    <button
                      type="button"
                      onClick={onSaveDraft}
                      disabled={isFormDisabled}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-3 text-[15px] font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {isSubmitting ? "Đang xử lý..." : "Lưu Bản Nháp"}
                    </button>
                  </>
                )}

                {mode === "edit" && onSave && (
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={isFormDisabled}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-black tracking-wide text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/40 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <Article size={20} weight="bold" />
                    {isSubmitting ? "ĐANG CẬP NHẬT..." : "CẬP NHẬT BÀI VIẾT"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean checklist rendering
function ChecklistItem({ check }: { check: { status: "good" | "warn" | "error", text: string } }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-snug">
      {check.status === "good" && <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />}
      {check.status === "warn" && <Warning size={18} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />}
      {check.status === "error" && <XCircle size={18} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />}
      <span className={check.status === "error" ? "text-slate-800 font-bold" : "text-slate-600 font-medium"}>{check.text}</span>
    </li>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
      <AlertCircle size={22} className="shrink-0 text-rose-500" />
      <p className="font-bold">{message}</p>
    </div>
  );
}