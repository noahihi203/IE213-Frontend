import PostEditorClient from "@/components/editor/PostEditorClient"; 

export default function EditPostPage({ params }: { params: { slug: string } }) {
  return <PostEditorClient postId={params.slug} />;
}