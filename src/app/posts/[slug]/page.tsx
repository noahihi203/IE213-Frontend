import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetailClient from "./PostDetailClient";
import { ApiResponse, Post } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/v1/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface PageProps {
  params: {
    slug: string;
  };
}

const stripMarkdown = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~\-|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildCanonicalUrl = (slug: string) => `${SITE_URL}/posts/${slug}`;

async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/slug/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<Post>;
    return payload?.metadata ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = params.slug;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | IE213 Blog",
      description: "The requested post is unavailable.",
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical: `/posts/${slug}`,
      },
    };
  }

  const description =
    post.excerpt?.trim() ||
    stripMarkdown(post.content).slice(0, 160) ||
    "Read this post on IE213 Blog.";

  const author = typeof post.authorId === "object" ? post.authorId : undefined;

  const isPublished = post.status === "published";

  return {
    title: `${post.title} | IE213 Blog`,
    description,
    robots: {
      index: isPublished,
      follow: isPublished,
    },
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    keywords: post.tags?.map((tag) => tag.name).filter(Boolean),
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/posts/${post.slug}`,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              alt: post.title,
            },
          ]
        : undefined,
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      authors: author ? [author.fullName || author.username] : undefined,
      tags: post.tags?.map((tag) => tag.name),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const slug = params.slug;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const author = typeof post.authorId === "object" ? post.authorId : undefined;

  const description =
    post.excerpt?.trim() ||
    stripMarkdown(post.content).slice(0, 160) ||
    "Read this post on IE213 Blog.";

  const canonicalUrl = buildCanonicalUrl(post.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined,
    dateModified: new Date(post.modifiedOn).toISOString(),
    author: author
      ? {
          "@type": "Person",
          name: author.fullName || author.username,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "IE213 Blog",
      url: SITE_URL,
    },
    mainEntityOfPage: canonicalUrl,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Posts",
        item: `${SITE_URL}/posts`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <PostDetailClient slug={slug} initialPost={post} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
    </>
  );
}
