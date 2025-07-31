'use client';

import { useState } from 'react';
import { trackTrackDeskConversion, trackTrackDeskEvent, getTrackDeskAffiliateInfo } from '@/utils/trackdesk';
import { trackAffiliateConversion, getAffiliateInfo, hasActiveAffiliateTracking } from '@/utils/affiliateTracking';

/**
 * TrackDesk Integration Test Page
 * 
 * This page allows manual testing of TrackDesk affiliate tracking functionality
 * Access via: /test-trackdesk?aff=test123&click_id=click456
 */
export default function TestTrackDeskPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [affiliateInfo, setAffiliateInfo] = useState<any>(null);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAffiliateInfo = () => {
    try {
      const trackdeskInfo = getTrackDeskAffiliateInfo();
      const allAffiliateInfo = getAffiliateInfo();
      const hasTracking = hasActiveAffiliateTracking();
      
      setAffiliateInfo({
        trackdesk: trackdeskInfo,
        all: allAffiliateInfo,
        hasActiveTracking: hasTracking
      });
      
      addResult(`✅ Affiliate info retrieved: ${JSON.stringify(trackdeskInfo)}`);
      addResult(`✅ Has active tracking: ${hasTracking}`);
    } catch (error) {
      addResult(`❌ Failed to get affiliate info: ${error}`);
    }
  };

  const testTrackDeskEvent = () => {
    try {
      trackTrackDeskEvent('test_event', {
        test_data: 'test_value',
        timestamp: new Date().toISOString()
      });
      addResult('✅ TrackDesk event tracked successfully');
    } catch (error) {
      addResult(`❌ Failed to track TrackDesk event: ${error}`);
    }
  };

  const testTrackDeskConversion = () => {
    try {
      trackTrackDeskConversion({
        conversionType: 'sale',
        orderId: `test_order_${Date.now()}`,
        revenue: 29.99,
        currency: 'USD',
        customerId: 'test_user_123',
        customerEmail: 'test@example.com',
        metadata: {
          test: true,
          planType: 'premium'
        }
      });
      addResult('✅ TrackDesk sale conversion tracked successfully');
    } catch (error) {
      addResult(`❌ Failed to track TrackDesk conversion: ${error}`);
    }
  };

  const testUnifiedAffiliateTracking = async () => {
    try {
      await trackAffiliateConversion({
        conversionType: 'signup',
        customerId: 'test_user_456',
        customerEmail: 'signup@example.com',
        metadata: {
          test: true,
          source: 'test_page'
        }
      });
      addResult('✅ Unified affiliate signup conversion tracked successfully');
    } catch (error) {
      addResult(`❌ Failed to track unified affiliate conversion: ${error}`);
    }
  };

  const testLeadConversion = async () => {
    try {
      await trackAffiliateConversion({
        conversionType: 'lead',
        customerId: 'test_lead_789',
        customerEmail: 'lead@example.com',
        metadata: {
          test: true,
          leadSource: 'test_page'
        }
      });
      addResult('✅ Lead conversion tracked successfully');
    } catch (error) {
      addResult(`❌ Failed to track lead conversion: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setAffiliateInfo(null);
  };

  const simulateAffiliateVisit = () => {
    try {
      // Simulate storing affiliate data
      sessionStorage.setItem('trackdesk_affiliate_id', 'test_affiliate_123');
      sessionStorage.setItem('trackdesk_click_id', 'test_click_456');
      addResult('✅ Simulated affiliate visit with test data');
    } catch (error) {
      addResult(`❌ Failed to simulate affiliate visit: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            TrackDesk Integration Test
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Test Instructions
            </h2>
            <p className="text-blue-800">
              To test affiliate tracking, visit this page with affiliate parameters:
              <br />
              <code className="bg-blue-100 px-2 py-1 rounded">
                /test-trackdesk?aff=test123&click_id=click456
              </code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={simulateAffiliateVisit}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Simulate Affiliate Visit
            </button>
            
            <button
              onClick={testAffiliateInfo}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Get Affiliate Info
            </button>
            
            <button
              onClick={testTrackDeskEvent}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test TrackDesk Event
            </button>
            
            <button
              onClick={testTrackDeskConversion}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Test Sale Conversion
            </button>
            
            <button
              onClick={testUnifiedAffiliateTracking}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Test Signup Conversion
            </button>
            
            <button
              onClick={testLeadConversion}
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Test Lead Conversion
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          {affiliateInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Current Affiliate Info</h3>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(affiliateInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Test Results</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet. Click a test button above.</p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      result.includes('✅') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
