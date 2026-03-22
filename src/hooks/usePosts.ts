import { useState } from "react";
import { postService } from "@/lib/api/post.service";
import { Post } from "@/lib/types";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const loadMyPosts = async () => {
    try {
      const res = await postService.getMyPosts({ page: 1, limit: 10 });
      setPosts(
        Array.isArray(res.metadata)
          ? res.metadata
          : Array.isArray(res.metadata?.data)
            ? res.metadata.data
            : [],
      );
    } catch (err) {
      console.error("Failed to load posts:", err);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  return { posts, isLoadingPosts, loadMyPosts };
}
