# Outrank.so Webhook Integration

This document describes the implementation of the Outrank.so webhook integration for receiving and storing published articles.

## 🚀 Quick Setup

### 1. Environment Configuration

Add the following environment variable to your `.env.local` file:

```bash
# Outrank.so Webhook Access Token (for webhook authentication)
OUTRANK_WEBHOOK_ACCESS_TOKEN=your_secure_outrank_access_token_here
```

### 2. Database Setup

Run the SQL script to create the articles table:

```bash
# Execute the SQL file in your Supabase SQL editor
cat database/add-outrank-articles-table.sql
```

Or run it directly in Supabase SQL editor.

### 3. Configure Outrank.so Webhook

In your Outrank.so dashboard, set up the webhook with:

- **Integration Name**: `coolpix-articles` (or your preferred name)
- **Webhook Endpoint**: `https://your-domain.com/api/outrank-webhook`
- **Access Token**: The same token you set in `OUTRANK_WEBHOOK_ACCESS_TOKEN`

## 📁 File Structure

```
src/
├── app/api/
│   ├── outrank-webhook/
│   │   └── route.ts              # Main webhook endpoint
│   └── articles/
│       ├── route.ts              # Articles API (list, tags, stats)
│       └── [slug]/
│           └── route.ts          # Individual article by slug
├── types/
│   └── outrank.ts               # TypeScript interfaces
└── utils/
    └── articleManager.ts        # Article management utilities

database/
└── add-outrank-articles-table.sql  # Database schema
```

## 🔧 API Endpoints

### Webhook Endpoint

**POST** `/api/outrank-webhook`

Receives article publication notifications from Outrank.so.

**Authentication**: Bearer token in Authorization header

**Request Body**:
```json
{
  "event_type": "publish_articles",
  "timestamp": "2023-04-01T12:00:00Z",
  "data": {
    "articles": [
      {
        "id": "123456",
        "title": "How to Implement Webhooks",
        "content_markdown": "Webhooks are a powerful...",
        "content_html": "<p>Webhooks are a powerful...</p>",
        "meta_description": "Learn how to implement webhooks",
        "created_at": "2023-03-31T10:30:00Z",
        "image_url": "https://example.com/image.jpg",
        "slug": "how-to-implement-webhooks",
        "tags": ["webhooks", "integration", "api"]
      }
    ]
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Processed 1/1 articles successfully",
  "processed_articles": 1,
  "timestamp": "2023-04-01T12:00:00Z"
}
```

### Articles API

**GET** `/api/articles?action=list`

Retrieve articles with optional filtering and pagination.

**Query Parameters**:
- `limit` (default: 10) - Number of articles to return
- `offset` (default: 0) - Number of articles to skip
- `search` - Search in title and meta description
- `tags` - Comma-separated list of tags to filter by
- `dateFrom` - Filter articles from this date (ISO format)
- `dateTo` - Filter articles to this date (ISO format)

**GET** `/api/articles?action=tags`

Get all unique tags from articles.

**GET** `/api/articles?action=stats`

Get article statistics (total count, recent articles, top tags).

**GET** `/api/articles/[slug]`

Get a specific article by its slug.

## 🗄️ Database Schema

The `articles` table stores all received articles with the following structure:

```sql
CREATE TABLE public.articles (
    id UUID PRIMARY KEY,
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

## 🔒 Security Features

- **Bearer Token Authentication**: All webhook requests must include a valid access token
- **Row Level Security (RLS)**: Database policies ensure proper access control
- **Input Validation**: All incoming data is validated before storage
- **Error Handling**: Comprehensive error handling with detailed logging

## 🛠️ Usage Examples

### Fetching Articles in Your Frontend

```typescript
// Get latest articles
const response = await fetch('/api/articles?action=list&limit=5');
const { data } = await response.json();
console.log(data.articles);

// Search articles
const searchResponse = await fetch('/api/articles?action=list&search=webhook');
const searchData = await searchResponse.json();

// Get article by slug
const articleResponse = await fetch('/api/articles/how-to-implement-webhooks');
const article = await articleResponse.json();
```

### Using Article Manager Utilities

```typescript
import { getArticles, getArticleBySlug } from '@/utils/articleManager';

// Server-side usage
const articles = await getArticles({ limit: 10, tags: ['api'] });
const article = await getArticleBySlug('webhook-guide');
```

## 🧪 Testing

### Test Webhook Endpoint

```bash
curl -X POST https://your-domain.com/api/outrank-webhook \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "publish_articles",
    "timestamp": "2023-04-01T12:00:00Z",
    "data": {
      "articles": [{
        "id": "test-123",
        "title": "Test Article",
        "content_markdown": "# Test Content",
        "content_html": "<h1>Test Content</h1>",
        "meta_description": "Test article description",
        "created_at": "2023-04-01T10:00:00Z",
        "image_url": "https://example.com/test.jpg",
        "slug": "test-article",
        "tags": ["test"]
      }]
    }
  }'
```

### Check Webhook Configuration

```bash
curl https://your-domain.com/api/outrank-webhook
```

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that `OUTRANK_WEBHOOK_ACCESS_TOKEN` matches the token configured in Outrank.so
2. **500 Internal Server Error**: Verify database connection and that the articles table exists
3. **400 Bad Request**: Ensure the webhook payload matches the expected format

### Monitoring

Check your application logs for webhook processing details:
- `🔔 Outrank webhook received` - Webhook request received
- `📝 Processing X articles` - Number of articles being processed
- `✅ Successfully processed X/Y articles` - Processing results
- `❌ Errors: [...]` - Any processing errors

## 📊 Performance Considerations

- Articles are upserted using `outrank_article_id` to handle duplicates
- Database indexes are created for optimal query performance
- Batch processing handles multiple articles efficiently
- Error handling ensures partial failures don't block successful articles

## 🔄 Future Enhancements

Potential improvements for the integration:

1. **Webhook Retry Logic**: Implement retry mechanism for failed deliveries
2. **Article Versioning**: Track article updates and maintain version history
3. **Content Processing**: Add content analysis, SEO scoring, or AI enhancement
4. **Notification System**: Send notifications when new articles are published
5. **Analytics Integration**: Track article performance and engagement metrics
