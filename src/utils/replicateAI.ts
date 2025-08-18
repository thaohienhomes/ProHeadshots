import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Supported SDXL models on Replicate
export const REPLICATE_MODELS = {
  'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  'sdxl-lightning': 'bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f',
  'flux-dev': 'black-forest-labs/flux-dev:6ac11feee32c3668b8b3b3b5b0b8b5b5b0b8b5b5b0b8b5b5b0b8b5b5b0b8b5b5',
  'flux-schnell': 'black-forest-labs/flux-schnell:bf2f2b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c4b4c',
  'sdxl-training': 'ostris/flux-dev-lora-trainer:e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497',
} as const;

export type ReplicateModel = keyof typeof REPLICATE_MODELS;

// Input types for Replicate API
export interface ReplicateImageGenerationInput {
  prompt: string;
  model?: ReplicateModel;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  scheduler?: string;
  seed?: number;
  lora_scale?: number;
  lora_url?: string;
}

export interface ReplicateTrainingInput {
  input_images: string; // ZIP file URL containing training images
  trigger_word: string;
  max_train_steps?: number;
  learning_rate?: number;
  batch_size?: number;
  resolution?: number;
  seed?: number;
  autocaption?: boolean;
  webhook?: string;
}

export interface ReplicateImageGenerationResult {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  urls?: string[];
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
}

export interface ReplicateTrainingResult {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: {
    weights: string; // URL to trained model weights
  };
  error?: string;
  logs?: string;
}

/**
 * Generate images using Replicate SDXL models
 */
export async function generateImages(input: ReplicateImageGenerationInput): Promise<ReplicateImageGenerationResult> {
  try {
    const modelId = REPLICATE_MODELS[input.model || 'sdxl'];
    
    const prediction = await replicate.predictions.create({
      version: modelId,
      input: {
        prompt: input.prompt,
        negative_prompt: input.negative_prompt || 'blurry, low quality, distorted',
        width: input.width || 1024,
        height: input.height || 1024,
        num_outputs: input.num_outputs || 1,
        num_inference_steps: input.num_inference_steps || 25,
        guidance_scale: input.guidance_scale || 7.5,
        scheduler: input.scheduler || 'K_EULER',
        seed: input.seed,
        ...(input.lora_url && input.lora_scale && {
          lora_scale: input.lora_scale,
          lora_url: input.lora_url,
        }),
      },
    });

    return {
      id: prediction.id,
      status: prediction.status as any,
      urls: prediction.output as string[],
      error: prediction.error?.toString(),
      logs: prediction.logs,
      metrics: prediction.metrics,
    };
  } catch (error) {
    console.error('Error generating images with Replicate:', error);
    throw error;
  }
}

/**
 * Train a LoRA model using Replicate
 */
export async function trainModel(input: ReplicateTrainingInput): Promise<ReplicateTrainingResult> {
  try {
    const modelId = REPLICATE_MODELS['sdxl-training'];
    
    const training = await replicate.trainings.create({
      version: modelId,
      input: {
        input_images: input.input_images,
        trigger_word: input.trigger_word,
        max_train_steps: input.max_train_steps || 1000,
        learning_rate: input.learning_rate || 1e-4,
        batch_size: input.batch_size || 1,
        resolution: input.resolution || 1024,
        seed: input.seed || 42,
        autocaption: input.autocaption !== false,
      },
      webhook: input.webhook,
    });

    return {
      id: training.id,
      status: training.status as any,
      output: training.output as any,
      error: training.error?.toString(),
      logs: training.logs,
    };
  } catch (error) {
    console.error('Error training model with Replicate:', error);
    throw error;
  }
}

/**
 * Get prediction status
 */
export async function getPredictionStatus(predictionId: string): Promise<ReplicateImageGenerationResult> {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    
    return {
      id: prediction.id,
      status: prediction.status as any,
      urls: prediction.output as string[],
      error: prediction.error?.toString(),
      logs: prediction.logs,
      metrics: prediction.metrics,
    };
  } catch (error) {
    console.error('Error getting prediction status:', error);
    throw error;
  }
}

/**
 * Get training status
 */
export async function getTrainingStatus(trainingId: string): Promise<ReplicateTrainingResult> {
  try {
    const training = await replicate.trainings.get(trainingId);
    
    return {
      id: training.id,
      status: training.status as any,
      output: training.output as any,
      error: training.error?.toString(),
      logs: training.logs,
    };
  } catch (error) {
    console.error('Error getting training status:', error);
    throw error;
  }
}

/**
 * Cancel a prediction
 */
export async function cancelPrediction(predictionId: string): Promise<void> {
  try {
    await replicate.predictions.cancel(predictionId);
  } catch (error) {
    console.error('Error canceling prediction:', error);
    throw error;
  }
}

/**
 * Health check for Replicate service
 */
export async function healthCheck(): Promise<boolean> {
  // Skip health check during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    console.log('Skipping Replicate health check during build time');
    return true;
  }

  try {
    // Simple test to check if API is accessible
    const models = await replicate.models.list();
    return Array.isArray(models.results);
  } catch (error) {
    console.error('Replicate health check failed:', error);
    return false;
  }
}

/**
 * Upload file to Replicate (for training data)
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    // Note: Replicate doesn't have direct file upload like Fal.ai
    // You'll need to upload to your own storage (S3, etc.) and provide URL
    throw new Error('Direct file upload not supported. Upload to S3/storage and provide URL.');
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Generate images with a trained LoRA model
 */
export async function generateWithLora(
  prompt: string,
  loraUrl: string,
  options: Partial<ReplicateImageGenerationInput> = {}
): Promise<ReplicateImageGenerationResult> {
  return generateImages({
    prompt,
    model: 'sdxl',
    lora_url: loraUrl,
    lora_scale: options.lora_scale || 1.0,
    ...options,
  });
}

/**
 * Get model information
 */
export function getModelInfo(model: ReplicateModel) {
  const modelConfigs = {
    'sdxl': {
      name: 'Stable Diffusion XL',
      description: 'High-quality image generation with SDXL',
      maxResolution: 1024,
      supportedSizes: ['1024x1024', '1152x896', '896x1152', '1216x832', '832x1216'],
      estimatedCost: 0.0025, // per image
    },
    'sdxl-lightning': {
      name: 'SDXL Lightning',
      description: 'Fast 4-step SDXL generation',
      maxResolution: 1024,
      supportedSizes: ['1024x1024'],
      estimatedCost: 0.001, // per image
    },
    'flux-dev': {
      name: 'FLUX.1 [dev]',
      description: 'State-of-the-art image generation',
      maxResolution: 1024,
      supportedSizes: ['1024x1024', '1152x896', '896x1152'],
      estimatedCost: 0.003, // per image
    },
    'flux-schnell': {
      name: 'FLUX.1 [schnell]',
      description: 'Fast FLUX generation',
      maxResolution: 1024,
      supportedSizes: ['1024x1024'],
      estimatedCost: 0.001, // per image
    },
    'sdxl-training': {
      name: 'SDXL LoRA Training',
      description: 'Train custom LoRA models',
      maxResolution: 1024,
      supportedSizes: ['512x512', '768x768', '1024x1024'],
      estimatedCost: 0.008, // per training step
    },
  };

  return modelConfigs[model];
}
