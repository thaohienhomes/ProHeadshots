"use client";

import React, { useState } from 'react';
import { Sparkles, Zap, Palette, Camera, Video, Wand2 } from 'lucide-react';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: 'headshot' | 'video' | 'enhancement' | 'background';
  capabilities: string[];
  processingTime: string;
  quality: 'Standard' | 'Professional' | 'Ultra HD' | 'Premium';
  icon: React.ReactNode;
  preview?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'flux-pro-ultra',
    name: 'Flux Pro Ultra',
    description: 'Ultra-high definition headshots with exceptional detail and realism',
    category: 'headshot',
    capabilities: ['Ultra HD Resolution', 'Photorealistic', 'Professional Lighting', 'Advanced Face Enhancement'],
    processingTime: '2-3 minutes',
    quality: 'Ultra HD',
    icon: <Camera className="w-6 h-6" />,
    preview: '/models/flux-pro-preview.jpg',
    isPopular: true,
  },
  {
    id: 'imagen4',
    name: 'Imagen4',
    description: 'Google\'s latest AI model for professional-grade image generation',
    category: 'headshot',
    capabilities: ['Professional Quality', 'Natural Expressions', 'Consistent Style', 'Fast Processing'],
    processingTime: '1-2 minutes',
    quality: 'Professional',
    icon: <Sparkles className="w-6 h-6" />,
    preview: '/models/imagen4-preview.jpg',
  },
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    description: 'Artistic and creative headshots with unique styling options',
    category: 'headshot',
    capabilities: ['Artistic Styles', 'Creative Effects', 'Style Transfer', 'Custom Aesthetics'],
    processingTime: '2-4 minutes',
    quality: 'Premium',
    icon: <Palette className="w-6 h-6" />,
    preview: '/models/recraft-preview.jpg',
  },
  {
    id: 'veo3',
    name: 'Veo3',
    description: 'AI video generation for dynamic profile videos',
    category: 'video',
    capabilities: ['Video Generation', 'Motion Effects', 'Dynamic Poses', 'Cinematic Quality'],
    processingTime: '5-10 minutes',
    quality: 'Professional',
    icon: <Video className="w-6 h-6" />,
    preview: '/models/veo3-preview.jpg',
    isNew: true,
  },
  {
    id: 'kling-video',
    name: 'Kling Video',
    description: 'Advanced video AI for professional profile videos',
    category: 'video',
    capabilities: ['High-Quality Video', 'Smooth Animations', 'Professional Editing', 'Multiple Formats'],
    processingTime: '3-8 minutes',
    quality: 'Ultra HD',
    icon: <Video className="w-6 h-6" />,
    preview: '/models/kling-preview.jpg',
  },
  {
    id: 'aura-sr',
    name: 'AuraSR',
    description: 'Super-resolution enhancement for existing images',
    category: 'enhancement',
    capabilities: ['4x Upscaling', 'Detail Enhancement', 'Noise Reduction', 'Quality Improvement'],
    processingTime: '30-60 seconds',
    quality: 'Ultra HD',
    icon: <Zap className="w-6 h-6" />,
    preview: '/models/aura-preview.jpg',
  },
  {
    id: 'clarity-upscaler',
    name: 'Clarity Upscaler',
    description: 'Advanced upscaling with clarity preservation',
    category: 'enhancement',
    capabilities: ['8x Upscaling', 'Edge Enhancement', 'Artifact Removal', 'Sharpness Control'],
    processingTime: '1-2 minutes',
    quality: 'Premium',
    icon: <Wand2 className="w-6 h-6" />,
    preview: '/models/clarity-preview.jpg',
  },
  {
    id: 'flux-kontext',
    name: 'Flux Pro Kontext',
    description: 'Intelligent background replacement and scene generation',
    category: 'background',
    capabilities: ['Background Removal', 'Scene Generation', 'Lighting Match', 'Realistic Compositing'],
    processingTime: '1-3 minutes',
    quality: 'Professional',
    icon: <Camera className="w-6 h-6" />,
    preview: '/models/kontext-preview.jpg',
  },
];

interface AIModelSelectorProps {
  selectedModels: string[];
  onModelSelect: (modelIds: string[]) => void;
  category?: 'headshot' | 'video' | 'enhancement' | 'background' | 'all';
  maxSelections?: number;
  showComparison?: boolean;
}

export default function AIModelSelector({
  selectedModels,
  onModelSelect,
  category = 'all',
  maxSelections = 3,
  showComparison = false,
}: AIModelSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>(category);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const filteredModels = category === 'all' 
    ? AI_MODELS 
    : AI_MODELS.filter(model => model.category === category);

  const categories = [
    { id: 'all', name: 'All Models', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'headshot', name: 'Headshots', icon: <Camera className="w-4 h-4" /> },
    { id: 'video', name: 'Video', icon: <Video className="w-4 h-4" /> },
    { id: 'enhancement', name: 'Enhancement', icon: <Zap className="w-4 h-4" /> },
    { id: 'background', name: 'Background', icon: <Palette className="w-4 h-4" /> },
  ];

  const handleModelToggle = (modelId: string) => {
    const isSelected = selectedModels.includes(modelId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedModels.filter(id => id !== modelId);
    } else {
      if (selectedModels.length >= maxSelections) {
        // Replace the first selected model if at max capacity
        newSelection = [...selectedModels.slice(1), modelId];
      } else {
        newSelection = [...selectedModels, modelId];
      }
    }

    onModelSelect(newSelection);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Ultra HD': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'Premium': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'Professional': return 'text-primary-400 bg-primary-400/10 border-primary-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      {category === 'all' && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500 to-primary-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels
          .filter(model => activeCategory === 'all' || model.category === activeCategory)
          .map((model) => {
            const isSelected = selectedModels.includes(model.id);
            
            return (
              <div
                key={model.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'transform scale-105'
                    : 'hover:scale-105'
                }`}
                onClick={() => handleModelToggle(model.id)}
              >
                <div
                  className={`relative bg-white/10 backdrop-blur-lg border rounded-xl p-6 transition-all duration-300 ${
                    isSelected
                      ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-primary-500/10 shadow-lg shadow-cyan-500/20'
                      : 'border-white/20 hover:border-white/40 hover:bg-white/15'
                  }`}
                >
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {model.isPopular && (
                      <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500 to-primary-500 text-white rounded-full">
                        Popular
                      </span>
                    )}
                    {model.isNew && (
                      <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  {/* Model Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white'
                  }`}>
                    {model.icon}
                  </div>

                  {/* Model Info */}
                  <h3 className="text-lg font-semibold text-white mb-2">{model.name}</h3>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{model.description}</p>

                  {/* Quality Badge */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-4 ${getQualityColor(model.quality)}`}>
                    {model.quality}
                  </div>

                  {/* Processing Time */}
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <Zap className="w-4 h-4" />
                    {model.processingTime}
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-1">
                    {model.capabilities.slice(0, 2).map((capability, index) => (
                      <div key={index} className="flex items-center gap-2 text-slate-300 text-xs">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        {capability}
                      </div>
                    ))}
                    {model.capabilities.length > 2 && (
                      <div className="text-slate-400 text-xs">
                        +{model.capabilities.length - 2} more features
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border-2 border-cyan-400 pointer-events-none">
                      <div className="absolute top-2 left-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Selection Summary */}
      {selectedModels.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <h4 className="text-white font-medium mb-2">Selected Models ({selectedModels.length}/{maxSelections})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedModels.map((modelId) => {
              const model = AI_MODELS.find(m => m.id === modelId);
              return model ? (
                <span key={modelId} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                  {model.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
