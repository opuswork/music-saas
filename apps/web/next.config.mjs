/** 모든 페이지에 붙는 보안 헤더 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // "X-Powered-By: Next.js" 헤더 숨김
  poweredByHeader: false,
  images: {
    // next/image가 지원 브라우저에 AVIF/WebP로 변환해 전송
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
