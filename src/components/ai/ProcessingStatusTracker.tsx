'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // in seconds
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface ProcessingStatusTrackerProps {
  userId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export default function ProcessingStatusTracker({ 
  userId, 
  onComplete, 
  onError 
}: ProcessingStatusTrackerProps) {
  const [stages] = useState<ProcessingStage[]>([
    {
      id: 'upload',
      name: 'Photo Analysis',
      description: 'Analyzing your uploaded photos',
      estimatedDuration: 30,
      status: 'complete'
    },
    {
      id: 'training',
      name: 'AI Model Training',
      description: 'Training personalized AI model',
      estimatedDuration: 300, // 5 minutes
      status: 'active'
    },
    {
      id: 'generation',
      name: 'Headshot Generation',
      description: 'Generating professional headshots',
      estimatedDuration: 600, // 10 minutes
      status: 'pending'
    },
    {
      id: 'processing',
      name: 'Final Processing',
      description: 'Applying finishing touches',
      estimatedDuration: 120, // 2 minutes
      status: 'pending'
    }
  ]);

  const [currentStage, setCurrentStage] = useState(1);
  const [stageProgress, setStageProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalElapsed(prev => prev + 1);
      
      // Simulate progress
      setStageProgress(prev => {
        if (prev >= 100) {
          // Move to next stage
          setCurrentStage(current => {
            if (current < stages.length - 1) {
              return current + 1;
            }
            return current;
          });
          return 0;
        }
        return prev + (Math.random() * 2); // Slow, realistic progress
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stages.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalEstimatedTime = () => {
    return stages.reduce((total, stage) => total + stage.estimatedDuration, 0);
  };

  const getOverallProgress = () => {
    const completedStages = currentStage;
    const currentStageProgress = stageProgress / 100;
    return ((completedStages + currentStageProgress) / stages.length) * 100;
  };

  return (
    <Card className="bg-navy-800/50 backdrop-blur-sm border-cyan-400/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Processing Progress
          </CardTitle>
          <Badge variant="outline" className="text-navy-300 border-navy-600">
            {formatTime(totalElapsed)} / ~{formatTime(getTotalEstimatedTime())}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Progress */}
        <div className="mb-6">
          <Progress
            value={Math.min(getOverallProgress(), 100)}
            className="h-3 mb-2"
          />
        
        <div className="text-center text-navy-300 text-sm">
          {Math.round(getOverallProgress())}% Complete
        </div>
      </div>

      {/* Stage Details */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isActive = index === currentStage;
          const isComplete = index < currentStage;
          const isPending = index > currentStage;

          return (
            <div key={stage.id} className="flex items-center space-x-4 p-3 rounded-lg bg-navy-700/30 border border-navy-600/50">
              {/* Status Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isComplete
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-primary-600'
                    : 'bg-navy-600'
              }`}>
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-navy-400" />
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${
                      isComplete ? 'text-green-400' : isActive ? 'text-cyan-400' : 'text-navy-400'
                    }`}>
                      {stage.name}
                    </h4>
                    {isComplete && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30" variant="outline">
                        Complete
                      </Badge>
                    )}
                    {isActive && (
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30" variant="outline">
                        Processing
                      </Badge>
                    )}
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="text-navy-300">
                      {Math.round(stageProgress)}%
                    </Badge>
                  )}
                </div>
                <p className="text-navy-400 text-sm">{stage.description}</p>
                
                {/* Stage Progress Bar */}
                {isActive && (
                  <div className="mt-3">
                    <Progress
                      value={stageProgress}
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

        {/* Estimated Completion */}
        <div className="mt-6 pt-4 border-t border-navy-700">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 text-navy-300 border-navy-600">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(getTotalEstimatedTime() - totalElapsed)} remaining
            </Badge>
            <p className="text-navy-400 text-xs">
              You can safely close this page and return later
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
