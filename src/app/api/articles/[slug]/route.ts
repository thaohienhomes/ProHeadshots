import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/utils/articleManager';

export const dynamic = "force-dynamic";

/**
 * GET handler for individual article by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({
        success: false,
        error: 'Article slug is required'
      }, { status: 400 });
    }

    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'Article not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: article,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Article API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
