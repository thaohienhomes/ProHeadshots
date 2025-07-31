'use client';

import { useState, useEffect } from 'react';
import { navigationUtils } from './SectionIdManager';

interface NavigationTesterProps {
  isVisible?: boolean;
}

export default function NavigationTester({ isVisible = false }: NavigationTesterProps) {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const expectedSections = ['hero', 'how-it-works', 'gallery', 'features', 'benefits', 'pricing', 'testimonials', 'faq'];

  useEffect(() => {
    // Update section IDs periodically
    const updateSectionIds = () => {
      const ids = navigationUtils.getAllSectionIds();
      setSectionIds(ids);
    };

    updateSectionIds();
    const interval = setInterval(updateSectionIds, 2000);

    return () => clearInterval(interval);
  }, []);

  const runTest = () => {
    const results = navigationUtils.testAllSections();
    setTestResults(results);
    console.log('🧪 Navigation Test Results:', results);
  };

  const testNavigation = (sectionId: string) => {
    const success = navigationUtils.scrollToSection(sectionId);
    console.log(`🧭 Navigate to "${sectionId}":`, success ? 'Success' : 'Failed');
  };

  if (!isVisible && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        🧪 Nav Test
      </button>

      {/* Test Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-slate-800 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Navigation Tester</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Test All Button */}
          <button
            onClick={runTest}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded mb-4 transition-colors"
          >
            Run Full Test
          </button>

          {/* Section Status */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Section Status:</h4>
            <div className="space-y-1">
              {expectedSections.map(sectionId => {
                const exists = sectionIds.includes(sectionId);
                const tested = testResults[sectionId];
                
                return (
                  <div key={sectionId} className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        exists ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {sectionId}
                    </span>
                    <button
                      onClick={() => testNavigation(sectionId)}
                      disabled={!exists}
                      className={`px-2 py-1 rounded text-xs ${
                        exists 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Go
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Section IDs */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Found IDs ({sectionIds.length}):</h4>
            <div className="text-xs text-gray-300 max-h-20 overflow-y-auto">
              {sectionIds.length > 0 ? sectionIds.join(', ') : 'No section IDs found'}
            </div>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Last Test Results:</h4>
              <div className="text-xs space-y-1">
                {Object.entries(testResults).map(([sectionId, exists]) => (
                  <div key={sectionId} className="flex justify-between">
                    <span>{sectionId}:</span>
                    <span className={exists ? 'text-green-400' : 'text-red-400'}>
                      {exists ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <p className="text-xs text-gray-400">
              Console commands:<br/>
              • <code>coolpixTest()</code><br/>
              • <code>coolpixNavigate(&apos;section-id&apos;)</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
