/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for static images
  },
  // Optimize bundle & server config
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      'recharts',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'date-fns',
      'country-flag-icons',
    ],
    // Ensure sharp loads as native module, not bundled
    serverComponentsExternalPackages: ['sharp'],
  },
  // Production optimizations
  swcMinify: true,
  poweredByHeader: false,
}

module.exports = nextConfig
