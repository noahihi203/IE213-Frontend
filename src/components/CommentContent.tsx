import Link from "next/link";

interface CommentContentProps {
  content: string;
  className?: string;
  mentionLabel?: string;
  mentionHref?: string | null;
}

const isMentionBoundary = (char: string) => {
  if (!char) return true;
  return /\s|[.,!?;:)]/.test(char);
};

export default function CommentContent({
  content,
  className,
  mentionLabel,
  mentionHref,
}: CommentContentProps) {
  const trimmedContent = content || "";

  if (mentionHref && mentionLabel) {
    const mentionText = `@${mentionLabel}`;
    if (trimmedContent.startsWith(mentionText)) {
      const nextChar = trimmedContent.charAt(mentionText.length);
      if (isMentionBoundary(nextChar)) {
        const rest = trimmedContent.slice(mentionText.length);
        return (
          <p className={className}>
            <Link
              href={mentionHref}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              {mentionText}
            </Link>
            {rest}
          </p>
        );
      }
    }
  }

  return <p className={className}>{trimmedContent}</p>;
}
