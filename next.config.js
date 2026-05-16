/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 启用 Next.js 图片优化
  images: {
    // 如果有外部图片域名，可以在这里配置
    remotePatterns: [],
  },
};

module.exports = nextConfig;
