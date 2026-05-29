import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // web-push uses Node.js crypto — keep it server-only
  serverExternalPackages: ["web-push"],

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
