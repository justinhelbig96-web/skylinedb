/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'amayama.com' },
      { protocol: 'https', hostname: 'nengun.com' },
      { protocol: 'https', hostname: 'www.nengun.com' },
      { protocol: 'https', hostname: 'nissan.epc-data.com' },
      { protocol: 'https', hostname: 'www.jdmheart.com' },
    ],
  },
}

export default nextConfig
