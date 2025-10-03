/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    BITLABS_SECRET: process.env.BITLABS_SECRET,
    CPX_SECURE_HASH: process.env.CPX_SECURE_HASH,
    THEOREM_SECRET: process.env.THEOREM_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  },
}

module.exports = nextConfig
