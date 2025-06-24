"use client";

import React, { useState } from 'react';
import Header from "@/components/Header";
import BatchProcessor from "@/components/BatchProcessor";
import StyleTemplates from "@/components/StyleTemplates";
import SocialSharing from "@/components/SocialSharing";
import AdvancedDownload from "@/components/AdvancedDownload";
import { Zap, Palette, Share2, Download, Upload, Sparkles } from 'lucide-react';

export default function AdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState<'batch' | 'templates' | 'sharing' | 'download'>('batch');

  // Mock data for demos
  const mockImages = [
    {
      id: '1',
      url: '/sampleslanding/example0001.png',
      style: 'Professional',
      model: 'Flux Pro Ultra',
    },
    {
      id: '2',
      url: '/sampleslanding/before0001.png',
      style: 'Creative',
      model: 'Recraft V3',
    },
    {
      id: '3',
      url: '/sampleslanding/example0001.png',
      style: 'Casual',
      model: 'Imagen4',
    },
  ];

  const tabs = [
    {
      id: 'batch',
      name: 'Batch Processing',
      description: 'Upload and process multiple images at once',
      icon: <Upload className="w-5 h-5" />,
    },
    {
      id: 'templates',
      name: 'Style Templates',
      description: 'Pre-defined styles for different use cases',
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: 'sharing',
      name: 'Social Sharing',
      description: 'Share your headshots across platforms',
      icon: <Share2 className="w-5 h-5" />,
    },
    {
      id: 'download',
      name: 'Advanced Downloads',
      description: 'Multiple formats and resolutions',
      icon: <Download className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <Header userAuth={true} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-primary-400 bg-clip-text text-transparent">
              Advanced Features
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Explore powerful tools to enhance your AI headshot experience with batch processing, style templates, social sharing, and advanced download options.
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-cyan-500/10 to-primary-500/10 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/10 backdrop-blur-lg border-white/20 hover:border-white/40'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white'
              }`}>
                {tab.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{tab.name}</h3>
              <p className="text-slate-300 text-sm">{tab.description}</p>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'batch' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-semibold text-white">Batch Processing</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  Upload multiple images at once and process them with different AI models and styles. Perfect for creating a complete professional portfolio in one go.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <Zap className="w-8 h-8 text-cyan-400 mb-2" />
                    <h4 className="text-white font-medium mb-1">Fast Processing</h4>
                    <p className="text-slate-300 text-sm">Process up to 10 images simultaneously</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <Palette className="w-8 h-8 text-primary-400 mb-2" />
                    <h4 className="text-white font-medium mb-1">Multiple Styles</h4>
                    <p className="text-slate-300 text-sm">Apply different styles to each image</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <Download className="w-8 h-8 text-purple-400 mb-2" />
                    <h4 className="text-white font-medium mb-1">Bulk Download</h4>
                    <p className="text-slate-300 text-sm">Download all results in one click</p>
                  </div>
                </div>
              </div>
              
              <BatchProcessor
                maxFiles={10}
                selectedModels={['flux-pro-ultra', 'imagen4']}
                selectedStyles={['professional', 'creative', 'casual']}
                onProcess={(items) => {
                  console.log('Batch processing completed:', items);
                }}
              />
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-semibold text-white">Style Templates</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  Choose from professionally designed templates optimized for different industries and use cases. Each template includes specific AI model settings, lighting, and styling preferences.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-blue-400">8</span>
                    </div>
                    <p className="text-white font-medium">Templates</p>
                    <p className="text-slate-400 text-sm">Available</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-green-400">5</span>
                    </div>
                    <p className="text-white font-medium">Categories</p>
                    <p className="text-slate-400 text-sm">Business, Creative, etc.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-purple-400">3</span>
                    </div>
                    <p className="text-white font-medium">AI Models</p>
                    <p className="text-slate-400 text-sm">Optimized settings</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-cyan-400">∞</span>
                    </div>
                    <p className="text-white font-medium">Customization</p>
                    <p className="text-slate-400 text-sm">Fully adjustable</p>
                  </div>
                </div>
              </div>
              
              <StyleTemplates
                category="all"
                showPreview={true}
                onTemplateSelect={(template) => {
                  console.log('Selected template:', template);
                }}
              />
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-semibold text-white">Social Sharing</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  Share your professional headshots across all major social platforms with optimized formatting and engaging captions. Build your professional brand with ease.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Email'].map((platform) => (
                    <div key={platform} className="text-center">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-medium text-sm">{platform[0]}</span>
                      </div>
                      <p className="text-white text-sm">{platform}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <SocialSharing
                imageUrl={mockImages[0].url}
                title="Check out my new professional headshot!"
                description="Created with CVPHOTO's advanced AI technology - professional results in minutes!"
                hashtags={['AIHeadshots', 'CVPHOTO', 'ProfessionalPhotos', 'LinkedInProfile']}
                customMessage="💡 Pro tip: Use this headshot across all your professional profiles for consistent branding!"
              />
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-semibold text-white">Advanced Download Options</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  Download your headshots in multiple formats and resolutions. Perfect for different use cases from social media to high-resolution printing.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Formats Available</h4>
                    <div className="flex flex-wrap gap-2">
                      {['JPEG', 'PNG', 'WebP', 'PDF', 'ZIP'].map((format) => (
                        <span key={format} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Resolutions</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>512x512 (Social Media)</div>
                      <div>1024x1024 (Web)</div>
                      <div>2048x2048 (Print)</div>
                      <div>4096x4096 (Ultra HD)</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Quality Options</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>Standard (85%)</div>
                      <div>High (95%)</div>
                      <div>Ultra (100%)</div>
                      <div>Custom (50-100%)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <AdvancedDownload
                images={mockImages}
                showBulkOptions={true}
                userPlan="professional"
                onDownload={(options, selectedImages) => {
                  console.log('Download requested:', { options, selectedImages });
                }}
              />
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-primary-500/10 border border-cyan-400/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Create Your Professional Headshots?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Experience all these advanced features and more. Upload your photos and let our AI create stunning professional headshots in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Start Creating
              </button>
              <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition-all duration-300">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
