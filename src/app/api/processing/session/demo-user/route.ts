// Demo API route for development - replace with real implementation
import { NextResponse } from 'next/server';

export async function GET() {
  // Mock processing session data for development
  const mockSession = {
    sessionId: 'demo-session-123',
    userId: 'demo-user',
    status: 'processing',
    overallProgress: 35,
    estimatedTotalTime: 4800, // 80 minutes
    actualElapsedTime: 1200, // 20 minutes
    stages: [
      {
        id: 'photo-analysis',
        name: 'Photo Analysis',
        description: 'AI analyzing your facial features and lighting',
        status: 'complete',
        progress: 100,
        estimatedTimeRemaining: 0,
        actualTimeElapsed: 300,
        startTime: new Date(Date.now() - 300000).toISOString(),
        endTime: new Date(Date.now() - 240000).toISOString(),
        metrics: {
          gpuUsage: 75,
          memoryUsage: 60,
          modelAccuracy: 92,
          processingSpeed: 1.2,
        },
        logs: [
          'Photo analysis completed successfully',
          'Detected 8 high-quality photos',
          'Facial features mapped with 95% confidence'
        ]
      },
      {
        id: 'model-training',
        name: 'Model Training',
        description: 'Creating your personalized AI model',
        status: 'active',
        progress: 35,
        estimatedTimeRemaining: 2400, // 40 minutes
        actualTimeElapsed: 900, // 15 minutes
        startTime: new Date(Date.now() - 900000).toISOString(),
        metrics: {
          gpuUsage: 85,
          memoryUsage: 70,
          modelAccuracy: 88,
          processingSpeed: 0.8,
        },
        logs: [
          'Model training in progress',
          'Processing epoch 15 of 50',
          'Current accuracy: 88.3%'
        ]
      },
      {
        id: 'headshot-generation',
        name: 'Headshot Generation',
        description: 'Generating multiple professional variations',
        status: 'pending',
        progress: 0,
        estimatedTimeRemaining: 1800, // 30 minutes
        actualTimeElapsed: 0,
        metrics: {
          gpuUsage: 0,
          memoryUsage: 0,
          modelAccuracy: 0,
          processingSpeed: 0,
        },
        logs: []
      },
      {
        id: 'quality-enhancement',
        name: 'Quality Enhancement',
        description: 'Final touches and quality assurance',
        status: 'pending',
        progress: 0,
        estimatedTimeRemaining: 600, // 10 minutes
        actualTimeElapsed: 0,
        metrics: {
          gpuUsage: 0,
          memoryUsage: 0,
          modelAccuracy: 0,
          processingSpeed: 0,
        },
        logs: []
      }
    ],
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date().toISOString(),
    systemLoad: {
      queuePosition: 0,
      averageWaitTime: 4800,
      activeJobs: 18,
      systemCapacity: 25,
    }
  };

  return NextResponse.json({
    success: true,
    data: mockSession,
    timestamp: new Date().toISOString(),
  });
}
