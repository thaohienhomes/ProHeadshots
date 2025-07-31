# Supabase Setup for Outrank.so Integration

Follow these steps to set up the database tables for the Outrank.so webhook integration.

## 🚀 Step-by-Step Setup

### Step 1: Create the Articles Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Create the articles table
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
```

5. Click **Run** to execute

### Step 2: Create Indexes

Create a new query and run:

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_outrank_id ON public.articles(outrank_article_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(outrank_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_received_at ON public.articles(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN(tags);
```

### Step 3: Create Trigger Function

Create a new query and run:

```sql
-- Create trigger function and trigger for updated_at
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_updated_at();
```

### Step 4: Set Up Security Policies

Create a new query and run:

```sql
-- Enable Row Level Security and create policies
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
```

### Step 5: Create Public View

Create a new query and run:

```sql
-- Create public view for articles
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
```

## ✅ Verification

After running all the steps, verify the setup:

1. Go to **Table Editor** in Supabase
2. You should see the `articles` table listed
3. Click on the table to see its structure
4. Check that all columns are present and properly configured

## 🔧 Alternative: Use Individual Files

If you prefer to run the SQL files individually, use these files in order:

1. `database/outrank-articles-simple.sql` - Creates the table
2. `database/outrank-articles-indexes.sql` - Creates indexes
3. `database/outrank-articles-triggers.sql` - Creates triggers
4. `database/outrank-articles-security.sql` - Sets up security
5. `database/outrank-articles-view.sql` - Creates the public view

## 🚨 Troubleshooting

### Common Issues:

1. **Syntax Error**: Make sure you're copying the SQL exactly as shown
2. **Permission Error**: Ensure you're logged in as the database owner
3. **Table Already Exists**: The `IF NOT EXISTS` clause should handle this, but you can drop the table first if needed

### If You Need to Start Over:

```sql
-- Drop everything and start fresh
DROP VIEW IF EXISTS public.articles_public;
DROP TABLE IF EXISTS public.articles CASCADE;
```

Then run through the steps again.

## 📊 Test the Setup

Once complete, you can test by running:

```sql
-- Test insert (this should work with service role)
INSERT INTO public.articles (
    outrank_article_id,
    title,
    content_markdown,
    content_html,
    meta_description,
    slug,
    tags,
    outrank_created_at
) VALUES (
    'test-123',
    'Test Article',
    '# Test Content',
    '<h1>Test Content</h1>',
    'Test description',
    'test-article',
    '["test"]',
    NOW()
);

-- Test select (this should work for everyone)
SELECT * FROM public.articles_public;
```

The setup is now complete and ready for the Outrank.so webhook integration!
