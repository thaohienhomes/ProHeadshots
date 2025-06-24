"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Zap, DollarSign, Clock, Star, TrendingUp } from 'lucide-react';
import { UserRequirements, ImageCharacteristics, ModelSelectionResult } from '@/utils/intelligentModelSelection';

interface IntelligentModelSelectorProps {
  onModelSelected: (selection: ModelSelectionResult) => void;
  userId?: string;
  initialRequirements?: Partial<UserRequirements>;
  className?: string;
}

export default function IntelligentModelSelector({
  onModelSelected,
  userId,
  initialRequirements,
  className = '',
}: IntelligentModelSelectorProps) {
  const [requirements, setRequirements] = useState<UserRequirements>({
    purpose: 'professional',
    quality: 'standard',
    speed: 'balanced',
    budget: 'medium',
    style: 'realistic',
    outputCount: 1,
    userPlan: 'basic',
    ...initialRequirements,
  });

  const [imageCharacteristics, setImageCharacteristics] = useState<ImageCharacteristics>({
    lighting: 'studio',
    complexity: 'moderate',
    faceCount: 1,
    backgroundType: 'simple',
  });

  const [selection, setSelection] = useState<ModelSelectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-select model when requirements change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleIntelligentSelection();
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [requirements, imageCharacteristics]);

  const handleIntelligentSelection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/intelligent-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirements,
          imageCharacteristics,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelection(data.selection);
        onModelSelected(data.selection);
      } else {
        setError(data.error || 'Failed to get model recommendation');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error getting intelligent selection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequirement = (key: keyof UserRequirements, value: any) => {
    setRequirements(prev => ({ ...prev, [key]: value }));
  };

  const updateCharacteristic = (key: keyof ImageCharacteristics, value: any) => {
    setImageCharacteristics(prev => ({ ...prev, [key]: value }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent Match';
    if (confidence >= 0.8) return 'Very Good Match';
    if (confidence >= 0.7) return 'Good Match';
    if (confidence >= 0.6) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">
          Intelligent Model Selection
        </h3>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
        )}
      </div>

      {/* Requirements Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose
          </label>
          <select
            value={requirements.purpose}
            onChange={(e) => updateRequirement('purpose', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
            <option value="social">Social Media</option>
            <option value="portfolio">Portfolio</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quality
          </label>
          <select
            value={requirements.quality}
            onChange={(e) => updateRequirement('quality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="ultra">Ultra HD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speed Priority
          </label>
          <select
            value={requirements.speed}
            onChange={(e) => updateRequirement('speed', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fast">Fast</option>
            <option value="balanced">Balanced</option>
            <option value="quality">Quality First</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget
          </label>
          <select
            value={requirements.budget}
            onChange={(e) => updateRequirement('budget', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low Cost</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Style
          </label>
          <select
            value={requirements.style}
            onChange={(e) => updateRequirement('style', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="realistic">Realistic</option>
            <option value="artistic">Artistic</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Output Count
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={requirements.outputCount}
            onChange={(e) => updateRequirement('outputCount', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Advanced Options */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lighting
              </label>
              <select
                value={imageCharacteristics.lighting}
                onChange={(e) => updateCharacteristic('lighting', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="natural">Natural</option>
                <option value="studio">Studio</option>
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complexity
              </label>
              <select
                value={imageCharacteristics.complexity}
                onChange={(e) => updateCharacteristic('complexity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Face Count
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={imageCharacteristics.faceCount}
                onChange={(e) => updateCharacteristic('faceCount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background
              </label>
              <select
                value={imageCharacteristics.backgroundType}
                onChange={(e) => updateCharacteristic('backgroundType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Simple</option>
                <option value="detailed">Detailed</option>
                <option value="transparent">Transparent</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Model Recommendation */}
      {selection && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Recommended Model
            </h4>
            <div className={`flex items-center gap-1 ${getConfidenceColor(selection.primaryModel.confidence)}`}>
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">
                {getConfidenceLabel(selection.primaryModel.confidence)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-blue-900">
                {selection.primaryModel.modelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h5>
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.round(selection.primaryModel.estimatedTime / 60)}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${selection.primaryModel.estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-blue-800">Confidence:</span>
                <div className="flex-1 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selection.primaryModel.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-blue-700">
                  {Math.round(selection.primaryModel.confidence * 100)}%
                </span>
              </div>
            </div>

            {selection.primaryModel.reasoning.length > 0 && (
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Why this model:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {selection.primaryModel.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Alternative Models */}
          {selection.alternativeModels.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Alternative Options:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selection.alternativeModels.slice(0, 3).map((alt, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {alt.modelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{Math.round(alt.confidence * 100)}% match</span>
                      <div className="flex items-center gap-2">
                        <span>{Math.round(alt.estimatedTime / 60)}m</span>
                        <span>${alt.estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {selection.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Recommendations:</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {selection.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
