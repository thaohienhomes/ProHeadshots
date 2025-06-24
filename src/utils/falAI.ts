import { fal } from "@fal-ai/client";

// Configure Fal AI client
fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

// Supported AI models on Fal.ai
export const FAL_AI_MODELS = {
  'flux-pro-ultra': 'fal-ai/flux-pro/v1.1-ultra',
  'flux-pro': 'fal-ai/flux-pro',
  'flux-dev': 'fal-ai/flux/dev',
  'imagen4': 'fal-ai/imagen4', // Note: May not be available, using as example
  'recraft-v3': 'fal-ai/recraft-v3', // Note: May not be available, using as example
  'aura-sr': 'fal-ai/aura-sr',
  'clarity-upscaler': 'fal-ai/clarity-upscaler',
  'flux-lora': 'fal-ai/flux-lora',
  'flux-lora-training': 'fal-ai/flux-lora-fast-training',
} as const;

export type FalAIModelId = keyof typeof FAL_AI_MODELS;

export interface FalAIImageGenerationInput {
  prompt: string;
  model?: FalAIModelId;
  num_images?: number;
  image_size?: string;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  enable_safety_checker?: boolean;
  lora_path?: string;
  lora_scale?: number;
}

export interface FalAIImageGenerationResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

export interface FalAITrainingInput {
  images: string[];
  trigger_word: string;
  is_style?: boolean;
  is_subject?: boolean;
  steps?: number;
  learning_rate?: number;
  batch_size?: number;
  resolution?: number;
  webhook_url?: string;
}

export interface FalAITrainingResult {
  diffusers_lora_file: {
    url: string;
    file_name: string;
    file_size: number;
  };
  config_file: {
    url: string;
    file_name: string;
    file_size: number;
  };
}

/**
 * Generate images using specified Fal AI model
 */
export async function generateImages(input: FalAIImageGenerationInput): Promise<FalAIImageGenerationResult> {
  try {
    const modelId = input.model || 'flux-dev';
    const modelEndpoint = FAL_AI_MODELS[modelId];

    if (!modelEndpoint) {
      throw new Error(`Unsupported model: ${modelId}`);
    }

    // Prepare input based on model type
    const modelInput: any = {
      prompt: input.prompt,
      num_images: input.num_images || 1,
      image_size: input.image_size || "square_hd",
      seed: input.seed,
      guidance_scale: input.guidance_scale || 3.5,
      num_inference_steps: input.num_inference_steps || 28,
      enable_safety_checker: input.enable_safety_checker !== false,
    };

    // Add LoRA support if specified
    if (input.lora_path && modelId === 'flux-lora') {
      modelInput.loras = [{
        path: input.lora_path,
        scale: input.lora_scale || 1.0,
      }];
    }

    const result = await fal.subscribe(modelEndpoint, {
      input: modelInput,
    });

    return result.data as FalAIImageGenerationResult;
  } catch (error) {
    console.error(`Error generating images with Fal AI model ${input.model}:`, error);
    throw error;
  }
}

/**
 * Train a LoRA model using Fal AI
 */
export async function trainModel(input: FalAITrainingInput): Promise<string> {
  try {
    const result = await fal.queue.submit("fal-ai/flux-lora-fast-training", {
      input: {
        images_data_url: input.images,
        trigger_word: input.trigger_word,
        is_style: input.is_style || false,
        is_subject: input.is_subject || true,
        steps: input.steps || 1000,
        learning_rate: input.learning_rate || 0.0004,
        batch_size: input.batch_size || 1,
        resolution: input.resolution || 512,
      },
      webhookUrl: input.webhook_url,
    });

    return result.request_id;
  } catch (error) {
    console.error("Error training model with Fal AI:", error);
    throw error;
  }
}

/**
 * Check the status of a training job
 */
export async function checkTrainingStatus(requestId: string) {
  try {
    const status = await fal.queue.status("fal-ai/flux-lora-fast-training", {
      requestId,
      logs: true,
    });

    return status;
  } catch (error) {
    console.error("Error checking training status:", error);
    throw error;
  }
}

/**
 * Get the result of a completed training job
 */
export async function getTrainingResult(requestId: string): Promise<FalAITrainingResult> {
  try {
    const result = await fal.queue.result("fal-ai/flux-lora-fast-training", {
      requestId,
    });

    return result.data as FalAITrainingResult;
  } catch (error) {
    console.error("Error getting training result:", error);
    throw error;
  }
}

/**
 * Upload a file to Fal AI storage and get a URL
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    const url = await fal.storage.upload(file);
    return url;
  } catch (error) {
    console.error("Error uploading file to Fal AI:", error);
    throw error;
  }
}

/**
 * Generate images with a trained LoRA model
 */
export async function generateWithLora(
  prompt: string,
  loraUrl: string,
  options: Partial<FalAIImageGenerationInput> = {}
): Promise<FalAIImageGenerationResult> {
  return generateImages({
    prompt,
    model: 'flux-lora',
    lora_path: loraUrl,
    lora_scale: options.lora_scale || 1.0,
    ...options,
  });
}

/**
 * Upscale images using AuraSR
 */
export async function upscaleImage(imageUrl: string, scale: number = 4): Promise<any> {
  try {
    const result = await fal.subscribe(FAL_AI_MODELS['aura-sr'], {
      input: {
        image_url: imageUrl,
        scale: scale,
      },
    });

    return result.data;
  } catch (error) {
    console.error("Error upscaling image with AuraSR:", error);
    throw error;
  }
}

/**
 * Generate images with multiple models in parallel
 */
export async function generateWithMultipleModels(
  prompt: string,
  models: FalAIModelId[],
  options: Partial<FalAIImageGenerationInput> = {}
): Promise<{ model: FalAIModelId; result: FalAIImageGenerationResult | Error }[]> {
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
export function getModelInfo(modelId: FalAIModelId) {
  const modelInfo = {
    'flux-pro-ultra': {
      name: 'Flux Pro Ultra',
      description: 'Ultra-high definition headshots with exceptional detail and realism',
      maxResolution: '4K',
      avgProcessingTime: '2-3 minutes',
      features: ['Ultra HD Resolution', 'Photorealistic', 'Professional Lighting'],
      pricing: 'Premium',
    },
    'flux-pro': {
      name: 'Flux Pro',
      description: 'Professional-grade image generation with high quality',
      maxResolution: '2K',
      avgProcessingTime: '1-2 minutes',
      features: ['High Quality', 'Fast Processing', 'Consistent Results'],
      pricing: 'Standard',
    },
    'flux-dev': {
      name: 'Flux Dev',
      description: 'Development version with good quality and speed',
      maxResolution: '1K',
      avgProcessingTime: '30-60 seconds',
      features: ['Fast Processing', 'Good Quality', 'Cost Effective'],
      pricing: 'Basic',
    },
    'aura-sr': {
      name: 'AuraSR',
      description: 'Super-resolution enhancement for existing images',
      maxResolution: '8K',
      avgProcessingTime: '30-60 seconds',
      features: ['4x Upscaling', 'Detail Enhancement', 'Noise Reduction'],
      pricing: 'Standard',
    },
    'clarity-upscaler': {
      name: 'Clarity Upscaler',
      description: 'Advanced upscaling with clarity preservation',
      maxResolution: '8K',
      avgProcessingTime: '1-2 minutes',
      features: ['8x Upscaling', 'Edge Enhancement', 'Artifact Removal'],
      pricing: 'Premium',
    },
    'flux-lora': {
      name: 'Flux LoRA',
      description: 'Personalized image generation with trained models',
      maxResolution: '2K',
      avgProcessingTime: '1-3 minutes',
      features: ['Personalized', 'Custom Training', 'High Quality'],
      pricing: 'Standard',
    },
    'imagen4': {
      name: 'Imagen4',
      description: 'Google\'s latest AI model for professional-grade image generation',
      maxResolution: '2K',
      avgProcessingTime: '1-2 minutes',
      features: ['Professional Quality', 'Natural Expressions', 'Consistent Style'],
      pricing: 'Standard',
    },
    'recraft-v3': {
      name: 'Recraft V3',
      description: 'Artistic and creative headshots with unique styling options',
      maxResolution: '3K',
      avgProcessingTime: '2-4 minutes',
      features: ['Artistic Styles', 'Creative Effects', 'Style Transfer'],
      pricing: 'Premium',
    },
    'flux-lora-training': {
      name: 'Flux LoRA Training',
      description: 'Train custom LoRA models for personalized generation',
      maxResolution: 'N/A',
      avgProcessingTime: '10-30 minutes',
      features: ['Custom Training', 'Personalization', 'High Quality'],
      pricing: 'Premium',
    },
  };

  return modelInfo[modelId];
}
