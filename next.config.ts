import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/info': ['./bin/**/*'],
    '/api/download': ['./bin/**/*'],
  },
};

export default nextConfig;
