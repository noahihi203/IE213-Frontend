"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamic import để tránh SSR error (editor dùng browser API)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  minHeight = 420,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        height={minHeight}
        preview="live"
        visibleDragbar={false}
        style={{
          borderRadius: "0.5rem",
          border: "1px solid #cbd5e1",
          boxShadow: "none",
        }}
      />
    </div>
  );
}
