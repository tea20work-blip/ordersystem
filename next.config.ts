import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2t6059p6jfvt4.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
