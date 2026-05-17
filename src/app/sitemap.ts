import { MetadataRoute } from 'next';
import { postService } from '@/lib/api/post.service';

// Revalidate the cache once every 24 hours (86,400 seconds)
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use a fallback to ensure baseUrl is never undefined
  const baseUrl: string = process.env.NEXT_PUBLIC_API_URL!;

  try {
    // Fetch published posts from your backend
    const response = await postService.getAllPosts({ 
      limit: 1000, 
      status: 'published' 
    });
    
    const posts = response.metadata.data || [];

    // Filter and Map: This ensures 'url' is always a strict string
    const postEntries: MetadataRoute.Sitemap = posts
      .filter((post) => post && typeof post.slug === 'string')
      .map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(post.modifiedOn || post.createdOn),
        changeFrequency: 'daily',
        priority: 0.7,
      }));

    // Define your static main pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/posts`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
    ];

    return [...staticPages, ...postEntries];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Fallback to static pages if the backend is unreachable
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/posts`, lastModified: new Date() },
    ];
  }
}