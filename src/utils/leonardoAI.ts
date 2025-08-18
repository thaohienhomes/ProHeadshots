// Leonardo AI service utility for Coolpix.me
// Follows the same patterns as falAI.ts for consistency

// Leonardo AI API configuration
const LEONARDO_API_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1';

// Supported AI models on Leonardo AI
export const LEONARDO_AI_MODELS = {
  'leonardo-phoenix': 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Phoenix (Photorealistic)
  'leonardo-diffusion-xl': '1e60896f-3c26-4296-8ecc-53e2afecc132', // Leonardo Diffusion XL
  'leonardo-vision-xl': 'cd2b2a15-9760-4174-a5ff-4d2925057376', // Leonardo Vision XL
  'photoreal': 'ac614f96-1082-45bf-be9d-757f2d31c174', // PhotoReal
  'dreamshaper-v7': 'ac614f96-1082-45bf-be9d-757f2d31c174', // DreamShaper v7
  'absolute-reality': '1e60896f-3c26-4296-8ecc-53e2afecc132', // Absolute Reality
} as const;

export type LeonardoAIModelId = keyof typeof LEONARDO_AI_MODELS;

export interface LeonardoAIImageGenerationInput {
  prompt: string;
  model?: LeonardoAIModelId;
  num_images?: number;
  width?: number;
  height?: number;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  scheduler?: string;
  negative_prompt?: string;
  init_image_id?: string;
  init_strength?: number;
  preset_style?: string;
}

export interface LeonardoAIImageGenerationResult {
  sdGenerationJob: {
    generationId: string;
    apiCreditCost: number;
  };
}

export interface LeonardoAIGenerationStatus {
  generations_by_pk: {
    id: string;
    status: 'PENDING' | 'COMPLETE' | 'FAILED';
    imageUrl?: string;
    generated_images: Array<{
      id: string;
      url: string;
      likeCount: number;
      nsfw: boolean;
    }>;
    modelId: string;
    prompt: string;
    negativePrompt?: string;
    seed: number;
    public: boolean;
    scheduler: string;
    sdVersion: string;
    status: string;
    presetStyle?: string;
    initStrength?: number;
    guidanceScale: number;
    inferenceSteps: number;
    createdAt: string;
  };
}

export interface LeonardoAITrainingInput {
  images: string[]; // Array of image URLs or IDs
  name: string;
  description?: string;
  modelType?: 'GENERAL' | 'PORTRAIT' | 'ANIME' | 'PHOTOREALISTIC';
  nsfw?: boolean;
  webhook_url?: string;
  instance_prompt?: string;
  resolution?: number;
}

export interface LeonardoAITrainingResult {
  sdTrainingJob: {
    customModelId: string;
    apiCreditCost: number;
  };
}

/**
 * Make authenticated request to Leonardo AI API
 */
async function makeRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<any> {
  const apiKey = process.env.LEONARDO_API_KEY;
  
  if (!apiKey) {
    throw new Error('LEONARDO_API_KEY environment variable is not set');
  }

  const url = `${LEONARDO_API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Leonardo AI API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Leonardo AI API request failed:`, error);
    throw error;
  }
}

/**
 * Upload images to Leonardo AI for training
 */
export async function uploadImages(imagePaths: string[]): Promise<string[]> {
  try {
    const uploadedIds: string[] = [];
    
    for (const imagePath of imagePaths) {
      // Get file extension
      const extension = imagePath.split('.').pop() || 'jpg';
      
      // Initialize image upload
      const initResponse = await makeRequest('/init-image', 'POST', {
        extension: extension
      });
      
      // Upload to presigned URL
      const uploadResponse = await fetch(initResponse.uploadInitImage.url, {
        method: 'PUT',
        body: await fetch(imagePath).then(r => r.blob()),
        headers: {
          'Content-Type': `image/${extension}`,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
      }
      
      uploadedIds.push(initResponse.uploadInitImage.id);
    }
    
    return uploadedIds;
  } catch (error) {
    console.error('Error uploading images to Leonardo AI:', error);
    throw error;
  }
}

/**
 * Create a dataset from uploaded images
 */
export async function createDataset(name: string, imageIds: string[]): Promise<string> {
  try {
    const response = await makeRequest('/datasets', 'POST', {
      name,
      description: `Training dataset for ${name}`,
      images: imageIds
    });
    
    return response.insert_datasets_one.id;
  } catch (error) {
    console.error('Error creating dataset:', error);
    throw error;
  }
}

/**
 * Train a custom model using Leonardo AI
 */
export async function trainModel(input: LeonardoAITrainingInput): Promise<string> {
  try {
    // First upload images if they are URLs
    const imageIds = await uploadImages(input.images);
    
    // Create dataset
    const datasetId = await createDataset(input.name, imageIds);
    
    // Start training
    const response = await makeRequest('/models', 'POST', {
      name: input.name,
      description: input.description || `Custom AI model for ${input.name}`,
      datasetId: datasetId,
      instance_prompt: input.instance_prompt || 'photo of sks person',
      modelType: input.modelType || 'PORTRAIT',
      nsfw: input.nsfw || false,
      resolution: input.resolution || 768,
      sd_Version: 'SDXL_0_9',
      strengthType: 'MEDIUM',
      stylePreset: 'PHOTOREALISTIC'
    });
    
    return response.sdTrainingJob.customModelId;
  } catch (error) {
    console.error('Error training model with Leonardo AI:', error);
    throw error;
  }
}

/**
 * Generate images using Leonardo AI
 */
export async function generateImages(input: LeonardoAIImageGenerationInput): Promise<LeonardoAIImageGenerationResult> {
  try {
    const modelId = input.model ? LEONARDO_AI_MODELS[input.model] : LEONARDO_AI_MODELS['leonardo-phoenix'];
    
    const requestBody = {
      prompt: input.prompt,
      modelId: modelId,
      num_images: input.num_images || 1,
      width: input.width || 768,
      height: input.height || 768,
      num_inference_steps: input.num_inference_steps || 30,
      guidance_scale: input.guidance_scale || 7,
      scheduler: input.scheduler || 'EULER_DISCRETE',
      public: false,
      tiling: false,
      negative_prompt: input.negative_prompt || 'bad quality, blurry, distorted',
      ...(input.init_image_id && { init_image_id: input.init_image_id }),
      ...(input.init_strength && { init_strength: input.init_strength }),
      ...(input.preset_style && { presetStyle: input.preset_style }),
      ...(input.seed && { seed: input.seed }),
    };

    const response = await makeRequest('/generations', 'POST', requestBody);
    
    return response;
  } catch (error) {
    console.error('Error generating images with Leonardo AI:', error);
    throw error;
  }
}

/**
 * Check generation status
 */
export async function checkGenerationStatus(generationId: string): Promise<LeonardoAIGenerationStatus> {
  try {
    const response = await makeRequest(`/generations/${generationId}`);
    return response;
  } catch (error) {
    console.error('Error checking generation status:', error);
    throw error;
  }
}

/**
 * Wait for generation to complete
 */
export async function waitForGeneration(generationId: string, maxAttempts: number = 60): Promise<string[]> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkGenerationStatus(generationId);
    
    if (status.generations_by_pk.status === 'COMPLETE') {
      return status.generations_by_pk.generated_images.map(img => img.url);
    }
    
    if (status.generations_by_pk.status === 'FAILED') {
      throw new Error('Generation failed');
    }
    
    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Generation timeout');
}

/**
 * Check training status
 */
export async function checkTrainingStatus(modelId: string) {
  try {
    const response = await makeRequest(`/models/${modelId}`);
    return response.custom_models_by_pk;
  } catch (error) {
    console.error('Error checking training status:', error);
    throw error;
  }
}

/**
 * Get user information and credits
 */
export async function getUserInfo() {
  try {
    const response = await makeRequest('/me');
    return response;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}

/**
 * Health check for Leonardo AI service
 */
export async function healthCheck(): Promise<boolean> {
  // Skip health check during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    console.log('Skipping Leonardo AI health check during build time');
    return true; // Return true to avoid blocking build
  }

  try {
    await getUserInfo();
    return true;
  } catch (error) {
    console.error('Leonardo AI health check failed:', error);
    return false;
  }
}

/**
 * Upload a file to Leonardo AI storage
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    const extension = file.name.split('.').pop() || 'jpg';

    // Initialize image upload
    const initResponse = await makeRequest('/init-image', 'POST', {
      extension: extension
    });

    // Upload to presigned URL
    const uploadResponse = await fetch(initResponse.uploadInitImage.url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    return initResponse.uploadInitImage.id;
  } catch (error) {
    console.error('Error uploading file to Leonardo AI:', error);
    throw error;
  }
}

/**
 * Generate video from image using Leonardo Motion
 */
export async function generateVideo(imageId: string, motionStrength: number = 5): Promise<any> {
  try {
    const response = await makeRequest('/generations-motion-svd', 'POST', {
      imageId: imageId,
      motionStrength: motionStrength,
      visibility: 'PRIVATE'
    });

    return response;
  } catch (error) {
    console.error('Error generating video with Leonardo AI:', error);
    throw error;
  }
}

/**
 * Try-on clothes using img2img (Leonardo doesn't have native try-on)
 */
export async function tryOnClothes(personImageId: string, clothingImageId: string): Promise<LeonardoAIImageGenerationResult> {
  try {
    return await generateImages({
      prompt: 'person wearing the outfit, professional photo, high quality',
      init_image_id: personImageId,
      init_strength: 0.5,
      guidance_scale: 8,
      num_inference_steps: 40,
      negative_prompt: 'bad quality, blurry, distorted, deformed, low resolution'
    });
  } catch (error) {
    console.error('Error with try-on clothes:', error);
    throw error;
  }
}

/**
 * Generate images with multiple models in parallel
 */
export async function generateWithMultipleModels(
  prompt: string,
  models: LeonardoAIModelId[],
  options: Partial<LeonardoAIImageGenerationInput> = {}
): Promise<{ model: LeonardoAIModelId; result: LeonardoAIImageGenerationResult | Error }[]> {
  const promises = models.map(async (model) => {
    try {
      const result = await generateImages({
        prompt,
        model,
        ...options,
      });
      return { model, result };
    } catch (error) {
      return { model, result: error as Error };
    }
  });

  return Promise.all(promises);
}

/**
 * Get model capabilities and pricing information
 */
export function getModelInfo(modelId: LeonardoAIModelId) {
  const modelInfo = {
    'leonardo-phoenix': {
      name: 'Leonardo Phoenix',
      description: 'Photorealistic model with exceptional detail and lighting',
      maxResolution: '2K',
      avgProcessingTime: '2-4 minutes',
      features: ['Photorealistic', 'Professional Lighting', 'High Detail'],
      pricing: 'Premium',
      costPerImage: 0.02,
    },
    'leonardo-diffusion-xl': {
      name: 'Leonardo Diffusion XL',
      description: 'High-quality general purpose model',
      maxResolution: '2K',
      avgProcessingTime: '1-3 minutes',
      features: ['High Quality', 'Versatile', 'Consistent Results'],
      pricing: 'Standard',
      costPerImage: 0.015,
    },
    'leonardo-vision-xl': {
      name: 'Leonardo Vision XL',
      description: 'Advanced model with superior visual understanding',
      maxResolution: '3K',
      avgProcessingTime: '2-5 minutes',
      features: ['Advanced Vision', 'Superior Quality', 'Complex Scenes'],
      pricing: 'Premium',
      costPerImage: 0.025,
    },
    'photoreal': {
      name: 'PhotoReal',
      description: 'Ultra-realistic photography style generation',
      maxResolution: '2K',
      avgProcessingTime: '3-6 minutes',
      features: ['Ultra Realistic', 'Photography Style', 'Natural Lighting'],
      pricing: 'Premium',
      costPerImage: 0.03,
    },
    'dreamshaper-v7': {
      name: 'DreamShaper v7',
      description: 'Artistic and creative image generation',
      maxResolution: '2K',
      avgProcessingTime: '1-2 minutes',
      features: ['Artistic Style', 'Creative Effects', 'Fast Processing'],
      pricing: 'Standard',
      costPerImage: 0.012,
    },
    'absolute-reality': {
      name: 'Absolute Reality',
      description: 'Hyper-realistic model for professional headshots',
      maxResolution: '2K',
      avgProcessingTime: '2-4 minutes',
      features: ['Hyper Realistic', 'Professional Quality', 'Portrait Focused'],
      pricing: 'Premium',
      costPerImage: 0.022,
    },
  };

  return modelInfo[modelId];
}

/**
 * Calculate estimated cost for generation
 */
export function calculateGenerationCost(
  modelId: LeonardoAIModelId,
  numImages: number = 1
): number {
  const modelInfo = getModelInfo(modelId);
  return modelInfo.costPerImage * numImages;
}

/**
 * Get available models sorted by cost
 */
export function getModelsByCost(): Array<{ modelId: LeonardoAIModelId; cost: number }> {
  return Object.keys(LEONARDO_AI_MODELS).map(modelId => ({
    modelId: modelId as LeonardoAIModelId,
    cost: getModelInfo(modelId as LeonardoAIModelId).costPerImage
  })).sort((a, b) => a.cost - b.cost);
}

/**
 * Get recommended model based on requirements
 */
export function getRecommendedModel(
  quality: 'basic' | 'standard' | 'premium',
  speed: 'fast' | 'standard' | 'slow',
  budget: 'low' | 'medium' | 'high'
): LeonardoAIModelId {
  if (budget === 'low') {
    return 'dreamshaper-v7';
  }

  if (quality === 'premium' && budget === 'high') {
    return speed === 'fast' ? 'leonardo-phoenix' : 'photoreal';
  }

  if (quality === 'standard') {
    return speed === 'fast' ? 'leonardo-diffusion-xl' : 'absolute-reality';
  }

  return 'leonardo-phoenix'; // Default fallback
}
