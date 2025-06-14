/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "supabase.co",
      "gallery-album.s3.ap-south-1.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "gallery-album.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
