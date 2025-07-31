-- Simple Outrank Articles Table Creation
-- Run this step by step in Supabase SQL Editor

-- Step 1: Create the articles table
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
