import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { generateImages, FalAIModelId, FalAIImageGenerationInput } from '@/utils/falAI';
import { deductCredits } from '@/utils/creditSystem';
import { getCachedGenerationResult, cacheGenerationResult, GenerationCacheKey } from '@/utils/aiCache';

export interface AIProcessingJob {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'batched';
  model_id: FalAIModelId;
  input_data: FalAIImageGenerationInput;
  result_data?: any;
  error_message?: string;
  credits_used: number;
  priority: number; // 1-10, higher = more priority
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
  batch_id?: string;
  retry_count: number;
  max_retries: number;
  user_plan: 'basic' | 'professional' | 'executive';
  quality_score?: number;
  processing_time?: number;
}

export interface ProcessingProgress {
  jobId: string;
  status: string;
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface QueueStatus {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  batchedJobs: number;
  estimatedWaitTime: number; // in seconds
  activeBatches: number;
  queueThroughput: number; // jobs per minute
  averageProcessingTime: number; // in seconds
}

export interface BatchJob {
  id: string;
  jobs: AIProcessingJob[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model_id: FalAIModelId;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  estimated_completion?: string;
  priority_score: number;
}

export interface QueueOptimizationConfig {
  maxBatchSize: number;
  batchTimeoutMs: number;
  maxConcurrentJobs: number;
  priorityWeights: {
    userPlan: Record<string, number>;
    retryCount: number;
    age: number;
    modelComplexity: Record<FalAIModelId, number>;
  };
  resourceLimits: {
    maxMemoryUsage: number;
    maxCpuUsage: number;
    maxGpuUsage: number;
  };
}

/**
 * Add a new AI processing job to the queue
 */
export async function addProcessingJob(
  userId: string,
  modelId: FalAIModelId,
  inputData: FalAIImageGenerationInput,
  priority: number = 5
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Calculate credits needed
    const creditsNeeded = calculateJobCredits(modelId, inputData);
    
    // Check if user has enough credits
    const creditResult = await deductCredits(
      userId,
      creditsNeeded,
      `AI generation with ${modelId}`
    );
    
    if (!creditResult.success) {
      return { success: false, error: 'Insufficient credits' };
    }

    // Create job record
    const { data: job, error } = await supabase
      .from('ai_processing_jobs')
      .insert({
        user_id: userId,
        status: 'pending',
        model_id: modelId,
        input_data: inputData,
        credits_used: creditsNeeded,
        priority: priority,
        estimated_completion: calculateEstimatedCompletion(modelId)
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating AI processing job', error, 'AI_QUEUE', { userId, modelId });
      return { success: false, error: 'Failed to create job' };
    }

    logger.info('AI processing job created', 'AI_QUEUE', {
      jobId: job.id,
      userId,
      modelId,
      creditsUsed: creditsNeeded
    });

    // Start processing immediately (in production, this would be handled by a queue worker)
    processJobAsync(job.id);

    return { success: true, jobId: job.id };
  } catch (error) {
    logger.error('Error adding processing job', error as Error, 'AI_QUEUE', { userId, modelId });
    return { success: false, error: 'Error creating job' };
  }
}

/**
 * Get job status and progress
 */
export async function getJobStatus(jobId: string): Promise<ProcessingProgress | null> {
  try {
    const supabase = await createClient();
    
    const { data: job, error } = await supabase
      .from('ai_processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return null;
    }

    const progress = calculateProgress(job);
    
    return {
      jobId: job.id,
      status: job.status,
      progress: progress.percentage,
      message: progress.message,
      estimatedTimeRemaining: progress.estimatedTimeRemaining
    };
  } catch (error) {
    logger.error('Error getting job status', error as Error, 'AI_QUEUE', { jobId });
    return null;
  }
}

/**
 * Get user's processing jobs
 */
export async function getUserJobs(
  userId: string, 
  limit: number = 10
): Promise<AIProcessingJob[]> {
  try {
    const supabase = await createClient();
    
    const { data: jobs, error } = await supabase
      .from('ai_processing_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error getting user jobs', error, 'AI_QUEUE', { userId });
      return [];
    }

    return jobs || [];
  } catch (error) {
    logger.error('Error getting user jobs', error as Error, 'AI_QUEUE', { userId });
    return [];
  }
}

/**
 * Cancel a processing job
 */
export async function cancelJob(jobId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('ai_processing_jobs')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('user_id', userId)
      .eq('status', 'pending'); // Only cancel pending jobs

    if (error) {
      logger.error('Error cancelling job', error, 'AI_QUEUE', { jobId, userId });
      return false;
    }

    logger.info('Job cancelled', 'AI_QUEUE', { jobId, userId });
    return true;
  } catch (error) {
    logger.error('Error cancelling job', error as Error, 'AI_QUEUE', { jobId, userId });
    return false;
  }
}

/**
 * Process a job asynchronously
 */
async function processJobAsync(jobId: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Update job status to processing
    await supabase
      .from('ai_processing_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Get job details
    const { data: job } = await supabase
      .from('ai_processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) return;

    // Process with Fal AI
    const result = await generateImages({
      ...job.input_data,
      model: job.model_id
    });

    // Update job with results
    await supabase
      .from('ai_processing_jobs')
      .update({
        status: 'completed',
        result_data: result,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    logger.info('Job completed successfully', 'AI_QUEUE', { jobId });

  } catch (error) {
    // Update job with error
    const supabase = await createClient();
    await supabase
      .from('ai_processing_jobs')
      .update({
        status: 'failed',
        error_message: (error as Error).message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    logger.error('Job failed', error as Error, 'AI_QUEUE', { jobId });
  }
}

/**
 * Calculate credits needed for a job
 */
function calculateJobCredits(modelId: FalAIModelId, input: FalAIImageGenerationInput): number {
  const baseCredits = input.num_images || 1;
  
  const modelMultipliers = {
    'flux-pro-ultra': 3,
    'flux-pro': 2,
    'imagen4': 2,
    'recraft-v3': 2.5,
    'flux-lora': 2,
    'aura-sr': 1.5,
    'clarity-upscaler': 2,
    'flux-dev': 1,
    'flux-lora-training': 10
  };
  
  return Math.ceil(baseCredits * (modelMultipliers[modelId] || 1));
}

/**
 * Calculate estimated completion time
 */
function calculateEstimatedCompletion(modelId: FalAIModelId): string {
  const processingTimes = {
    'flux-pro-ultra': 180, // 3 minutes
    'flux-pro': 120, // 2 minutes
    'imagen4': 90, // 1.5 minutes
    'recraft-v3': 150, // 2.5 minutes
    'flux-lora': 120, // 2 minutes
    'aura-sr': 60, // 1 minute
    'clarity-upscaler': 90, // 1.5 minutes
    'flux-dev': 45, // 45 seconds
    'flux-lora-training': 1200 // 20 minutes
  };
  
  const seconds = processingTimes[modelId] || 60;
  const estimatedTime = new Date(Date.now() + seconds * 1000);
  
  return estimatedTime.toISOString();
}

/**
 * Calculate job progress
 */
function calculateProgress(job: AIProcessingJob): {
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
} {
  switch (job.status) {
    case 'pending':
      return { percentage: 0, message: 'Waiting in queue...' };
    case 'batched':
      return { percentage: 10, message: 'Batched for processing...' };
    case 'processing':
      const elapsed = job.started_at ?
        (Date.now() - new Date(job.started_at).getTime()) / 1000 : 0;
      const estimated = job.estimated_completion ?
        (new Date(job.estimated_completion).getTime() - new Date(job.created_at).getTime()) / 1000 : 120;
      const progress = Math.min(90, (elapsed / estimated) * 100);
      const remaining = Math.max(0, estimated - elapsed);
      return {
        percentage: progress,
        message: 'Generating your headshots...',
        estimatedTimeRemaining: remaining
      };
    case 'completed':
      return { percentage: 100, message: 'Completed successfully!' };
    case 'failed':
      return { percentage: 0, message: `Failed: ${job.error_message}` };
    case 'cancelled':
      return { percentage: 0, message: 'Cancelled' };
    default:
      return { percentage: 0, message: 'Unknown status' };
  }
}

/**
 * Enhanced AI Processing Queue with intelligent batching and optimization
 */
export class EnhancedAIQueue {
  private config: QueueOptimizationConfig;
  private activeBatches = new Map<string, BatchJob>();
  private processingStats = {
    totalProcessed: 0,
    totalProcessingTime: 0,
    successRate: 0,
    averageWaitTime: 0,
  };

  constructor(config?: Partial<QueueOptimizationConfig>) {
    this.config = {
      maxBatchSize: 5,
      batchTimeoutMs: 30000, // 30 seconds
      maxConcurrentJobs: 10,
      priorityWeights: {
        userPlan: { basic: 1, professional: 2, executive: 3 },
        retryCount: -0.5,
        age: 0.1,
        modelComplexity: {
          'flux-dev': 1,
          'flux-pro': 2,
          'flux-pro-ultra': 3,
          'imagen4': 2,
          'recraft-v3': 2.5,
          'aura-sr': 1.5,
          'clarity-upscaler': 2,
          'flux-lora': 2,
          'flux-lora-training': 4,
        },
      },
      resourceLimits: {
        maxMemoryUsage: 0.8, // 80%
        maxCpuUsage: 0.7, // 70%
        maxGpuUsage: 0.9, // 90%
      },
      ...config,
    };

    // Start batch processing interval
    setInterval(() => this.processPendingBatches(), 5000); // Every 5 seconds
  }

  /**
   * Add job with intelligent batching
   */
  async addJobToBatch(
    userId: string,
    modelId: FalAIModelId,
    inputData: FalAIImageGenerationInput,
    userPlan: string = 'basic',
    priority: number = 5
  ): Promise<{ success: boolean; jobId?: string; batchId?: string; error?: string }> {
    try {
      // Check cache first
      const cacheKey: GenerationCacheKey = {
        prompt: inputData.prompt,
        modelId,
        parameters: inputData,
        userId,
      };

      const cachedResult = await getCachedGenerationResult(cacheKey);
      if (cachedResult) {
        logger.info('Job served from cache', 'AI_QUEUE', { userId, modelId });
        return {
          success: true,
          jobId: `cached_${Date.now()}`,
          batchId: 'cache'
        };
      }

      // Calculate job priority
      const calculatedPriority = this.calculateJobPriority(
        userPlan as any,
        modelId,
        priority,
        0 // retry count
      );

      // Create job
      const job: Partial<AIProcessingJob> = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        status: 'pending',
        model_id: modelId,
        input_data: inputData,
        priority: calculatedPriority,
        created_at: new Date().toISOString(),
        retry_count: 0,
        max_retries: 3,
        user_plan: userPlan as any,
        estimated_completion: calculateEstimatedCompletion(modelId),
      };

      // Find or create batch for this model
      const batchId = await this.findOrCreateBatch(modelId, calculatedPriority);
      job.batch_id = batchId;
      job.status = 'batched';

      // Save job to database
      const supabase = await createClient();
      const { data: savedJob, error } = await supabase
        .from('ai_processing_jobs')
        .insert(job)
        .select()
        .single();

      if (error) {
        logger.error('Error saving job to database', error, 'AI_QUEUE');
        return { success: false, error: 'Failed to create job' };
      }

      // Add to batch
      await this.addJobToBatchRecord(batchId, savedJob as AIProcessingJob);

      logger.info('Job added to batch', 'AI_QUEUE', {
        jobId: savedJob.id,
        batchId,
        modelId,
        priority: calculatedPriority,
      });

      return {
        success: true,
        jobId: savedJob.id,
        batchId
      };

    } catch (error) {
      logger.error('Error adding job to batch', error as Error, 'AI_QUEUE');
      return { success: false, error: 'Error creating job' };
    }
  }

  /**
   * Calculate job priority based on multiple factors
   */
  private calculateJobPriority(
    userPlan: 'basic' | 'professional' | 'executive',
    modelId: FalAIModelId,
    basePriority: number,
    retryCount: number
  ): number {
    const weights = this.config.priorityWeights;

    let priority = basePriority;

    // User plan weight
    priority += weights.userPlan[userPlan] || 1;

    // Model complexity weight
    priority += weights.modelComplexity[modelId] || 1;

    // Retry penalty
    priority += retryCount * weights.retryCount;

    // Age bonus (older jobs get higher priority)
    priority += Date.now() * weights.age / 1000000; // Small age bonus

    return Math.max(1, Math.min(10, priority));
  }

  /**
   * Find existing batch or create new one
   */
  private async findOrCreateBatch(
    modelId: FalAIModelId,
    priority: number
  ): Promise<string> {
    // Look for existing batch with same model and similar priority
    for (const [batchId, batch] of this.activeBatches.entries()) {
      if (
        batch.model_id === modelId &&
        batch.status === 'pending' &&
        batch.jobs.length < this.config.maxBatchSize &&
        Math.abs(batch.priority_score - priority) <= 2
      ) {
        return batchId;
      }
    }

    // Create new batch
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const batch: BatchJob = {
      id: batchId,
      jobs: [],
      status: 'pending',
      model_id: modelId,
      created_at: new Date().toISOString(),
      total_jobs: 0,
      completed_jobs: 0,
      failed_jobs: 0,
      priority_score: priority,
    };

    this.activeBatches.set(batchId, batch);

    // Set timeout for batch processing
    setTimeout(() => {
      this.processBatch(batchId);
    }, this.config.batchTimeoutMs);

    return batchId;
  }

  /**
   * Add job to batch record
   */
  private async addJobToBatchRecord(batchId: string, job: AIProcessingJob): Promise<void> {
    const batch = this.activeBatches.get(batchId);
    if (!batch) return;

    batch.jobs.push(job);
    batch.total_jobs = batch.jobs.length;

    // Process batch if it's full
    if (batch.jobs.length >= this.config.maxBatchSize) {
      await this.processBatch(batchId);
    }
  }

  /**
   * Process a batch of jobs
   */
  private async processBatch(batchId: string): Promise<void> {
    const batch = this.activeBatches.get(batchId);
    if (!batch || batch.status !== 'pending' || batch.jobs.length === 0) {
      return;
    }

    try {
      batch.status = 'processing';
      batch.started_at = new Date().toISOString();

      logger.info('Processing batch', 'AI_QUEUE', {
        batchId,
        jobCount: batch.jobs.length,
        modelId: batch.model_id,
      });

      // Process jobs in parallel with concurrency limit
      const concurrency = Math.min(batch.jobs.length, this.config.maxConcurrentJobs);
      const jobChunks = this.chunkArray(batch.jobs, concurrency);

      for (const chunk of jobChunks) {
        await Promise.all(chunk.map(job => this.processJobWithCaching(job)));
      }

      batch.status = 'completed';
      batch.completed_at = new Date().toISOString();
      batch.completed_jobs = batch.jobs.filter(j => j.status === 'completed').length;
      batch.failed_jobs = batch.jobs.filter(j => j.status === 'failed').length;

      // Update statistics
      this.updateProcessingStats(batch);

      // Clean up batch
      this.activeBatches.delete(batchId);

      logger.info('Batch completed', 'AI_QUEUE', {
        batchId,
        completedJobs: batch.completed_jobs,
        failedJobs: batch.failed_jobs,
      });

    } catch (error) {
      batch.status = 'failed';
      logger.error('Batch processing failed', error as Error, 'AI_QUEUE', { batchId });
    }
  }

  /**
   * Process individual job with caching
   */
  private async processJobWithCaching(job: AIProcessingJob): Promise<void> {
    const startTime = Date.now();

    try {
      // Update job status
      job.status = 'processing';
      job.started_at = new Date().toISOString();

      await this.updateJobInDatabase(job);

      // Check cache again (in case it was cached while waiting)
      const cacheKey: GenerationCacheKey = {
        prompt: job.input_data.prompt,
        modelId: job.model_id,
        parameters: job.input_data,
        userId: job.user_id,
      };

      let result = await getCachedGenerationResult(cacheKey);

      if (!result) {
        // Generate new result
        result = await generateImages({
          ...job.input_data,
          model: job.model_id,
        });

        // Cache the result
        const processingTime = Date.now() - startTime;
        await cacheGenerationResult(cacheKey, result, {
          generationTime: processingTime,
          cost: calculateJobCredits(job.model_id, job.input_data),
          qualityScore: 0.8, // Could be calculated based on result analysis
        });
      }

      // Update job with success
      job.status = 'completed';
      job.result_data = result;
      job.completed_at = new Date().toISOString();
      job.processing_time = Date.now() - startTime;

      await this.updateJobInDatabase(job);

      logger.info('Job completed successfully', 'AI_QUEUE', {
        jobId: job.id,
        processingTime: job.processing_time,
      });

    } catch (error) {
      // Handle retry logic
      if (job.retry_count < job.max_retries) {
        job.retry_count++;
        job.status = 'pending';
        job.priority = this.calculateJobPriority(
          job.user_plan,
          job.model_id,
          job.priority,
          job.retry_count
        );

        logger.info('Job retrying', 'AI_QUEUE', {
          jobId: job.id,
          retryCount: job.retry_count,
          error: (error as Error).message,
        });

        // Re-add to queue
        await this.addJobToBatch(
          job.user_id,
          job.model_id,
          job.input_data,
          job.user_plan,
          job.priority
        );
      } else {
        // Mark as failed
        job.status = 'failed';
        job.error_message = (error as Error).message;
        job.completed_at = new Date().toISOString();

        logger.error('Job failed permanently', error as Error, 'AI_QUEUE', {
          jobId: job.id,
          retryCount: job.retry_count,
        });
      }

      await this.updateJobInDatabase(job);
    }
  }

  /**
   * Update job in database
   */
  private async updateJobInDatabase(job: AIProcessingJob): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase
        .from('ai_processing_jobs')
        .update({
          status: job.status,
          result_data: job.result_data,
          error_message: job.error_message,
          started_at: job.started_at,
          completed_at: job.completed_at,
          retry_count: job.retry_count,
          priority: job.priority,
          processing_time: job.processing_time,
          quality_score: job.quality_score,
        })
        .eq('id', job.id);
    } catch (error) {
      logger.error('Error updating job in database', error as Error, 'AI_QUEUE', {
        jobId: job.id,
      });
    }
  }

  /**
   * Process pending batches
   */
  private async processPendingBatches(): Promise<void> {
    for (const [batchId, batch] of this.activeBatches.entries()) {
      if (
        batch.status === 'pending' &&
        (batch.jobs.length >= this.config.maxBatchSize ||
          Date.now() - new Date(batch.created_at).getTime() >= this.config.batchTimeoutMs)
      ) {
        await this.processBatch(batchId);
      }
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<QueueStatus> {
    try {
      const supabase = await createClient();

      // Get job counts from database
      const { data: jobCounts } = await supabase
        .from('ai_processing_jobs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const counts = jobCounts?.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Calculate throughput (jobs per minute in last hour)
      const { data: recentJobs } = await supabase
        .from('ai_processing_jobs')
        .select('completed_at')
        .gte('completed_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .not('completed_at', 'is', null);

      const throughput = recentJobs ? recentJobs.length / 60 : 0;

      return {
        totalJobs: Object.values(counts).reduce((sum, count) => sum + count, 0),
        pendingJobs: counts.pending || 0,
        processingJobs: counts.processing || 0,
        completedJobs: counts.completed || 0,
        failedJobs: counts.failed || 0,
        batchedJobs: counts.batched || 0,
        estimatedWaitTime: this.calculateEstimatedWaitTime(),
        activeBatches: this.activeBatches.size,
        queueThroughput: Math.round(throughput * 100) / 100,
        averageProcessingTime: this.processingStats.averageWaitTime,
      };

    } catch (error) {
      logger.error('Error getting queue status', error as Error, 'AI_QUEUE');
      return {
        totalJobs: 0,
        pendingJobs: 0,
        processingJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        batchedJobs: 0,
        estimatedWaitTime: 0,
        activeBatches: 0,
        queueThroughput: 0,
        averageProcessingTime: 0,
      };
    }
  }

  /**
   * Calculate estimated wait time
   */
  private calculateEstimatedWaitTime(): number {
    const pendingJobs = Array.from(this.activeBatches.values())
      .reduce((sum, batch) => sum + batch.jobs.filter(j => j.status === 'pending').length, 0);

    const avgProcessingTime = this.processingStats.averageWaitTime || 120; // 2 minutes default
    const throughput = this.processingStats.totalProcessed > 0
      ? this.processingStats.totalProcessed / (this.processingStats.totalProcessingTime / 60000)
      : 1; // jobs per minute

    return pendingJobs > 0 ? Math.ceil(pendingJobs / throughput * 60) : 0; // seconds
  }

  /**
   * Update processing statistics
   */
  private updateProcessingStats(batch: BatchJob): void {
    const completedJobs = batch.completed_jobs;
    const processingTime = batch.completed_at && batch.started_at
      ? new Date(batch.completed_at).getTime() - new Date(batch.started_at).getTime()
      : 0;

    this.processingStats.totalProcessed += completedJobs;
    this.processingStats.totalProcessingTime += processingTime;
    this.processingStats.successRate =
      this.processingStats.totalProcessed > 0
        ? (this.processingStats.totalProcessed - batch.failed_jobs) / this.processingStats.totalProcessed
        : 0;
    this.processingStats.averageWaitTime =
      this.processingStats.totalProcessed > 0
        ? this.processingStats.totalProcessingTime / this.processingStats.totalProcessed / 1000
        : 0;
  }

  /**
   * Utility function to chunk array
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// Export singleton instance
export const enhancedAIQueue = new EnhancedAIQueue();
