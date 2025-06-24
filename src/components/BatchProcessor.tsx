"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, Play, Pause, RotateCcw, Download, Eye, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import OptimizedImage from './OptimizedImage';

interface BatchItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: {
    images: Array<{
      url: string;
      style: string;
      model: string;
    }>;
  };
  error?: string;
}

interface BatchProcessorProps {
  onProcess?: (items: BatchItem[]) => void;
  maxFiles?: number;
  acceptedFormats?: string[];
  selectedModels?: string[];
  selectedStyles?: string[];
}

export default function BatchProcessor({
  onProcess,
  maxFiles = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  selectedModels = ['flux-pro-ultra'],
  selectedStyles = ['professional', 'casual', 'creative'],
}: BatchProcessorProps) {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: BatchItem[] = acceptedFiles.slice(0, maxFiles - batchItems.length).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setBatchItems(prev => [...prev, ...newItems]);
  }, [batchItems.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
    maxFiles: maxFiles - batchItems.length,
    disabled: isProcessing,
  });

  const removeItem = (id: string) => {
    setBatchItems(prev => {
      const item = prev.find(item => item.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const clearAll = () => {
    batchItems.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setBatchItems([]);
  };

  const startProcessing = async () => {
    if (batchItems.length === 0) return;

    setIsProcessing(true);
    setIsPaused(false);

    try {
      // Process items sequentially to avoid overwhelming the API
      for (let i = 0; i < batchItems.length; i++) {
        if (isPaused) break;

        const item = batchItems[i];
        if (item.status !== 'pending') continue;

        // Update status to processing
        setBatchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, status: 'processing', progress: 0 }
            : prevItem
        ));

        try {
          // Simulate processing with progress updates
          for (let progress = 0; progress <= 100; progress += 10) {
            if (isPaused) break;
            
            setBatchItems(prev => prev.map(prevItem => 
              prevItem.id === item.id 
                ? { ...prevItem, progress }
                : prevItem
            ));

            await new Promise(resolve => setTimeout(resolve, 200));
          }

          // Simulate API call for AI generation
          const formData = new FormData();
          formData.append('image', item.file);
          formData.append('models', JSON.stringify(selectedModels));
          formData.append('styles', JSON.stringify(selectedStyles));

          // Mock result for demo
          const mockResult = {
            images: selectedStyles.flatMap(style => 
              selectedModels.map(model => ({
                url: item.preview, // Using preview as mock result
                style,
                model,
              }))
            ),
          };

          setBatchItems(prev => prev.map(prevItem => 
            prevItem.id === item.id 
              ? { 
                  ...prevItem, 
                  status: 'completed', 
                  progress: 100,
                  result: mockResult 
                }
              : prevItem
          ));

        } catch (error) {
          setBatchItems(prev => prev.map(prevItem => 
            prevItem.id === item.id 
              ? { 
                  ...prevItem, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Processing failed'
                }
              : prevItem
          ));
        }
      }

      if (onProcess) {
        onProcess(batchItems);
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const pauseProcessing = () => {
    setIsPaused(true);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    startProcessing();
  };

  const retryFailed = () => {
    setBatchItems(prev => prev.map(item => 
      item.status === 'error' 
        ? { ...item, status: 'pending', progress: 0, error: undefined }
        : item
    ));
  };

  const downloadAll = () => {
    const completedItems = batchItems.filter(item => item.status === 'completed' && item.result);
    
    completedItems.forEach((item, index) => {
      item.result?.images.forEach((image, imageIndex) => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `headshot-${index + 1}-${image.style}-${image.model}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  };

  const getStatusColor = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending': return 'text-slate-400 bg-slate-400/10';
      case 'processing': return 'text-cyan-400 bg-cyan-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
    }
  };

  const completedCount = batchItems.filter(item => item.status === 'completed').length;
  const errorCount = batchItems.filter(item => item.status === 'error').length;
  const processingCount = batchItems.filter(item => item.status === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragActive
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {isDragActive ? 'Drop images here' : 'Upload Multiple Images'}
        </h3>
        <p className="text-slate-300 mb-4">
          Drag & drop up to {maxFiles} images, or click to select files
        </p>
        <p className="text-sm text-slate-400">
          Supports: {acceptedFormats.map(format => format.split('/')[1]).join(', ')}
        </p>
        <p className="text-sm text-slate-400 mt-2">
          {batchItems.length} / {maxFiles} files selected
        </p>
      </div>

      {/* Batch Controls */}
      {batchItems.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Batch Processing</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">
                {completedCount} completed, {errorCount} errors, {processingCount} processing
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {!isProcessing ? (
              <button
                onClick={startProcessing}
                disabled={batchItems.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Start Processing
              </button>
            ) : (
              <button
                onClick={isPaused ? resumeProcessing : pauseProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white rounded-lg font-medium transition-all duration-300"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}

            {errorCount > 0 && (
              <button
                onClick={retryFailed}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Failed ({errorCount})
              </button>
            )}

            {completedCount > 0 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-lg font-medium transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                Download All ({completedCount})
              </button>
            )}

            <button
              onClick={clearAll}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Progress Overview */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round((completedCount / batchItems.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / batchItems.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Batch Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isProcessing && item.status === 'processing'}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Image Preview */}
                <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden mb-3">
                  <OptimizedImage
                    src={item.preview}
                    alt={`Preview ${item.file.name}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* File Info */}
                <div className="mb-3">
                  <p className="text-white text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-slate-400 text-xs">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* Status */}
                <div className="mb-3">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                </div>

                {/* Progress Bar */}
                {item.status === 'processing' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Processing</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {item.status === 'error' && item.error && (
                  <div className="mb-3">
                    <p className="text-red-400 text-xs">{item.error}</p>
                  </div>
                )}

                {/* Results */}
                {item.status === 'completed' && item.result && (
                  <div className="space-y-2">
                    <p className="text-green-400 text-xs">
                      {item.result.images.length} images generated
                    </p>
                    <div className="flex gap-1">
                      <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors">
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
