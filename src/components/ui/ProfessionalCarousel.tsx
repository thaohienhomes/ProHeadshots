"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  category?: string;
}

interface ProfessionalCarouselProps {
  images: CarouselImage[];
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  showArrows?: boolean;
  showPlayPause?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  layout?: 'single' | 'multi' | 'masonry';
  className?: string;
  onImageClick?: (image: CarouselImage, index: number) => void;
  enableSwipe?: boolean;
  pauseOnHover?: boolean;
}

const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const aspectRatioClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  auto: 'aspect-auto',
};

export default function ProfessionalCarousel({
  images,
  autoplay = true,
  autoplayDelay = 4000,
  showDots = true,
  showArrows = true,
  showPlayPause = false,
  aspectRatio = 'portrait',
  layout = 'single',
  className,
  onImageClick,
  enableSwipe = true,
  pauseOnHover = true,
}: ProfessionalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload adjacent images
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (images[index] && !loadedImages.has(index)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, index]));
        };
        img.src = images[index].src;
      }
    };

    // Preload current and adjacent images
    preloadImage(currentIndex);
    preloadImage((currentIndex + 1) % images.length);
    preloadImage((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images, loadedImages]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isHovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoplayDelay);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isHovered, autoplayDelay, images.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Swipe handling
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (!enableSwipe) return;
    
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 || velocity > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  }, [enableSwipe, goToPrevious, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, togglePlayPause]);

  if (!images.length) return null;

  return (
    <div 
      ref={containerRef}
      className={cn("relative group", className)}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      role="region"
      aria-label="Image carousel"
    >
      {/* Main carousel container */}
      <div className="relative overflow-hidden rounded-2xl bg-navy-900/20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
            transition={springConfig}
            drag={enableSwipe ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn("relative", aspectRatioClasses[aspectRatio])}
          >
            <OptimizedImage
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              fill
              className="object-cover cursor-pointer transition-transform duration-700 hover:scale-105"
              onClick={() => onImageClick?.(images[currentIndex], currentIndex)}
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            
            {/* Overlay with title/subtitle */}
            {(images[currentIndex].title || images[currentIndex].subtitle) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-900/80 to-transparent p-6"
              >
                {images[currentIndex].title && (
                  <h3 className="text-white text-lg font-semibold mb-1">
                    {images[currentIndex].title}
                  </h3>
                )}
                {images[currentIndex].subtitle && (
                  <p className="text-cyan-200 text-sm">
                    {images[currentIndex].subtitle}
                  </p>
                )}
              </motion.div>
            )}

            {/* Loading indicator */}
            {!loadedImages.has(currentIndex) && (
              <div className="absolute inset-0 flex items-center justify-center bg-navy-900/20">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      {showArrows && images.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-navy-900/80 hover:bg-navy-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-navy-900/80 hover:bg-navy-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </>
      )}

      {/* Play/Pause button */}
      {showPlayPause && images.length > 1 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayPause}
          className="absolute top-4 right-4 bg-navy-900/80 hover:bg-navy-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>
      )}

      {/* Dots indicator */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {images.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-cyan-400 w-8"
                  : "bg-navy-600 hover:bg-navy-500"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress indicator */}
      {autoplay && isPlaying && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-navy-900/20">
          <motion.div
            className="h-full bg-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: autoplayDelay / 1000, ease: "linear" }}
            key={currentIndex}
          />
        </div>
      )}
    </div>
  );
}
