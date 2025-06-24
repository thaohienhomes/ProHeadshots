"use client";

import React, { useState } from 'react';
import Header from "@/components/Header";
import AIModelSelector from "@/components/AIModelSelector";
import AIProcessingStatus, { ProcessingStep } from "@/components/AIProcessingStatus";
import AIModelComparison from "@/components/AIModelComparison";
import AIModelTester from "@/components/AIModelTester";

export default function AIDemoPage() {
  const [selectedModels, setSelectedModels] = useState<string[]>(['flux-pro-ultra']);
  const [activeTab, setActiveTab] = useState<'selector' | 'processing' | 'comparison' | 'tester'>('selector');

  // Example processing steps
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    {
      id: 'upload',
      name: 'Image Upload',
      description: 'Uploading and validating your photos',
      status: 'completed',
      estimatedTime: '30 seconds',
      actualTime: '25 seconds',
    },
    {
      id: 'training',
      name: 'AI Model Training',
      description: 'Training personalized AI model with your photos',
      status: 'processing',
      model: 'Flux Pro Ultra',
      estimatedTime: '2-3 minutes',
      progress: 75,
    },
    {
      id: 'generation',
      name: 'Headshot Generation',
      description: 'Generating professional headshots using trained model',
      status: 'pending',
      model: 'Imagen4',
      estimatedTime: '1-2 minutes',
    },
    {
      id: 'enhancement',
      name: 'Image Enhancement',
      description: 'Applying final touches and quality improvements',
      status: 'pending',
      model: 'AuraSR',
      estimatedTime: '30 seconds',
    },
  ]);

  const handleRetry = (stepId: string) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'processing' as const, error: undefined, progress: 0 }
        : step
    ));
  };

  const simulateProgress = () => {
    setProcessingSteps(prev => prev.map((step, index) => {
      if (step.status === 'processing' && step.progress !== undefined) {
        const newProgress = Math.min(100, step.progress + 10);
        if (newProgress === 100) {
          return { ...step, status: 'completed' as const, actualTime: step.estimatedTime };
        }
        return { ...step, progress: newProgress };
      }
      if (step.status === 'pending' && index > 0 && prev[index - 1].status === 'completed') {
        return { ...step, status: 'processing' as const, progress: 0 };
      }
      return step;
    }));
  };

  const tabs = [
    { id: 'selector', name: 'Model Selector', description: 'Choose AI models for your headshots' },
    { id: 'processing', name: 'Processing Status', description: 'Track AI processing progress' },
    { id: 'comparison', name: 'Model Comparison', description: 'Compare different AI models' },
    { id: 'tester', name: 'Model Tester', description: 'Test AI models in real-time' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <Header userAuth={true} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-primary-400 bg-clip-text text-transparent mb-4">
            AI Model Integration Demo
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Experience our enhanced AI model selection, processing tracking, and comparison features
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-primary-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs opacity-80">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'selector' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">AI Model Selector</h2>
                <p className="text-slate-300 mb-6">
                  Select up to 3 AI models to generate your professional headshots. Each model has unique capabilities and strengths.
                </p>
                
                <AIModelSelector
                  selectedModels={selectedModels}
                  onModelSelect={setSelectedModels}
                  category="all"
                  maxSelections={3}
                  showComparison={true}
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedModels(['flux-pro-ultra', 'imagen4'])}
                  className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                >
                  <div className="font-medium mb-1">Professional Package</div>
                  <div className="text-sm text-slate-300">Flux Pro Ultra + Imagen4</div>
                </button>
                <button
                  onClick={() => setSelectedModels(['recraft-v3', 'aura-sr'])}
                  className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                >
                  <div className="font-medium mb-1">Creative Package</div>
                  <div className="text-sm text-slate-300">Recraft V3 + AuraSR</div>
                </button>
                <button
                  onClick={() => setSelectedModels(['veo3', 'kling-video'])}
                  className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                >
                  <div className="font-medium mb-1">Video Package</div>
                  <div className="text-sm text-slate-300">Veo3 + Kling Video</div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'processing' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-white">AI Processing Status</h2>
                  <button
                    onClick={simulateProgress}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 text-white rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Simulate Progress
                  </button>
                </div>
                <p className="text-slate-300 mb-6">
                  Track the real-time progress of your AI headshot generation with detailed step-by-step updates.
                </p>
                
                <AIProcessingStatus 
                  steps={processingSteps} 
                  currentStep="training"
                  onRetry={handleRetry}
                  showDetailedProgress={true}
                />
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">AI Model Comparison</h2>
                <p className="text-slate-300 mb-6">
                  Compare different AI models side-by-side to understand their features, capabilities, and best use cases.
                </p>
              </div>

              <AIModelComparison
                selectedModels={selectedModels}
                onModelSelect={(modelId) => {
                  if (!selectedModels.includes(modelId)) {
                    setSelectedModels(prev => [...prev, modelId].slice(0, 3));
                  }
                }}
                showSamples={true}
                compactView={false}
              />
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">AI Model Tester</h2>
                <p className="text-slate-300 mb-6">
                  Test different AI models in real-time with custom prompts and see the results side-by-side.
                </p>
              </div>

              <AIModelTester
                availableModels={['flux-pro-ultra', 'flux-pro', 'flux-dev']}
                maxModels={3}
                onGenerate={(prompt, models) => {
                  console.log('Generated with prompt:', prompt, 'using models:', models);
                }}
              />
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Smart Model Selection</h3>
            <p className="text-slate-300 text-sm">
              Intelligent recommendations based on your needs and preferences with detailed feature comparisons.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Real-time Progress</h3>
            <p className="text-slate-300 text-sm">
              Live tracking of AI processing with detailed progress indicators and estimated completion times.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Quality Assurance</h3>
            <p className="text-slate-300 text-sm">
              Advanced error handling and retry mechanisms ensure the highest quality results every time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
