"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Search, Filter, Grid, List, Eye, Download, Heart } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  aspectRatio?: number; // width/height ratio
}

interface ProfessionalGalleryProps {
  images: GalleryImage[];
  columns?: { mobile: number; tablet: number; desktop: number };
  layout?: 'grid' | 'masonry' | 'justified';
  showSearch?: boolean;
  showFilters?: boolean;
  showCategories?: boolean;
  enableLightbox?: boolean;
  className?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
  onImageLike?: (image: GalleryImage) => void;
  onImageDownload?: (image: GalleryImage) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

const hoverVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

export default function ProfessionalGallery({
  images,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  layout = 'masonry',
  showSearch = true,
  showFilters = true,
  showCategories = true,
  enableLightbox = true,
  className,
  onImageClick,
  onImageLike,
  onImageDownload,
}: ProfessionalGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(galleryRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(images.map(img => img.category).filter(Boolean)));
    return ['all', ...cats];
  }, [images]);

  // Filter images based on search and category
  const filteredImages = useMemo(() => {
    return images.filter(image => {
      const matchesSearch = !searchQuery || 
        image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [images, searchQuery, selectedCategory]);

  const handleImageLike = (image: GalleryImage) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(image.id)) {
        newSet.delete(image.id);
      } else {
        newSet.add(image.id);
      }
      return newSet;
    });
    onImageLike?.(image);
  };

  const getGridClasses = () => {
    switch (layout) {
      case 'grid':
        return `grid grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop} gap-4`;
      case 'masonry':
        return `columns-${columns.mobile} md:columns-${columns.tablet} lg:columns-${columns.desktop} gap-4 space-y-4`;
      case 'justified':
        return 'flex flex-wrap gap-4';
      default:
        return `grid grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop} gap-4`;
    }
  };

  return (
    <div ref={galleryRef} className={cn("w-full", className)}>
      {/* Header with search and filters */}
      {(showSearch || showFilters) && (
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-navy-900/20 border border-navy-700 rounded-lg text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>
          )}

          {/* Filters and view controls */}
          {showFilters && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Category filters */}
              {showCategories && categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                        selectedCategory === category
                          ? "bg-cyan-400 text-navy-900"
                          : "bg-navy-800 text-navy-200 hover:bg-navy-700"
                      )}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* View mode toggle */}
              <div className="flex items-center gap-2 bg-navy-900/20 rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200",
                    viewMode === 'grid'
                      ? "bg-cyan-400 text-navy-900"
                      : "text-navy-400 hover:text-white"
                  )}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-all duration-200",
                    viewMode === 'list'
                      ? "bg-cyan-400 text-navy-900"
                      : "text-navy-400 hover:text-white"
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-6">
        <p className="text-navy-300 text-sm">
          Showing {filteredImages.length} of {images.length} images
        </p>
      </div>

      {/* Gallery grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className={getGridClasses()}
      >
        <AnimatePresence>
          {filteredImages.map((image, index) => (
            <GalleryItem
              key={image.id}
              image={image}
              index={index}
              layout={layout}
              viewMode={viewMode}
              isLiked={likedImages.has(image.id)}
              onImageClick={onImageClick}
              onImageLike={handleImageLike}
              onImageDownload={onImageDownload}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-navy-800 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No images found</h3>
          <p className="text-navy-400">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </div>
  );
}

// Individual gallery item component
interface GalleryItemProps {
  image: GalleryImage;
  index: number;
  layout: 'grid' | 'masonry' | 'justified';
  viewMode: 'grid' | 'list';
  isLiked: boolean;
  onImageClick?: (image: GalleryImage, index: number) => void;
  onImageLike?: (image: GalleryImage) => void;
  onImageDownload?: (image: GalleryImage) => void;
}

function GalleryItem({
  image,
  index,
  layout,
  viewMode,
  isLiked,
  onImageClick,
  onImageLike,
  onImageDownload,
}: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const aspectRatio = image.aspectRatio || 1;
  const isPortrait = aspectRatio < 1;
  const isLandscape = aspectRatio > 1.5;

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={cn(
        "relative group cursor-pointer",
        layout === 'masonry' && "break-inside-avoid mb-4",
        viewMode === 'list' && "flex items-center gap-4 p-4 bg-navy-900/20 rounded-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onImageClick?.(image, index)}
    >
      <motion.div
        variants={hoverVariants}
        initial="rest"
        whileHover="hover"
        className={cn(
          "relative overflow-hidden rounded-lg bg-navy-900/20",
          viewMode === 'grid' && layout === 'grid' && "aspect-square",
          viewMode === 'grid' && layout === 'masonry' && (
            isPortrait ? "aspect-[3/4]" : 
            isLandscape ? "aspect-[4/3]" : 
            "aspect-square"
          ),
          viewMode === 'list' && "w-24 h-24 flex-shrink-0"
        )}
      >
        <OptimizedImage
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onLoad={() => setImageLoaded(true)}
          sizes={
            viewMode === 'list' 
              ? "96px"
              : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          }
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-navy-800 animate-pulse" />
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy-900/60 flex items-center justify-center"
            >
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick?.(image, index);
                  }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="View image"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                
                {onImageLike && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageLike(image);
                    }}
                    className={cn(
                      "p-2 backdrop-blur-sm rounded-full transition-colors",
                      isLiked 
                        ? "bg-red-500 text-white" 
                        : "bg-white/20 text-white hover:bg-white/30"
                    )}
                    aria-label={isLiked ? "Unlike image" : "Like image"}
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  </motion.button>
                )}

                {onImageDownload && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageDownload(image);
                    }}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    aria-label="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured badge */}
        {image.featured && (
          <div className="absolute top-2 left-2 bg-cyan-400 text-navy-900 text-xs font-semibold px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </motion.div>

      {/* Image info for list view */}
      {viewMode === 'list' && (
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">
            {image.title || image.alt}
          </h3>
          {image.category && (
            <p className="text-navy-400 text-sm mt-1">{image.category}</p>
          )}
          {image.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {image.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-navy-800 text-navy-300 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
