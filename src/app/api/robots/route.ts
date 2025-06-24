import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvphoto.app';
  
  const robots = `User-agent: *
Allow: /
Allow: /auth
Allow: /checkout
Allow: /advanced-features
Allow: /terms
Allow: /privacy
Allow: /contact

Disallow: /api/
Disallow: /dashboard
Disallow: /upload/
Disallow: /wait
Disallow: /forms
Disallow: /postcheckout
Disallow: /postcheckout-polar

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
