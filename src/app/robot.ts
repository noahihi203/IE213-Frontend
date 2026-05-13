import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl: string = process.env.NEXT_PUBLIC_API_URL!;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', // Admin area
        '/login',      // Login page
        '/api/',       // Internal Next.js API routes
        '/_next/',     // Next.js system files
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}