'use client';

import { useRealTimeProcessing } from '@/hooks/useRealTimeProcessing';
import { useProcessingWebSocket } from '@/lib/websocket/processingSocket';
import { useEffect, useState } from 'react';

interface RealTimeProcessingVizProps {
  userId?: string;
}

export default function RealTimeProcessingViz({ userId = 'demo-user' }: RealTimeProcessingVizProps) {
  const {
    session,
    isLoading,
    error,
    getCurrentStage,
    formatTimeRemaining,
    getEstimatedCompletionTime,
    refreshSession,
    connectionStatus
  } = useRealTimeProcessing(userId, {
    onError: (error) => console.error('Processing error:', error),
    onComplete: (session) => console.log('Processing complete:', session),
    onProgress: (session) => console.log('Processing progress:', session.overallProgress)
  });

  // WebSocket connection for real-time updates
  const {
    isConnected: wsConnected,
    isConnecting: wsConnecting,
    error: wsError,
    lastMessage
  } = useProcessingWebSocket(session?.sessionId || null);

  const [animatedProgress, setAnimatedProgress] = useState<{ [key: string]: number }>({});

  const currentStage = getCurrentStage();
  const estimatedCompletion = getEstimatedCompletionTime();

  // Determine overall connection status
  const isConnected = wsConnected || connectionStatus() === 'connected';
  const isConnecting = wsConnecting || connectionStatus() === 'connecting';
  const connectionError = wsError || error;

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'processing_update':
        // Refresh session data when we get processing updates
        refreshSession();
        break;

      case 'stage_complete':
        console.log('Stage completed:', lastMessage.data);
        refreshSession();
        break;

      case 'session_complete':
        console.log('Session completed:', lastMessage.data);
        refreshSession();
        break;

      case 'error':
        console.error('WebSocket error:', lastMessage.data);
        break;
    }
  }, [lastMessage, refreshSession]);

  // Animate progress bars smoothly
  useEffect(() => {
    if (!session) return;

    session.stages.forEach(stage => {
      if (stage.status === 'active' && stage.progress !== animatedProgress[stage.id]) {
        const targetProgress = stage.progress;
        const currentProgress = animatedProgress[stage.id] || 0;

        if (currentProgress < targetProgress) {
          const increment = Math.min(1, targetProgress - currentProgress);
          setTimeout(() => {
            setAnimatedProgress(prev => ({
              ...prev,
              [stage.id]: Math.min(targetProgress, currentProgress + increment)
            }));
          }, 50);
        }
      }
    });
  }, [session, animatedProgress]);

  if (isLoading || !session) {
    return (
      <div className="p-4 bg-navy-700/30 border border-cyan-400/10 rounded-xl">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-navy-300 text-sm">
            {isConnecting ? 'Connecting to processing server...' : 'Loading processing data...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400 animate-pulse' :
            isConnecting ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`} />
          <span className="text-xs text-navy-300">
            {isConnected ? 'Live Updates' :
             isConnecting ? 'Connecting...' :
             'Reconnecting...'}
          </span>
          {wsConnected && (
            <span className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
              WebSocket
            </span>
          )}
        </div>
        {estimatedCompletion && (
          <div className="text-xs text-navy-300">
            ETA: {estimatedCompletion.toLocaleTimeString()}
          </div>
        )}
      </div>

      {connectionError && (
        <div className="p-2 bg-red-400/10 border border-red-400/20 rounded text-red-300 text-xs">
          <div className="flex items-center justify-between">
            <span>{connectionError.message || 'Connection error'}</span>
            <button
              onClick={refreshSession}
              className="text-cyan-400 hover:text-cyan-300 underline ml-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Overall Progress */}
      <div className="p-4 bg-navy-700/30 border border-cyan-400/10 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-cyan-400 text-sm font-medium">Overall Progress</span>
          <span className="text-white text-sm font-bold">{session.overallProgress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-navy-700 rounded-full h-3 mb-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${session.overallProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-navy-400">Time Elapsed:</span>
            <span className="text-white ml-2">{formatTimeRemaining(session.actualElapsedTime)}</span>
          </div>
          <div>
            <span className="text-navy-400">Time Remaining:</span>
            <span className="text-white ml-2">{formatTimeRemaining(session.estimatedTotalTime)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Stage Progress */}
      <div className="space-y-3">
        {session.stages.map((stage) => (
          <div key={stage.id} className="p-3 bg-navy-800/20 border border-navy-600/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  stage.status === 'complete' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : stage.status === 'active'
                    ? 'bg-gradient-to-r from-cyan-500 to-primary-600 text-white animate-pulse'
                    : stage.status === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-navy-700 text-navy-400'
                }`}>
                  {stage.status === 'complete' ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : stage.status === 'error' ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stage.id
                  )}
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${
                    stage.status === 'active' ? 'text-white' : 
                    stage.status === 'complete' ? 'text-green-400' : 
                    stage.status === 'error' ? 'text-red-400' : 'text-navy-400'
                  }`}>
                    {stage.name}
                  </h4>
                  <p className="text-xs text-navy-400">{stage.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-bold ${
                  stage.status === 'active' ? 'text-cyan-400' : 
                  stage.status === 'complete' ? 'text-green-400' : 'text-navy-500'
                }`}>
                  {stage.progress.toFixed(1)}%
                </div>
                {stage.status === 'active' && (
                  <div className="text-xs text-navy-400">
                    {formatTimeRemaining(stage.estimatedTimeRemaining)} left
                  </div>
                )}
              </div>
            </div>

            {/* Stage Progress Bar */}
            {(stage.status === 'active' || stage.status === 'complete') && (
              <div className="w-full bg-navy-700 rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stage.status === 'complete' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gradient-to-r from-cyan-500 to-primary-600'
                  }`}
                  style={{ width: `${animatedProgress[stage.id] || stage.progress}%` }}
                />
              </div>
            )}

            {/* Real-time Metrics for Active Stage */}
            {stage.status === 'active' && stage.metrics && (
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-navy-400">GPU:</span>
                  <span className="text-cyan-300">{stage.metrics.gpuUsage.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">Memory:</span>
                  <span className="text-cyan-300">{stage.metrics.memoryUsage.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">Accuracy:</span>
                  <span className="text-cyan-300">{stage.metrics.modelAccuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">Speed:</span>
                  <span className="text-cyan-300">{stage.metrics.processingSpeed.toFixed(1)}x</span>
                </div>
              </div>
            )}

            {/* Processing Logs for Active Stage */}
            {stage.status === 'active' && stage.logs && stage.logs.length > 0 && (
              <div className="mt-2 p-2 bg-navy-900/30 rounded text-xs">
                <div className="text-cyan-400 mb-1">Live Log:</div>
                {stage.logs.slice(-2).map((log, index) => (
                  <div key={index} className="text-navy-300 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* System Load Information */}
      <div className="p-3 bg-navy-800/20 border border-navy-600/20 rounded-lg">
        <div className="text-cyan-400 text-sm font-medium mb-2">System Status</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-navy-400">Queue Position:</span>
            <span className="text-white ml-2">{Math.floor(session.systemLoad.queuePosition)}</span>
          </div>
          <div>
            <span className="text-navy-400">Active Jobs:</span>
            <span className="text-white ml-2">{session.systemLoad.activeJobs}/{session.systemLoad.systemCapacity}</span>
          </div>
          <div>
            <span className="text-navy-400">Avg Wait:</span>
            <span className="text-white ml-2">{formatTimeRemaining(session.systemLoad.averageWaitTime)}</span>
          </div>
          <div>
            <span className="text-navy-400">Load:</span>
            <span className={`ml-2 ${
              session.systemLoad.activeJobs / session.systemLoad.systemCapacity > 0.8 
                ? 'text-red-400' 
                : session.systemLoad.activeJobs / session.systemLoad.systemCapacity > 0.6 
                ? 'text-yellow-400' 
                : 'text-green-400'
            }`}>
              {((session.systemLoad.activeJobs / session.systemLoad.systemCapacity) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
