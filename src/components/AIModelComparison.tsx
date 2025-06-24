"use client";

import React, { useState } from 'react';
import { Check, X, Zap, Clock, Star, Camera, Palette, Video } from 'lucide-react';
import Image from 'next/image';

interface ModelFeature {
  name: string;
  description?: string;
  supported: boolean;
  premium?: boolean;
}

interface ModelSpec {
  id: string;
  name: string;
  description: string;
  category: 'headshot' | 'video' | 'enhancement' | 'background';
  icon: React.ReactNode;
  quality: 'Standard' | 'Professional' | 'Ultra HD' | 'Premium';
  processingTime: string;
  resolution: string;
  price: string;
  features: ModelFeature[];
  sampleImages: string[];
  pros: string[];
  cons: string[];
  bestFor: string[];
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
}

const MODEL_SPECS: ModelSpec[] = [
  {
    id: 'flux-pro-ultra',
    name: 'Flux Pro Ultra',
    description: 'Ultra-high definition headshots with exceptional detail and realism',
    category: 'headshot',
    icon: <Camera className="w-6 h-6" />,
    quality: 'Ultra HD',
    processingTime: '2-3 minutes',
    resolution: '4K (3840×2160)',
    price: 'Premium',
    rating: 4.9,
    isPopular: true,
    features: [
      { name: 'Ultra HD Resolution', supported: true },
      { name: 'Photorealistic Quality', supported: true },
      { name: 'Professional Lighting', supported: true },
      { name: 'Advanced Face Enhancement', supported: true },
      { name: 'Background Customization', supported: true },
      { name: 'Batch Processing', supported: true },
      { name: 'Video Generation', supported: false },
      { name: 'Real-time Preview', supported: true, premium: true },
    ],
    sampleImages: ['/samples/flux-1.jpg', '/samples/flux-2.jpg', '/samples/flux-3.jpg'],
    pros: ['Highest quality output', 'Exceptional detail', 'Professional lighting', 'Fast processing'],
    cons: ['Higher cost', 'Requires more processing power'],
    bestFor: ['Executive headshots', 'LinkedIn profiles', 'Corporate photography', 'High-end portfolios'],
  },
  {
    id: 'imagen4',
    name: 'Imagen4',
    description: 'Google\'s latest AI model for professional-grade image generation',
    category: 'headshot',
    icon: <Star className="w-6 h-6" />,
    quality: 'Professional',
    processingTime: '1-2 minutes',
    resolution: '2K (2048×1536)',
    price: 'Standard',
    rating: 4.7,
    features: [
      { name: 'Ultra HD Resolution', supported: false },
      { name: 'Photorealistic Quality', supported: true },
      { name: 'Professional Lighting', supported: true },
      { name: 'Advanced Face Enhancement', supported: true },
      { name: 'Background Customization', supported: true },
      { name: 'Batch Processing', supported: true },
      { name: 'Video Generation', supported: false },
      { name: 'Real-time Preview', supported: true },
    ],
    sampleImages: ['/samples/imagen-1.jpg', '/samples/imagen-2.jpg', '/samples/imagen-3.jpg'],
    pros: ['Fast processing', 'Natural expressions', 'Consistent quality', 'Cost-effective'],
    cons: ['Lower resolution than Ultra models', 'Limited customization'],
    bestFor: ['Business headshots', 'Social media profiles', 'Team photos', 'Quick turnaround projects'],
  },
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    description: 'Artistic and creative headshots with unique styling options',
    category: 'headshot',
    icon: <Palette className="w-6 h-6" />,
    quality: 'Premium',
    processingTime: '2-4 minutes',
    resolution: '3K (3072×2304)',
    price: 'Premium',
    rating: 4.6,
    isNew: true,
    features: [
      { name: 'Ultra HD Resolution', supported: false },
      { name: 'Photorealistic Quality', supported: true },
      { name: 'Professional Lighting', supported: true },
      { name: 'Advanced Face Enhancement', supported: true },
      { name: 'Background Customization', supported: true },
      { name: 'Batch Processing', supported: false },
      { name: 'Video Generation', supported: false },
      { name: 'Real-time Preview', supported: true },
    ],
    sampleImages: ['/samples/recraft-1.jpg', '/samples/recraft-2.jpg', '/samples/recraft-3.jpg'],
    pros: ['Artistic styles', 'Creative effects', 'Unique aesthetics', 'Style transfer'],
    cons: ['Longer processing time', 'Less photorealistic', 'Limited batch processing'],
    bestFor: ['Creative portfolios', 'Artistic headshots', 'Brand photography', 'Unique styling needs'],
  },
];

interface AIModelComparisonProps {
  selectedModels?: string[];
  onModelSelect?: (modelId: string) => void;
  showSamples?: boolean;
  compactView?: boolean;
}

export default function AIModelComparison({
  selectedModels = [],
  onModelSelect,
  showSamples = true,
  compactView = false,
}: AIModelComparisonProps) {
  const [activeTab, setActiveTab] = useState<'features' | 'samples' | 'specs'>('features');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    selectedModels.length > 0 ? selectedModels : MODEL_SPECS.slice(0, 2).map(m => m.id)
  );

  const comparisonModels = MODEL_SPECS.filter(model => 
    selectedForComparison.includes(model.id)
  );

  const allFeatures = Array.from(
    new Set(MODEL_SPECS.flatMap(model => model.features.map(f => f.name)))
  );

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Ultra HD': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'Premium': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'Professional': return 'text-primary-400 bg-primary-400/10 border-primary-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const handleModelToggle = (modelId: string) => {
    if (selectedForComparison.includes(modelId)) {
      if (selectedForComparison.length > 1) {
        setSelectedForComparison(prev => prev.filter(id => id !== modelId));
      }
    } else {
      if (selectedForComparison.length < 3) {
        setSelectedForComparison(prev => [...prev, modelId]);
      } else {
        setSelectedForComparison(prev => [...prev.slice(1), modelId]);
      }
    }
  };

  if (compactView) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Model Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisonModels.map((model) => (
            <div key={model.id} className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/10 flex items-center justify-center text-white">
                {model.icon}
              </div>
              <h4 className="font-medium text-white mb-1">{model.name}</h4>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs border ${getQualityColor(model.quality)}`}>
                {model.quality}
              </div>
              <p className="text-slate-300 text-sm mt-2">{model.processingTime}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Models to Compare</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODEL_SPECS.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelToggle(model.id)}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                selectedForComparison.includes(model.id)
                  ? 'border-cyan-400/50 bg-cyan-400/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-white">{model.icon}</div>
                <div>
                  <h4 className="font-medium text-white">{model.name}</h4>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs border ${getQualityColor(model.quality)}`}>
                    {model.quality}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm">{model.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Tabs */}
      <div className="flex gap-2">
        {['features', 'samples', 'specs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${
              activeTab === tab
                ? 'bg-gradient-to-r from-cyan-500 to-primary-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comparison Content */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        {activeTab === 'features' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white font-medium">Features</th>
                  {comparisonModels.map((model) => (
                    <th key={model.id} className="text-center p-4 text-white font-medium min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-white">{model.icon}</div>
                        <span>{model.name}</span>
                        <div className={`px-2 py-1 rounded-full text-xs border ${getQualityColor(model.quality)}`}>
                          {model.quality}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((featureName) => (
                  <tr key={featureName} className="border-b border-white/10">
                    <td className="p-4 text-slate-300">{featureName}</td>
                    {comparisonModels.map((model) => {
                      const feature = model.features.find(f => f.name === featureName);
                      return (
                        <td key={model.id} className="p-4 text-center">
                          {feature?.supported ? (
                            <div className="flex items-center justify-center gap-1">
                              <Check className="w-5 h-5 text-green-400" />
                              {feature.premium && (
                                <Star className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                          ) : (
                            <X className="w-5 h-5 text-slate-500 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'samples' && showSamples && (
          <div className="p-6">
            <div className="grid gap-6">
              {comparisonModels.map((model) => (
                <div key={model.id}>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    {model.icon}
                    {model.name} Samples
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {model.sampleImages.map((image, index) => (
                      <div key={index} className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-slate-400">
                          Sample {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="p-6">
            <div className="grid gap-6">
              {comparisonModels.map((model) => (
                <div key={model.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-white">{model.icon}</div>
                    <div>
                      <h4 className="text-white font-medium">{model.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`px-2 py-1 rounded-full text-xs border ${getQualityColor(model.quality)}`}>
                          {model.quality}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{model.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-slate-400 text-sm">Processing Time</div>
                      <div className="text-white font-medium">{model.processingTime}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Resolution</div>
                      <div className="text-white font-medium">{model.resolution}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Pricing</div>
                      <div className="text-white font-medium">{model.price}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Category</div>
                      <div className="text-white font-medium capitalize">{model.category}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-green-400 font-medium mb-2">Pros</h5>
                      <ul className="space-y-1">
                        {model.pros.map((pro, index) => (
                          <li key={index} className="text-slate-300 text-sm flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-red-400 font-medium mb-2">Cons</h5>
                      <ul className="space-y-1">
                        {model.cons.map((con, index) => (
                          <li key={index} className="text-slate-300 text-sm flex items-center gap-2">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-cyan-400 font-medium mb-2">Best For</h5>
                    <div className="flex flex-wrap gap-2">
                      {model.bestFor.map((use, index) => (
                        <span key={index} className="px-2 py-1 bg-cyan-400/10 text-cyan-400 rounded-full text-sm">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
