# Hybrid AI Provider System for Coolpix.me

This document describes the implementation of the hybrid AI provider system that integrates both fal.ai and Leonardo AI with intelligent routing and automatic fallback capabilities.

## Overview

The hybrid AI system provides:
- **Dual Provider Support**: Both fal.ai and Leonardo AI integration
- **Intelligent Routing**: Automatic provider selection based on availability, cost, and quality
- **Automatic Fallback**: Seamless failover when primary provider is unavailable
- **Health Monitoring**: Real-time provider status tracking
- **Unified API**: Single interface for all AI operations
- **Enhanced Caching**: Cross-provider result caching
- **Backward Compatibility**: Existing API routes continue to work

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  Unified AI API  │───▶│ Provider Health │
└─────────────────┘    └──────────────────┘    │   Monitoring    │
                                │               └─────────────────┘
                                ▼
                       ┌──────────────────┐
                       │ Intelligent      │
                       │ Router           │
                       └──────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌──────────────┐        ┌──────────────┐
            │   fal.ai     │        │ Leonardo AI  │
            │   Service    │        │   Service    │
            └──────────────┘        └──────────────┘
```

## Key Components

### 1. Unified AI Service (`src/utils/unifiedAI.ts`)
- Main orchestration layer
- Provider selection logic
- Automatic fallback handling
- Request routing and response normalization

### 2. Leonardo AI Integration (`src/utils/leonardoAI.ts`)
- Complete Leonardo AI API wrapper
- Image generation, model training, video generation
- Follows same patterns as existing fal.ai integration

### 3. Provider Health Monitoring (`src/utils/providerHealthMonitoring.ts`)
- Real-time health checks every 30 seconds
- Performance metrics tracking
- Automatic failover detection
- System health reporting

### 4. Enhanced Caching (`src/utils/aiCache.ts`)
- Cross-provider result caching
- Provider health status caching
- Unified generation result caching
- Intelligent cache invalidation

### 5. Hybrid API Routes
- `/api/ai/unified-generate` - Unified image generation
- `/api/ai/unified-train` - Unified model training
- `/api/ai/provider-health` - Health monitoring endpoint

## Configuration

### Environment Variables

```bash
# AI Provider Configuration
AI_PROVIDER=unified                    # 'fal', 'leonardo', or 'unified'
AI_PRIMARY_PROVIDER=fal               # Primary provider for unified mode
AI_SECONDARY_PROVIDER=leonardo        # Secondary provider for unified mode
AI_ENABLED=true                       # Enable AI services
AI_FALLBACK_ENABLED=true             # Enable automatic fallback

# API Keys
FAL_AI_API_KEY=your_fal_api_key
LEONARDO_API_KEY=your_leonardo_api_key
```

### Service Configuration

The system automatically configures based on the `AI_PROVIDER` setting:

- **`fal`**: Use only fal.ai
- **`leonardo`**: Use only Leonardo AI  
- **`unified`**: Use both with intelligent routing (recommended)
- **`astria`**: Legacy Astria support (backward compatibility)

## Usage Examples

### Basic Image Generation

```typescript
import { unifiedAI } from '@/utils/unifiedAI';

// Generate with automatic provider selection
const result = await unifiedAI.generateImages({
  prompt: 'professional headshot of a person in business attire',
  requirements: {
    quality: 'premium',
    speed: 'standard',
    budget: 'medium'
  },
  num_images: 4
});

console.log(`Generated ${result.images.length} images using ${result.metadata.provider}`);
```

### Force Specific Provider

```typescript
// Force Leonardo AI
const result = await unifiedAI.generateImages({
  prompt: 'artistic portrait',
  provider: 'leonardo',
  num_images: 1
});
```

### Model Training

```typescript
// Train with automatic provider selection
const trainingId = await unifiedAI.trainModel({
  images: ['url1', 'url2', 'url3'],
  name: 'custom_model',
  trigger_word: 'myface'
});
```

### Health Monitoring

```typescript
import { healthMonitor } from '@/utils/providerHealthMonitoring';

// Get system health
const health = healthMonitor.getSystemHealth();
console.log(`System status: ${health.overall}`);

// Get specific provider metrics
const falMetrics = healthMonitor.getProviderMetrics('fal');
console.log(`Fal.ai status: ${falMetrics?.status}`);
```

## API Endpoints

### Unified Generation
```http
POST /api/ai/unified-generate
Content-Type: application/json

{
  "prompt": "professional headshot",
  "requirements": {
    "quality": "premium",
    "speed": "standard", 
    "budget": "medium"
  },
  "options": {
    "num_images": 4,
    "image_size": "portrait"
  }
}
```

### Provider Health
```http
GET /api/ai/provider-health
GET /api/ai/provider-health?provider=fal&detailed=true
```

### Unified Training
```http
POST /api/ai/unified-train
Content-Type: application/json

{
  "images": ["url1", "url2"],
  "name": "my_model",
  "trigger_word": "myface",
  "description": "Custom model description"
}
```

## Monitoring and Analytics

### Health Metrics
- Response times for each provider
- Success/failure rates
- Consecutive failure counts
- Uptime percentages
- Error categorization

### Performance Tracking
- Generation times by provider
- Cost analysis
- Quality scores
- Cache hit rates
- Fallback frequency

### System Health Levels
- **Healthy**: All providers online
- **Degraded**: One provider down or slow
- **Critical**: All providers offline

## Deployment

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Set your API keys
FAL_AI_API_KEY=your_fal_key
LEONARDO_API_KEY=your_leonardo_key

# Configure for unified mode
AI_PROVIDER=unified
AI_PRIMARY_PROVIDER=fal
AI_SECONDARY_PROVIDER=leonardo
```

### 2. Vercel Deployment
```bash
# Set environment variables in Vercel
vercel env add AI_PROVIDER production
vercel env add AI_PRIMARY_PROVIDER production
vercel env add AI_SECONDARY_PROVIDER production
vercel env add FAL_AI_API_KEY production
vercel env add LEONARDO_API_KEY production
```

### 3. Initialize System
The system auto-initializes in production. For manual initialization:

```typescript
import { initializeAISystem } from '@/utils/initializeAI';

await initializeAISystem();
```

## Troubleshooting

### Common Issues

1. **Provider Always Offline**
   - Check API keys are correct
   - Verify network connectivity
   - Check rate limits

2. **Fallback Not Working**
   - Ensure `AI_FALLBACK_ENABLED=true`
   - Check both providers have valid API keys
   - Verify secondary provider is different from primary

3. **Slow Response Times**
   - Check provider health metrics
   - Consider adjusting health check intervals
   - Review cache hit rates

### Debug Commands

```typescript
// Check system status
import { getAISystemStatus } from '@/utils/initializeAI';
console.log(getAISystemStatus());

// Force health check
import { healthMonitor } from '@/utils/providerHealthMonitoring';
await healthMonitor.forceHealthCheck();

// Get cache statistics
import { getAllCacheStats } from '@/utils/aiCache';
console.log(getAllCacheStats());
```

## Migration from Single Provider

The hybrid system is backward compatible. Existing code will continue to work while gaining the benefits of the unified system.

### Gradual Migration
1. Deploy with `AI_PROVIDER=fal` (no changes)
2. Add Leonardo API key
3. Switch to `AI_PROVIDER=unified`
4. Monitor health dashboard
5. Optimize based on usage patterns

## Future Enhancements

- Additional AI providers (Midjourney, DALL-E, etc.)
- Advanced load balancing algorithms
- Cost optimization recommendations
- A/B testing between providers
- Custom model deployment
- Real-time quality assessment
