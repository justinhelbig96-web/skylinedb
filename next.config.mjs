/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'amayama.com' },
      { protocol: 'https', hostname: 'nengun.com' },
    ],
  },
}

export default nextConfig
