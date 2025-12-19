import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    domains: [
      'www.apple.com',
      'images.samsung.com',
      'lh3.googleusercontent.com',
      'cdn.shopify.com',
      'gmedia.playstation.com',
      'www.sony.co.in',
      'i.dell.com',
      'resource.logitech.com',
      'images.unsplash.com',
    ],
    unoptimized: false,
  },
};

export default nextConfig;
