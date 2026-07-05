/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Move pdf-parse out of the browser bundle (Node.js only)
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
