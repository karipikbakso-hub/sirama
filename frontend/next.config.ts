import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Disabled - menggunakan manual optimization yang lebih baik

  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    optimizeCss: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/sanctum/:path*',
        destination: 'http://localhost:8000/sanctum/:path*',
      },
      {
        source: '/login',
        destination: 'http://localhost:8000/login',
      },
      {
        source: '/logout',
        destination: 'http://localhost:8000/logout',
      },
      {
        source: '/user',
        destination: 'http://localhost:8000/user',
      },
    ];
  },
};

export default nextConfig;
