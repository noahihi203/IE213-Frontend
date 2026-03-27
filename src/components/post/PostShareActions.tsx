"use client";

import {
  Copy,
  FacebookLogo,
  LinkedinLogo,
  ShareNetwork,
  XLogo,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { shareService } from "@/lib/api/share.service";

type SharePlatform = "facebook" | "x" | "linkedin" | "copy" | "native";

interface PostShareActionsProps {
  postId: string;
  title: string;
  excerpt?: string;
  slug: string;
  isAuthenticated: boolean;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SHARE_TEXT_MAX = 200;

const normalizeShareText = (value?: string) => {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
};

const truncateShareText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  const suffix = "...";
  const sliceLength = Math.max(0, maxLength - suffix.length);
  return `${value.slice(0, sliceLength).trim()}${suffix}`;
};

const getShareText = (excerpt: string | undefined, title: string) => {
  const base = normalizeShareText(excerpt) || normalizeShareText(title);
  return truncateShareText(base, SHARE_TEXT_MAX);
};

const buildShareUrl = (
  platform: Exclude<SharePlatform, "copy" | "native">,
  url: string,
  shareText: string,
) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  if (platform === "facebook") {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  }

  if (platform === "x") {
    return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  }

  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
};

const openSharePopup = (url: string) => {
  const width = 640;
  const height = 560;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

  const popup = window.open(
    url,
    "share-popup",
    `width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)},noopener,noreferrer`,
  );

  if (!popup) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  popup.focus();
};

const trackShareEvent = (
  platform: SharePlatform,
  postId: string,
  slug: string,
) => {
  if (typeof window === "undefined") return;

  const payload = {
    event: "post_share",
    platform,
    postId,
    slug,
    at: new Date().toISOString(),
  };

  const dataLayer = (window as any).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push(payload);
  }
};

const tryTrackBackendShare = async (
  isAuthenticated: boolean,
  postId: string,
  platform: SharePlatform,
  title: string,
) => {
  if (!isAuthenticated || platform === "copy" || platform === "native") {
    return;
  }

  try {
    await shareService.sharePost(postId, {
      platform,
      message: `Shared post: ${title}`,
    });
  } catch (error) {
    console.error("Failed to track backend share", error);
  }
};

export default function PostShareActions({
  postId,
  title,
  excerpt,
  slug,
  isAuthenticated,
}: PostShareActionsProps) {
  const postUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${slug}`
      : `${SITE_URL}/posts/${slug}`;
  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        const temporaryInput = document.createElement("input");
        temporaryInput.value = postUrl;
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        document.execCommand("copy");
        document.body.removeChild(temporaryInput);
      }
      toast.success("Đã sao chép liên kết bài viết!");
      trackShareEvent("copy", postId, slug);
    } catch (error) {
      console.error("Failed to copy post link", error);
      toast.error("Không thể sao chép liên kết bài viết.");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      return;
    }

    try {
      const shareText = getShareText(excerpt, title);
      await navigator.share({
        title,
        text: shareText,
        url: postUrl,
      });
      trackShareEvent("native", postId, slug);
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error("Failed to open native share", error);
      }
    }
  };

  const handleSocialShare = async (
    platform: Exclude<SharePlatform, "copy" | "native">,
  ) => {
    const shareText = getShareText(excerpt, title);
    const shareUrl = buildShareUrl(platform, postUrl, shareText);
    openSharePopup(shareUrl);
    trackShareEvent(platform, postId, slug);
    await tryTrackBackendShare(isAuthenticated, postId, platform, title);
  };

  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleSocialShare("facebook")}
          className="inline-flex items-center justify-center rounded-lg bg-[#e7f0ff] p-3 text-[#1877f2] transition-colors hover:bg-[#dbe8ff]"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <FacebookLogo className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => void handleSocialShare("x")}
          className="inline-flex items-center justify-center rounded-lg bg-slate-200 p-3 text-slate-900 transition-colors hover:bg-slate-300"
          aria-label="Share on X"
          title="Share on X"
        >
          <XLogo className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => void handleSocialShare("linkedin")}
          className="inline-flex items-center justify-center rounded-lg bg-[#e7f4ff] p-3 text-[#0a66c2] transition-colors hover:bg-[#d8ecff]"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <LinkedinLogo className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => void handleCopyLink()}
          className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-3 text-slate-700 transition-colors hover:bg-slate-200"
          aria-label="Copy post link"
          title="Copy post link"
        >
          <Copy className="h-5 w-5" />
        </button>
      </div>

      <div className="md:hidden fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1">
          {canUseNativeShare && (
            <button
              type="button"
              onClick={() => void handleNativeShare()}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-100 p-2.5 text-emerald-700"
              aria-label="Native share"
              title="Share"
            >
              <ShareNetwork className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleSocialShare("facebook")}
            className="inline-flex items-center justify-center rounded-xl bg-[#e7f0ff] p-2.5 text-[#1877f2]"
            aria-label="Share on Facebook"
            title="Share on Facebook"
          >
            <FacebookLogo className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => void handleSocialShare("linkedin")}
            className="inline-flex items-center justify-center rounded-xl bg-[#e7f4ff] p-2.5 text-[#0a66c2]"
            aria-label="Share on LinkedIn"
            title="Share on LinkedIn"
          >
            <LinkedinLogo className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 p-2.5 text-slate-700"
            aria-label="Copy post link"
            title="Copy post link"
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
