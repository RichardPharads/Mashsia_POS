// apps/dashboard/next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',   // ← this is the critical line

  // API calls from dashboard server components go to the api container
  // by container name — not by LAN IP
  env: {
    API_URL: process.env.API_URL || 'http://api:3000',
  },
}

export default nextConfig