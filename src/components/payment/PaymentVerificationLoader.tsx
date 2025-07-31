'use client';

import { useState, useEffect } from 'react';

interface PaymentVerificationLoaderProps {
  checkoutId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export default function PaymentVerificationLoader({ 
  checkoutId, 
  onSuccess, 
  onError 
}: PaymentVerificationLoaderProps) {
  const [stage, setStage] = useState<'connecting' | 'verifying' | 'processing' | 'complete'>('connecting');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(progressTimer);
  }, []);

  const getStageMessage = () => {
    switch (stage) {
      case 'connecting':
        return 'Connecting to payment provider...';
      case 'verifying':
        return 'Verifying payment status...';
      case 'processing':
        return 'Processing your payment...';
      case 'complete':
        return 'Payment verified successfully!';
      default:
        return 'Processing...';
    }
  };

  const getEstimatedTime = () => {
    if (timeElapsed < 5) return 'A few seconds remaining';
    if (timeElapsed < 15) return 'Almost done...';
    return 'This is taking longer than usual, but we\'re still working on it';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-8">
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 max-w-md w-full">
        {/* Progress Circle */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-navy-700"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              className="text-cyan-400 transition-all duration-500 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Verifying Payment</h2>
          <p className="text-navy-300 mb-4">{getStageMessage()}</p>
          <p className="text-navy-400 text-sm">{getEstimatedTime()}</p>
        </div>

        {/* Time Elapsed */}
        <div className="text-center text-navy-400 text-sm">
          Time elapsed: {timeElapsed}s
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
