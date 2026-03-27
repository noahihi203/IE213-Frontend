import type { Metadata } from "next";
import { Post } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/v1/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface MetadataProps {
  params: {
    slug: string;
  };
}

const trimText = (value: string, maxLength: number) => {
  if (!value) return "";
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1).trim()}...`
    : value;
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const toDescription = (post: Post) => {
  if (post.excerpt && post.excerpt.trim().length > 0) {
    return trimText(post.excerpt.trim(), 180);
  }

  const plainTextContent = post.content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\-\[\]()!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return trimText(plainTextContent, 180);
};

const fetchPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/slug/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 120 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as { metadata?: Post };
    return json?.metadata || null;
  } catch {
    return null;
  }
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const canonicalUrl = `${SITE_URL}/posts/${params.slug}`;
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post | IE213 Blog",
      description: "Read the latest article from IE213 Blog.",
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const title = trimText(post.title, 80);
  const description =
    toDescription(post) || "Read the latest article from IE213 Blog.";
  const image = toAbsoluteUrl(post.coverImage);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      siteName: "IE213 Blog",
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function PostSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
