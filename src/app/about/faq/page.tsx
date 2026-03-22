import { Metadata } from "next";
import Link from "next/link";
import { Outfit } from "next/font/google";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const faqData = [
  {
    id: 1,
    question: "What is IE213 Blog?",
    answer:
      "IE213 Blog is a modern, feature-rich blogging platform built with Next.js 14 and Express. It allows users to create, share, and discover engaging blog posts across various categories.",
  },
  {
    id: 2,
    question: "How do I create a blog post?",
    answer:
      "To create a blog post, you need to be logged in as an author or admin. Navigate to the 'Write' section, fill in your post details including title, content, category, and tags, then choose to save as draft or publish immediately.",
  },
  {
    id: 3,
    question: "Can I edit my posts after publishing?",
    answer:
      "Yes, you can edit your published posts anytime. Go to your dashboard, find the post you want to edit, click the 'Edit' button, make your changes, and save. The updated version will be published immediately.",
  },
  {
    id: 4,
    question: "What are categories and tags?",
    answer:
      "Categories are broad classifications for posts (e.g., Technology, Business, Lifestyle). Tags are more specific keywords that help readers find related content. Each post can belong to one category but have multiple tags.",
  },
  {
    id: 5,
    question: "How does the comment system work?",
    answer:
      "Readers can leave comments on published posts. Comments support nested replies, allowing discussions to branch out. All comments are moderated to maintain community standards.",
  },
  {
    id: 6,
    question: "Can I share posts on social media?",
    answer:
      "Yes, you can share posts using the share button on each post. IE213 supports sharing to Facebook, Twitter, LinkedIn, and copying the link for internal sharing.",
  },
  {
    id: 7,
    question: "What does the 'Like' feature do?",
    answer:
      "The like feature allows readers to show appreciation for posts they enjoyed. Your post's like count is displayed on your dashboard, helping you understand reader engagement.",
  },
  {
    id: 8,
    question: "How are trending posts determined?",
    answer:
      "Trending posts are calculated based on views, likes, comments, and shares weighted over time. More recent high-engagement posts rank higher to surface fresh, popular content.",
  },
  {
    id: 9,
    question: "Is there a Markdown support?",
    answer:
      "Yes, the content editor supports Markdown formatting. You can use headings, bold, italics, code blocks, lists, and links to format your posts beautifully.",
  },
  {
    id: 10,
    question: "How do I delete my account?",
    answer:
      "You can request account deletion from your settings. Your posts will be archived but remain accessible. Contact support for permanent data deletion.",
  },
];

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const generateMetadata = (): Metadata => {
  return {
    title: "FAQ - IE213 Blog",
    description:
      "Frequently asked questions about IE213 Blog. Learn how to create posts, engage with the community, and make the most of our platform.",
    keywords: ["FAQ", "help", "blog", "questions", "answers"],
    openGraph: {
      title: "FAQ - IE213 Blog",
      description: "Find answers to common questions about IE213 Blog platform",
      type: "website",
      url: "https://ie213-blog.com/about/faq",
    },
  };
};

async function getFAQData(): Promise<FAQItem[]> {
  return Promise.resolve(faqData);
}

function FAQItem({ item }: { item: FAQItem }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-200">
      <summary className="flex cursor-pointer items-center justify-between gap-3 marker:content-none">
        <span className="text-base font-medium text-slate-900 md:text-lg">
          {item.question}
        </span>
        <CaretDown
          size={18}
          className="text-slate-500 transition-transform group-open:rotate-180"
          weight="duotone"
        />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
        {item.answer}
      </p>
    </details>
  );
}

export default async function FAQPage() {
  const faqs = await getFAQData();

  return (
    <div className={`${outfit.className} min-h-[100dvh] bg-slate-50`}>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-10">
          <h1 className="text-4xl font-semibold tracking-tighter text-slate-900 md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-slate-600 md:text-lg">
            Find answers to common questions about IE213 Blog.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.id} item={faq} />
          ))}
        </div>

        <div className="mt-12 rounded-[1.5rem] border border-emerald-200/70 bg-emerald-50/60 p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
            Can't find what you're looking for?
          </h2>
          <p className="mb-6 text-slate-700">
            Contact our support team for personalized assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:-translate-y-[1px]"
            >
              Contact Support
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-xl border border-emerald-600 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      </div>
    </div>
  );
}
