-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_outrank_id ON public.articles(outrank_article_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(outrank_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_received_at ON public.articles(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
