"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  Play, 
  Pause, 
  Download, 
  Settings, 
  Sparkles,
  Clock,
  Zap,
  Monitor,
  Smartphone,
  Camera,
  Wand2
} from "lucide-react";

interface VideoCapability {
  id: string;
  name: string;
  description: string;
  provider: 'veo3' | 'kling-video';
  duration: string;
  quality: 'HD' | '4K' | 'Ultra HD';
  processingTime: string;
  costPerSecond: number;
  features: string[];
  previewUrl?: string;
  isPopular?: boolean;
}

const VIDEO_CAPABILITIES: VideoCapability[] = [
  {
    id: 'professional-intro',
    name: 'Professional Video Intro',
    description: 'AI-generated professional introduction videos with custom backgrounds and branding',
    provider: 'veo3',
    duration: '15-30 seconds',
    quality: 'HD',
    processingTime: '3-5 minutes',
    costPerSecond: 0.08,
    isPopular: true,
    features: [
      'Custom background selection',
      'Professional lighting',
      'Smooth animations',
      'Brand integration',
      'Multiple export formats'
    ]
  },
  {
    id: 'animated-portrait',
    name: 'Animated Portrait',
    description: 'Transform static headshots into dynamic, engaging animated portraits',
    provider: 'kling-video',
    duration: '5-15 seconds',
    quality: '4K',
    processingTime: '2-4 minutes',
    costPerSecond: 0.12,
    features: [
      'Natural facial animations',
      'Eye movement and blinking',
      'Subtle head movements',
      'Breathing simulation',
      'High-resolution output'
    ]
  },
  {
    id: 'presentation-video',
    name: 'Presentation Video',
    description: 'Create engaging presentation videos with AI-generated speaker footage',
    provider: 'veo3',
    duration: '30-60 seconds',
    quality: 'HD',
    processingTime: '5-8 minutes',
    costPerSecond: 0.08,
    features: [
      'Presentation slides integration',
      'Natural gestures',
      'Professional attire',
      'Multiple camera angles',
      'Teleprompter simulation'
    ]
  },
  {
    id: 'social-media-video',
    name: 'Social Media Video',
    description: 'Optimized video content for LinkedIn, Twitter, and other social platforms',
    provider: 'kling-video',
    duration: '10-30 seconds',
    quality: '4K',
    processingTime: '2-3 minutes',
    costPerSecond: 0.12,
    features: [
      'Platform-optimized formats',
      'Engaging animations',
      'Text overlay support',
      'Brand color integration',
      'Mobile-first design'
    ]
  }
];

const VideoCapabilityCard: React.FC<{ capability: VideoCapability }> = ({ capability }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'veo3':
        return {
          name: 'Veo3',
          color: 'from-emerald-500 to-teal-600',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
        };
      case 'kling-video':
        return {
          name: 'Kling Video',
          color: 'from-teal-500 to-cyan-600',
          badge: 'bg-teal-500/20 text-teal-300 border-teal-400/30'
        };
      default:
        return {
          name: 'AI Video',
          color: 'from-gray-500 to-gray-600',
          badge: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
        };
    }
  };

  const providerInfo = getProviderInfo(capability.provider);

  return (
    <Card className="bg-navy-800/50 border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 group relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${providerInfo.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Popular badge */}
      {capability.isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-navy-900 font-semibold">
            <Sparkles className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${providerInfo.color}`}>
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{capability.name}</CardTitle>
              <Badge className={providerInfo.badge} variant="outline">
                {providerInfo.name}
              </Badge>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-cyan-500 to-primary-600 text-white">
            {capability.quality}
          </Badge>
        </div>
        <CardDescription className="text-navy-200">
          {capability.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Video preview placeholder */}
        <div className="relative bg-navy-700/50 rounded-lg overflow-hidden aspect-video">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>
          
          {/* Progress bar */}
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <Progress value={progress} className="h-1" />
            </div>
          )}
          
          {/* Video info overlay */}
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20">
              {capability.duration}
            </Badge>
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-navy-300">Processing:</span>
              <span className="text-white">{capability.processingTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-navy-300">Cost:</span>
              <span className="text-white">${capability.costPerSecond}/sec</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="w-4 h-4 text-green-400" />
              <span className="text-navy-300">Quality:</span>
              <span className="text-white">{capability.quality}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-purple-400" />
              <span className="text-navy-300">Duration:</span>
              <span className="text-white">{capability.duration}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Key Features</h4>
          <div className="space-y-1">
            {capability.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-navy-300">
                <div className="w-1 h-1 rounded-full bg-cyan-400" />
                <span>{feature}</span>
              </div>
            ))}
            {capability.features.length > 3 && (
              <div className="text-xs text-cyan-400 cursor-pointer hover:text-cyan-300">
                +{capability.features.length - 3} more features
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </Button>
          <Button size="sm" variant="outline" className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function VideoGenerationShowcase() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredCapabilities = activeTab === 'all' 
    ? VIDEO_CAPABILITIES 
    : VIDEO_CAPABILITIES.filter(cap => cap.provider === activeTab);

  return (
    <section className="py-20 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-section mx-auto px-section">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <Video className="w-4 h-4 mr-2" />
            Video Generation
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            AI-Powered <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Video Creation</span>
          </h2>
          <p className="text-xl text-navy-200 max-w-3xl mx-auto">
            Transform your static headshots into dynamic video content with our advanced AI video generation technology. 
            Perfect for professional introductions, social media, and presentations.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-navy-800/50 border border-cyan-400/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600">
              All Videos
            </TabsTrigger>
            <TabsTrigger value="veo3" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600">
              Veo3
            </TabsTrigger>
            <TabsTrigger value="kling-video" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600">
              Kling Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCapabilities.map((capability) => (
                <VideoCapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>

            {/* Call to action */}
            <div className="text-center mt-12">
              <Button 
                href="/auth?mode=signup"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Creating Videos
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
