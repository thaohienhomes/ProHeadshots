"use client";

import React, { useState } from 'react';
import { Play, Download, Share2, Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ModelResult {
  model: string;
  modelInfo: {
    name: string;
    description: string;
    avgProcessingTime: string;
    features: string[];
  };
  success: boolean;
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  timings?: {
    inference: number;
  };
  error?: string;
}

interface AIModelTesterProps {
  onGenerate?: (prompt: string, models: string[]) => void;
  availableModels?: string[];
  maxModels?: number;
}

export default function AIModelTester({
  onGenerate,
  availableModels = ['flux-pro-ultra', 'flux-pro', 'flux-dev'],
  maxModels = 3,
}: AIModelTesterProps) {
  const [prompt, setPrompt] = useState('Professional headshot of a person in business attire, studio lighting, high quality');
  const [selectedModels, setSelectedModels] = useState<string[]>(['flux-pro-ultra']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const modelDisplayNames = {
    'flux-pro-ultra': 'Flux Pro Ultra',
    'flux-pro': 'Flux Pro',
    'flux-dev': 'Flux Dev',
    'aura-sr': 'AuraSR',
    'clarity-upscaler': 'Clarity Upscaler',
  };

  const handleModelToggle = (model: string) => {
    setSelectedModels(prev => {
      if (prev.includes(model)) {
        return prev.filter(m => m !== model);
      } else if (prev.length < maxModels) {
        return [...prev, model];
      } else {
        // Replace the first model if at max capacity
        return [...prev.slice(1), model];
      }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;

    setIsGenerating(true);
    setResults([]);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/ai/generate-multi-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          models: selectedModels,
          options: {
            num_images: 1,
            image_size: "portrait_4_3",
            guidance_scale: 3.5,
            num_inference_steps: 28,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setGenerationTime(Date.now() - startTime);
      } else {
        console.error('Generation failed:', data.error);
      }

      if (onGenerate) {
        onGenerate(prompt, selectedModels);
      }
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageUrl: string, modelName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${modelName}-headshot.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Model Tester</h3>
        
        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
            rows={3}
            placeholder="Describe the headshot you want to generate..."
          />
        </div>

        {/* Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Select Models ({selectedModels.length}/{maxModels})
          </label>
          <div className="flex flex-wrap gap-2">
            {availableModels.map((model) => (
              <button
                key={model}
                onClick={() => handleModelToggle(model)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedModels.includes(model)
                    ? 'bg-gradient-to-r from-cyan-500 to-primary-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                {modelDisplayNames[model as keyof typeof modelDisplayNames] || model}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || selectedModels.length === 0}
          className="w-full bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 disabled:from-slate-600 disabled:to-slate-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Generate with {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Results</h4>
            {generationTime && (
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <Clock className="w-4 h-4" />
                Total time: {(generationTime / 1000).toFixed(1)}s
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-lg border rounded-xl p-4 ${
                  result.success 
                    ? 'border-green-400/30' 
                    : 'border-red-400/30'
                }`}
              >
                {/* Model Header */}
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-white">{result.modelInfo.name}</h5>
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>

                {result.success && result.images ? (
                  <div className="space-y-3">
                    {/* Generated Image */}
                    <div className="relative aspect-[3/4] bg-slate-700 rounded-lg overflow-hidden">
                      <Image
                        src={result.images[0].url}
                        alt={`Generated by ${result.modelInfo.name}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Image Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadImage(result.images![0].url, result.model)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => navigator.share?.({ url: result.images![0].url })}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>

                    {/* Processing Time */}
                    {result.timings && (
                      <div className="flex items-center gap-2 text-slate-300 text-xs">
                        <Zap className="w-3 h-3" />
                        Processing: {result.timings.inference.toFixed(1)}s
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-400 text-sm">
                    <p className="font-medium mb-1">Generation Failed</p>
                    <p className="text-xs">{result.error || 'Unknown error occurred'}</p>
                  </div>
                )}

                {/* Model Info */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-slate-300 text-xs mb-2">{result.modelInfo.description}</p>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Clock className="w-3 h-3" />
                    Est. {result.modelInfo.avgProcessingTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
