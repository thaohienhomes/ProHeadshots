'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import RealTimeProcessingViz from './RealTimeProcessingViz';
import VideoPlayer from './VideoPlayer';
import { usePersonalizedPredictions } from '@/hooks/usePersonalizedPredictions';
import LiveActivityFeed from './LiveActivityFeed';
import { AnalyticsProvider, Trackable, useScrollTracking, useTimeTracking } from '@/components/analytics/AnalyticsProvider';
import { useAnalytics } from '@/lib/analytics/engagementTracker';
import { useNotifications } from '@/lib/notifications/notificationManager';
import WaitPageErrorBoundary from './WaitPageErrorBoundary';

// Processing stages configuration
interface ProcessingStage {
  id: number;
  name: string;
  description: string;
  estimatedDuration: string;
  status: 'pending' | 'active' | 'complete';
  tips: string[];
}

const processingStages: ProcessingStage[] = [
  {
    id: 1,
    name: "Photo Analysis",
    description: "AI analyzing your facial features and lighting",
    estimatedDuration: "5-10 minutes",
    status: "active",
    tips: [
      "We're identifying your best angles",
      "Analyzing lighting patterns and facial structure",
      "Detecting optimal composition elements"
    ]
  },
  {
    id: 2,
    name: "Model Training",
    description: "Creating your personalized AI model",
    estimatedDuration: "45-60 minutes",
    status: "pending",
    tips: [
      "Training a custom AI model just for you",
      "Learning your unique facial characteristics",
      "Optimizing for professional headshot quality"
    ]
  },
  {
    id: 3,
    name: "Headshot Generation",
    description: "Generating multiple professional variations",
    estimatedDuration: "15-30 minutes",
    status: "pending",
    tips: [
      "Creating diverse professional styles",
      "Generating multiple lighting scenarios",
      "Ensuring studio-quality results"
    ]
  },
  {
    id: 4,
    name: "Quality Enhancement",
    description: "Final touches and quality assurance",
    estimatedDuration: "10-15 minutes",
    status: "pending",
    tips: [
      "Applying final quality enhancements",
      "Ensuring professional standards",
      "Preparing your headshot gallery"
    ]
  }
];

// Educational content for rotating display
const educationalContent = [
  {
    title: "🎯 Why AI Headshots?",
    content: "Professional photographers charge $300-800 for headshots. Our AI delivers studio-quality results at a fraction of the cost.",
    category: "value"
  },
  {
    title: "🧠 Behind the Scenes",
    content: "Our AI analyzes 47 facial features to create perfect lighting, composition, and professional styling just for you.",
    category: "technology"
  },
  {
    title: "⚡ Cutting-Edge Models",
    content: "We use Flux Pro Ultra, Imagen4, and Recraft V3 - the most advanced AI models available for photorealistic generation.",
    category: "technology"
  },
  {
    title: "🎨 Professional Quality",
    content: "Each headshot is generated at 4K resolution with professional lighting, perfect for LinkedIn, resumes, and business cards.",
    category: "quality"
  },
  {
    title: "⏱️ Why the Wait?",
    content: "Longer processing time = better results. We're training a custom AI model specifically for your facial features.",
    category: "process"
  },
  {
    title: "🔒 Your Privacy",
    content: "Your photos are processed securely and deleted after generation. We never store or share your personal images.",
    category: "privacy"
  },
  {
    title: "📊 Success Rate",
    content: "92% of our customers are satisfied with their results. Our AI has generated over 50,000 professional headshots.",
    category: "social-proof"
  },
  {
    title: "💼 Professional Impact",
    content: "LinkedIn profiles with professional headshots receive 14x more profile views and 36x more messages.",
    category: "value"
  }
];

// Processing statistics for social proof
const processingStats = [
  "2,847 headshots generated today",
  "15,234 professionals served this month",
  "Average satisfaction: 4.8/5 stars",
  "98.5% completion success rate",
  "Used by professionals at 500+ companies"
];

// Interactive learning modules with video content
const learningModules = [
  {
    id: 'ai-models',
    title: '🤖 Our AI Models',
    icon: '⚡',
    summary: 'Learn about the cutting-edge AI technology powering your headshots',
    hasVideo: true,
    content: {
      'Flux Pro Ultra': {
        description: 'State-of-the-art photorealistic image generation',
        features: ['4K resolution output', 'Advanced facial recognition', 'Professional lighting simulation'],
        usage: 'Primary model for high-quality headshot generation',
        videoId: 'flux-pro-ultra',
        videoTitle: 'Flux Pro Ultra: Next-Gen AI Image Generation',
        videoDescription: 'See how Flux Pro Ultra creates photorealistic headshots with unprecedented quality'
      },
      'Imagen4': {
        description: 'Google\'s latest text-to-image AI model',
        features: ['Superior detail rendering', 'Natural skin texture', 'Professional styling'],
        usage: 'Used for style variations and enhancement',
        videoId: 'imagen4-overview',
        videoTitle: 'Imagen4: Google\'s Revolutionary AI Model',
        videoDescription: 'Discover how Imagen4 enhances detail and texture in professional portraits'
      },
      'Recraft V3': {
        description: 'Specialized in professional portrait generation',
        features: ['Business-focused styling', 'Corporate aesthetics', 'Brand consistency'],
        usage: 'Ensures professional business appearance',
        videoId: 'recraft-v3',
        videoTitle: 'Recraft V3: Professional Portrait Specialist',
        videoDescription: 'Learn how Recraft V3 creates consistent, business-ready headshots'
      }
    }
  },
  {
    id: 'process',
    title: '🔬 The Process',
    icon: '🧪',
    summary: 'Discover how we transform your photos into professional headshots',
    hasVideo: true,
    content: {
      'Photo Analysis': {
        description: 'Advanced computer vision analyzes your facial features',
        features: ['47-point facial mapping', 'Lighting analysis', 'Composition optimization'],
        usage: 'Creates the foundation for your personalized model',
        videoId: 'photo-analysis',
        videoTitle: 'AI Photo Analysis: Behind the Scenes',
        videoDescription: 'Watch how our AI analyzes and maps facial features for optimal results'
      },
      'Model Training': {
        description: 'Custom AI model trained specifically for your face',
        features: ['Personalized feature learning', 'Style adaptation', 'Quality optimization'],
        usage: 'Ensures consistent, high-quality results across all variations',
        videoId: 'model-training',
        videoTitle: 'Personalized AI Model Training Process',
        videoDescription: 'See how we create a custom AI model trained specifically for your features'
      },
      'Generation & Enhancement': {
        description: 'Multiple professional variations with quality assurance',
        features: ['Style diversity', 'Professional standards', 'Quality validation'],
        usage: 'Delivers your final professional headshot gallery'
      }
    }
  },
  {
    id: 'quality',
    title: '✨ Quality Standards',
    icon: '🎯',
    summary: 'Why our AI headshots meet professional photography standards',
    hasVideo: true,
    content: {
      'Resolution & Detail': {
        description: '4K output with professional-grade detail',
        features: ['High-resolution output', 'Sharp facial features', 'Professional clarity'],
        usage: 'Perfect for print and digital use',
        videoId: 'quality-standards',
        videoTitle: 'Professional Quality Standards Explained',
        videoDescription: 'Learn about our rigorous quality standards and 4K output specifications'
      },
      'Lighting & Composition': {
        description: 'Studio-quality lighting and professional composition',
        features: ['Professional lighting setup', 'Optimal composition', 'Background consistency'],
        usage: 'Matches traditional studio photography standards'
      },
      'Style Consistency': {
        description: 'Consistent professional appearance across all variations',
        features: ['Brand alignment', 'Professional styling', 'Corporate standards'],
        usage: 'Suitable for all professional contexts'
      }
    }
  }
];

function WaitPageContentInner() {
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Analytics hooks
  const analytics = useAnalytics();
  useScrollTracking('wait-page-content');
  useTimeTracking('wait-page-main', 10000); // Track if user spends 10+ seconds

  // Notification hooks
  const notifications = useNotifications();

  // Personalized predictions hook
  const {
    prediction,
    systemMetrics,
    isLoading: predictionsLoading,
    formatTime,
    getConfidenceColor,
    getConfidenceText
  } = usePersonalizedPredictions('demo-user');

  // Rotate educational content every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContentIndex((prev) => (prev + 1) % educationalContent.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Rotate processing stats every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % processingStats.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Rotate tips for active stage every 10 seconds
  useEffect(() => {
    const activeStage = processingStages.find(stage => stage.status === 'active');
    if (activeStage && activeStage.tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % activeStage.tips.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setNotificationEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      const permission = await notifications.requestPermission();
      setNotificationPermission(permission);
      setNotificationEnabled(permission === 'granted');

      // Track analytics
      analytics.trackNotificationPermission(permission === 'granted');

      if (permission === 'granted') {
        // Show test notification using the notification manager
        await notifications.sendBrowser(
          'CoolPix Notifications Enabled',
          'You\'ll be notified when your headshots are ready!',
          {
            data: { type: 'test' },
          }
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const activeStage = processingStages.find(stage => stage.status === 'active');
  const currentContent = educationalContent[currentContentIndex];

  return (
    <div
      id="wait-page-content"
      className="flex flex-col lg:flex-row h-screen w-full bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800"
    >
      {/* Image Section - Hidden on mobile, half width on desktop */}
      <div className="hidden lg:block lg:w-1/2 h-full relative">
        <Image
          src="/wait.webp"
          alt="Professional headshot placeholder"
          fill
          sizes="(max-width: 1024px) 0vw, 50vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-900/80">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6">
              <p className="text-white text-xl font-light italic leading-relaxed">
                &ldquo;I needed a professional headshot and this service was a
                lifesaver!&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Full width on mobile, half width on desktop */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-start lg:justify-center p-4 sm:p-6 lg:p-12 relative overflow-y-auto">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary-500/5 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-md lg:max-w-lg relative z-10 mx-auto lg:mx-0">
          <div
            id="wait-page-main"
            className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-4 sm:p-6 lg:p-8"
          >
            {/* Real-time Processing Visualization */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Real-time AI Processing
              </div>

              <RealTimeProcessingViz userId="demo-user" />
            </div>

            {/* Personalized Predictions */}
            {prediction && !predictionsLoading && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-purple-300 text-sm font-medium">Personalized Prediction</span>
                  </div>
                  <div className={`text-xs font-medium ${getConfidenceColor(prediction.confidenceLevel)}`}>
                    {getConfidenceText(prediction.confidenceLevel)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-navy-800/20 rounded-lg">
                    <div className="text-purple-300 text-xs font-medium mb-1">Your Estimated Time</div>
                    <div className="text-white text-lg font-bold">
                      {formatTime(prediction.estimatedTotalTime)}
                    </div>
                    <div className="text-navy-300 text-xs">
                      Based on your profile & system load
                    </div>
                  </div>

                  {systemMetrics && (
                    <div className="p-3 bg-navy-800/20 rounded-lg">
                      <div className="text-purple-300 text-xs font-medium mb-1">System Load</div>
                      <div className={`text-lg font-bold ${
                        systemMetrics.currentLoad > 0.8 ? 'text-red-400' :
                        systemMetrics.currentLoad > 0.6 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {(systemMetrics.currentLoad * 100).toFixed(0)}%
                      </div>
                      <div className="text-navy-300 text-xs">
                        {systemMetrics.activeJobs}/{systemMetrics.maxCapacity} jobs active
                      </div>
                    </div>
                  )}
                </div>

                {/* Prediction Factors */}
                <div className="mb-3">
                  <div className="text-purple-300 text-xs font-medium mb-2">Factors Affecting Your Time:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-navy-400">Photo Complexity:</span>
                      <span className={prediction.factors.photoComplexity > 0 ? 'text-orange-400' : 'text-green-400'}>
                        {prediction.factors.photoComplexity > 0 ? '+' : ''}{(prediction.factors.photoComplexity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">System Load:</span>
                      <span className={prediction.factors.systemLoad > 0.5 ? 'text-orange-400' : 'text-green-400'}>
                        +{(prediction.factors.systemLoad * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">Account Priority:</span>
                      <span className={prediction.factors.accountPriority < 0 ? 'text-green-400' : 'text-navy-300'}>
                        {prediction.factors.accountPriority < 0 ? '' : '+'}{(prediction.factors.accountPriority * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">Time of Day:</span>
                      <span className={prediction.factors.timeOfDay > 0 ? 'text-orange-400' : 'text-green-400'}>
                        {prediction.factors.timeOfDay > 0 ? '+' : ''}{(prediction.factors.timeOfDay * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {prediction.recommendations.length > 0 && (
                  <div className="p-3 bg-purple-500/5 border border-purple-400/10 rounded-lg">
                    <div className="text-purple-300 text-xs font-medium mb-2">💡 Recommendations:</div>
                    <ul className="space-y-1">
                      {prediction.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-navy-200 text-xs flex items-start gap-2">
                          <span className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-white">
              Hold tight! We&apos;re preparing your AI headshots
            </h2>
            
            {/* Behind-the-scenes Visualization */}
            <div className="mb-6 p-4 bg-navy-700/30 border border-cyan-400/10 rounded-xl">
              <div className="text-cyan-400 text-sm font-medium mb-3 flex items-center gap-2">
                <span className="animate-pulse">🔬</span>
                <span>AI Processing Visualization</span>
              </div>

              {/* Neural Network Visualization */}
              <div className="mb-4 p-3 bg-navy-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-navy-200 text-xs">Neural Network Activity</span>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 bg-navy-600 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full animate-pulse"
                        style={{
                          width: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${1 + Math.random()}s`
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 bg-navy-800/20 rounded">
                  <div className="text-cyan-400 text-xs font-medium">GPU Usage</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-navy-600 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full animate-pulse" />
                    </div>
                    <span className="text-navy-200 text-xs">87%</span>
                  </div>
                </div>
                <div className="p-2 bg-navy-800/20 rounded">
                  <div className="text-cyan-400 text-xs font-medium">Model Accuracy</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-navy-600 rounded-full overflow-hidden">
                      <div className="h-full w-11/12 bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full" />
                    </div>
                    <span className="text-navy-200 text-xs">94%</span>
                  </div>
                </div>
              </div>

              {/* Current Process Indicator */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  <span className="text-cyan-300 text-xs">
                    {activeStage ? `Processing: ${activeStage.name}` : 'Initializing AI Models'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rotating Educational Content */}
            <div className="mb-6 p-4 bg-navy-700/30 border border-cyan-400/10 rounded-xl transition-all duration-500 animate-fade-in-up">
              <div className="text-cyan-400 text-sm font-medium mb-2 animate-slide-in-right">
                {currentContent.title}
              </div>
              <p className="text-navy-200 text-sm leading-relaxed animate-fade-in-up">
                {currentContent.content}
              </p>
            </div>

            {/* Current Stage Tip */}
            {activeStage && activeStage.tips.length > 0 && (
              <div className="mb-6 p-3 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
                <div className="text-cyan-300 text-xs font-medium mb-1">
                  💡 Current Process:
                </div>
                <p className="text-navy-200 text-xs leading-relaxed">
                  {activeStage.tips[currentTipIndex]}
                </p>
              </div>
            )}

            {/* Interactive Learning Modules - Compact on mobile */}
            <div className="mb-4 lg:mb-6 space-y-2 lg:space-y-3">
              <div className="text-cyan-400 text-sm font-medium mb-2 lg:mb-3 flex items-center gap-2">
                <span>📚</span>
                <span className="hidden sm:inline">Learn While You Wait</span>
                <span className="sm:hidden">Learn More</span>
              </div>

              {learningModules.map((module) => (
                <div key={module.id} className="border border-navy-600/30 rounded-lg overflow-hidden">
                  <Trackable
                    trackingId={`learning-module-${module.id}`}
                    trackingType="module"
                    trackingProperties={{ moduleId: module.id, action: 'expand' }}
                  >
                    <button
                      onClick={() => {
                        const isExpanding = expandedModule !== module.id;
                        setExpandedModule(expandedModule === module.id ? null : module.id);

                        // Track analytics
                        if (isExpanding) {
                          analytics.trackLearningModuleExpansion(module.id);
                        }
                      }}
                      className="w-full p-3 bg-navy-700/20 hover:bg-navy-700/40 transition-colors duration-200 text-left flex items-center justify-between group"
                    >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{module.icon}</span>
                      <div>
                        <h4 className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors">
                          {module.title}
                        </h4>
                        <p className="text-navy-300 text-xs">
                          {module.summary}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-navy-400 transition-transform duration-200 ${
                        expandedModule === module.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  </Trackable>

                  {expandedModule === module.id && (
                    <div className="p-4 bg-navy-800/20 border-t border-navy-600/20 animate-fade-in-up">
                      <div className="space-y-3">
                        {Object.entries(module.content).map(([key, section]) => (
                          <div key={key} className="border border-navy-600/20 rounded-md overflow-hidden">
                            <button
                              onClick={() => {
                                const sectionKey = `${module.id}-${key}`;
                                const isExpanding = expandedSection !== sectionKey;
                                setExpandedSection(expandedSection === sectionKey ? null : sectionKey);

                                // Track analytics
                                if (isExpanding) {
                                  analytics.trackLearningModuleExpansion(module.id, key);
                                }
                              }}
                              className="w-full p-3 bg-navy-700/10 hover:bg-navy-700/20 transition-colors text-left flex items-center justify-between"
                            >
                              <h5 className="text-cyan-300 text-sm font-medium">{key}</h5>
                              <svg
                                className={`w-3 h-3 text-navy-400 transition-transform duration-200 ${
                                  expandedSection === `${module.id}-${key}` ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {expandedSection === `${module.id}-${key}` && (
                              <div className="p-3 bg-navy-800/10 border-t border-navy-600/10 animate-slide-in-right">
                                <p className="text-navy-200 text-xs mb-2 leading-relaxed">
                                  {section.description}
                                </p>

                                {/* Video Player for sections with video content */}
                                {(section as any).videoId && (
                                  <div className="mb-3">
                                    <VideoPlayer
                                      videoId={(section as any).videoId}
                                      title={(section as any).videoTitle}
                                      description={(section as any).videoDescription}
                                      onAnalytics={(analyticsData) => {
                                        // Track video analytics
                                        analytics.trackVideoInteraction(
                                          (section as any).videoId,
                                          analyticsData.completed ? 'complete' : 'play',
                                          analyticsData.watchDuration
                                        );
                                      }}
                                    />
                                  </div>
                                )}

                                <div className="mb-2">
                                  <span className="text-cyan-400 text-xs font-medium">Features:</span>
                                  <ul className="mt-1 space-y-1">
                                    {section.features.map((feature: string, idx: number) => (
                                      <li key={idx} className="text-navy-300 text-xs flex items-center gap-2">
                                        <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="text-xs">
                                  <span className="text-cyan-400 font-medium">Usage: </span>
                                  <span className="text-navy-200">{section.usage}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Live Activity Feed */}
            <div className="mb-6">
              <LiveActivityFeed />
            </div>

            <p className="text-navy-300 mb-8 leading-relaxed">
              Our advanced AI models (Flux Pro Ultra, Imagen4, Recraft V3) are working hard to generate your professional headshots. You may close this screen and come back later.
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white">92% of our customers are satisfied.</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white">Bringing you studio quality headshots at home.</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white">Founded in EU. We respect your high standards.</span>
              </li>
              
              {/* Rotating Processing Stats */}
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white transition-all duration-500">
                  {processingStats[currentStatIndex]}
                </span>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-cyan-400/20">
              {/* Notification Setup */}
              {!notificationEnabled && 'Notification' in window && (
                <div className="mb-4 p-3 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-cyan-400 text-lg">🔔</div>
                    <div className="flex-1">
                      <h4 className="text-cyan-300 text-sm font-medium mb-1">
                        Get Notified When Ready
                      </h4>
                      <p className="text-navy-300 text-xs mb-2 leading-relaxed">
                        Enable browser notifications to know instantly when your headshots are complete.
                      </p>
                      <button
                        onClick={requestNotificationPermission}
                        className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded text-cyan-300 text-xs font-medium transition-colors duration-200"
                      >
                        Enable Notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {notificationEnabled && (
                <div className="mb-4 p-3 bg-green-400/5 border border-green-400/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-green-400 text-sm">✅</div>
                    <span className="text-green-300 text-xs font-medium">
                      Notifications enabled - you&apos;ll be alerted when ready!
                    </span>
                  </div>
                </div>
              )}

              <p className="text-navy-300 text-sm">
                You may close this screen and come back later. We&apos;ll email you when your headshots are ready!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with analytics provider and error boundary
export default function WaitPageContent() {
  return (
    <WaitPageErrorBoundary>
      <AnalyticsProvider>
        <WaitPageContentInner />
      </AnalyticsProvider>
    </WaitPageErrorBoundary>
  );
}
