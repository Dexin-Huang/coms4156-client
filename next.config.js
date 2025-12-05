/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://alpha-boost-service-tbmfdv7fhq-uc.a.run.app/:path*',
      },
    ]
  },
}

module.exports = nextConfig
