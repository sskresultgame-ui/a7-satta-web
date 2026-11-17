import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Send all non-www traffic to the canonical www domain (301).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "a7satta.co" }],
        destination: "https://www.a7satta.co/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
