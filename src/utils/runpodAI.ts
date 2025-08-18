// RunPod AI Integration - Phase 2 Implementation
// This will be used for scaling and cost optimization

interface RunPodConfig {
  apiKey: string;
  baseUrl: string;
  templateId: string;
  gpuType: 'A40' | 'RTX4090' | 'A100';
  maxConcurrentJobs: number;
}

interface RunPodJob {
  id: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  input: any;
  output?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
  cost?: number;
}

interface RunPodGenerationInput {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  lora_url?: string;
  lora_scale?: number;
}

interface RunPodTrainingInput {
  input_images: string; // ZIP file URL
  trigger_word: string;
  max_train_steps?: number;
  learning_rate?: number;
  batch_size?: number;
  resolution?: number;
}

// Default configuration for RunPod
const defaultConfig: RunPodConfig = {
  apiKey: process.env.RUNPOD_API_KEY || '',
  baseUrl: 'https://api.runpod.ai/v2',
  templateId: process.env.RUNPOD_TEMPLATE_ID || 'sdxl-template',
  gpuType: 'A40', // Cost-effective option at $0.40/hr
  maxConcurrentJobs: 5,
};

/**
 * Initialize RunPod client
 */
class RunPodClient {
  private config: RunPodConfig;

  constructor(config: Partial<RunPodConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const url = `${this.config.baseUrl}/${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      throw new Error(`RunPod API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new job for image generation
   */
  async createGenerationJob(input: RunPodGenerationInput): Promise<RunPodJob> {
    const jobData = {
      input: {
        prompt: input.prompt,
        negative_prompt: input.negative_prompt || 'blurry, low quality, distorted',
        width: input.width || 1024,
        height: input.height || 1024,
        num_outputs: input.num_outputs || 1,
        num_inference_steps: input.num_inference_steps || 25,
        guidance_scale: input.guidance_scale || 7.5,
        seed: input.seed,
        ...(input.lora_url && {
          lora_url: input.lora_url,
          lora_scale: input.lora_scale || 1.0,
        }),
      },
    };

    const response = await this.makeRequest(`${this.config.templateId}/run`, 'POST', jobData);
    
    return {
      id: response.id,
      status: 'QUEUED',
      input: jobData.input,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Create a new job for model training
   */
  async createTrainingJob(input: RunPodTrainingInput): Promise<RunPodJob> {
    const jobData = {
      input: {
        input_images: input.input_images,
        trigger_word: input.trigger_word,
        max_train_steps: input.max_train_steps || 1000,
        learning_rate: input.learning_rate || 1e-4,
        batch_size: input.batch_size || 1,
        resolution: input.resolution || 1024,
      },
    };

    const response = await this.makeRequest(`${this.config.templateId}/run`, 'POST', jobData);
    
    return {
      id: response.id,
      status: 'QUEUED',
      input: jobData.input,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<RunPodJob> {
    const response = await this.makeRequest(`${this.config.templateId}/status/${jobId}`);
    
    return {
      id: response.id,
      status: response.status,
      input: response.input,
      output: response.output,
      error: response.error,
      createdAt: response.created_at,
      completedAt: response.completed_at,
      cost: response.cost,
    };
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    await this.makeRequest(`${this.config.templateId}/cancel/${jobId}`, 'POST');
  }

  /**
   * Get job logs
   */
  async getJobLogs(jobId: string): Promise<string[]> {
    const response = await this.makeRequest(`${this.config.templateId}/logs/${jobId}`);
    return response.logs || [];
  }
}

// Export singleton instance
export const runpodClient = new RunPodClient();

/**
 * Generate images using RunPod
 */
export async function generateImages(input: RunPodGenerationInput): Promise<RunPodJob> {
  return runpodClient.createGenerationJob(input);
}

/**
 * Train a model using RunPod
 */
export async function trainModel(input: RunPodTrainingInput): Promise<RunPodJob> {
  return runpodClient.createTrainingJob(input);
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<RunPodJob> {
  return runpodClient.getJobStatus(jobId);
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<void> {
  return runpodClient.cancelJob(jobId);
}

/**
 * Health check for RunPod service
 */
export async function healthCheck(): Promise<boolean> {
  // Skip health check during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    console.log('Skipping RunPod health check during build time');
    return true;
  }

  try {
    // Simple test to check if API is accessible
    const response = await fetch(`${defaultConfig.baseUrl}/health`, {
      headers: {
        'Authorization': `Bearer ${defaultConfig.apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('RunPod health check failed:', error);
    return false;
  }
}

/**
 * Get cost estimation for a job
 */
export function estimateCost(
  gpuType: RunPodConfig['gpuType'] = 'A40',
  estimatedMinutes: number = 5
): number {
  const hourlyRates = {
    'A40': 0.40,
    'RTX4090': 0.30,
    'A100': 1.20,
  };

  const hourlyRate = hourlyRates[gpuType];
  return (hourlyRate / 60) * estimatedMinutes;
}

/**
 * Get available GPU types and their costs
 */
export function getGPUOptions() {
  return [
    {
      type: 'A40' as const,
      name: 'NVIDIA A40',
      memory: '48GB',
      hourlyRate: 0.40,
      recommended: true,
      description: 'Best balance of performance and cost',
    },
    {
      type: 'RTX4090' as const,
      name: 'NVIDIA RTX 4090',
      memory: '24GB',
      hourlyRate: 0.30,
      recommended: false,
      description: 'Lower cost, good for simple generations',
    },
    {
      type: 'A100' as const,
      name: 'NVIDIA A100',
      memory: '80GB',
      hourlyRate: 1.20,
      recommended: false,
      description: 'High performance, higher cost',
    },
  ];
}

export default runpodClient;
