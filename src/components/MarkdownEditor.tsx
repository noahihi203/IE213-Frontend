"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { uploadService } from "@/lib/api/upload.service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  CircleNotch, ImageSquare, WarningCircle, TextB, TextItalic, TextUnderline,
  TextStrikethrough, Highlighter, Code, Palette, TextAlignLeft,
  TextAlignCenter, TextAlignRight, ListBullets, ListNumbers, CheckSquare,
  Table, Quotes, Minus, Link, CornersOut, CornersIn, Columns, Eye, Pencil
} from "@phosphor-icons/react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}

type ViewMode = "write" | "preview" | "split";

export default function MarkdownEditor({
  value,
  onChange,
  minHeight = 500,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [textColor, setTextColor] = useState("#10b981");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScroll = () => {
    if (viewMode !== "split" || !textareaRef.current || !previewRef.current) return;
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  };

  const applyFormat = useCallback((prefix: string, suffix: string = "", defaultText: string = "") => {
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
    } catch (e) {
      console.error("execCommand failed", e);
    }

    if (!success) {
      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);
      onChange(before + newText + after);
    }

    setTimeout(() => {
      textarea.focus();
      if (selection) {
        textarea.setSelectionRange(start, start + newText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + textToInsert.length);
      }
    }, 0);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      applyFormat("  ", "");
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b": e.preventDefault(); applyFormat("**", "**", "in đậm"); break;
        case "i": e.preventDefault(); applyFormat("_", "_", "in nghiêng"); break;
        case "u": e.preventDefault(); applyFormat("<u>", "</u>", "gạch chân"); break;
        case "k": e.preventDefault(); applyFormat("[", "](url)", "văn bản link"); break;
      }
    }
  };

  const processUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return setLocalError("Chỉ hỗ trợ hình ảnh.");
    if (file.size > MAX_FILE_SIZE) return setLocalError("Ảnh tối đa 5MB.");
    
    setLocalError("");
    setIsUploading(true);
    
    // SEO Bonus: We extract the filename without extension to use as the default Alt Text
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const placeholder = `\n![Đang tải ${file.name}...]()\n`;
    applyFormat(placeholder);

    try {
      const response = await uploadService.uploadImage(file);
      // SEO Friendly Image Tag
      const finalImg = `\n![${fileNameWithoutExt}](${response.metadata.imageUrl})\n`;
      onChange(textareaRef.current!.value.replace(placeholder, finalImg));
    } catch (error: any) {
      onChange(textareaRef.current!.value.replace(placeholder, ""));
      setLocalError(error.message || "Tải ảnh thất bại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData?.items[0]?.getAsFile();
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      processUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) processUpload(file);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div 
      className={`flex flex-col overflow-hidden bg-white transition-all duration-300 ${
        isFullscreen 
          ? "fixed inset-0 z-[100] h-screen w-screen bg-white" 
          : "rounded-xl border border-slate-300 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500"
      }`}
    >
      {/* ----------------- TOOLBAR ----------------- */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-3 py-2 backdrop-blur-sm shrink-0">
        
        <div className="flex flex-wrap items-center gap-1.5">
          {/* SEO Heading Dropdown */}
          <ToolGroup>
            <select
              className="h-8 cursor-pointer appearance-none rounded-md border-none bg-transparent py-0 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-200 focus:bg-slate-200"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1em 1em'
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  applyFormat(`\n${val} `, "\n");
                  e.target.value = ""; // Reset after applying
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Kiểu văn bản...</option>
              <option value="#">H1 - Tiêu đề chính (Chỉ dùng 1 lần)</option>
              <option value="##">H2 - Tiêu đề mục lục</option>
              <option value="###">H3 - Tiêu đề phụ</option>
              <option value="####">H4 - Mục nhỏ</option>
              <option value="#####">H5 - Ý chính</option>
              <option value="######">H6 - Ý phụ</option>
            </select>
          </ToolGroup>

          {/* Typography */}
          <ToolGroup>
            <ToolBtn icon={<TextB />} onClick={() => applyFormat("**", "**")} title="In đậm (Ctrl+B)" />
            <ToolBtn icon={<TextItalic />} onClick={() => applyFormat("_", "_")} title="In nghiêng (Ctrl+I)" />
            <ToolBtn icon={<TextUnderline />} onClick={() => applyFormat("<u>", "</u>")} title="Gạch chân (Ctrl+U)" />
            <ToolBtn icon={<TextStrikethrough />} onClick={() => applyFormat("~~", "~~")} title="Gạch ngang" />
            <ToolBtn icon={<Highlighter />} onClick={() => applyFormat("<mark>", "</mark>")} title="Highlight" />
          </ToolGroup>

          {/* Colors */}
          <ToolGroup>
            <div className="relative flex items-center" title="Đổi màu chữ">
              <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-slate-600 hover:bg-slate-200 hover:text-emerald-600">
                <Palette size={18} />
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    applyFormat(`<span style="color: ${e.target.value}">`, `</span>`);
                  }}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>
          </ToolGroup>

          {/* Alignment */}
          <ToolGroup>
            <ToolBtn icon={<TextAlignLeft />} onClick={() => applyFormat('<div align="left">\n\n', '\n\n</div>')} title="Căn trái" />
            <ToolBtn icon={<TextAlignCenter />} onClick={() => applyFormat('<div align="center">\n\n', '\n\n</div>')} title="Căn giữa" />
            <ToolBtn icon={<TextAlignRight />} onClick={() => applyFormat('<div align="right">\n\n', '\n\n</div>')} title="Căn phải" />
          </ToolGroup>

          {/* Lists & Blocks */}
          <ToolGroup>
            <ToolBtn icon={<ListBullets />} onClick={() => applyFormat("\n- ", "")} title="Danh sách chấm" />
            <ToolBtn icon={<ListNumbers />} onClick={() => applyFormat("\n1. ", "")} title="Danh sách số" />
            <ToolBtn icon={<CheckSquare />} onClick={() => applyFormat("\n- [ ] ", "")} title="Danh sách công việc" />
            <ToolBtn icon={<Quotes />} onClick={() => applyFormat("\n> ", "")} title="Trích dẫn" />
            <ToolBtn icon={<Code />} onClick={() => applyFormat("`", "`")} title="Code inline" />
          </ToolGroup>

          {/* Inserts */}
          <ToolGroup>
            <ToolBtn icon={<Link />} onClick={() => applyFormat("[", "](https://)")} title="Chèn Link (Tốt cho SEO Internal)" />
            <ToolBtn 
              icon={<Table />} 
              title="Chèn Bảng"
              onClick={() => applyFormat("\n| Cột 1 | Cột 2 | Cột 3 |\n| :--- | :---: | ---: |\n| Dòng 1 | Dòng 1 | Dòng 1 |\n", "")} 
            />
            <ToolBtn icon={<Minus />} onClick={() => applyFormat("\n\n---\n\n", "")} title="Đường kẻ ngang" />
            
            {/* Image Upload Button */}
            <label className={`relative flex cursor-pointer items-center justify-center rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-emerald-600 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`} title="Tải ảnh lên (Tự động tạo Alt Text)">
              {isUploading ? <CircleNotch size={18} className="animate-spin text-emerald-600" /> : <ImageSquare size={18} />}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processUpload(e.target.files[0])} />
            </label>
          </ToolGroup>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-200/80 p-1">
            <ViewBtn active={viewMode === "write"} onClick={() => setViewMode("write")} icon={<Pencil />} title="Viết" />
            <ViewBtn active={viewMode === "split"} onClick={() => setViewMode("split")} icon={<Columns />} title="Chia đôi" />
            <ViewBtn active={viewMode === "preview"} onClick={() => setViewMode("preview")} icon={<Eye />} title="Xem trước" />
          </div>
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all"
            title={isFullscreen ? "Thu nhỏ" : "Phóng to toàn màn hình"}
          >
            {isFullscreen ? <CornersIn size={18} /> : <CornersOut size={18} />}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {localError && (
        <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 text-sm text-rose-700 border-b border-rose-100 shrink-0">
          <WarningCircle size={16} weight="bold" /><span>{localError}</span>
        </div>
      )}

      {/* ----------------- EDITOR WORKSPACE ----------------- */}
      <div 
        className="relative flex w-full flex-1 overflow-hidden bg-slate-50/30" 
        style={{ minHeight: isFullscreen ? 'calc(100vh - 100px)' : minHeight }}
      >
        {isUploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-5 py-2.5 text-sm font-medium text-white shadow-xl">
              <CircleNotch size={20} className="animate-spin text-emerald-400" />
              <span>Đang tải ảnh lên Cloud...</span>
            </div>
          </div>
        )}

        {(viewMode === "write" || viewMode === "split") && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onScroll={handleScroll}
            disabled={isUploading}
            placeholder="Viết nội dung bài viết ở đây... Bạn có thể bôi đen chữ và chọn công cụ ở trên, hoặc kéo thả/dán ảnh trực tiếp vào đây."
            className={`h-full resize-none p-6 font-mono text-[15px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 scrollbar-thin scrollbar-thumb-slate-200 bg-transparent ${
              viewMode === "split" ? "w-1/2 border-r border-slate-200" : "w-full"
            }`}
          />
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div 
            ref={previewRef}
            className={`h-full overflow-y-auto p-6 bg-white scrollbar-thin scrollbar-thumb-slate-200 ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            {value ? (
              <div className="prose prose-slate prose-emerald max-w-none prose-img:rounded-xl prose-img:shadow-sm prose-pre:border prose-pre:border-slate-200 prose-headings:scroll-mt-6">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm italic text-slate-400">
                Chưa có nội dung.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- FOOTER STATS ----------------- */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shrink-0">
        <div className="flex gap-4">
          <span>{wordCount} Từ</span>
          <span>{charCount} Ký tự</span>
        </div>
        <div>
          Cấu trúc thẻ SEO H1-H6 | Hỗ trợ Alt-Text Ảnh
        </div>
      </div>
    </div>
  );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 shadow-sm">
      {children}
    </div>
  );
}

function ToolBtn({ icon, onClick, title }: { icon: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
    >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 18 }) : icon}
    </button>
  );
}

function ViewBtn({ active, onClick, icon, title }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 16, className: "mr-1.5 hidden sm:block" }) : icon}
      {title}
    </button>
  );
}