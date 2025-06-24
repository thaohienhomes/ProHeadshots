require('dotenv').config({ path: '.env.local' });
const { fal } = require('@fal-ai/client');

// Configure Fal AI client
fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

async function testFalAI() {
  console.log('🧪 Testing Fal AI Integration...');
  
  try {
    // Check if Fal AI API key is configured
    if (!process.env.FAL_AI_API_KEY) {
      throw new Error('FAL_AI_API_KEY not configured');
    }
    
    console.log('✅ Fal AI API key configured');
    
    // Test basic image generation
    console.log('Testing basic image generation...');
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: "A beautiful sunset over mountains",
        num_images: 1,
        image_size: "square_hd",
      },
    });
    
    if (result && result.data && result.data.images && result.data.images.length > 0) {
      console.log('✅ Image generation successful');
      console.log(`   Generated image URL: ${result.data.images[0].url}`);
    } else {
      throw new Error('Image generation failed or returned unexpected format');
    }
    
    console.log('All tests passed! Fal AI integration is working correctly.');
    return true;
  } catch (error) {
    console.error('❌ Fal AI test failed:', error.message);
    return false;
  }
}

testFalAI().then(success => {
  if (!success) {
    process.exit(1);
  }
});