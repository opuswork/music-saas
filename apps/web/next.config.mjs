/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Web Audio / OSMD 체인을 RSC/서버 번들에서 잘못 쪼개면 vendor-chunks 누락(500)이 날 수 있어 외부화
    serverComponentsExternalPackages: [
      'osmd-audio-player',
      'opensheetmusicdisplay',
      'standardized-audio-context',
      'soundfont-player',
    ],
  },
};

export default nextConfig;
