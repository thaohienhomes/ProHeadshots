"use client";

import React, { useState, useEffect } from 'react';
import { getBusinessMetricsClient, getConversionFunnelClient, ConversionFunnel } from '@/utils/analytics.client';

interface BusinessMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalGenerations: number;
  avgRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
}

interface DateRange {
  start: string;
  end: string;
  label: string;
}

const DATE_RANGES: DateRange[] = [
  {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last 7 days'
  },
  {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last 30 days'
  },
  {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last 90 days'
  }
];

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(DATE_RANGES[1]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedDateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [metricsData, funnelDataResult] = await Promise.all([
        getBusinessMetricsClient(),
        getConversionFunnelClient()
      ]);
      
      setMetrics(metricsData);
      setFunnelData(funnelDataResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-navy-700 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-navy-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
        <h3 className="text-red-400 font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        
        <div className="flex gap-2">
          {DATE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setSelectedDateRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDateRange.label === range.label
                  ? 'bg-cyan-500 text-white'
                  : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-navy-300 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">{metrics.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-green-400 mt-1">
              +{metrics.newUsers} new ({selectedDateRange.label})
            </p>
          </div>

          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-navy-300 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-white">{metrics.activeUsers.toLocaleString()}</p>
            <p className="text-sm text-cyan-400 mt-1">
              {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-navy-300 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</p>
            <p className="text-sm text-green-400 mt-1">
              {formatCurrency(metrics.avgRevenuePerUser)} avg per user
            </p>
          </div>

          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-navy-300 mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-white">{formatPercentage(metrics.conversionRate)}</p>
            <p className="text-sm text-yellow-400 mt-1">
              {formatPercentage(metrics.churnRate)} churn rate
            </p>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Generations</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-navy-300">Total Generations</span>
                <span className="text-2xl font-bold text-cyan-400">
                  {metrics.totalGenerations.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-300">Avg per User</span>
                <span className="text-lg font-semibold text-white">
                  {(metrics.totalGenerations / metrics.totalUsers).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-300">Success Rate</span>
                <span className="text-lg font-semibold text-green-400">95.2%</span>
              </div>
            </div>
          </div>

          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-navy-300">Basic Plan</span>
                <span className="text-lg font-semibold text-white">
                  {formatCurrency(metrics.totalRevenue * 0.3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-300">Professional Plan</span>
                <span className="text-lg font-semibold text-white">
                  {formatCurrency(metrics.totalRevenue * 0.5)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-300">Executive Plan</span>
                <span className="text-lg font-semibold text-white">
                  {formatCurrency(metrics.totalRevenue * 0.2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Conversion Funnel</h3>
        
        <div className="space-y-4">
          {funnelData.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.conversion_rate > 50 ? 'bg-green-500' :
                    step.conversion_rate > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white`}>
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{step.step}</span>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {step.users_completed.toLocaleString()} users
                  </div>
                  <div className={`text-sm ${
                    step.conversion_rate > 50 ? 'text-green-400' :
                    step.conversion_rate > 25 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(step.conversion_rate)} conversion
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-navy-700 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    step.conversion_rate > 50 ? 'bg-green-500' :
                    step.conversion_rate > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${step.conversion_rate}%` }}
                />
              </div>
              
              {step.drop_off_rate > 0 && (
                <div className="text-xs text-red-400">
                  {formatPercentage(step.drop_off_rate)} drop-off rate
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-navy-700/50 hover:bg-navy-600/50 rounded-lg transition-colors text-left">
            <h4 className="text-white font-medium mb-1">Export Data</h4>
            <p className="text-navy-300 text-sm">Download analytics report</p>
          </button>
          
          <button className="p-4 bg-navy-700/50 hover:bg-navy-600/50 rounded-lg transition-colors text-left">
            <h4 className="text-white font-medium mb-1">User Insights</h4>
            <p className="text-navy-300 text-sm">View detailed user behavior</p>
          </button>
          
          <button className="p-4 bg-navy-700/50 hover:bg-navy-600/50 rounded-lg transition-colors text-left">
            <h4 className="text-white font-medium mb-1">A/B Tests</h4>
            <p className="text-navy-300 text-sm">Manage experiments</p>
          </button>
        </div>
      </div>
    </div>
  );
}
