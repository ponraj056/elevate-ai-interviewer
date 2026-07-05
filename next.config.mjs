/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Move pdf-parse out of the browser bundle (Node.js only)
  serverExternalPackages: ['pdf-parse'],
  // Fix workspace root detection warning (pnpm-lock.yaml + parent package-lock.json)
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
