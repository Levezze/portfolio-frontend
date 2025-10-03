import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8cd13f499aba45a08aa5d342d7244fe7.r2.dev",
        pathname: "/projects/**",
      },
    ],
  },
};

export default nextConfig;
