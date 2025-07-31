import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string[] }> }
) {
  try {
    const { dimensions } = await params;
    
    // Parse dimensions (e.g., ['400', '400'] or ['300', '300'])
    let width = 400;
    let height = 400;
    
    if (dimensions && dimensions.length >= 2) {
      width = parseInt(dimensions[0]) || 400;
      height = parseInt(dimensions[1]) || 400;
    } else if (dimensions && dimensions.length === 1) {
      const size = parseInt(dimensions[0]) || 400;
      width = size;
      height = size;
    }
    
    // Limit dimensions for security
    width = Math.min(Math.max(width, 50), 2000);
    height = Math.min(Math.max(height, 50), 2000);
    
    // Generate SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#334155;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#475569;stop-opacity:1" />
          </linearGradient>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#64748b" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="${Math.min(width, height) / 15}" 
              fill="#94a3b8" 
              opacity="0.8">
          ${width} × ${height}
        </text>
        <circle cx="50%" cy="35%" r="${Math.min(width, height) / 8}" 
                fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.6"/>
        <rect x="40%" y="60%" width="20%" height="15%" 
              fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.6" rx="2"/>
      </svg>
    `.trim();
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Placeholder API error:', error);
    
    // Return a simple fallback SVG
    const fallbackSvg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1e293b"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
              font-family="sans-serif" font-size="24" fill="#94a3b8">
          Image Placeholder
        </text>
      </svg>
    `;
    
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
