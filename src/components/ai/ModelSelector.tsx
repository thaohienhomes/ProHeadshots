"use client";

import React, { useState } from 'react';
import { FalAIModelId, getModelInfo } from '@/utils/falAI';
import { calculateCreditsNeeded } from '@/utils/creditSystem.client';

interface ModelSelectorProps {
  selectedModel: FalAIModelId;
  onModelChange: (model: FalAIModelId) => void;
  imageCount?: number;
  qualityLevel?: string;
}

const MODEL_CATEGORIES = {
  'Professional': ['flux-pro-ultra', 'flux-pro', 'imagen4'],
  'Creative': ['recraft-v3', 'flux-lora'],
  'Enhancement': ['aura-sr', 'clarity-upscaler'],
  'Development': ['flux-dev']
} as const;

export default function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  imageCount = 1,
  qualityLevel = 'standard'
}: ModelSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string>('Professional');

  const handleModelSelect = (model: FalAIModelId) => {
    onModelChange(model);
  };

  const getCreditsForModel = (model: FalAIModelId) => {
    return calculateCreditsNeeded(imageCount, model, qualityLevel);
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Basic': return 'text-green-400';
      case 'Standard': return 'text-cyan-400';
      case 'Premium': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">AI Model Selection</h3>
      
      <div className="space-y-4">
        {Object.entries(MODEL_CATEGORIES).map(([category, models]) => (
          <div key={category} className="border border-navy-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category ? '' : category)}
              className="w-full px-4 py-3 bg-navy-700/50 hover:bg-navy-600/50 text-left flex items-center justify-between transition-colors"
            >
              <span className="font-semibold text-white">{category} Models</span>
              <span className={`transform transition-transform ${
                expandedCategory === category ? 'rotate-180' : ''
              }`}>
                ▼
              </span>
            </button>
            
            {expandedCategory === category && (
              <div className="p-4 space-y-3">
                {models.map((model) => {
                  const modelInfo = getModelInfo(model);
                  const credits = getCreditsForModel(model);
                  const isSelected = selectedModel === model;
                  
                  return (
                    <div
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-navy-600 hover:border-cyan-400/50 hover:bg-navy-700/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">
                            {modelInfo?.name || model}
                          </h4>
                          <p className="text-sm text-navy-300 mb-2">
                            {modelInfo?.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-sm font-medium ${getPricingColor(modelInfo?.pricing || '')}`}>
                            {modelInfo?.pricing}
                          </div>
                          <div className="text-xs text-navy-400">
                            {credits} credit{credits !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {modelInfo?.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-navy-600/50 text-xs text-cyan-300 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-navy-400">
                        <span>Max: {modelInfo?.maxResolution}</span>
                        <span>Time: {modelInfo?.avgProcessingTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Selected Model Summary */}
      <div className="mt-6 p-4 bg-navy-700/30 rounded-lg border border-cyan-400/20">
        <h4 className="font-semibold text-white mb-2">Selected Model</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-400 font-medium">
              {getModelInfo(selectedModel)?.name || selectedModel}
            </p>
            <p className="text-sm text-navy-300">
              {imageCount} image{imageCount !== 1 ? 's' : ''} • {qualityLevel} quality
            </p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">
              {getCreditsForModel(selectedModel)} Credits
            </p>
            <p className="text-xs text-navy-400">
              Est. {getModelInfo(selectedModel)?.avgProcessingTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
