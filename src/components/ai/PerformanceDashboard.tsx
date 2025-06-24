"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  DollarSign,
  Star,
  Users,
  Server,
  Cpu,
  MemoryStick,
  HardDrive
} from 'lucide-react';

interface PerformanceData {
  systemPerformance?: {
    overall: {
      totalGenerations: number;
      successRate: number;
      averageProcessingTime: number;
      averageQueueTime: number;
      totalCost: number;
      averageQualityScore: number;
    };
    models: Array<{
      modelId: string;
      totalGenerations: number;
      successRate: number;
      averageProcessingTime: number;
      averageQualityScore: number;
      performanceTrend: 'improving' | 'stable' | 'declining';
    }>;
    trends: Array<{
      timestamp: string;
      metric: string;
      value: number;
    }>;
  };
  userPerformance?: {
    totalGenerations: number;
    successRate: number;
    averageProcessingTime: number;
    totalCost: number;
    averageQualityScore: number;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    systemLoad: number;
    memoryUsage: number;
  };
  recentAlerts: Array<{
    id: string;
    severity: string;
    metric_name: string;
    metric_value: number;
    threshold: number;
    triggered_at: string;
  }>;
  isAdmin: boolean;
}

interface PerformanceDashboardProps {
  className?: string;
}

export default function PerformanceDashboard({ className = '' }: PerformanceDashboardProps) {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, timeframe]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ai/performance?action=dashboard&timeframe=${timeframe}`);
      const result = await response.json();

      if (result.success) {
        setData(result.dashboard);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading && !data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-red-600 hover:text-red-800 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const performance = data.isAdmin ? data.systemPerformance : { overall: data.userPerformance };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            {data.isAdmin ? 'System Performance Dashboard' : 'Your Performance Dashboard'}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded text-sm ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Auto Refresh
          </button>
        </div>
      </div>

      {/* System Health Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.health.status)}`}>
          <div className={`w-2 h-2 rounded-full ${data.health.status === 'healthy' ? 'bg-green-600' : data.health.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'}`}></div>
          System {data.health.status.charAt(0).toUpperCase() + data.health.status.slice(1)}
        </div>
      </div>

      {/* Key Metrics */}
      {performance?.overall && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Total Generations</h4>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {performance.overall.totalGenerations?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Success Rate</h4>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {performance.overall.successRate?.toFixed(1) || 0}%
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Avg Processing Time</h4>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {formatDuration(performance.overall.averageProcessingTime || 0)}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Total Cost</h4>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(performance.overall.totalCost || 0)}
            </div>
          </div>
        </div>
      )}

      {/* System Resources (Admin Only) */}
      {data.isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">CPU Usage</h4>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {data.health.systemLoad?.toFixed(1) || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, data.health.systemLoad || 0)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MemoryStick className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Memory Usage</h4>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {data.health.memoryUsage?.toFixed(1) || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, data.health.memoryUsage || 0)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Uptime</h4>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {data.health.uptime?.toFixed(2) || 0}%
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Response Time</h4>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatDuration(data.health.responseTime || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Model Performance (Admin Only) */}
      {data.isAdmin && data.systemPerformance?.models && data.systemPerformance.models.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Model</th>
                  <th className="text-left py-2">Generations</th>
                  <th className="text-left py-2">Success Rate</th>
                  <th className="text-left py-2">Avg Time</th>
                  <th className="text-left py-2">Quality</th>
                  <th className="text-left py-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.systemPerformance.models.map((model) => (
                  <tr key={model.modelId} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{model.modelId}</td>
                    <td className="py-2">{model.totalGenerations.toLocaleString()}</td>
                    <td className="py-2">{model.successRate.toFixed(1)}%</td>
                    <td className="py-2">{formatDuration(model.averageProcessingTime)}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {(model.averageQualityScore * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="py-2">
                      {getTrendIcon(model.performanceTrend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Alerts (Admin Only) */}
      {data.isAdmin && data.recentAlerts && data.recentAlerts.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h4>
          <div className="space-y-2">
            {data.recentAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <div className="font-medium text-red-900">
                    {alert.metric_name}: {alert.metric_value} (threshold: {alert.threshold})
                  </div>
                  <div className="text-sm text-red-700">
                    {new Date(alert.triggered_at).toLocaleString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!performance?.overall && (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p>No performance data available for the selected timeframe</p>
        </div>
      )}
    </div>
  );
}
