import { useState } from "react";
import { postService } from "@/lib/api/post.service";
import { Post } from "@/lib/types";

export function usePosts() {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const loadMyPosts = async () => {
    try {
      const res = await postService.getMyPosts({ page: 1, limit: 10 });
      setMyPosts(
        Array.isArray(res.metadata)
          ? res.metadata
          : Array.isArray(res.metadata?.data)
            ? res.metadata.data
            : [],
      );
    } catch (err) {
      console.error("Failed to load posts:", err);
      setMyPosts([]);
    }
  };

  const loadLikedPosts = async () => {
    try {
      const res = await postService.getMyLikedPosts({ page: 1, limit: 10 });
      setLikedPosts(
        Array.isArray(res.metadata)
          ? res.metadata
          : Array.isArray(res.metadata?.data)
            ? res.metadata.data
            : [],
      );
    } catch (err) {
      console.error("Failed to load liked posts:", err);
      setLikedPosts([]);
    }
  };

  const loadPostsForRole = async (role?: string) => {
    setIsLoadingPosts(true);
    try {
      if (role === "admin" || role === "author") {
        await Promise.all([loadMyPosts(), loadLikedPosts()]);
      } else {
        setMyPosts([]);
        await loadLikedPosts();
      }
    } finally {
      setIsLoadingPosts(false);
    }
  };

  return {
    myPosts,
    likedPosts,
    isLoadingPosts,
    loadMyPosts,
    loadLikedPosts,
    loadPostsForRole,
  };
}
