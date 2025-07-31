import { createClient } from '@/utils/supabase/server';
import { StoredArticle } from '@/types/outrank';
import { logger } from '@/utils/logger';

/**
 * Article management utilities for Outrank.so integration
 */

export interface ArticleFilters {
  limit?: number;
  offset?: number;
  tags?: string[];
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ArticleListResponse {
  articles: StoredArticle[];
  total: number;
  hasMore: boolean;
}

/**
 * Get articles with optional filtering and pagination
 */
export async function getArticles(filters: ArticleFilters = {}): Promise<ArticleListResponse | null> {
  try {
    const supabase = await createClient();
    const {
      limit = 10,
      offset = 0,
      tags,
      searchQuery,
      dateFrom,
      dateTo
    } = filters;

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('outrank_created_at', { ascending: false });

    // Apply filters
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,meta_description.ilike.%${searchQuery}%`);
    }

    if (dateFrom) {
      query = query.gte('outrank_created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('outrank_created_at', dateTo);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching articles', error, 'ARTICLE_MANAGER');
      return null;
    }

    return {
      articles: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };

  } catch (error) {
    logger.error('Exception fetching articles', error as Error, 'ARTICLE_MANAGER');
    return null;
  }
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<StoredArticle | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      logger.error('Error fetching article by slug', error, 'ARTICLE_MANAGER', { slug });
      return null;
    }

    return data;

  } catch (error) {
    logger.error('Exception fetching article by slug', error as Error, 'ARTICLE_MANAGER', { slug });
    return null;
  }
}

/**
 * Get a single article by Outrank ID
 */
export async function getArticleByOutrankId(outrankId: string): Promise<StoredArticle | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('outrank_article_id', outrankId)
      .single();

    if (error) {
      logger.error('Error fetching article by Outrank ID', error, 'ARTICLE_MANAGER', { outrankId });
      return null;
    }

    return data;

  } catch (error) {
    logger.error('Exception fetching article by Outrank ID', error as Error, 'ARTICLE_MANAGER', { outrankId });
    return null;
  }
}

/**
 * Get all unique tags from articles
 */
export async function getArticleTags(): Promise<string[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('articles')
      .select('tags');

    if (error) {
      logger.error('Error fetching article tags', error, 'ARTICLE_MANAGER');
      return [];
    }

    // Extract and flatten all tags
    const allTags = new Set<string>();
    data?.forEach(article => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach(tag => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();

  } catch (error) {
    logger.error('Exception fetching article tags', error as Error, 'ARTICLE_MANAGER');
    return [];
  }
}

/**
 * Get article statistics
 */
export async function getArticleStats(): Promise<{
  totalArticles: number;
  recentArticles: number;
  topTags: { tag: string; count: number }[];
} | null> {
  try {
    const supabase = await createClient();
    
    // Get total count
    const { count: totalArticles, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      logger.error('Error getting article count', countError, 'ARTICLE_MANAGER');
      return null;
    }

    // Get recent articles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recentArticles, error: recentError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('outrank_created_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      logger.error('Error getting recent article count', recentError, 'ARTICLE_MANAGER');
    }

    // Get all tags for statistics
    const tags = await getArticleTags();
    const { data: articlesWithTags, error: tagsError } = await supabase
      .from('articles')
      .select('tags');

    let topTags: { tag: string; count: number }[] = [];
    
    if (!tagsError && articlesWithTags) {
      const tagCounts = new Map<string, number>();
      
      articlesWithTags.forEach(article => {
        if (Array.isArray(article.tags)) {
          article.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });

      topTags = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    return {
      totalArticles: totalArticles || 0,
      recentArticles: recentArticles || 0,
      topTags
    };

  } catch (error) {
    logger.error('Exception getting article stats', error as Error, 'ARTICLE_MANAGER');
    return null;
  }
}
