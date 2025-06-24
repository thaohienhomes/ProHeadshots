"use client";

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';

interface CacheStats {
  generation: {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: number;
    memorySize: number;
    maxSize: number;
  };
  modelSelection: {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: number;
    memorySize: number;
    maxSize: number;
  };
  userPreference: {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: number;
    memorySize: number;
    maxSize: number;
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    totalRequests: number;
    overallHitRate: number;
  };
  database?: {
    totalEntries: number;
    byType: Record<string, number>;
  };
}

interface CacheEntry {
  id: string;
  cacheKey: string;
  type: string;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  lastAccessed: string;
  metadata: {
    modelId?: string;
    userId?: string;
    qualityScore?: number;
    generationTime?: number;
    cost?: number;
  };
  isExpired: boolean;
}

interface CacheMonitorProps {
  isAdmin?: boolean;
  className?: string;
}

export default function CacheMonitor({ isAdmin = false, className = '' }: CacheMonitorProps) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchEntries();
  }, [selectedType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchStats();
        fetchEntries();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedType]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai/cache?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch cache stats');
      console.error('Error fetching cache stats:', err);
    }
  };

  const fetchEntries = async () => {
    try {
      const typeParam = selectedType !== 'all' ? `&type=${selectedType}` : '';
      const response = await fetch(`/api/ai/cache?action=entries${typeParam}`);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.entries);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch cache entries');
      console.error('Error fetching cache entries:', err);
    }
  };

  const clearCache = async (type?: string) => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const typeParam = type ? `?type=${type}` : '';
      const response = await fetch(`/api/ai/cache${typeParam}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchStats();
        await fetchEntries();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to clear cache');
      console.error('Error clearing cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCacheEntry = async (cacheKey: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ai/cache?key=${cacheKey}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchEntries();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete cache entry');
      console.error('Error deleting cache entry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 80) return 'text-green-600';
    if (hitRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchStats();
            fetchEntries();
          }}
          className="mt-2 text-red-600 hover:text-red-800 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI Cache Monitor</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          
          <button
            onClick={() => {
              fetchStats();
              fetchEntries();
            }}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Cache Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Generation Cache</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Hit Rate:</span>
                <span className={getHitRateColor(stats.generation.hitRate)}>
                  {stats.generation.hitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Entries:</span>
                <span>{stats.generation.memorySize}/{stats.generation.maxSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Requests:</span>
                <span>{stats.generation.totalRequests}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Model Selection</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Hit Rate:</span>
                <span className={getHitRateColor(stats.modelSelection.hitRate)}>
                  {stats.modelSelection.hitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Entries:</span>
                <span>{stats.modelSelection.memorySize}/{stats.modelSelection.maxSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Requests:</span>
                <span>{stats.modelSelection.totalRequests}</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">User Preferences</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Hit Rate:</span>
                <span className={getHitRateColor(stats.userPreference.hitRate)}>
                  {stats.userPreference.hitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Entries:</span>
                <span>{stats.userPreference.memorySize}/{stats.userPreference.maxSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Requests:</span>
                <span>{stats.userPreference.totalRequests}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Overall</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Hit Rate:</span>
                <span className={getHitRateColor(stats.overall.overallHitRate)}>
                  {stats.overall.overallHitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Hits:</span>
                <span>{stats.overall.totalHits}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Requests:</span>
                <span>{stats.overall.totalRequests}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Management */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="generation">Generation</option>
            <option value="model_selection">Model Selection</option>
            <option value="user_preference">User Preferences</option>
          </select>
          
          <span className="text-sm text-gray-600">
            {entries.length} entries
          </span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearCache(selectedType !== 'all' ? selectedType : undefined)}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear {selectedType !== 'all' ? selectedType : 'All'}
            </button>
          </div>
        )}
      </div>

      {/* Cache Entries */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">Type</th>
              <th className="text-left py-2">Model</th>
              <th className="text-left py-2">Created</th>
              <th className="text-left py-2">Expires</th>
              <th className="text-left py-2">Access Count</th>
              <th className="text-left py-2">Quality</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className={`border-b border-gray-100 ${entry.isExpired ? 'opacity-50' : ''}`}>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    entry.type === 'generation' ? 'bg-blue-100 text-blue-700' :
                    entry.type === 'model_selection' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {entry.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-2">
                  {entry.metadata.modelId || '-'}
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="py-2">
                  {entry.isExpired ? (
                    <span className="text-red-600 text-xs">Expired</span>
                  ) : (
                    new Date(entry.expiresAt).toLocaleString()
                  )}
                </td>
                <td className="py-2">{entry.accessCount}</td>
                <td className="py-2">
                  {entry.metadata.qualityScore ? 
                    `${(entry.metadata.qualityScore * 100).toFixed(0)}%` : 
                    '-'
                  }
                </td>
                <td className="py-2">
                  <button
                    onClick={() => deleteCacheEntry(entry.cacheKey)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cache entries found
          </div>
        )}
      </div>
    </div>
  );
}
