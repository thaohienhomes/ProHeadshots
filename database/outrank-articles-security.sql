-- Step 4: Enable Row Level Security and create policies
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to articles
CREATE POLICY "Articles are publicly readable" ON public.articles
    FOR SELECT USING (true);

-- Only allow system/admin to insert/update articles (webhook only)
CREATE POLICY "Only system can modify articles" ON public.articles
    FOR ALL USING (false);

-- Grant necessary permissions
GRANT SELECT ON public.articles TO authenticated;
GRANT SELECT ON public.articles TO anon;
GRANT ALL ON public.articles TO service_role;
