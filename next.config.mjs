/** @type {import('next').NextConfig} */
const seoRedirects = [
  ["/resources/google-maps-leads-for-web-designers", "/resources/google-maps-lead-generation-for-freelancers"],
  ["/resources/google-maps-prospecting-for-web-designers", "/resources/google-maps-prospecting-tool-for-freelancers"],
  ["/resources/freelance-sales-pipeline-from-google-maps", "/resources/google-maps-lead-generation-for-freelancers"],
  ["/blog/find-clients-for-hubspot-consulting", "/blog/client-acquisition-software-for-freelancers-free-leads-crm"],
  ["/for/data-scientists", "/lead-generation/freelance-client-leads"],
  ["/blog/portfolio-that-books-calls-roi-first-approach", "/blog/freelance-client-acquisition-system"],
  ["/for/mobile-app-developers", "/lead-generation/freelance-client-leads"],
  ["/for/shopify-experts", "/lead-generation/web-design-leads"],
  ["/for/video-editors", "/lead-generation/freelance-client-leads"],
  ["/for/virtual-assistants", "/lead-generation/freelance-client-leads"],
  ["/for/social-media-managers", "/lead-generation/freelance-client-leads"],
  ["/blog/best-crm-for-high-ticket-closing-in-2026-compared-1780943521022", "/blog/freelance-crm-track-leads-close-clients"],
];

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self' https://accounts.google.com https://github.com https://checkout.stripe.com https://*.paddle.com",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://cdn.paddle.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://images.unsplash.com https://*.googlesyndication.com https://*.doubleclick.net",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://ep1.adtrafficquality.google https://api.stripe.com https://*.paddle.com https://*.twilio.com wss://*.twilio.com",
      "frame-src 'self' https://*.googlesyndication.com https://*.doubleclick.net https://checkout.stripe.com https://*.paddle.com",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
    ].join("; "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-XSS-Protection", value: "0" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: process.cwd(),
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.icloseleads.com" }],
        destination: "https://icloseleads.com/:path*",
        permanent: true,
      },
      ...seoRedirects.map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  async headers() {
    return [
      {
        source: "/blog-images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        source: "/dashboard/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        source: "/auth/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
