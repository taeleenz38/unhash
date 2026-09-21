import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/trustwallet/assets@master/blockchains/**",
      },
    ],
  },
};

export default nextConfig;
