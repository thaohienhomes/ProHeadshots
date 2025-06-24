"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateImageRequirements } from '@/utils/imageQualityControl.client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'validating' | 'ready' | 'error';
  error?: string;
  warnings?: string[];
  progress: number;
}

interface AdvancedUploadProps {
  onFilesReady: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFormats?: string[];
}

export default function AdvancedUpload({
  onFilesReady,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}: AdvancedUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));

    // Process each file
    for (const uploadedFile of newFiles) {
      await processFile(uploadedFile);
    }
  }, [maxFiles]);

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update status to validating
      updateFileStatus(uploadedFile.id, { status: 'validating', progress: 50 });

      // Validate image requirements
      const validation = await validateImageRequirements(uploadedFile.preview);
      
      if (!validation.valid) {
        updateFileStatus(uploadedFile.id, {
          status: 'error',
          error: validation.errors.join(', '),
          progress: 0
        });
        return;
      }

      // File is ready
      updateFileStatus(uploadedFile.id, {
        status: 'ready',
        warnings: validation.warnings,
        progress: 100
      });

      // Notify parent component
      const readyFiles = uploadedFiles.filter(f => f.status === 'ready');
      onFilesReady(readyFiles);

    } catch (error) {
      updateFileStatus(uploadedFile.id, {
        status: 'error',
        error: 'Failed to process image',
        progress: 0
      });
    }
  };

  const updateFileStatus = (fileId: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats.map(format => format.split('/')[1])
    },
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize: maxFileSize,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  });

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-400';
      case 'validating': return 'text-yellow-400';
      case 'ready': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return '⏳';
      case 'validating': return '🔍';
      case 'ready': return '✅';
      case 'error': return '❌';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragActive || dropzoneActive
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-navy-600 hover:border-cyan-400/50 hover:bg-navy-800/30'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-4">
          <div className="text-6xl">
            {isDragActive || dropzoneActive ? '📤' : '📷'}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragActive || dropzoneActive
                ? 'Drop your photos here'
                : 'Upload Your Photos'
              }
            </h3>
            <p className="text-navy-300 mb-4">
              Drag and drop your photos here, or click to browse
            </p>
            
            <div className="text-sm text-navy-400 space-y-1">
              <p>• Supported formats: JPEG, PNG, WebP</p>
              <p>• Maximum file size: {(maxFileSize / (1024 * 1024)).toFixed(0)}MB</p>
              <p>• Up to {maxFiles} photos at once</p>
              <p>• Minimum resolution: 256x256 pixels</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">
            Uploaded Photos ({uploadedFiles.length}/{maxFiles})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-navy-800/50 backdrop-blur-sm border border-navy-600 rounded-lg p-4"
              >
                {/* Image Preview */}
                <div className="relative mb-3">
                  <OptimizedImage
                    src={file.preview}
                    alt={file.file.name}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                {/* File Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white truncate flex-1 mr-2">
                      {file.file.name}
                    </span>
                    <span className={`text-sm ${getStatusColor(file.status)}`}>
                      {getStatusIcon(file.status)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-navy-400">
                    {(file.file.size / (1024 * 1024)).toFixed(1)}MB
                  </div>
                  
                  {/* Progress Bar */}
                  {file.status !== 'ready' && file.status !== 'error' && (
                    <div className="w-full bg-navy-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Status Message */}
                  <div className={`text-xs ${getStatusColor(file.status)}`}>
                    {file.status === 'uploading' && 'Uploading...'}
                    {file.status === 'validating' && 'Validating image...'}
                    {file.status === 'ready' && 'Ready for processing'}
                    {file.status === 'error' && file.error}
                  </div>
                  
                  {/* Warnings */}
                  {file.warnings && file.warnings.length > 0 && (
                    <div className="text-xs text-yellow-400">
                      ⚠️ {file.warnings.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
