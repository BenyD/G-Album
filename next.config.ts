import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Disable Next.js image optimization
    unoptimized: true,
  },
  // Enable experimental features for server actions
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "galbum.net"],
    },
  },
};

export default nextConfig;
