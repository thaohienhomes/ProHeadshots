"use client";

import React, { useState, useCallback } from 'react';
import { 
  Sparkles, 
  Zap, 
  Eye, 
  Settings, 
  Download, 
  Upload,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface QualityMetrics {
  sharpness: number;
  brightness: number;
  contrast: number;
  colorBalance: number;
  faceQuality: number;
  backgroundQuality: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

interface EnhancementOptions {
  enableUpscaling: boolean;
  enableColorCorrection: boolean;
  enableSharpening: boolean;
  enableNoiseReduction: boolean;
  enableFaceEnhancement: boolean;
  enableBackgroundOptimization: boolean;
  targetQuality: 'good' | 'excellent' | 'professional';
  preserveOriginal: boolean;
}

interface EnhancementResult {
  originalImage: {
    url: string;
    quality: QualityMetrics;
  };
  enhancedImage: {
    url: string;
    quality: QualityMetrics;
  };
  improvements: {
    sharpnessGain: number;
    brightnessAdjustment: number;
    contrastImprovement: number;
    overallImprovement: number;
  };
  processingTime: number;
  enhancementsApplied: string[];
}

interface QualityEnhancerProps {
  onEnhancementComplete?: (result: EnhancementResult) => void;
  className?: string;
}

export default function QualityEnhancer({ onEnhancementComplete, className = '' }: QualityEnhancerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [options, setOptions] = useState<EnhancementOptions>({
    enableUpscaling: true,
    enableColorCorrection: true,
    enableSharpening: true,
    enableNoiseReduction: true,
    enableFaceEnhancement: true,
    enableBackgroundOptimization: true,
    targetQuality: 'good',
    preserveOriginal: true,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setQuality(null);
      setEnhancementResult(null);
      setError(null);
      
      // Auto-assess quality
      assessImageQuality(imageUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const assessImageQuality = async (imageUrl: string) => {
    setIsAssessing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/quality-enhancement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'assess',
          imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuality(data.quality);
      } else {
        setError(data.error || 'Failed to assess image quality');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error assessing quality:', err);
    } finally {
      setIsAssessing(false);
    }
  };

  const enhanceImage = async (autoEnhance: boolean = false) => {
    if (!selectedImage) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const body = autoEnhance
        ? {
            action: 'auto-enhance',
            imageUrl: selectedImage,
            targetQuality: options.targetQuality,
          }
        : {
            action: 'enhance',
            imageUrl: selectedImage,
            options,
          };

      const response = await fetch('/api/ai/quality-enhancement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setEnhancementResult(data.result);
        if (onEnhancementComplete) {
          onEnhancementComplete(data.result);
        }
      } else {
        setError(data.error || 'Failed to enhance image');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error enhancing image:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.7) return 'Good';
    if (score >= 0.6) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900">AI Quality Enhancer</h3>
      </div>

      {/* Image Upload */}
      {!selectedImage && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop your image here' : 'Upload an image to enhance'}
          </p>
          <p className="text-sm text-gray-500">
            Supports JPEG, PNG, WebP formats
          </p>
        </div>
      )}

      {/* Selected Image */}
      {selectedImage && (
        <div className="mb-6">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected image"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setQuality(null);
                setEnhancementResult(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Quality Assessment */}
      {selectedImage && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Quality Assessment</h4>
            {isAssessing && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          </div>

          {quality && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Overall Score</div>
                <div className={`text-lg font-semibold ${getQualityColor(quality.overallScore)}`}>
                  {(quality.overallScore * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">
                  {getQualityLabel(quality.overallScore)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Sharpness</div>
                <div className={`text-lg font-semibold ${getQualityColor(quality.sharpness)}`}>
                  {(quality.sharpness * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Face Quality</div>
                <div className={`text-lg font-semibold ${getQualityColor(quality.faceQuality)}`}>
                  {(quality.faceQuality * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Brightness</div>
                <div className={`text-lg font-semibold ${getQualityColor(quality.brightness)}`}>
                  {(quality.brightness * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Contrast</div>
                <div className={`text-lg font-semibold ${getQualityColor(quality.contrast)}`}>
                  {(quality.contrast * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Color Balance</div>
                <div className={`text-lg font-semibold ${getQualityColor(quality.colorBalance)}`}>
                  {(quality.colorBalance * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}

          {quality?.issues && quality.issues.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Issues Detected
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {quality.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {quality?.recommendations && quality.recommendations.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Recommendations
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {quality.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Enhancement Options */}
      {selectedImage && quality && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Enhancement Options</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Quality
              </label>
              <select
                value={options.targetQuality}
                onChange={(e) => setOptions(prev => ({ ...prev, targetQuality: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="preserveOriginal"
                checked={options.preserveOriginal}
                onChange={(e) => setOptions(prev => ({ ...prev, preserveOriginal: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="preserveOriginal" className="text-sm text-gray-700">
                Preserve original image
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'enableUpscaling', label: 'Upscaling' },
              { key: 'enableColorCorrection', label: 'Color Correction' },
              { key: 'enableSharpening', label: 'Sharpening' },
              { key: 'enableNoiseReduction', label: 'Noise Reduction' },
              { key: 'enableFaceEnhancement', label: 'Face Enhancement' },
              { key: 'enableBackgroundOptimization', label: 'Background Optimization' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={key}
                  checked={options[key as keyof EnhancementOptions] as boolean}
                  onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor={key} className="text-sm text-gray-700">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhancement Actions */}
      {selectedImage && quality && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => enhanceImage(true)}
            disabled={isEnhancing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isEnhancing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Auto Enhance
          </button>

          <button
            onClick={() => enhanceImage(false)}
            disabled={isEnhancing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isEnhancing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            Custom Enhance
          </button>
        </div>
      )}

      {/* Enhancement Result */}
      {enhancementResult && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Enhancement Result</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Original</h5>
              <img
                src={enhancementResult.originalImage.url}
                alt="Original"
                className="w-full rounded-lg shadow-md"
              />
              <div className="mt-2 text-sm text-gray-600">
                Quality Score: {(enhancementResult.originalImage.quality.overallScore * 100).toFixed(0)}%
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Enhanced</h5>
              <img
                src={enhancementResult.enhancedImage.url}
                alt="Enhanced"
                className="w-full rounded-lg shadow-md"
              />
              <div className="mt-2 text-sm text-gray-600">
                Quality Score: {(enhancementResult.enhancedImage.quality.overallScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Overall Improvement</div>
              <div className="text-lg font-semibold text-green-600">
                +{(enhancementResult.improvements.overallImprovement * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Sharpness Gain</div>
              <div className="text-lg font-semibold text-blue-600">
                +{(enhancementResult.improvements.sharpnessGain * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Processing Time</div>
              <div className="text-lg font-semibold text-yellow-600">
                {(enhancementResult.processingTime / 1000).toFixed(1)}s
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Enhancements</div>
              <div className="text-lg font-semibold text-purple-600">
                {enhancementResult.enhancementsApplied.length}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={enhancementResult.enhancedImage.url}
              download="enhanced-image.jpg"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Download Enhanced
            </a>

            {enhancementResult.originalImage.url !== enhancementResult.enhancedImage.url && (
              <a
                href={enhancementResult.originalImage.url}
                download="original-image.jpg"
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Download Original
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
