import { FalAIModelId, getModelInfo } from './falAI';
import { createClient } from './supabase/server';
import { logger } from './logger';

export interface UserRequirements {
  purpose: 'professional' | 'creative' | 'social' | 'portfolio' | 'corporate';
  quality: 'basic' | 'standard' | 'premium' | 'ultra';
  speed: 'fast' | 'balanced' | 'quality';
  budget: 'low' | 'medium' | 'high' | 'unlimited';
  style: 'realistic' | 'artistic' | 'professional' | 'casual' | 'creative';
  outputCount: number;
  userPlan: 'basic' | 'professional' | 'executive';
}

export interface ImageCharacteristics {
  resolution?: string;
  aspectRatio?: string;
  lighting?: 'natural' | 'studio' | 'outdoor' | 'indoor';
  complexity?: 'simple' | 'moderate' | 'complex';
  faceCount?: number;
  backgroundType?: 'simple' | 'detailed' | 'transparent';
}

export interface ModelRecommendation {
  modelId: FalAIModelId;
  confidence: number; // 0-1
  reasoning: string[];
  estimatedCost: number;
  estimatedTime: number;
  qualityScore: number;
  suitabilityScore: number;
}

export interface ModelSelectionResult {
  primaryModel: ModelRecommendation;
  alternativeModels: ModelRecommendation[];
  totalEstimatedCost: number;
  totalEstimatedTime: number;
  recommendations: string[];
}

/**
 * Intelligent model selection based on user requirements and image characteristics
 */
export class IntelligentModelSelector {
  private modelPerformanceData: Map<FalAIModelId, any> = new Map();
  private userPreferenceData: Map<string, any> = new Map();

  constructor() {
    this.initializeModelData();
  }

  /**
   * Select optimal models based on requirements
   */
  async selectOptimalModels(
    requirements: UserRequirements,
    imageCharacteristics?: ImageCharacteristics,
    userId?: string
  ): Promise<ModelSelectionResult> {
    try {
      // Get user preference history if available
      const userPreferences = userId ? await this.getUserPreferences(userId) : null;
      
      // Analyze all available models
      const modelAnalysis = await this.analyzeModels(requirements, imageCharacteristics, userPreferences);
      
      // Rank models by suitability
      const rankedModels = this.rankModels(modelAnalysis, requirements);
      
      // Select primary and alternative models
      const primaryModel = rankedModels[0];
      const alternativeModels = rankedModels.slice(1, 4); // Top 3 alternatives
      
      // Calculate totals and generate recommendations
      const result: ModelSelectionResult = {
        primaryModel,
        alternativeModels,
        totalEstimatedCost: primaryModel.estimatedCost,
        totalEstimatedTime: primaryModel.estimatedTime,
        recommendations: this.generateRecommendations(primaryModel, requirements),
      };

      // Log selection for learning
      await this.logModelSelection(userId, requirements, result);

      return result;
    } catch (error) {
      logger.error('Error in intelligent model selection', error, 'AI_MODEL_SELECTION');
      throw error;
    }
  }

  /**
   * Analyze all models against requirements
   */
  private async analyzeModels(
    requirements: UserRequirements,
    imageCharacteristics?: ImageCharacteristics,
    userPreferences?: any
  ): Promise<ModelRecommendation[]> {
    const availableModels: FalAIModelId[] = [
      'flux-pro-ultra', 'flux-pro', 'flux-dev', 'imagen4', 'recraft-v3',
      'aura-sr', 'clarity-upscaler', 'flux-lora'
    ];

    const recommendations: ModelRecommendation[] = [];

    for (const modelId of availableModels) {
      const modelInfo = getModelInfo(modelId);
      if (!modelInfo) continue;

      const recommendation = await this.evaluateModel(
        modelId,
        requirements,
        imageCharacteristics,
        userPreferences
      );

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  /**
   * Evaluate a single model against requirements
   */
  private async evaluateModel(
    modelId: FalAIModelId,
    requirements: UserRequirements,
    imageCharacteristics?: ImageCharacteristics,
    userPreferences?: any
  ): Promise<ModelRecommendation> {
    const modelInfo = getModelInfo(modelId);
    const performanceData = this.modelPerformanceData.get(modelId);
    
    let confidence = 0;
    let qualityScore = 0;
    let suitabilityScore = 0;
    const reasoning: string[] = [];

    // Quality assessment
    qualityScore = this.assessQuality(modelId, requirements.quality);
    if (qualityScore > 0.8) reasoning.push(`Excellent quality match for ${requirements.quality} requirements`);

    // Speed assessment
    const speedScore = this.assessSpeed(modelId, requirements.speed);
    if (speedScore > 0.8) reasoning.push(`Optimal speed for ${requirements.speed} preference`);

    // Cost assessment
    const costScore = this.assessCost(modelId, requirements.budget);
    if (costScore > 0.8) reasoning.push(`Cost-effective for ${requirements.budget} budget`);

    // Purpose suitability
    const purposeScore = this.assessPurpose(modelId, requirements.purpose);
    if (purposeScore > 0.8) reasoning.push(`Highly suitable for ${requirements.purpose} use case`);

    // Style compatibility
    const styleScore = this.assessStyle(modelId, requirements.style);
    if (styleScore > 0.8) reasoning.push(`Perfect style match for ${requirements.style} aesthetic`);

    // User plan compatibility
    const planScore = this.assessPlanCompatibility(modelId, requirements.userPlan);
    if (planScore > 0.8) reasoning.push(`Optimized for ${requirements.userPlan} plan features`);

    // User preference bonus
    let preferenceBonus = 0;
    if (userPreferences?.favoriteModels?.includes(modelId)) {
      preferenceBonus = 0.1;
      reasoning.push('Based on your previous preferences');
    }

    // Calculate overall scores
    suitabilityScore = (qualityScore + speedScore + costScore + purposeScore + styleScore + planScore) / 6;
    confidence = Math.min(suitabilityScore + preferenceBonus, 1);

    // Estimate cost and time
    const estimatedCost = this.estimateCost(modelId, requirements.outputCount);
    const estimatedTime = this.estimateTime(modelId, requirements.outputCount);

    return {
      modelId,
      confidence,
      reasoning,
      estimatedCost,
      estimatedTime,
      qualityScore,
      suitabilityScore,
    };
  }

  /**
   * Assess quality compatibility
   */
  private assessQuality(modelId: FalAIModelId, quality: string): number {
    const qualityMap = {
      'flux-pro-ultra': { ultra: 1.0, premium: 0.9, standard: 0.7, basic: 0.5 },
      'flux-pro': { ultra: 0.8, premium: 1.0, standard: 0.9, basic: 0.7 },
      'flux-dev': { ultra: 0.4, premium: 0.6, standard: 0.8, basic: 1.0 },
      'imagen4': { ultra: 0.7, premium: 0.9, standard: 1.0, basic: 0.8 },
      'recraft-v3': { ultra: 0.8, premium: 1.0, standard: 0.8, basic: 0.6 },
      'aura-sr': { ultra: 1.0, premium: 0.9, standard: 0.7, basic: 0.5 },
      'clarity-upscaler': { ultra: 1.0, premium: 0.9, standard: 0.7, basic: 0.5 },
      'flux-lora': { ultra: 0.9, premium: 1.0, standard: 0.8, basic: 0.6 },
    };

    return qualityMap[modelId]?.[quality] || 0.5;
  }

  /**
   * Assess speed compatibility
   */
  private assessSpeed(modelId: FalAIModelId, speed: string): number {
    const speedMap = {
      'flux-pro-ultra': { fast: 0.3, balanced: 0.7, quality: 1.0 },
      'flux-pro': { fast: 0.6, balanced: 1.0, quality: 0.8 },
      'flux-dev': { fast: 1.0, balanced: 0.8, quality: 0.5 },
      'imagen4': { fast: 0.7, balanced: 0.9, quality: 0.8 },
      'recraft-v3': { fast: 0.4, balanced: 0.7, quality: 1.0 },
      'aura-sr': { fast: 0.9, balanced: 1.0, quality: 0.7 },
      'clarity-upscaler': { fast: 0.6, balanced: 0.8, quality: 1.0 },
      'flux-lora': { fast: 0.5, balanced: 0.8, quality: 1.0 },
    };

    return speedMap[modelId]?.[speed] || 0.5;
  }

  /**
   * Assess cost compatibility
   */
  private assessCost(modelId: FalAIModelId, budget: string): number {
    const costMap = {
      'flux-pro-ultra': { low: 0.2, medium: 0.5, high: 0.8, unlimited: 1.0 },
      'flux-pro': { low: 0.4, medium: 0.8, high: 1.0, unlimited: 1.0 },
      'flux-dev': { low: 1.0, medium: 1.0, high: 0.8, unlimited: 0.6 },
      'imagen4': { low: 0.5, medium: 0.8, high: 1.0, unlimited: 1.0 },
      'recraft-v3': { low: 0.3, medium: 0.6, high: 0.9, unlimited: 1.0 },
      'aura-sr': { low: 0.6, medium: 0.9, high: 1.0, unlimited: 1.0 },
      'clarity-upscaler': { low: 0.4, medium: 0.7, high: 1.0, unlimited: 1.0 },
      'flux-lora': { low: 0.5, medium: 0.8, high: 1.0, unlimited: 1.0 },
    };

    return costMap[modelId]?.[budget] || 0.5;
  }

  /**
   * Assess purpose suitability
   */
  private assessPurpose(modelId: FalAIModelId, purpose: string): number {
    const purposeMap = {
      'flux-pro-ultra': { professional: 1.0, corporate: 1.0, portfolio: 0.9, creative: 0.6, social: 0.5 },
      'flux-pro': { professional: 0.9, corporate: 0.9, portfolio: 1.0, creative: 0.7, social: 0.6 },
      'flux-dev': { professional: 0.6, corporate: 0.5, portfolio: 0.7, creative: 0.8, social: 1.0 },
      'imagen4': { professional: 0.8, corporate: 0.8, portfolio: 0.9, creative: 0.7, social: 0.7 },
      'recraft-v3': { professional: 0.6, corporate: 0.5, portfolio: 0.8, creative: 1.0, social: 0.9 },
      'aura-sr': { professional: 0.9, corporate: 0.9, portfolio: 1.0, creative: 0.7, social: 0.6 },
      'clarity-upscaler': { professional: 0.9, corporate: 0.9, portfolio: 1.0, creative: 0.7, social: 0.6 },
      'flux-lora': { professional: 0.8, corporate: 0.7, portfolio: 0.9, creative: 0.9, social: 0.8 },
    };

    return purposeMap[modelId]?.[purpose] || 0.5;
  }

  /**
   * Assess style compatibility
   */
  private assessStyle(modelId: FalAIModelId, style: string): number {
    const styleMap = {
      'flux-pro-ultra': { realistic: 1.0, professional: 1.0, casual: 0.7, artistic: 0.5, creative: 0.5 },
      'flux-pro': { realistic: 0.9, professional: 0.9, casual: 0.8, artistic: 0.6, creative: 0.6 },
      'flux-dev': { realistic: 0.7, professional: 0.6, casual: 1.0, artistic: 0.8, creative: 0.8 },
      'imagen4': { realistic: 0.8, professional: 0.8, casual: 0.8, artistic: 0.7, creative: 0.7 },
      'recraft-v3': { realistic: 0.5, professional: 0.6, casual: 0.8, artistic: 1.0, creative: 1.0 },
      'aura-sr': { realistic: 1.0, professional: 0.9, casual: 0.7, artistic: 0.6, creative: 0.6 },
      'clarity-upscaler': { realistic: 1.0, professional: 0.9, casual: 0.7, artistic: 0.6, creative: 0.6 },
      'flux-lora': { realistic: 0.8, professional: 0.8, casual: 0.8, artistic: 0.9, creative: 0.9 },
    };

    return styleMap[modelId]?.[style] || 0.5;
  }

  /**
   * Assess plan compatibility
   */
  private assessPlanCompatibility(modelId: FalAIModelId, plan: string): number {
    const planMap = {
      'flux-pro-ultra': { basic: 0.3, professional: 0.8, executive: 1.0 },
      'flux-pro': { basic: 0.6, professional: 1.0, executive: 1.0 },
      'flux-dev': { basic: 1.0, professional: 0.8, executive: 0.6 },
      'imagen4': { basic: 0.5, professional: 0.9, executive: 1.0 },
      'recraft-v3': { basic: 0.4, professional: 0.8, executive: 1.0 },
      'aura-sr': { basic: 0.7, professional: 1.0, executive: 1.0 },
      'clarity-upscaler': { basic: 0.5, professional: 0.9, executive: 1.0 },
      'flux-lora': { basic: 0.6, professional: 1.0, executive: 1.0 },
    };

    return planMap[modelId]?.[plan] || 0.5;
  }

  /**
   * Estimate cost for model and output count
   */
  private estimateCost(modelId: FalAIModelId, outputCount: number): number {
    const baseCosts = {
      'flux-pro-ultra': 3.0,
      'flux-pro': 2.0,
      'flux-dev': 1.0,
      'imagen4': 2.0,
      'recraft-v3': 2.5,
      'aura-sr': 1.5,
      'clarity-upscaler': 2.0,
      'flux-lora': 2.0,
    };

    return (baseCosts[modelId] || 1.0) * outputCount;
  }

  /**
   * Estimate processing time
   */
  private estimateTime(modelId: FalAIModelId, outputCount: number): number {
    const baseTimes = {
      'flux-pro-ultra': 180, // 3 minutes
      'flux-pro': 120, // 2 minutes
      'flux-dev': 45, // 45 seconds
      'imagen4': 90, // 1.5 minutes
      'recraft-v3': 150, // 2.5 minutes
      'aura-sr': 60, // 1 minute
      'clarity-upscaler': 90, // 1.5 minutes
      'flux-lora': 120, // 2 minutes
    };

    return (baseTimes[modelId] || 60) * outputCount;
  }

  /**
   * Rank models by overall suitability
   */
  private rankModels(
    recommendations: ModelRecommendation[],
    requirements: UserRequirements
  ): ModelRecommendation[] {
    return recommendations
      .filter(rec => rec.confidence > 0.3) // Filter out very low confidence models
      .sort((a, b) => {
        // Primary sort by confidence
        if (Math.abs(a.confidence - b.confidence) > 0.1) {
          return b.confidence - a.confidence;
        }
        
        // Secondary sort by suitability score
        if (Math.abs(a.suitabilityScore - b.suitabilityScore) > 0.05) {
          return b.suitabilityScore - a.suitabilityScore;
        }
        
        // Tertiary sort by cost efficiency (for budget-conscious users)
        if (requirements.budget === 'low' || requirements.budget === 'medium') {
          return a.estimatedCost - b.estimatedCost;
        }
        
        // Final sort by quality score
        return b.qualityScore - a.qualityScore;
      });
  }

  /**
   * Generate recommendations based on selection
   */
  private generateRecommendations(
    primaryModel: ModelRecommendation,
    requirements: UserRequirements
  ): string[] {
    const recommendations: string[] = [];

    if (primaryModel.confidence > 0.9) {
      recommendations.push('Excellent model match for your requirements');
    } else if (primaryModel.confidence > 0.7) {
      recommendations.push('Good model match with minor trade-offs');
    } else {
      recommendations.push('Consider adjusting requirements for better results');
    }

    if (requirements.budget === 'low' && primaryModel.estimatedCost > 5) {
      recommendations.push('Consider flux-dev for more cost-effective results');
    }

    if (requirements.speed === 'fast' && primaryModel.estimatedTime > 120) {
      recommendations.push('For faster results, consider flux-dev or aura-sr');
    }

    if (requirements.quality === 'ultra' && primaryModel.qualityScore < 0.9) {
      recommendations.push('For maximum quality, consider flux-pro-ultra');
    }

    return recommendations;
  }

  /**
   * Get user preferences from database
   */
  private async getUserPreferences(userId: string): Promise<any> {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('user_ai_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Log model selection for learning
   */
  private async logModelSelection(
    userId: string | undefined,
    requirements: UserRequirements,
    result: ModelSelectionResult
  ): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase
        .from('ai_model_selections')
        .insert({
          user_id: userId,
          requirements,
          selected_model: result.primaryModel.modelId,
          confidence: result.primaryModel.confidence,
          estimated_cost: result.totalEstimatedCost,
          estimated_time: result.totalEstimatedTime,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      logger.error('Error logging model selection', error, 'AI_MODEL_SELECTION');
    }
  }

  /**
   * Initialize model performance data
   */
  private initializeModelData(): void {
    // This would typically be loaded from a database or external service
    // For now, we'll use static data
    this.modelPerformanceData.set('flux-pro-ultra', {
      successRate: 0.95,
      avgQualityScore: 0.92,
      avgProcessingTime: 180,
      userSatisfaction: 0.89,
    });

    this.modelPerformanceData.set('flux-pro', {
      successRate: 0.93,
      avgQualityScore: 0.85,
      avgProcessingTime: 120,
      userSatisfaction: 0.87,
    });

    this.modelPerformanceData.set('flux-dev', {
      successRate: 0.90,
      avgQualityScore: 0.75,
      avgProcessingTime: 45,
      userSatisfaction: 0.82,
    });

    // Add more model data as needed
  }
}

// Export singleton instance
export const intelligentModelSelector = new IntelligentModelSelector();

/**
 * Convenience function for quick model selection
 */
export async function selectBestModel(
  requirements: UserRequirements,
  imageCharacteristics?: ImageCharacteristics,
  userId?: string
): Promise<ModelSelectionResult> {
  return intelligentModelSelector.selectOptimalModels(requirements, imageCharacteristics, userId);
}
