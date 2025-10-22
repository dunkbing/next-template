import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "b5041a633fa4f74b62cc8823d81fdd88.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
