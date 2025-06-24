"use client";

import React, { useState, useMemo } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface GeneratedImage {
  id: string;
  url: string;
  originalUrl?: string;
  model: string;
  style: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: string;
  createdAt: string;
  liked: boolean;
  downloaded: boolean;
  tags: string[];
}

interface AdvancedGalleryProps {
  images: GeneratedImage[];
  onImageSelect?: (image: GeneratedImage) => void;
  onImageLike?: (imageId: string) => void;
  onImageDownload?: (imageId: string) => void;
  onImageShare?: (imageId: string) => void;
  onImageDelete?: (imageId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'liked' | 'model' | 'quality';
type FilterOption = 'all' | 'liked' | 'downloaded' | 'not-downloaded';
type ViewMode = 'grid' | 'list' | 'comparison';

export default function AdvancedGallery({
  images,
  onImageSelect,
  onImageLike,
  onImageDownload,
  onImageShare,
  onImageDelete
}: AdvancedGalleryProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');

  // Get unique models and qualities for filters
  const uniqueModels = useMemo(() => 
    Array.from(new Set(images.map(img => img.model))), [images]
  );
  
  const uniqueQualities = useMemo(() => 
    Array.from(new Set(images.map(img => img.quality))), [images]
  );

  // Filter and sort images
  const filteredAndSortedImages = useMemo(() => {
    let filtered = images.filter(image => {
      // Filter by status
      if (filterBy === 'liked' && !image.liked) return false;
      if (filterBy === 'downloaded' && !image.downloaded) return false;
      if (filterBy === 'not-downloaded' && image.downloaded) return false;
      
      // Filter by model
      if (selectedModel !== 'all' && image.model !== selectedModel) return false;
      
      // Filter by quality
      if (selectedQuality !== 'all' && image.quality !== selectedQuality) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          image.model.toLowerCase().includes(query) ||
          image.style.toLowerCase().includes(query) ||
          image.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'liked':
          return (b.liked ? 1 : 0) - (a.liked ? 1 : 0);
        case 'model':
          return a.model.localeCompare(b.model);
        case 'quality':
          const qualityOrder = { ultra: 4, high: 3, medium: 2, low: 1 };
          return qualityOrder[b.quality] - qualityOrder[a.quality];
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, filterBy, selectedModel, selectedQuality, searchQuery, sortBy]);

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAllImages = () => {
    setSelectedImages(filteredAndSortedImages.map(img => img.id));
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'ultra': return 'text-purple-400';
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-6">
        {/* Search and View Mode */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by model, style, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-navy-700/50 border border-cyan-400/30 rounded-lg text-white placeholder-navy-300 focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div className="flex gap-2">
            {(['grid', 'list', 'comparison'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-cyan-500 text-white'
                    : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 bg-navy-700/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="liked">Liked First</option>
              <option value="model">By Model</option>
              <option value="quality">By Quality</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Filter</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="w-full px-3 py-2 bg-navy-700/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Images</option>
              <option value="liked">Liked Only</option>
              <option value="downloaded">Downloaded</option>
              <option value="not-downloaded">Not Downloaded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-navy-700/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Models</option>
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Quality</label>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full px-3 py-2 bg-navy-700/50 border border-cyan-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Qualities</option>
              {uniqueQualities.map(quality => (
                <option key={quality} value={quality} className={getQualityColor(quality)}>
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedModel('all');
                setSelectedQuality('all');
                setFilterBy('all');
                setSortBy('newest');
              }}
              className="w-full px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Selection Controls */}
        {selectedImages.length > 0 && (
          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-white">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-navy-700 hover:bg-navy-600 text-white rounded text-sm transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={selectAllImages}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-sm transition-colors"
                >
                  Select All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-navy-300">
        Showing {filteredAndSortedImages.length} of {images.length} images
      </div>

      {/* Gallery */}
      {filteredAndSortedImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No images found</h3>
          <p className="text-navy-300">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : viewMode === 'list'
            ? 'space-y-4'
            : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
        }`}>
          {filteredAndSortedImages.map((image) => (
            <div
              key={image.id}
              className={`bg-navy-800/50 backdrop-blur-sm border border-navy-600 rounded-lg overflow-hidden hover:border-cyan-400/50 transition-all ${
                selectedImages.includes(image.id) ? 'ring-2 ring-cyan-400' : ''
              }`}
            >
              {/* Image */}
              <div className="relative">
                <OptimizedImage
                  src={image.url}
                  alt={`Generated headshot - ${image.style}`}
                  width={400}
                  height={400}
                  className={`w-full ${viewMode === 'list' ? 'h-32' : 'h-64'} object-cover cursor-pointer`}
                  onClick={() => onImageSelect?.(image)}
                />
                
                {/* Selection Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleImageSelection(image.id);
                  }}
                  className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedImages.includes(image.id)
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'bg-black/50 border-white/50 hover:border-cyan-400'
                  }`}
                >
                  {selectedImages.includes(image.id) && '✓'}
                </button>

                {/* Quality Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-medium ${getQualityColor(image.quality)}`}>
                  {image.quality.toUpperCase()}
                </div>

                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageLike?.(image.id);
                  }}
                  className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    image.liked
                      ? 'bg-red-500 text-white'
                      : 'bg-black/50 text-white/70 hover:text-red-400'
                  }`}
                >
                  ❤️
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white truncate">{image.style}</h4>
                  <span className="text-xs text-navy-400">{image.model}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-navy-300 mb-3">
                  <span>{image.resolution}</span>
                  <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Tags */}
                {image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {image.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-navy-700/50 text-xs text-cyan-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {image.tags.length > 3 && (
                      <span className="px-2 py-1 bg-navy-700/50 text-xs text-navy-400 rounded">
                        +{image.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onImageDownload?.(image.id)}
                    className="flex-1 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-sm transition-colors"
                  >
                    {image.downloaded ? 'Downloaded' : 'Download'}
                  </button>
                  <button
                    onClick={() => onImageShare?.(image.id)}
                    className="px-3 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded text-sm transition-colors"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => onImageDelete?.(image.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
