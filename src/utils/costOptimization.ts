import { FalAIModelId } from './falAI';
import { createClient } from './supabase/server';
import { logger } from './logger';

export interface ModelCostData {
  modelId: FalAIModelId;
  costPerGeneration: number;
  averageProcessingTime: number; // seconds
  successRate: number; // 0-1
  qualityScore: number; // 0-1
  resourceUsage: {
    cpu: number; // 0-1
    memory: number; // 0-1
    gpu: number; // 0-1
  };
  costEfficiencyScore: number; // 0-1 (higher is better)
}

export interface CostAnalysis {
  totalCost: number;
  costBreakdown: {
    modelCosts: Record<FalAIModelId, number>;
    processingCosts: number;
    storageCosts: number;
    cachingCosts: number;
  };
  costSavings: {
    fromCaching: number;
    fromBatching: number;
    fromOptimization: number;
    total: number;
  };
  recommendations: string[];
  projectedMonthlyCost: number;
  costTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export interface ResourceUsage {
  cpu: {
    current: number;
    average: number;
    peak: number;
    limit: number;
  };
  memory: {
    current: number;
    average: number;
    peak: number;
    limit: number;
  };
  gpu: {
    current: number;
    average: number;
    peak: number;
    limit: number;
  };
  storage: {
    used: number;
    available: number;
    total: number;
  };
  network: {
    bandwidth: number;
    usage: number;
  };
}

export interface OptimizationRecommendation {
  type: 'model_selection' | 'batching' | 'caching' | 'scheduling' | 'resource_allocation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  potentialSavings: number; // percentage
  implementationEffort: 'low' | 'medium' | 'high';
  estimatedImpact: string;
  actionItems: string[];
}

export interface CostOptimizationConfig {
  budgetLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  resourceLimits: {
    maxCpuUsage: number;
    maxMemoryUsage: number;
    maxGpuUsage: number;
  };
  costThresholds: {
    warningThreshold: number; // percentage of budget
    criticalThreshold: number; // percentage of budget
  };
  optimizationTargets: {
    costReduction: number; // percentage
    qualityMaintenance: number; // minimum quality score
    performanceImprovement: number; // percentage
  };
}

/**
 * Cost Optimization and Resource Management System
 */
export class CostOptimizationManager {
  private config: CostOptimizationConfig;
  private modelCostData = new Map<FalAIModelId, ModelCostData>();

  constructor(config?: Partial<CostOptimizationConfig>) {
    this.config = {
      budgetLimits: {
        daily: 100,
        weekly: 500,
        monthly: 2000,
      },
      resourceLimits: {
        maxCpuUsage: 0.8,
        maxMemoryUsage: 0.8,
        maxGpuUsage: 0.9,
      },
      costThresholds: {
        warningThreshold: 0.8,
        criticalThreshold: 0.95,
      },
      optimizationTargets: {
        costReduction: 0.2, // 20% cost reduction target
        qualityMaintenance: 0.8, // maintain 80% quality
        performanceImprovement: 0.15, // 15% performance improvement
      },
      ...config,
    };

    this.initializeModelCostData();
  }

  /**
   * Analyze current costs and generate recommendations
   */
  async analyzeCosts(timeframe: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<CostAnalysis> {
    try {
      const supabase = await createClient();
      
      // Get cost data for the specified timeframe
      const startDate = this.getStartDate(timeframe);
      
      const { data: generations } = await supabase
        .from('ai_generations')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const { data: enhancements } = await supabase
        .from('quality_enhancements')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Calculate costs
      const modelCosts = this.calculateModelCosts(generations || []);
      const processingCosts = this.calculateProcessingCosts(generations || []);
      const storageCosts = this.calculateStorageCosts();
      const cachingCosts = this.calculateCachingCosts();

      const totalCost = Object.values(modelCosts).reduce((sum, cost) => sum + cost, 0) +
                       processingCosts + storageCosts + cachingCosts;

      // Calculate savings
      const costSavings = await this.calculateCostSavings(generations || []);

      // Generate recommendations
      const recommendations = await this.generateCostRecommendations(totalCost, modelCosts);

      // Project monthly cost
      const projectedMonthlyCost = this.projectMonthlyCost(totalCost, timeframe);

      // Get cost trends
      const costTrends = await this.getCostTrends();

      return {
        totalCost,
        costBreakdown: {
          modelCosts,
          processingCosts,
          storageCosts,
          cachingCosts,
        },
        costSavings,
        recommendations,
        projectedMonthlyCost,
        costTrends,
      };

    } catch (error) {
      logger.error('Error analyzing costs', error, 'COST_OPTIMIZATION');
      throw error;
    }
  }

  /**
   * Get current resource usage
   */
  async getResourceUsage(): Promise<ResourceUsage> {
    try {
      // In production, this would integrate with actual monitoring systems
      // For now, we'll simulate realistic values
      
      const cpuUsage = Math.random() * 0.7 + 0.1; // 10-80%
      const memoryUsage = Math.random() * 0.6 + 0.2; // 20-80%
      const gpuUsage = Math.random() * 0.8 + 0.1; // 10-90%

      return {
        cpu: {
          current: cpuUsage,
          average: cpuUsage * 0.8,
          peak: Math.min(1, cpuUsage * 1.3),
          limit: this.config.resourceLimits.maxCpuUsage,
        },
        memory: {
          current: memoryUsage,
          average: memoryUsage * 0.85,
          peak: Math.min(1, memoryUsage * 1.2),
          limit: this.config.resourceLimits.maxMemoryUsage,
        },
        gpu: {
          current: gpuUsage,
          average: gpuUsage * 0.9,
          peak: Math.min(1, gpuUsage * 1.1),
          limit: this.config.resourceLimits.maxGpuUsage,
        },
        storage: {
          used: 1024 * 1024 * 1024 * 50, // 50GB
          available: 1024 * 1024 * 1024 * 450, // 450GB
          total: 1024 * 1024 * 1024 * 500, // 500GB
        },
        network: {
          bandwidth: 1000, // Mbps
          usage: Math.random() * 500 + 100, // 100-600 Mbps
        },
      };

    } catch (error) {
      logger.error('Error getting resource usage', error, 'COST_OPTIMIZATION');
      throw error;
    }
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    try {
      const costAnalysis = await this.analyzeCosts();
      const resourceUsage = await this.getResourceUsage();
      const recommendations: OptimizationRecommendation[] = [];

      // Model selection optimization
      if (this.shouldOptimizeModelSelection(costAnalysis)) {
        recommendations.push({
          type: 'model_selection',
          priority: 'high',
          description: 'Switch to more cost-effective models for similar quality results',
          potentialSavings: 25,
          implementationEffort: 'medium',
          estimatedImpact: 'Reduce model costs by 25% while maintaining 95% quality',
          actionItems: [
            'Analyze model performance vs cost ratios',
            'Implement intelligent model selection',
            'A/B test cost-effective alternatives',
          ],
        });
      }

      // Batching optimization
      if (this.shouldOptimizeBatching(costAnalysis)) {
        recommendations.push({
          type: 'batching',
          priority: 'medium',
          description: 'Implement intelligent batching to reduce processing overhead',
          potentialSavings: 15,
          implementationEffort: 'low',
          estimatedImpact: 'Reduce processing costs by 15% through better batching',
          actionItems: [
            'Implement dynamic batch sizing',
            'Optimize batch timing',
            'Group similar requests',
          ],
        });
      }

      // Caching optimization
      if (this.shouldOptimizeCaching(costAnalysis)) {
        recommendations.push({
          type: 'caching',
          priority: 'high',
          description: 'Improve caching strategy to reduce redundant processing',
          potentialSavings: 30,
          implementationEffort: 'medium',
          estimatedImpact: 'Reduce redundant processing by 30%',
          actionItems: [
            'Implement semantic caching',
            'Optimize cache hit rates',
            'Implement cache warming',
          ],
        });
      }

      // Resource allocation optimization
      if (this.shouldOptimizeResources(resourceUsage)) {
        recommendations.push({
          type: 'resource_allocation',
          priority: 'medium',
          description: 'Optimize resource allocation to reduce infrastructure costs',
          potentialSavings: 20,
          implementationEffort: 'high',
          estimatedImpact: 'Reduce infrastructure costs by 20%',
          actionItems: [
            'Implement auto-scaling',
            'Optimize resource scheduling',
            'Use spot instances where appropriate',
          ],
        });
      }

      // Scheduling optimization
      if (this.shouldOptimizeScheduling(costAnalysis)) {
        recommendations.push({
          type: 'scheduling',
          priority: 'low',
          description: 'Optimize job scheduling to take advantage of off-peak pricing',
          potentialSavings: 10,
          implementationEffort: 'medium',
          estimatedImpact: 'Reduce costs by 10% through better scheduling',
          actionItems: [
            'Implement priority-based scheduling',
            'Use off-peak processing for non-urgent jobs',
            'Optimize queue management',
          ],
        });
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      logger.error('Error generating optimization recommendations', error, 'COST_OPTIMIZATION');
      return [];
    }
  }

  /**
   * Get most cost-effective model for given requirements
   */
  getMostCostEffectiveModel(
    qualityRequirement: number = 0.8,
    speedRequirement: 'fast' | 'medium' | 'slow' = 'medium'
  ): FalAIModelId | null {
    const models = Array.from(this.modelCostData.values())
      .filter(model => model.qualityScore >= qualityRequirement)
      .sort((a, b) => b.costEfficiencyScore - a.costEfficiencyScore);

    if (speedRequirement === 'fast') {
      return models.find(m => m.averageProcessingTime <= 60)?.modelId || models[0]?.modelId || null;
    } else if (speedRequirement === 'slow') {
      return models[models.length - 1]?.modelId || null;
    }

    return models[0]?.modelId || null;
  }

  /**
   * Calculate cost for a specific generation request
   */
  calculateGenerationCost(
    modelId: FalAIModelId,
    numImages: number = 1,
    options: any = {}
  ): number {
    const modelData = this.modelCostData.get(modelId);
    if (!modelData) return 0;

    let baseCost = modelData.costPerGeneration * numImages;

    // Apply option multipliers
    if (options.image_size === 'square_hd' || options.image_size === 'portrait_4_3') {
      baseCost *= 1.2;
    }
    if (options.num_inference_steps > 30) {
      baseCost *= 1.1;
    }
    if (options.guidance_scale > 7) {
      baseCost *= 1.05;
    }

    return Math.round(baseCost * 100) / 100;
  }

  /**
   * Monitor budget usage and send alerts
   */
  async monitorBudgetUsage(): Promise<{
    status: 'ok' | 'warning' | 'critical';
    usage: number;
    limit: number;
    message: string;
  }> {
    try {
      const monthlyAnalysis = await this.analyzeCosts('monthly');
      const monthlyLimit = this.config.budgetLimits.monthly;
      const usagePercentage = monthlyAnalysis.totalCost / monthlyLimit;

      let status: 'ok' | 'warning' | 'critical' = 'ok';
      let message = 'Budget usage is within normal limits';

      if (usagePercentage >= this.config.costThresholds.criticalThreshold) {
        status = 'critical';
        message = `Critical: Budget usage at ${(usagePercentage * 100).toFixed(1)}% of monthly limit`;
      } else if (usagePercentage >= this.config.costThresholds.warningThreshold) {
        status = 'warning';
        message = `Warning: Budget usage at ${(usagePercentage * 100).toFixed(1)}% of monthly limit`;
      }

      // Log budget status
      logger.info('Budget monitoring', {
        status,
        usage: monthlyAnalysis.totalCost,
        limit: monthlyLimit,
        percentage: usagePercentage,
      }, 'COST_OPTIMIZATION');

      return {
        status,
        usage: monthlyAnalysis.totalCost,
        limit: monthlyLimit,
        message,
      };

    } catch (error) {
      logger.error('Error monitoring budget usage', error, 'COST_OPTIMIZATION');
      return {
        status: 'critical',
        usage: 0,
        limit: this.config.budgetLimits.monthly,
        message: 'Error monitoring budget usage',
      };
    }
  }

  /**
   * Initialize model cost data
   */
  private initializeModelCostData(): void {
    const modelData: Array<[FalAIModelId, Omit<ModelCostData, 'modelId'>]> = [
      ['flux-dev', {
        costPerGeneration: 0.5,
        averageProcessingTime: 45,
        successRate: 0.95,
        qualityScore: 0.75,
        resourceUsage: { cpu: 0.3, memory: 0.4, gpu: 0.6 },
        costEfficiencyScore: 0.9,
      }],
      ['flux-pro', {
        costPerGeneration: 1.0,
        averageProcessingTime: 90,
        successRate: 0.97,
        qualityScore: 0.85,
        resourceUsage: { cpu: 0.5, memory: 0.6, gpu: 0.8 },
        costEfficiencyScore: 0.8,
      }],
      ['flux-pro-ultra', {
        costPerGeneration: 2.0,
        averageProcessingTime: 150,
        successRate: 0.98,
        qualityScore: 0.95,
        resourceUsage: { cpu: 0.7, memory: 0.8, gpu: 0.9 },
        costEfficiencyScore: 0.7,
      }],
      ['imagen4', {
        costPerGeneration: 1.2,
        averageProcessingTime: 75,
        successRate: 0.96,
        qualityScore: 0.88,
        resourceUsage: { cpu: 0.4, memory: 0.5, gpu: 0.7 },
        costEfficiencyScore: 0.85,
      }],
      ['recraft-v3', {
        costPerGeneration: 1.5,
        averageProcessingTime: 120,
        successRate: 0.94,
        qualityScore: 0.82,
        resourceUsage: { cpu: 0.6, memory: 0.7, gpu: 0.8 },
        costEfficiencyScore: 0.75,
      }],
      ['aura-sr', {
        costPerGeneration: 0.8,
        averageProcessingTime: 30,
        successRate: 0.99,
        qualityScore: 0.9,
        resourceUsage: { cpu: 0.2, memory: 0.3, gpu: 0.5 },
        costEfficiencyScore: 0.95,
      }],
      ['clarity-upscaler', {
        costPerGeneration: 1.0,
        averageProcessingTime: 60,
        successRate: 0.98,
        qualityScore: 0.92,
        resourceUsage: { cpu: 0.3, memory: 0.4, gpu: 0.6 },
        costEfficiencyScore: 0.9,
      }],
      ['flux-lora', {
        costPerGeneration: 1.3,
        averageProcessingTime: 100,
        successRate: 0.96,
        qualityScore: 0.87,
        resourceUsage: { cpu: 0.5, memory: 0.6, gpu: 0.8 },
        costEfficiencyScore: 0.8,
      }],
    ];

    modelData.forEach(([modelId, data]) => {
      this.modelCostData.set(modelId, { modelId, ...data });
    });
  }

  /**
   * Calculate model costs from generation data
   */
  private calculateModelCosts(generations: any[]): Record<FalAIModelId, number> {
    const modelCosts: Record<string, number> = {};

    generations.forEach(gen => {
      if (gen.models && Array.isArray(gen.models)) {
        gen.models.forEach((modelId: FalAIModelId) => {
          const cost = this.calculateGenerationCost(modelId, 1);
          modelCosts[modelId] = (modelCosts[modelId] || 0) + cost;
        });
      }
    });

    return modelCosts as Record<FalAIModelId, number>;
  }

  /**
   * Calculate processing costs
   */
  private calculateProcessingCosts(generations: any[]): number {
    // Base processing cost per generation
    return generations.length * 0.1;
  }

  /**
   * Calculate storage costs
   */
  private calculateStorageCosts(): number {
    // Estimated storage cost based on usage
    return 10; // $10 per month baseline
  }

  /**
   * Calculate caching costs
   */
  private calculateCachingCosts(): number {
    // Estimated caching infrastructure cost
    return 5; // $5 per month baseline
  }

  /**
   * Calculate cost savings from optimizations
   */
  private async calculateCostSavings(generations: any[]): Promise<{
    fromCaching: number;
    fromBatching: number;
    fromOptimization: number;
    total: number;
  }> {
    // Estimate savings based on cache hit rates and batching efficiency
    const totalGenerations = generations.length;
    const estimatedCacheHitRate = 0.3; // 30% cache hit rate
    const estimatedBatchingEfficiency = 0.15; // 15% efficiency gain

    const fromCaching = totalGenerations * estimatedCacheHitRate * 0.5; // Average cost per generation
    const fromBatching = totalGenerations * estimatedBatchingEfficiency * 0.1;
    const fromOptimization = (fromCaching + fromBatching) * 0.1; // Additional optimizations

    return {
      fromCaching,
      fromBatching,
      fromOptimization,
      total: fromCaching + fromBatching + fromOptimization,
    };
  }

  /**
   * Generate cost recommendations
   */
  private async generateCostRecommendations(totalCost: number, modelCosts: Record<FalAIModelId, number>): Promise<string[]> {
    const recommendations: string[] = [];

    // High cost models
    const sortedModelCosts = Object.entries(modelCosts)
      .sort(([,a], [,b]) => b - a);

    if (sortedModelCosts.length > 0 && sortedModelCosts[0][1] > totalCost * 0.4) {
      recommendations.push(`Consider alternatives to ${sortedModelCosts[0][0]} which accounts for ${((sortedModelCosts[0][1] / totalCost) * 100).toFixed(1)}% of costs`);
    }

    // Budget threshold
    const monthlyLimit = this.config.budgetLimits.monthly;
    if (totalCost > monthlyLimit * 0.8) {
      recommendations.push('Monthly budget usage is high - consider implementing cost controls');
    }

    // Efficiency recommendations
    recommendations.push('Implement intelligent caching to reduce redundant processing');
    recommendations.push('Use batch processing for non-urgent requests');
    recommendations.push('Consider using flux-dev for development and testing');

    return recommendations;
  }

  /**
   * Project monthly cost based on current usage
   */
  private projectMonthlyCost(currentCost: number, timeframe: string): number {
    const multipliers = {
      daily: 30,
      weekly: 4.33,
      monthly: 1,
    };

    return currentCost * (multipliers[timeframe as keyof typeof multipliers] || 1);
  }

  /**
   * Get cost trends
   */
  private async getCostTrends(): Promise<{ daily: number[]; weekly: number[]; monthly: number[] }> {
    // Simulate cost trends - in production, this would query actual data
    const generateTrend = (length: number, base: number) => 
      Array.from({ length }, () => base + (Math.random() - 0.5) * base * 0.3);

    return {
      daily: generateTrend(30, 10),
      weekly: generateTrend(12, 70),
      monthly: generateTrend(6, 300),
    };
  }

  /**
   * Get start date for timeframe
   */
  private getStartDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Optimization decision helpers
   */
  private shouldOptimizeModelSelection(analysis: CostAnalysis): boolean {
    return Object.values(analysis.costBreakdown.modelCosts).some(cost => cost > analysis.totalCost * 0.3);
  }

  private shouldOptimizeBatching(analysis: CostAnalysis): boolean {
    return analysis.costSavings.fromBatching < analysis.totalCost * 0.1;
  }

  private shouldOptimizeCaching(analysis: CostAnalysis): boolean {
    return analysis.costSavings.fromCaching < analysis.totalCost * 0.2;
  }

  private shouldOptimizeResources(usage: ResourceUsage): boolean {
    return usage.cpu.average > 0.7 || usage.memory.average > 0.7 || usage.gpu.average > 0.8;
  }

  private shouldOptimizeScheduling(analysis: CostAnalysis): boolean {
    return analysis.totalCost > this.config.budgetLimits.monthly * 0.5;
  }
}

// Export singleton instance
export const costOptimizationManager = new CostOptimizationManager();

/**
 * Convenience functions
 */
export async function analyzeCosts(timeframe: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<CostAnalysis> {
  return costOptimizationManager.analyzeCosts(timeframe);
}

export async function getResourceUsage(): Promise<ResourceUsage> {
  return costOptimizationManager.getResourceUsage();
}

export async function generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
  return costOptimizationManager.generateOptimizationRecommendations();
}

export function getMostCostEffectiveModel(
  qualityRequirement: number = 0.8,
  speedRequirement: 'fast' | 'medium' | 'slow' = 'medium'
): FalAIModelId | null {
  return costOptimizationManager.getMostCostEffectiveModel(qualityRequirement, speedRequirement);
}

export function calculateGenerationCost(
  modelId: FalAIModelId,
  numImages: number = 1,
  options: any = {}
): number {
  return costOptimizationManager.calculateGenerationCost(modelId, numImages, options);
}

export async function monitorBudgetUsage(): Promise<{
  status: 'ok' | 'warning' | 'critical';
  usage: number;
  limit: number;
  message: string;
}> {
  return costOptimizationManager.monitorBudgetUsage();
}
