import { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

// Static FAQ data
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

// Generate metadata for better SEO
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

// Fetch or prepare FAQ data (could be from API)
async function getFAQData(): Promise<FAQItem[]> {
  // Simulate API fetch with caching
  // In production, this could be: const res = await fetch('...', { next: { revalidate: 3600 } })
  // For now, using static data
  return Promise.resolve(faqData);
}

// FAQItem Component
function FAQItem({ item }: { item: FAQItem }) {
  return (
    <details className="group border-b border-gray-200 py-6 hover:bg-gray-50 px-4 rounded-lg transition-colors">
      <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-900 marker:content-none">
        <span className="text-lg">{item.question}</span>
        <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-4 text-gray-600 leading-relaxed">{item.answer}</p>
    </details>
  );
}

// Main FAQ Page - Server Component (Static by default in Next.js 14)
export default async function FAQPage() {
  const faqs = await getFAQData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about IE213 Blog
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-2 bg-white rounded-lg shadow-sm">
          {faqs.map((faq) => (
            <FAQItem key={faq.id} item={faq} />
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-700 mb-6">
            Contact our support team for personalized assistance
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* SEO Schema */}
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
