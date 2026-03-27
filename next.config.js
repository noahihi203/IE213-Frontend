/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  experimental: {
    // Use Critters in production to inline above-the-fold CSS and defer the rest.
    optimizeCss: true,
    optimizePackageImports: ["@phosphor-icons/react", "date-fns"],
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
};

module.exports = nextConfig;
