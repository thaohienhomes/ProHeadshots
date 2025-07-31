import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  aiGenerationCache, 
  aiModelSelectionCache, 
  aiUserPreferenceCache 
} from '@/utils/aiCache';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const type = searchParams.get('type');

    // Get user authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin (optional - for cache management)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    switch (action) {
      case 'stats':
        return handleGetStats(isAdmin);
      
      case 'clear':
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }
        return handleClearCache(type);
      
      case 'entries':
        return handleGetCacheEntries(user.id, type, isAdmin);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, clear, or entries' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in cache API', error as Error, 'AI_CACHE_API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const cacheKey = searchParams.get('key');

    // Get user authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin access for global cache operations
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (cacheKey) {
      // Delete specific cache entry
      if (!isAdmin) {
        // Non-admin users can only delete their own cache entries
        const { data: entry } = await supabase
          .from('ai_cache')
          .select('metadata')
          .eq('cache_key', cacheKey)
          .single();

        if (!entry || entry.metadata?.user_id !== user.id) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          );
        }
      }

      await supabase
        .from('ai_cache')
        .delete()
        .eq('cache_key', cacheKey);

      return NextResponse.json({
        success: true,
        message: 'Cache entry deleted',
      });
    }

    if (type) {
      // Delete cache by type (admin only)
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      await handleClearCache(type);
      
      return NextResponse.json({
        success: true,
        message: `Cache type '${type}' cleared`,
      });
    }

    return NextResponse.json(
      { error: 'Cache key or type required' },
      { status: 400 }
    );

  } catch (error) {
    logger.error('Error deleting cache', error as Error, 'AI_CACHE_API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleGetStats(isAdmin: boolean) {
  try {
    const generationStats = aiGenerationCache.getCacheStats();
    const selectionStats = aiModelSelectionCache.getCacheStats();
    const preferenceStats = aiUserPreferenceCache.getCacheStats();

    const stats = {
      generation: generationStats,
      modelSelection: selectionStats,
      userPreference: preferenceStats,
      overall: {
        totalHits: generationStats.hits + selectionStats.hits + preferenceStats.hits,
        totalMisses: generationStats.misses + selectionStats.misses + preferenceStats.misses,
        totalRequests: generationStats.totalRequests + selectionStats.totalRequests + preferenceStats.totalRequests,
        overallHitRate: 0,
      },
      database: {
        totalEntries: 0,
        byType: {} as Record<string, number>,
      },
    };

    stats.overall.overallHitRate = stats.overall.totalRequests > 0 
      ? (stats.overall.totalHits / stats.overall.totalRequests) * 100 
      : 0;

    // Add database stats if admin
    if (isAdmin) {
      const supabase = await createClient();
      
      const { data: dbStats } = await supabase
        .from('ai_cache')
        .select('cache_type, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const dbStatsByType = dbStats?.reduce((acc, entry) => {
        acc[entry.cache_type] = (acc[entry.cache_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      stats.database = {
        totalEntries: dbStats?.length || 0,
        byType: dbStatsByType,
      };
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error getting cache stats', error as Error, 'AI_CACHE_API');
    throw error;
  }
}

async function handleClearCache(type?: string | null) {
  try {
    if (type) {
      switch (type) {
        case 'generation':
          await aiGenerationCache.clearCache('generation');
          break;
        case 'model_selection':
          await aiModelSelectionCache.clearCache('model_selection');
          break;
        case 'user_preference':
          await aiUserPreferenceCache.clearCache('user_preference');
          break;
        default:
          throw new Error(`Invalid cache type: ${type}`);
      }
    } else {
      // Clear all caches
      await Promise.all([
        aiGenerationCache.clearCache(),
        aiModelSelectionCache.clearCache(),
        aiUserPreferenceCache.clearCache(),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: type ? `Cache type '${type}' cleared` : 'All caches cleared',
    });

  } catch (error) {
    logger.error('Error clearing cache', error as Error, 'AI_CACHE_API');
    throw error;
  }
}

async function handleGetCacheEntries(userId: string, type?: string | null, isAdmin: boolean = false) {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('ai_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Filter by type if specified
    if (type) {
      query = query.eq('cache_type', type);
    }

    // Non-admin users can only see their own cache entries
    if (!isAdmin) {
      query = query.eq('metadata->>user_id', userId);
    }

    const { data: entries, error } = await query;

    if (error) {
      throw error;
    }

    // Process entries for response
    const processedEntries = entries?.map(entry => ({
      id: entry.id,
      cacheKey: entry.cache_key,
      type: entry.cache_type,
      createdAt: entry.created_at,
      expiresAt: entry.expires_at,
      accessCount: entry.access_count,
      lastAccessed: entry.last_accessed,
      metadata: {
        modelId: entry.metadata?.model_id,
        userId: entry.metadata?.user_id,
        qualityScore: entry.metadata?.quality_score,
        generationTime: entry.metadata?.generation_time,
        cost: entry.metadata?.cost,
      },
      isExpired: new Date() > new Date(entry.expires_at),
    })) || [];

    return NextResponse.json({
      success: true,
      entries: processedEntries,
      total: processedEntries.length,
      filters: {
        type,
        userId: isAdmin ? null : userId,
      },
    });

  } catch (error) {
    logger.error('Error getting cache entries', error as Error, 'AI_CACHE_API');
    throw error;
  }
}
