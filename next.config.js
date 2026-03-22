/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    transpilePackages: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
  },
};


module.exports = nextConfig;
