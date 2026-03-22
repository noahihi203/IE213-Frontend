"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  Code,
  CodeBlock,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListNumbers,
  Minus,
  Quotes,
  TextB,
  TextHOne,
  TextHTwo,
  TextHThree,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
} from "@phosphor-icons/react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Viết nội dung bài tại đây...",
  minHeight = "320px",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: "language-" },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-3",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    if (showLinkInput) linkInputRef.current?.focus();
  }, [showLinkInput]);

  useEffect(() => {
    if (showImageInput) imageInputRef.current?.focus();
  }, [showImageInput]);

  if (!editor) return null;

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const applyImage = () => {
    const url = imageUrl.trim();
    if (url) editor.chain().focus().setImage({ src: url }).run();
    setImageUrl("");
    setShowImageInput(false);
  };

  const toggleLinkInput = () => {
    setShowImageInput(false);
    const existingHref = editor.getAttributes("link").href ?? "";
    setLinkUrl(existingHref);
    setShowLinkInput((prev) => !prev);
  };

  const toggleImageInput = () => {
    setShowLinkInput(false);
    setShowImageInput((prev) => !prev);
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {/* Undo / Redo */}
        <ToolGroup>
          <ToolBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <ArrowClockwise size={16} weight="bold" />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* Text style */}
        <ToolGroup>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <TextB size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <TextItalic size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <TextUnderline size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <TextStrikethrough size={16} weight="bold" />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* Headings */}
        <ToolGroup>
          {([1, 2, 3] as const).map((level) => {
            const Icon =
              level === 1 ? TextHOne : level === 2 ? TextHTwo : TextHThree;
            return (
              <ToolBtn
                key={level}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level }).run()
                }
                active={editor.isActive("heading", { level })}
                title={`Heading ${level}`}
              >
                <Icon size={16} weight="bold" />
              </ToolBtn>
            );
          })}
        </ToolGroup>

        <Divider />

        {/* Lists */}
        <ToolGroup>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <List size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered list"
          >
            <ListNumbers size={16} weight="bold" />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* Block elements */}
        <ToolGroup>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quotes size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline code"
          >
            <Code size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <CodeBlock size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus size={16} weight="bold" />
          </ToolBtn>
        </ToolGroup>

        <Divider />

        {/* Link & Image */}
        <ToolGroup>
          <ToolBtn
            onClick={toggleLinkInput}
            active={editor.isActive("link") || showLinkInput}
            title="Link"
          >
            <LinkIcon size={16} weight="bold" />
          </ToolBtn>
          <ToolBtn
            onClick={toggleImageInput}
            active={showImageInput}
            title="Image"
          >
            <ImageIcon size={16} weight="bold" />
          </ToolBtn>
        </ToolGroup>
      </div>

      {/* ── Link input ── */}
      {showLinkInput && (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-emerald-50 px-3 py-2">
          <LinkIcon size={16} className="shrink-0 text-emerald-600" />
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") setShowLinkInput(false);
            }}
            placeholder="https://example.com"
            className="flex-1 text-sm bg-transparent outline-none"
          />
          <button
            type="button"
            onClick={applyLink}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Hủy
          </button>
        </div>
      )}

      {/* ── Image URL input ── */}
      {showImageInput && (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-sky-50 px-3 py-2">
          <ImageIcon size={16} className="shrink-0 text-sky-600" />
          <input
            ref={imageInputRef}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyImage();
              if (e.key === "Escape") setShowImageInput(false);
            }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 text-sm bg-transparent outline-none"
          />
          <button
            type="button"
            onClick={applyImage}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
          >
            Chèn ảnh
          </button>
          <button
            type="button"
            onClick={() => setShowImageInput(false)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Hủy
          </button>
        </div>
      )}

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function ToolBtn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor losing focus
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "text-slate-600 hover:bg-slate-200 hover:text-slate-800"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-slate-300" />;
}
