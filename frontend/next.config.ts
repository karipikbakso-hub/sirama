import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    allowedDevOrigins: ['http://192.168.100.16'],
    css: {
      lightningcss: false, // ⛔ disable LightningCSS
    },
    turbo: {
      enabled: false, // ⛔ disable Turbopack
    },


  },
};

export default nextConfig;