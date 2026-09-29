/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@telyad/ui',
    '@telyad/types',
    '@telyad/ad-formats',
    '@telyad/audience',
    '@telyad/campaign-engine',
  ],
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;
