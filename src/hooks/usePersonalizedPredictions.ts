'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  userId: string;
  photoCount: number;
  photoQuality: 'low' | 'medium' | 'high' | 'ultra';
  faceComplexity: number; // 1-10 scale
  previousProcessingTimes: number[]; // historical processing times in seconds
  preferredStyles: string[];
  accountType: 'free' | 'premium' | 'enterprise';
}

export interface SystemMetrics {
  currentLoad: number; // 0-1 scale
  queueLength: number;
  averageProcessingTime: number;
  gpuUtilization: number;
  activeJobs: number;
  maxCapacity: number;
  peakHours: boolean;
  maintenanceMode: boolean;
}

export interface PersonalizedPrediction {
  estimatedTotalTime: number; // seconds
  confidenceLevel: number; // 0-1 scale
  factors: {
    userHistory: number; // time adjustment based on user history
    photoComplexity: number; // time adjustment based on photo complexity
    systemLoad: number; // time adjustment based on current system load
    accountPriority: number; // time adjustment based on account type
    timeOfDay: number; // time adjustment based on peak hours
  };
  stageEstimates: {
    [stageName: string]: {
      baseTime: number;
      adjustedTime: number;
      confidence: number;
    };
  };
  recommendations: string[];
  nextUpdate: Date;
}

// Simulated user profiles for demo
const demoUserProfiles: { [userId: string]: UserProfile } = {
  'demo-user': {
    userId: 'demo-user',
    photoCount: 8,
    photoQuality: 'high',
    faceComplexity: 6,
    previousProcessingTimes: [6800, 7200, 6900, 7100], // ~2 hours average
    preferredStyles: ['professional', 'corporate', 'linkedin'],
    accountType: 'premium'
  },
  'new-user': {
    userId: 'new-user',
    photoCount: 5,
    photoQuality: 'medium',
    faceComplexity: 4,
    previousProcessingTimes: [],
    preferredStyles: ['professional'],
    accountType: 'free'
  }
};

export const usePersonalizedPredictions = (userId: string = 'demo-user') => {
  const [prediction, setPrediction] = useState<PersonalizedPrediction | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate system metrics updates
  const updateSystemMetrics = useCallback(() => {
    const currentHour = new Date().getHours();
    const isPeakHours = currentHour >= 9 && currentHour <= 17; // 9 AM - 5 PM
    
    const newMetrics: SystemMetrics = {
      currentLoad: 0.6 + Math.random() * 0.3, // 60-90% load
      queueLength: Math.floor(Math.random() * 25) + 5, // 5-30 jobs in queue
      averageProcessingTime: 6000 + Math.random() * 2400, // 100-140 minutes
      gpuUtilization: 70 + Math.random() * 25, // 70-95%
      activeJobs: Math.floor(Math.random() * 10) + 15, // 15-25 active jobs
      maxCapacity: 30,
      peakHours: isPeakHours,
      maintenanceMode: false
    };

    setSystemMetrics(newMetrics);
  }, []);

  // Calculate personalized prediction
  const calculatePrediction = useCallback((userProfile: UserProfile, metrics: SystemMetrics): PersonalizedPrediction => {
    // Base processing times for each stage (in seconds)
    const baseStages = {
      'Photo Analysis': 300, // 5 minutes
      'Model Training': 3600, // 60 minutes
      'Headshot Generation': 1800, // 30 minutes
      'Quality Enhancement': 900 // 15 minutes
    };

    // Calculate adjustment factors
    const factors = {
      // User history factor (-20% to +30% based on previous processing times)
      userHistory: userProfile.previousProcessingTimes.length > 0 
        ? (userProfile.previousProcessingTimes.reduce((a, b) => a + b, 0) / userProfile.previousProcessingTimes.length) / 7200 - 1
        : 0,
      
      // Photo complexity factor (-10% to +50% based on photo quality and face complexity)
      photoComplexity: (userProfile.faceComplexity / 10) * 0.3 + 
        (userProfile.photoQuality === 'ultra' ? 0.2 : 
         userProfile.photoQuality === 'high' ? 0.1 : 
         userProfile.photoQuality === 'medium' ? 0 : -0.1),
      
      // System load factor (0% to +100% based on current system load)
      systemLoad: metrics.currentLoad * 0.8 + (metrics.queueLength / 50) * 0.2,
      
      // Account priority factor (-30% for enterprise, -15% for premium, 0% for free)
      accountPriority: userProfile.accountType === 'enterprise' ? -0.3 :
        userProfile.accountType === 'premium' ? -0.15 : 0,
      
      // Time of day factor (+20% during peak hours)
      timeOfDay: metrics.peakHours ? 0.2 : 0
    };

    // Calculate adjusted stage estimates
    const stageEstimates: { [stageName: string]: { baseTime: number; adjustedTime: number; confidence: number } } = {};
    let totalAdjustedTime = 0;

    Object.entries(baseStages).forEach(([stageName, baseTime]) => {
      const stageMultiplier = 1 + 
        factors.userHistory * 0.5 + 
        factors.photoComplexity * 0.8 + 
        factors.systemLoad * 0.6 + 
        factors.accountPriority + 
        factors.timeOfDay * 0.4;

      const adjustedTime = Math.max(baseTime * 0.3, baseTime * stageMultiplier);
      
      // Confidence decreases with higher adjustments and for new users
      const confidence = Math.max(0.4, 
        0.9 - Math.abs(stageMultiplier - 1) * 0.5 - 
        (userProfile.previousProcessingTimes.length === 0 ? 0.2 : 0)
      );

      stageEstimates[stageName] = {
        baseTime,
        adjustedTime: Math.round(adjustedTime),
        confidence
      };

      totalAdjustedTime += adjustedTime;
    });

    // Generate recommendations based on factors
    const recommendations: string[] = [];
    
    if (factors.systemLoad > 0.7) {
      recommendations.push('High system load detected. Consider processing during off-peak hours for faster results.');
    }
    
    if (factors.photoComplexity > 0.3) {
      recommendations.push('Complex photos detected. Higher quality processing may take additional time.');
    }
    
    if (userProfile.accountType === 'free' && factors.systemLoad > 0.5) {
      recommendations.push('Upgrade to Premium for priority processing and faster results.');
    }
    
    if (metrics.peakHours) {
      recommendations.push('Processing during peak hours. Off-peak processing (evenings/weekends) is typically 20% faster.');
    }
    
    if (userProfile.previousProcessingTimes.length === 0) {
      recommendations.push('First-time processing. Estimates will become more accurate with usage history.');
    }

    // Overall confidence based on various factors
    const overallConfidence = Math.max(0.3, 
      0.8 - 
      (userProfile.previousProcessingTimes.length === 0 ? 0.2 : 0) -
      (factors.systemLoad > 0.8 ? 0.2 : 0) -
      (Math.abs(factors.photoComplexity) > 0.4 ? 0.1 : 0)
    );

    return {
      estimatedTotalTime: Math.round(totalAdjustedTime),
      confidenceLevel: overallConfidence,
      factors,
      stageEstimates,
      recommendations,
      nextUpdate: new Date(Date.now() + 30000) // Update every 30 seconds
    };
  }, []);

  // Initialize and update predictions
  useEffect(() => {
    const userProfile = demoUserProfiles[userId] || demoUserProfiles['new-user'];
    
    if (systemMetrics) {
      const newPrediction = calculatePrediction(userProfile, systemMetrics);
      setPrediction(newPrediction);
      setIsLoading(false);
      setLastUpdate(new Date());
    }
  }, [userId, systemMetrics, calculatePrediction]);

  // Update system metrics every 15 seconds
  useEffect(() => {
    updateSystemMetrics(); // Initial load
    
    const interval = setInterval(updateSystemMetrics, 15000);
    return () => clearInterval(interval);
  }, [updateSystemMetrics]);

  // Update predictions every 30 seconds
  useEffect(() => {
    if (!prediction) return;

    const timeUntilNextUpdate = prediction.nextUpdate.getTime() - Date.now();
    
    if (timeUntilNextUpdate > 0) {
      const timeout = setTimeout(() => {
        if (systemMetrics) {
          const userProfile = demoUserProfiles[userId] || demoUserProfiles['new-user'];
          const newPrediction = calculatePrediction(userProfile, systemMetrics);
          setPrediction(newPrediction);
          setLastUpdate(new Date());
        }
      }, timeUntilNextUpdate);

      return () => clearTimeout(timeout);
    }
  }, [prediction, systemMetrics, userId, calculatePrediction]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  }, []);

  const getConfidenceText = useCallback((confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  }, []);

  return {
    prediction,
    systemMetrics,
    isLoading,
    lastUpdate,
    formatTime,
    getConfidenceColor,
    getConfidenceText
  };
};
