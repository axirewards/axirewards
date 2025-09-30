/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    POSTBACK_SECRET_AYET: process.env.POSTBACK_SECRET_AYET,
    POSTBACK_SECRET_CPX: process.env.POSTBACK_SECRET_CPX,
    POSTBACK_SECRET_OFFERTORO: process.env.POSTBACK_SECRET_OFFERTORO,
    ADMIN_KEY: process.env.ADMIN_KEY,
  },
}

module.exports = nextConfig
