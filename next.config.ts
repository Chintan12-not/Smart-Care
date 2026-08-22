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
  async headers() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "auth.smartcaremobile.in",
          },
        ],
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
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
