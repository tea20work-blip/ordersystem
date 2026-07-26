import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2t6059p6jfvt4.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
