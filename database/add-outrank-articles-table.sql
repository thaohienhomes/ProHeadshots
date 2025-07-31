-- Outrank.so Articles Table for Webhook Integration
-- Run this to add article storage capabilities for Outrank.so webhook

-- 1. Articles Table for storing published articles from Outrank.so
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outrank_article_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    content_html TEXT NOT NULL,
    meta_description TEXT,
    image_url TEXT,
    slug TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    outrank_created_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_outrank_id ON public.articles(outrank_article_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(outrank_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_received_at ON public.articles(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);

-- 3. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for RLS
-- Allow public read access to articles (for displaying on website)
CREATE POLICY "Articles are publicly readable" ON public.articles
    FOR SELECT USING (true);

-- Only allow system/admin to insert/update articles (webhook only)
-- This will be handled by the webhook endpoint using service role key
CREATE POLICY "Only system can modify articles" ON public.articles
    FOR ALL USING (false);

-- 7. Grant necessary permissions
-- Grant select to authenticated users
GRANT SELECT ON public.articles TO authenticated;
GRANT SELECT ON public.articles TO anon;

-- Grant all permissions to service role (for webhook)
GRANT ALL ON public.articles TO service_role;

-- 8. Create a view for public article access with computed fields
CREATE OR REPLACE VIEW public.articles_public AS
SELECT 
    id,
    title,
    content_html,
    meta_description,
    image_url,
    slug,
    tags,
    outrank_created_at as published_at,
    created_at
FROM public.articles
ORDER BY outrank_created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.articles_public TO authenticated;
GRANT SELECT ON public.articles_public TO anon;

-- 9. Add comments for documentation
COMMENT ON TABLE public.articles IS 'Articles received from Outrank.so webhook integration';
COMMENT ON COLUMN public.articles.outrank_article_id IS 'Unique identifier from Outrank.so';
COMMENT ON COLUMN public.articles.content_markdown IS 'Article content in Markdown format';
COMMENT ON COLUMN public.articles.content_html IS 'Article content in HTML format';
COMMENT ON COLUMN public.articles.tags IS 'JSON array of article tags';
COMMENT ON COLUMN public.articles.outrank_created_at IS 'When the article was created in Outrank.so';
COMMENT ON COLUMN public.articles.received_at IS 'When we received the webhook notification';
