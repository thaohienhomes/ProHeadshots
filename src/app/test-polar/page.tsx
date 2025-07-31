"use client";

import { useState } from 'react';
import { validatePolarConfigAction, createPolarCheckoutAction } from '@/action/polarPayment';

export default function TestPolarPage() {
  const [configResult, setConfigResult] = useState<any>(null);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPolarConfig = async () => {
    setLoading(true);
    try {
      const result = await validatePolarConfigAction();
      setConfigResult(result);
      console.log('Polar config validation result:', result);
    } catch (error) {
      setConfigResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  const testCheckoutCreation = async () => {
    setLoading(true);
    try {
      // Use development product ID for testing
      const isDevelopment = process.env.NODE_ENV === 'development';
      const productId = isDevelopment
        ? '28d871b5-be69-4594-af59-737fa189d5df' // Development Basic plan
        : '5b26fbdf-87ee-4002-aecf-82f6278a4831'; // Production Basic plan

      console.log(`Testing with ${isDevelopment ? 'development' : 'production'} product ID:`, productId);

      const result = await createPolarCheckoutAction({
        productId,
        successUrl: `${window.location.origin}/postcheckout-polar?checkout_id={CHECKOUT_ID}`,
        customerEmail: 'test@coolpix.me',
        metadata: {
          user_id: 'test-user-123',
          plan_type: 'Basic'
        }
      });
      setCheckoutResult(result);
      console.log('Checkout creation result:', result);
    } catch (error) {
      setCheckoutResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Polar Payment Integration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Configuration Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration Test</h2>
            <button
              onClick={testPolarConfig}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {loading ? 'Testing...' : 'Test Polar Config'}
            </button>
            
            {configResult && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(configResult, null, 2)}
                </pre>
                <div className="mt-2">
                  {configResult.isConfigured ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ❌ Not Configured
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Creation Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Checkout Creation Test</h2>
            <button
              onClick={testCheckoutCreation}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 mb-4"
            >
              {loading ? 'Creating...' : 'Test Checkout Creation'}
            </button>
            
            {checkoutResult && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(checkoutResult, null, 2)}
                </pre>
                <div className="mt-2">
                  {checkoutResult.success ? (
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                        ✅ Success
                      </span>
                      {checkoutResult.checkoutUrl && (
                        <a
                          href={checkoutResult.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          Open Checkout
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ❌ Failed
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Configuration Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-800">Basic Plan</h3>
              <p className="text-sm text-gray-600">$29 - 10 headshots</p>
              <p className="text-xs text-gray-500 mt-1">ID: 5b26fbdf-87ee-4002-aecf-82f6278a4831</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-800">Professional Plan</h3>
              <p className="text-sm text-gray-600">$39 - 100 headshots</p>
              <p className="text-xs text-gray-500 mt-1">ID: 2e38da8b-460f-4bb6-b7ab-e6e0056d99f5</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-800">Executive Plan</h3>
              <p className="text-sm text-gray-600">$59 - 200 headshots</p>
              <p className="text-xs text-gray-500 mt-1">ID: 4fb38fdf-ebd1-484e-9f42-07781504af78</p>
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Environment:</span>
              <span className="ml-2 text-gray-600">{process.env.NODE_ENV || 'development'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Payment Provider:</span>
              <span className="ml-2 text-gray-600">{process.env.PAYMENT_PROVIDER || 'polar'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
