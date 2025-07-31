/**
 * TypeScript interfaces for Outrank.so webhook integration
 */

export interface OutrankArticle {
  id: string;
  title: string;
  content_markdown: string;
  content_html: string;
  meta_description: string;
  created_at: string; // ISO 8601 format
  image_url: string;
  slug: string;
  tags: string[];
}

export interface OutrankWebhookPayload {
  event_type: 'publish_articles';
  timestamp: string; // ISO 8601 format
  data: {
    articles: OutrankArticle[];
  };
}

export interface StoredArticle {
  id: string;
  outrank_article_id: string;
  title: string;
  content_markdown: string;
  content_html: string;
  meta_description: string | null;
  image_url: string | null;
  slug: string;
  tags: string[];
  outrank_created_at: string;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  processed_articles?: number;
  errors?: string[];
  timestamp: string;
}
