'use client';

import { useState, useEffect } from 'react';
import { paymentAnalytics } from '@/utils/paymentAnalytics';

interface PaymentMetrics {
  total_checkouts: number;
  successful_payments: number;
  failed_payments: number;
  conversion_rate: number;
  average_verification_time: number;
  error_rate: number;
  revenue_total: number;
}

interface ConversionFunnel {
  checkouts_created: number;
  payments_started: number;
  payments_completed: number;
  checkout_to_payment_rate: number;
  payment_completion_rate: number;
  overall_conversion_rate: number;
}

interface ErrorAnalysis {
  error: string;
  count: number;
}

export default function PaymentDashboard() {
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  const [errors, setErrors] = useState<ErrorAnalysis[]>([]);
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [metricsData, funnelData, errorsData] = await Promise.all([
        paymentAnalytics.getMetrics(timeframe),
        paymentAnalytics.getConversionFunnel(timeframe),
        paymentAnalytics.getErrorAnalysis(timeframe)
      ]);

      setMetrics(metricsData);
      setFunnel(funnelData);
      setErrors(errorsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  if (loading && !metrics) {
    return (
      <div className="p-6 bg-navy-900 rounded-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-navy-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-navy-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Payment Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-navy-800 text-white border border-navy-600 rounded px-3 py-2"
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-navy-400 text-sm">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
            <h3 className="text-navy-300 text-sm font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(metrics.revenue_total)}
            </p>
          </div>
          
          <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
            <h3 className="text-navy-300 text-sm font-medium">Conversion Rate</h3>
            <p className="text-2xl font-bold text-cyan-400">
              {formatPercentage(metrics.conversion_rate)}
            </p>
          </div>
          
          <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
            <h3 className="text-navy-300 text-sm font-medium">Successful Payments</h3>
            <p className="text-2xl font-bold text-white">
              {metrics.successful_payments}
            </p>
          </div>
          
          <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
            <h3 className="text-navy-300 text-sm font-medium">Error Rate</h3>
            <p className="text-2xl font-bold text-red-400">
              {formatPercentage(metrics.error_rate)}
            </p>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {funnel && (
        <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
          <h3 className="text-xl font-bold text-white mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-navy-300">Checkouts Created</span>
              <span className="text-white font-semibold">{funnel.checkouts_created}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-navy-300">Payments Started</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{funnel.payments_started}</span>
                <span className="text-cyan-400 text-sm">
                  ({formatPercentage(funnel.checkout_to_payment_rate)})
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-navy-300">Payments Completed</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{funnel.payments_completed}</span>
                <span className="text-green-400 text-sm">
                  ({formatPercentage(funnel.payment_completion_rate)})
                </span>
              </div>
            </div>
            
            <div className="border-t border-navy-600 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Overall Conversion</span>
                <span className="text-cyan-400 font-bold text-lg">
                  {formatPercentage(funnel.overall_conversion_rate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Analysis */}
      {errors.length > 0 && (
        <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
          <h3 className="text-xl font-bold text-white mb-4">Error Analysis</h3>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-navy-300">{error.error}</span>
                <span className="text-red-400 font-semibold">{error.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="bg-navy-800 p-6 rounded-lg border border-navy-700">
          <h3 className="text-xl font-bold text-white mb-4">Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-navy-300">Average Verification Time</span>
              <p className="text-white font-semibold">
                {metrics.average_verification_time.toFixed(2)}s
              </p>
            </div>
            <div>
              <span className="text-navy-300">Total Checkouts</span>
              <p className="text-white font-semibold">{metrics.total_checkouts}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
