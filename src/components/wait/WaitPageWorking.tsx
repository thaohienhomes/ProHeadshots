'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useAuthStatus } from '@/lib/auth/authUtils';

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
    estimatedDuration: "15-20 minutes",
    status: "pending",
    tips: [
      "Creating diverse professional styles",
      "Generating high-resolution outputs",
      "Applying final quality enhancements"
    ]
  }
];

interface WaitPageWorkingProps {
  userData: any[];
}

export default function WaitPageWorking({ userData }: WaitPageWorkingProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [progress, setProgress] = useState(15);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { user, isAuthenticated } = useAuthStatus();

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      // Simulate progress based on time
      if (timeElapsed < 300) { // First 5 minutes
        setProgress(Math.min(25, 15 + (timeElapsed / 300) * 10));
      } else if (timeElapsed < 3600) { // Next 55 minutes
        setProgress(Math.min(85, 25 + ((timeElapsed - 300) / 3300) * 60));
        setCurrentStage(2);
      } else { // Final stage
        setProgress(Math.min(100, 85 + ((timeElapsed - 3600) / 1200) * 15));
        setCurrentStage(3);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeElapsed]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedTotal = 4800; // 80 minutes
  const remainingTime = Math.max(0, estimatedTotal - timeElapsed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-4xl font-bold text-white">
              Creating Your AI Headshots
            </h1>
          </div>
          <p className="text-xl text-navy-300 max-w-2xl mx-auto mb-4">
            Our AI is working hard to create professional headshots just for you. 
            This process typically takes 60-90 minutes for the best results.
          </p>
          
          {/* User Info */}
          {isAuthenticated && user && (
            <div className="bg-navy-800/30 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-navy-200">
                Welcome back, <span className="text-cyan-400 font-medium">{user.name || user.email}</span>!
              </p>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Overall Progress</h2>
                <p className="text-navy-300">
                  Time Elapsed: {formatTime(timeElapsed)} | 
                  Estimated Remaining: {formatTime(remainingTime)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-cyan-400">{progress}%</div>
                <div className="text-navy-300">Complete</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-navy-700 rounded-full h-4 mb-6">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-primary-600 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Current Stage Info */}
            <div className="bg-navy-700/50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white font-bold">{currentStage}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {processingStages[currentStage - 1]?.name}
                  </h3>
                  <p className="text-navy-300">
                    {processingStages[currentStage - 1]?.description}
                  </p>
                </div>
              </div>
              
              {/* Current Stage Tips */}
              <div className="space-y-2">
                {processingStages[currentStage - 1]?.tips.map((tip, index) => (
                  <div key={index} className="flex items-center gap-3 text-navy-200">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Processing Stages */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Processing Stages</h2>
          <div className="space-y-6">
            {processingStages.map((stage, index) => (
              <div
                key={stage.id}
                className={`bg-navy-800/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-500 ${
                  stage.id === currentStage
                    ? 'border-cyan-400/40 shadow-lg shadow-cyan-400/10'
                    : stage.id < currentStage
                    ? 'border-green-400/40'
                    : 'border-navy-600/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    stage.id === currentStage
                      ? 'bg-cyan-500 text-white animate-pulse'
                      : stage.id < currentStage
                      ? 'bg-green-500 text-white'
                      : 'bg-navy-600 text-navy-300'
                  }`}>
                    {stage.id < currentStage ? '✓' : stage.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{stage.name}</h3>
                      <span className="text-navy-300 text-sm">{stage.estimatedDuration}</span>
                    </div>
                    <p className="text-navy-300">{stage.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stage.id === currentStage
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : stage.id < currentStage
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-navy-600/20 text-navy-400'
                  }`}>
                    {stage.id === currentStage ? 'Active' : stage.id < currentStage ? 'Complete' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-navy-800/30 backdrop-blur-sm border border-navy-600/40 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">Online</div>
                <div className="text-navy-300 text-sm">AI Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">18/25</div>
                <div className="text-navy-300 text-sm">Queue Position</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">~80min</div>
                <div className="text-navy-300 text-sm">Avg Wait Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-navy-400 mb-4">
            You can safely close this page. We&apos;ll email you when your headshots are ready!
          </p>
          <div className="flex items-center justify-center gap-2 text-navy-500">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span>Processing in progress...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
