"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getPolarCustomerOrders, PolarOrder } from '@/utils/polarPayment';

interface BillingInfo {
  currentPlan: string;
  nextBillingDate?: string;
  totalSpent: number;
  creditsRemaining: number;
  orders: PolarOrder[];
}

export default function BillingDashboard() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user data from userTable
      const { data: userData, error: userError } = await supabase
        .from('userTable')
        .select('paymentStatus, workStatus, email')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Mock billing info for now - in production, this would come from your billing system
      const mockBillingInfo: BillingInfo = {
        currentPlan: userData.paymentStatus === 'paid' ? 'Professional' : 'Free',
        nextBillingDate: userData.paymentStatus === 'paid' ? '2024-02-15' : undefined,
        totalSpent: userData.paymentStatus === 'paid' ? 39.00 : 0,
        creditsRemaining: userData.paymentStatus === 'paid' ? 100 : 0,
        orders: []
      };

      setBillingInfo(mockBillingInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch billing info');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-navy-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-navy-700 rounded w-3/4"></div>
            <div className="h-4 bg-navy-700 rounded w-1/2"></div>
            <div className="h-4 bg-navy-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
        <h3 className="text-red-400 font-semibold mb-2">Error Loading Billing Info</h3>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!billingInfo) return null;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-cyan-400">{billingInfo.currentPlan}</p>
            {billingInfo.nextBillingDate && (
              <p className="text-navy-300">Next billing: {billingInfo.nextBillingDate}</p>
            )}
          </div>
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Usage & Credits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-2">Credits Remaining</h4>
          <p className="text-3xl font-bold text-cyan-400">{billingInfo.creditsRemaining}</p>
          <p className="text-navy-300 text-sm">AI generations available</p>
        </div>

        <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-2">Total Spent</h4>
          <p className="text-3xl font-bold text-green-400">${billingInfo.totalSpent.toFixed(2)}</p>
          <p className="text-navy-300 text-sm">Lifetime spending</p>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Billing History</h4>
        {billingInfo.orders.length > 0 ? (
          <div className="space-y-3">
            {billingInfo.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-navy-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Order #{order.id.slice(-8)}</p>
                  <p className="text-navy-300 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${(order.amount / 100).toFixed(2)}</p>
                  <p className={`text-sm ${
                    order.status === 'confirmed' ? 'text-green-400' : 
                    order.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-navy-300">No billing history yet</p>
            <p className="text-navy-400 text-sm">Your purchases will appear here</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-navy-700/50 hover:bg-navy-600/50 rounded-lg transition-colors text-left">
            <h5 className="text-white font-medium mb-1">Buy More Credits</h5>
            <p className="text-navy-300 text-sm">Get additional AI generations</p>
          </button>
          
          <button className="p-4 bg-navy-700/50 hover:bg-navy-600/50 rounded-lg transition-colors text-left">
            <h5 className="text-white font-medium mb-1">Download Invoice</h5>
            <p className="text-navy-300 text-sm">Get your latest receipt</p>
          </button>
          
          <button className="p-4 bg-navy-700/50 hover:bg-navy-600/50 rounded-lg transition-colors text-left">
            <h5 className="text-white font-medium mb-1">Update Payment</h5>
            <p className="text-navy-300 text-sm">Change payment method</p>
          </button>
        </div>
      </div>
    </div>
  );
}
