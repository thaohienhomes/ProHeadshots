-- Step 5: Create public view for articles
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
