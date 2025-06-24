"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';

export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  model?: string;
  estimatedTime?: string;
  actualTime?: string;
  progress?: number;
  error?: string;
}

interface AIProcessingStatusProps {
  steps: ProcessingStep[];
  currentStep?: string;
  onRetry?: (stepId: string) => void;
  showDetailedProgress?: boolean;
}

export default function AIProcessingStatus({
  steps,
  currentStep,
  onRetry,
  showDetailedProgress = true,
}: AIProcessingStatusProps) {
  const [animatedProgress, setAnimatedProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Animate progress bars
    steps.forEach((step) => {
      if (step.status === 'processing' && step.progress !== undefined) {
        const targetProgress = step.progress;
        const currentProgress = animatedProgress[step.id] || 0;
        
        if (currentProgress < targetProgress) {
          const increment = Math.min(2, targetProgress - currentProgress);
          setTimeout(() => {
            setAnimatedProgress(prev => ({
              ...prev,
              [step.id]: Math.min(targetProgress, currentProgress + increment)
            }));
          }, 50);
        }
      }
    });
  }, [steps, animatedProgress]);

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStepColor = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-400/50 bg-green-400/10';
      case 'processing':
        return 'border-cyan-400/50 bg-cyan-400/10';
      case 'error':
        return 'border-red-400/50 bg-red-400/10';
      default:
        return 'border-slate-400/30 bg-slate-400/5';
    }
  };

  const getModelIcon = (model?: string) => {
    if (!model) return null;
    
    if (model.toLowerCase().includes('flux')) {
      return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
    if (model.toLowerCase().includes('imagen')) {
      return <Zap className="w-4 h-4 text-purple-400" />;
    }
    return <Sparkles className="w-4 h-4 text-primary-400" />;
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Processing Progress</h3>
          <span className="text-sm text-slate-300">
            {completedSteps} of {totalSteps} steps completed
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        
        <div className="text-center text-slate-300 text-sm">
          {overallProgress === 100 ? 'Processing Complete!' : 'Processing in progress...'}
        </div>
      </div>

      {/* Detailed Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative border rounded-xl p-4 transition-all duration-300 ${getStepColor(step)}`}
          >
            {/* Step Header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{step.name}</h4>
                  {step.model && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-xs text-slate-300">
                      {getModelIcon(step.model)}
                      {step.model}
                    </div>
                  )}
                </div>
                
                <p className="text-slate-300 text-sm mb-2">{step.description}</p>
                
                {/* Time Information */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {step.estimatedTime && (
                    <span>Est. {step.estimatedTime}</span>
                  )}
                  {step.actualTime && (
                    <span>Completed in {step.actualTime}</span>
                  )}
                </div>
              </div>
              
              {/* Step Number */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.status === 'completed' 
                  ? 'bg-green-400 text-white' 
                  : step.status === 'processing'
                  ? 'bg-cyan-400 text-white'
                  : step.status === 'error'
                  ? 'bg-red-400 text-white'
                  : 'bg-slate-600 text-slate-300'
              }`}>
                {step.status === 'completed' ? '✓' : index + 1}
              </div>
            </div>

            {/* Progress Bar for Processing Steps */}
            {step.status === 'processing' && showDetailedProgress && step.progress !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(animatedProgress[step.id] || step.progress)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${animatedProgress[step.id] || step.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {step.status === 'error' && step.error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{step.error}</p>
                {onRetry && (
                  <button
                    onClick={() => onRetry(step.id)}
                    className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                  >
                    Retry Step
                  </button>
                )}
              </div>
            )}

            {/* Connection Line to Next Step */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-full w-0.5 h-4 bg-slate-600"></div>
            )}
          </div>
        ))}
      </div>

      {/* Processing Summary */}
      {overallProgress === 100 && (
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Processing Complete!</h3>
          </div>
          <p className="text-slate-300">
            All AI models have finished processing your images. Your professional headshots are ready for download.
          </p>
        </div>
      )}
    </div>
  );
}

// Example usage component
export function ExampleAIProcessingStatus() {
  const [steps, setSteps] = useState<ProcessingStep[]>([
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
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'processing' as const, error: undefined, progress: 0 }
        : step
    ));
  };

  return (
    <AIProcessingStatus 
      steps={steps} 
      currentStep="training"
      onRetry={handleRetry}
      showDetailedProgress={true}
    />
  );
}
