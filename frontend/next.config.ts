// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack は create-next-app の --turbo で有効なので、明示不要。
  // もしどうしても設定をいじりたい場合は:
  // turbopack: { dev: true },  // Next 15.3 以降の書き方
};

module.exports = nextConfig;
