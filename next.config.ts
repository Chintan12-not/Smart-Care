import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.microlink.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/corporate-bulk-orders",
        destination: "/corporate-orders",
        permanent: true,
      },
      {
        source: "/repair",
        destination: "/pickup",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
