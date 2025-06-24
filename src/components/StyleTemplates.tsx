"use client";

import React, { useState } from 'react';
import { Briefcase, Camera, Palette, Users, Heart, Zap, Star, Crown } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'casual' | 'formal' | 'artistic';
  icon: React.ReactNode;
  preview: string;
  settings: {
    model: string;
    style: string;
    lighting: string;
    background: string;
    mood: string;
  };
  tags: string[];
  isPopular?: boolean;
  isPremium?: boolean;
  usageCount?: number;
}

const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'corporate-executive',
    name: 'Corporate Executive',
    description: 'Professional business headshot with confident, authoritative presence',
    category: 'business',
    icon: <Briefcase className="w-5 h-5" />,
    preview: '/templates/corporate-executive.jpg',
    settings: {
      model: 'flux-pro-ultra',
      style: 'professional',
      lighting: 'studio',
      background: 'neutral-gray',
      mood: 'confident',
    },
    tags: ['LinkedIn', 'Resume', 'Corporate', 'Executive'],
    isPopular: true,
    usageCount: 1247,
  },
  {
    id: 'creative-professional',
    name: 'Creative Professional',
    description: 'Artistic and modern headshot for creative industries',
    category: 'creative',
    icon: <Palette className="w-5 h-5" />,
    preview: '/templates/creative-professional.jpg',
    settings: {
      model: 'recraft-v3',
      style: 'artistic',
      lighting: 'natural',
      background: 'colorful-gradient',
      mood: 'inspiring',
    },
    tags: ['Design', 'Art', 'Creative', 'Modern'],
    usageCount: 892,
  },
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    description: 'Approachable yet professional for entrepreneurs and founders',
    category: 'business',
    icon: <Zap className="w-5 h-5" />,
    preview: '/templates/startup-founder.jpg',
    settings: {
      model: 'imagen4',
      style: 'approachable',
      lighting: 'soft',
      background: 'modern-office',
      mood: 'innovative',
    },
    tags: ['Startup', 'Entrepreneur', 'Tech', 'Innovation'],
    isPopular: true,
    usageCount: 756,
  },
  {
    id: 'academic-professional',
    name: 'Academic Professional',
    description: 'Scholarly and trustworthy for academic and research positions',
    category: 'formal',
    icon: <Users className="w-5 h-5" />,
    preview: '/templates/academic-professional.jpg',
    settings: {
      model: 'flux-pro',
      style: 'scholarly',
      lighting: 'library',
      background: 'bookshelf',
      mood: 'intellectual',
    },
    tags: ['Academic', 'Research', 'Professor', 'Scholar'],
    usageCount: 423,
  },
  {
    id: 'healthcare-professional',
    name: 'Healthcare Professional',
    description: 'Trustworthy and caring for medical and healthcare professionals',
    category: 'formal',
    icon: <Heart className="w-5 h-5" />,
    preview: '/templates/healthcare-professional.jpg',
    settings: {
      model: 'flux-pro-ultra',
      style: 'trustworthy',
      lighting: 'clinical',
      background: 'medical-office',
      mood: 'caring',
    },
    tags: ['Healthcare', 'Medical', 'Doctor', 'Nurse'],
    usageCount: 634,
  },
  {
    id: 'artistic-portrait',
    name: 'Artistic Portrait',
    description: 'Creative and expressive portrait with artistic flair',
    category: 'artistic',
    icon: <Camera className="w-5 h-5" />,
    preview: '/templates/artistic-portrait.jpg',
    settings: {
      model: 'recraft-v3',
      style: 'artistic',
      lighting: 'dramatic',
      background: 'abstract',
      mood: 'expressive',
    },
    tags: ['Art', 'Creative', 'Portrait', 'Expressive'],
    isPremium: true,
    usageCount: 312,
  },
  {
    id: 'casual-friendly',
    name: 'Casual Friendly',
    description: 'Relaxed and approachable for social media and personal use',
    category: 'casual',
    icon: <Star className="w-5 h-5" />,
    preview: '/templates/casual-friendly.jpg',
    settings: {
      model: 'imagen4',
      style: 'casual',
      lighting: 'natural',
      background: 'outdoor',
      mood: 'friendly',
    },
    tags: ['Social Media', 'Personal', 'Friendly', 'Casual'],
    usageCount: 1089,
  },
  {
    id: 'luxury-executive',
    name: 'Luxury Executive',
    description: 'High-end executive portrait with premium styling',
    category: 'business',
    icon: <Crown className="w-5 h-5" />,
    preview: '/templates/luxury-executive.jpg',
    settings: {
      model: 'flux-pro-ultra',
      style: 'luxury',
      lighting: 'premium',
      background: 'executive-suite',
      mood: 'prestigious',
    },
    tags: ['Luxury', 'Executive', 'Premium', 'High-end'],
    isPremium: true,
    isPopular: true,
    usageCount: 567,
  },
];

interface StyleTemplatesProps {
  selectedTemplate?: string;
  onTemplateSelect?: (template: StyleTemplate) => void;
  category?: 'all' | 'business' | 'creative' | 'casual' | 'formal' | 'artistic';
  showPreview?: boolean;
  compactView?: boolean;
}

export default function StyleTemplates({
  selectedTemplate,
  onTemplateSelect,
  category = 'all',
  showPreview = true,
  compactView = false,
}: StyleTemplatesProps) {
  const [activeCategory, setActiveCategory] = useState(category);
  const [selectedTemplateId, setSelectedTemplateId] = useState(selectedTemplate);

  const categories = [
    { id: 'all', name: 'All Templates', icon: <Star className="w-4 h-4" /> },
    { id: 'business', name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'creative', name: 'Creative', icon: <Palette className="w-4 h-4" /> },
    { id: 'casual', name: 'Casual', icon: <Camera className="w-4 h-4" /> },
    { id: 'formal', name: 'Formal', icon: <Users className="w-4 h-4" /> },
    { id: 'artistic', name: 'Artistic', icon: <Heart className="w-4 h-4" /> },
  ];

  const filteredTemplates = activeCategory === 'all' 
    ? STYLE_TEMPLATES 
    : STYLE_TEMPLATES.filter(template => template.category === activeCategory);

  const handleTemplateSelect = (template: StyleTemplate) => {
    setSelectedTemplateId(template.id);
    onTemplateSelect?.(template);
  };

  if (compactView) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredTemplates.slice(0, 4).map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className={`relative p-3 rounded-lg border transition-all duration-300 text-left ${
              selectedTemplateId === template.id
                ? 'border-cyan-400/50 bg-cyan-400/10'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-cyan-400">{template.icon}</div>
              <span className="text-white text-sm font-medium">{template.name}</span>
            </div>
            <p className="text-slate-300 text-xs">{template.description}</p>
            {template.isPopular && (
              <div className="absolute top-2 right-2">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative bg-white/10 backdrop-blur-lg border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 ${
              selectedTemplateId === template.id
                ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                : 'border-white/20 hover:border-white/40'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              {template.isPopular && (
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Popular
                </span>
              )}
              {template.isPremium && (
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>

            {/* Preview Image */}
            {showPreview && (
              <div className="aspect-[4/5] bg-slate-700 relative">
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Preview</p>
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                  {template.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{template.name}</h3>
                  <p className="text-slate-400 text-sm capitalize">{template.category}</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-4 line-clamp-2">{template.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 text-slate-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 text-slate-400 rounded-full text-xs">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Usage Stats */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Used {template.usageCount?.toLocaleString()} times
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs">4.8</span>
                </div>
              </div>

              {/* Settings Preview */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Model:</span>
                    <span className="text-white ml-1">{template.settings.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Style:</span>
                    <span className="text-white ml-1">{template.settings.style}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Lighting:</span>
                    <span className="text-white ml-1">{template.settings.lighting}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Mood:</span>
                    <span className="text-white ml-1">{template.settings.mood}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedTemplateId === template.id && (
              <div className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none">
                <div className="absolute top-2 left-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Template Summary */}
      {selectedTemplateId && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h4 className="text-white font-medium mb-2">Selected Template</h4>
          {(() => {
            const template = STYLE_TEMPLATES.find(t => t.id === selectedTemplateId);
            return template ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                  {template.icon}
                </div>
                <div>
                  <h5 className="text-white font-medium">{template.name}</h5>
                  <p className="text-slate-300 text-sm">{template.description}</p>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}
