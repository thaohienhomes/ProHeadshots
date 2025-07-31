'use client';

import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  type: 'completion' | 'start' | 'milestone' | 'achievement';
  message: string;
  timestamp: Date;
  location?: string;
  userType?: 'free' | 'premium' | 'enterprise';
  processingTime?: number;
  satisfaction?: number;
}

interface LiveStats {
  totalProcessed: number;
  processingToday: number;
  averageSatisfaction: number;
  activeUsers: number;
  completionsLastHour: number;
  topLocations: { city: string; count: number }[];
  peakEfficiency: number;
}

// Simulated activity data
const generateRandomActivity = (): ActivityItem => {
  const activities = [
    {
      type: 'completion' as const,
      messages: [
        'Professional from New York completed their headshots',
        'Marketing executive from London finished processing',
        'Entrepreneur from San Francisco got their results',
        'Consultant from Toronto completed their session',
        'Designer from Berlin received their headshots',
        'Manager from Sydney finished their AI session',
        'Developer from Austin completed processing',
        'Executive from Chicago got their professional photos'
      ]
    },
    {
      type: 'start' as const,
      messages: [
        'New user from Los Angeles started processing',
        'Professional from Miami began their session',
        'Executive from Boston started their headshots',
        'Consultant from Seattle began processing',
        'Designer from Portland started their session',
        'Manager from Denver began their headshots'
      ]
    },
    {
      type: 'milestone' as const,
      messages: [
        '🎉 50,000th headshot generated this month!',
        '⚡ 99.2% uptime achieved this week',
        '🏆 New processing speed record: 47 minutes',
        '🌟 Customer satisfaction reached 4.9/5',
        '🚀 1,000 headshots completed today',
        '💎 Premium user milestone: 10,000 served'
      ]
    },
    {
      type: 'achievement' as const,
      messages: [
        '🏅 User achieved 5-star satisfaction rating',
        '⭐ Perfect headshot quality score achieved',
        '🎯 User recommended us to 5 colleagues',
        '💯 100% satisfaction from enterprise client',
        '🔥 User upgraded to premium after seeing results'
      ]
    }
  ];

  const activityType = activities[Math.floor(Math.random() * activities.length)];
  const message = activityType.messages[Math.floor(Math.random() * activityType.messages.length)];
  
  const locations = ['New York', 'London', 'San Francisco', 'Toronto', 'Berlin', 'Sydney', 'Austin', 'Chicago', 'Los Angeles', 'Miami', 'Boston', 'Seattle'];
  const userTypes: ('free' | 'premium' | 'enterprise')[] = ['free', 'premium', 'enterprise'];

  return {
    id: `activity_${Date.now()}_${Math.random()}`,
    type: activityType.type,
    message,
    timestamp: new Date(),
    location: Math.random() > 0.3 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
    userType: userTypes[Math.floor(Math.random() * userTypes.length)],
    processingTime: activityType.type === 'completion' ? 3600 + Math.random() * 3600 : undefined, // 1-2 hours
    satisfaction: activityType.type === 'completion' ? 4.2 + Math.random() * 0.8 : undefined // 4.2-5.0
  };
};

const generateLiveStats = (): LiveStats => {
  const baseStats = {
    totalProcessed: 47832,
    processingToday: 1247,
    averageSatisfaction: 4.8,
    activeUsers: 23,
    completionsLastHour: 12,
    peakEfficiency: 94.2
  };

  return {
    totalProcessed: baseStats.totalProcessed + Math.floor(Math.random() * 10),
    processingToday: baseStats.processingToday + Math.floor(Math.random() * 5),
    averageSatisfaction: Math.round((baseStats.averageSatisfaction + (Math.random() - 0.5) * 0.2) * 10) / 10,
    activeUsers: baseStats.activeUsers + Math.floor(Math.random() * 10) - 5,
    completionsLastHour: baseStats.completionsLastHour + Math.floor(Math.random() * 6) - 3,
    topLocations: [
      { city: 'New York', count: 156 + Math.floor(Math.random() * 20) },
      { city: 'London', count: 134 + Math.floor(Math.random() * 15) },
      { city: 'San Francisco', count: 98 + Math.floor(Math.random() * 12) },
      { city: 'Toronto', count: 87 + Math.floor(Math.random() * 10) },
      { city: 'Berlin', count: 76 + Math.floor(Math.random() * 8) }
    ],
    peakEfficiency: Math.round((baseStats.peakEfficiency + (Math.random() - 0.5) * 2) * 10) / 10
  };
};

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<LiveStats>(generateLiveStats());
  const [isVisible, setIsVisible] = useState(true);

  // Add new activities periodically
  useEffect(() => {
    // Initial activities
    const initialActivities = Array.from({ length: 5 }, () => generateRandomActivity());
    setActivities(initialActivities);

    // Add new activity every 8-15 seconds
    const interval = setInterval(() => {
      const newActivity = generateRandomActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 most recent
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, []);

  // Update stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(generateLiveStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'completion': return '✅';
      case 'start': return '🚀';
      case 'milestone': return '🎉';
      case 'achievement': return '🏆';
      default: return '📊';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'completion': return 'text-green-400';
      case 'start': return 'text-blue-400';
      case 'milestone': return 'text-purple-400';
      case 'achievement': return 'text-yellow-400';
      default: return 'text-cyan-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      {/* Live Statistics */}
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-sm font-medium">Live Statistics</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-navy-400 hover:text-navy-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="text-white text-lg font-bold">{stats.totalProcessed.toLocaleString()}</div>
            <div className="text-navy-300 text-xs">Total Processed</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg font-bold">{stats.processingToday}</div>
            <div className="text-navy-300 text-xs">Today</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg font-bold">{stats.averageSatisfaction}/5</div>
            <div className="text-navy-300 text-xs">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg font-bold">{stats.activeUsers}</div>
            <div className="text-navy-300 text-xs">Active Now</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg font-bold">{stats.completionsLastHour}</div>
            <div className="text-navy-300 text-xs">Last Hour</div>
          </div>
          <div className="text-center">
            <div className="text-white text-lg font-bold">{stats.peakEfficiency}%</div>
            <div className="text-navy-300 text-xs">Efficiency</div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="border-t border-green-400/10 pt-3">
          <div className="text-green-300 text-xs font-medium mb-2">🌍 Top Locations Today:</div>
          <div className="flex flex-wrap gap-2">
            {stats.topLocations.slice(0, 3).map((location, index) => (
              <div key={location.city} className="px-2 py-1 bg-green-400/10 rounded text-xs">
                <span className="text-green-300">{location.city}</span>
                <span className="text-navy-300 ml-1">({location.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="p-4 bg-navy-700/30 border border-cyan-400/10 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium">Live Activity Feed</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-2 bg-navy-800/20 rounded-lg animate-fade-in-up"
            >
              <div className="text-sm mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${getActivityColor(activity.type)} leading-relaxed`}>
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-navy-400 text-xs">{formatTimeAgo(activity.timestamp)}</span>
                  {activity.userType && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      activity.userType === 'enterprise' ? 'bg-purple-400/20 text-purple-300' :
                      activity.userType === 'premium' ? 'bg-yellow-400/20 text-yellow-300' :
                      'bg-gray-400/20 text-gray-300'
                    }`}>
                      {activity.userType}
                    </span>
                  )}
                  {activity.satisfaction && (
                    <span className="text-xs text-green-400">
                      ⭐ {activity.satisfaction.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-cyan-400/10">
          <p className="text-navy-400 text-xs text-center">
            Join thousands of professionals getting AI headshots worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
