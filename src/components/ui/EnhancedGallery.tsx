"use client";

import React, { useState, useRef } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { staggerContainer, galleryItem } from '@/lib/animations';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category?: string;
  featured?: boolean;
}

interface EnhancedGalleryProps {
  images: GalleryImage[];
  columns?: { mobile: number; tablet: number; desktop: number };
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  showCategories?: boolean;
  enableLightbox?: boolean;
  className?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
}

export default function EnhancedGallery({
  images,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  aspectRatio = 'portrait',
  showCategories = false,
  enableLightbox = true,
  className,
  onImageClick,
}: EnhancedGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(galleryRef, { once: true, margin: "-100px" });

  const categories = showCategories
    ? ['all', ...Array.from(new Set(images.map(img => img.category).filter(Boolean))) as string[]]
    : [];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const handleImageClick = (image: GalleryImage, index: number) => {
    if (enableLightbox) {
      setLightboxImage(image);
    }
    onImageClick?.(image, index);
  };

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const gridClasses = `grid gap-4 grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;

  return (
    <div ref={galleryRef} className={cn("w-full", className)}>
      {/* Category Filter */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                selectedCategory === category
                  ? "bg-cyan-500 text-white shadow-lg"
                  : "bg-navy-800/50 text-navy-200 hover:bg-navy-700/50 hover:text-white"
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      <motion.div
        ref={galleryRef}
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className={gridClasses}
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              variants={galleryItem}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: "easeOut"
              }}
              whileHover="hover"
              className="group relative cursor-pointer"
              onClick={() => handleImageClick(image, index)}
            >
              <div className={cn(
                "relative overflow-hidden rounded-xl",
                aspectClasses[aspectRatio]
              )}>
                <OptimizedImage
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Featured Badge */}
                {image.featured && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    ✨ Featured
                  </div>
                )}
                
                {/* Hover Content */}
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <p className="text-sm font-medium">{image.alt}</p>
                  {image.category && (
                    <p className="text-xs text-cyan-300 mt-1">{image.category}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                fill
                className="object-contain"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}