import { NextRequest, NextResponse } from 'next/server';
import { getArticles, getArticleTags, getArticleStats, ArticleFilters } from '@/utils/articleManager';

export const dynamic = "force-dynamic";

/**
 * GET handler for articles API
 * Supports filtering and pagination via query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const action = searchParams.get('action') || 'list';
    
    switch (action) {
      case 'list': {
        const filters: ArticleFilters = {
          limit: parseInt(searchParams.get('limit') || '10'),
          offset: parseInt(searchParams.get('offset') || '0'),
          searchQuery: searchParams.get('search') || undefined,
          dateFrom: searchParams.get('dateFrom') || undefined,
          dateTo: searchParams.get('dateTo') || undefined,
        };

        // Parse tags parameter (comma-separated)
        const tagsParam = searchParams.get('tags');
        if (tagsParam) {
          filters.tags = tagsParam.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        const result = await getArticles(filters);
        
        if (!result) {
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch articles'
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      }

      case 'tags': {
        const tags = await getArticleTags();
        
        return NextResponse.json({
          success: true,
          data: { tags },
          timestamp: new Date().toISOString()
        });
      }

      case 'stats': {
        const stats = await getArticleStats();
        
        if (!stats) {
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch article statistics'
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: list, tags, stats'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Articles API error:', error);
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
