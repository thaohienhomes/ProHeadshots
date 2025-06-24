"use client";

import React, { useState } from 'react';
import { Download, Image as ImageIcon, FileText, Archive, Settings, Check, Loader2 } from 'lucide-react';

interface DownloadOption {
  id: string;
  name: string;
  description: string;
  format: 'jpg' | 'png' | 'webp' | 'pdf' | 'zip';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: string;
  size: string;
  icon: React.ReactNode;
  isPremium?: boolean;
}

interface AdvancedDownloadProps {
  images: Array<{
    id: string;
    url: string;
    style: string;
    model: string;
  }>;
  onDownload?: (options: DownloadOption[], selectedImages: string[]) => void;
  showBulkOptions?: boolean;
  userPlan?: 'basic' | 'professional' | 'executive';
}

const DOWNLOAD_OPTIONS: DownloadOption[] = [
  {
    id: 'jpg-high',
    name: 'JPEG High Quality',
    description: 'Perfect for social media and web use',
    format: 'jpg',
    quality: 'high',
    resolution: '1024x1024',
    size: '~500KB',
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    id: 'jpg-ultra',
    name: 'JPEG Ultra Quality',
    description: 'Maximum quality for professional use',
    format: 'jpg',
    quality: 'ultra',
    resolution: '2048x2048',
    size: '~1.2MB',
    icon: <ImageIcon className="w-5 h-5" />,
    isPremium: true,
  },
  {
    id: 'png-high',
    name: 'PNG High Quality',
    description: 'Lossless compression with transparency support',
    format: 'png',
    quality: 'high',
    resolution: '1024x1024',
    size: '~800KB',
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    id: 'png-ultra',
    name: 'PNG Ultra Quality',
    description: 'Maximum quality PNG for professional printing',
    format: 'png',
    quality: 'ultra',
    resolution: '2048x2048',
    size: '~2.1MB',
    icon: <ImageIcon className="w-5 h-5" />,
    isPremium: true,
  },
  {
    id: 'webp-high',
    name: 'WebP High Quality',
    description: 'Modern format with excellent compression',
    format: 'webp',
    quality: 'high',
    resolution: '1024x1024',
    size: '~300KB',
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    id: 'pdf-portfolio',
    name: 'PDF Portfolio',
    description: 'Professional portfolio with multiple images',
    format: 'pdf',
    quality: 'high',
    resolution: 'A4 Print',
    size: '~2MB',
    icon: <FileText className="w-5 h-5" />,
    isPremium: true,
  },
  {
    id: 'zip-all',
    name: 'ZIP Archive',
    description: 'All images in multiple formats',
    format: 'zip',
    quality: 'high',
    resolution: 'Various',
    size: '~5MB',
    icon: <Archive className="w-5 h-5" />,
  },
];

export default function AdvancedDownload({
  images,
  onDownload,
  showBulkOptions = true,
  userPlan = 'basic',
}: AdvancedDownloadProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['jpg-high']);
  const [selectedImages, setSelectedImages] = useState<string[]>(images.map(img => img.id));
  const [isDownloading, setIsDownloading] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    quality: 85,
    resolution: '1024x1024',
    watermark: false,
    metadata: true,
  });

  const isPremiumUser = userPlan === 'professional' || userPlan === 'executive';
  const availableOptions = DOWNLOAD_OPTIONS.filter(option => 
    !option.isPremium || isPremiumUser
  );

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleImageToggle = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAllImages = () => {
    setSelectedImages(images.map(img => img.id));
  };

  const deselectAllImages = () => {
    setSelectedImages([]);
  };

  const handleDownload = async () => {
    if (selectedOptions.length === 0 || selectedImages.length === 0) return;

    setIsDownloading(true);

    try {
      const options = DOWNLOAD_OPTIONS.filter(opt => selectedOptions.includes(opt.id));
      
      if (onDownload) {
        await onDownload(options, selectedImages);
      } else {
        // Default download behavior
        for (const imageId of selectedImages) {
          const image = images.find(img => img.id === imageId);
          if (!image) continue;

          for (const option of options) {
            await downloadImage(image.url, `${image.style}-${image.model}`, option);
            // Add delay between downloads to avoid overwhelming the browser
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadImage = async (url: string, filename: string, option: DownloadOption) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${filename}-${option.resolution}.${option.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const getTotalSize = () => {
    const selectedOpts = DOWNLOAD_OPTIONS.filter(opt => selectedOptions.includes(opt.id));
    const totalImages = selectedImages.length;
    
    // Rough calculation - in a real app, you'd get actual file sizes
    const estimatedSize = selectedOpts.reduce((total, opt) => {
      const sizeInKB = parseInt(opt.size.replace(/[^\d]/g, '')) || 500;
      return total + (sizeInKB * totalImages);
    }, 0);

    if (estimatedSize > 1024) {
      return `~${(estimatedSize / 1024).toFixed(1)}MB`;
    }
    return `~${estimatedSize}KB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Download Options</h3>
        </div>
        <div className="text-sm text-slate-300">
          {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} • {getTotalSize()}
        </div>
      </div>

      {/* Image Selection */}
      {showBulkOptions && images.length > 1 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Select Images</h4>
            <div className="flex gap-2">
              <button
                onClick={selectAllImages}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAllImages}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  selectedImages.includes(image.id)
                    ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => handleImageToggle(image.id)}
              >
                <div className="aspect-square bg-slate-700">
                  <img
                    src={image.url}
                    alt={`${image.style} headshot`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="text-center text-white">
                    <p className="text-sm font-medium">{image.style}</p>
                    <p className="text-xs text-slate-300">{image.model}</p>
                  </div>
                </div>

                {selectedImages.includes(image.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Format Options */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
        <h4 className="text-white font-medium mb-4">Download Formats</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableOptions.map((option) => (
            <div
              key={option.id}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                selectedOptions.includes(option.id)
                  ? 'border-cyan-400/50 bg-cyan-400/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => handleOptionToggle(option.id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-cyan-400 mt-1">{option.icon}</div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-white font-medium">{option.name}</h5>
                    {option.isPremium && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{option.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{option.resolution}</span>
                    <span>{option.size}</span>
                    <span className="uppercase">{option.format}</span>
                  </div>
                </div>
              </div>

              {selectedOptions.includes(option.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Settings */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h4 className="text-white font-medium">Custom Settings</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Quality: {customSettings.quality}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={customSettings.quality}
              onChange={(e) => setCustomSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Resolution
            </label>
            <select
              value={customSettings.resolution}
              onChange={(e) => setCustomSettings(prev => ({ ...prev, resolution: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="512x512">512x512 (Small)</option>
              <option value="1024x1024">1024x1024 (Medium)</option>
              <option value="2048x2048">2048x2048 (Large)</option>
              <option value="4096x4096">4096x4096 (Ultra)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="watermark"
              checked={customSettings.watermark}
              onChange={(e) => setCustomSettings(prev => ({ ...prev, watermark: e.target.checked }))}
              className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400"
            />
            <label htmlFor="watermark" className="text-sm text-white">
              Add watermark
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="metadata"
              checked={customSettings.metadata}
              onChange={(e) => setCustomSettings(prev => ({ ...prev, metadata: e.target.checked }))}
              className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400"
            />
            <label htmlFor="metadata" className="text-sm text-white">
              Include metadata
            </label>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading || selectedOptions.length === 0 || selectedImages.length === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download {selectedImages.length} Image{selectedImages.length !== 1 ? 's' : ''} 
            ({selectedOptions.length} Format{selectedOptions.length !== 1 ? 's' : ''})
          </>
        )}
      </button>

      {/* Premium Upgrade */}
      {!isPremiumUser && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-4">
          <h5 className="text-purple-400 font-medium mb-2">Unlock Premium Downloads</h5>
          <p className="text-slate-300 text-sm mb-3">
            Upgrade to Professional or Executive plan for ultra-high quality downloads, PDF portfolios, and more formats.
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg text-sm font-medium transition-all duration-300">
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}
