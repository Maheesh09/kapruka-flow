/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static2.kapruka.com' },
      { protocol: 'https', hostname: 'partnercentral.kapruka.com' },
    ],
  },
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    }]
  },
}

export default nextConfig