"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface ScrollImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  category?: string;
}

interface InfiniteScrollGalleryProps {
  images: ScrollImage[];
  direction?: 'left' | 'right';
  speed?: number; // pixels per second
  pauseOnHover?: boolean;
  showOverlay?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  className?: string;
  onImageClick?: (image: ScrollImage, index: number) => void;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
};

export default function InfiniteScrollGallery({
  images,
  direction = 'left',
  speed = 50,
  pauseOnHover = true,
  showOverlay = true,
  aspectRatio = 'portrait',
  className,
  onImageClick,
}: InfiniteScrollGalleryProps) {
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images, ...images];

  // Set ready state after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || images.length === 0 || !isReady) return;

    let animationId: number;
    let lastTime = 0;
    let currentTranslate = 0;

    const animate = (timestamp: number) => {
      if (lastTime === 0) lastTime = timestamp;

      if (!isPaused) {
        const deltaTime = timestamp - lastTime;
        const distance = (speed * deltaTime) / 1000;

        if (direction === 'left') {
          currentTranslate -= distance;
        } else {
          currentTranslate += distance;
        }

        // Calculate reset point based on card width and gap
        const cardWidth = 320; // w-80 = 320px
        const gap = 24; // space-x-6 = 24px
        const totalCardWidth = cardWidth + gap;
        const resetPoint = -(totalCardWidth * images.length);

        if (direction === 'left' && currentTranslate <= resetPoint) {
          currentTranslate = 0;
        } else if (direction === 'right' && currentTranslate >= 0) {
          currentTranslate = resetPoint;
        }

        container.style.transform = `translateX(${currentTranslate}px)`;
      }

      lastTime = timestamp;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation immediately
    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused, speed, direction, images.length, isReady]);

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/auth?mode=signup');
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => {
        if (pauseOnHover) {
          setIsPaused(false);
          setHoveredIndex(null);
        }
      }}
    >
      {/* Gradient overlays for seamless edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-navy-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-navy-950 to-transparent z-10 pointer-events-none" />
      
      <div
        ref={scrollRef}
        className="flex gap-6 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {duplicatedImages.map((image, index) => (
          <motion.div
            key={`${image.id}-${index}`}
            className="relative flex-shrink-0 w-80 group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onImageClick?.(image, index % images.length)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className={cn(
              "relative overflow-hidden rounded-xl bg-navy-900/20",
              aspectRatioClasses[aspectRatio]
            )}>
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="320px"
                priority={index < images.length && index < 3} // Only prioritize first 3 unique images
                loading={index < images.length && index < 3 ? "eager" : "lazy"} // Lazy load duplicates
              />

              {/* Hover overlay */}
              {showOverlay && hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent flex items-end"
                >
                  <div className="p-6 w-full">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {image.title && (
                        <h3 className="text-white text-lg font-semibold mb-1">
                          {image.title}
                        </h3>
                      )}
                      {image.category && (
                        <p className="text-cyan-200 text-sm">
                          {image.category}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={handleGenerateClick}
                          className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium hover:bg-white/30 hover:scale-105 transition-all duration-200 cursor-pointer"
                        >
                          Click to generate
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Loading state */}
              <div className="absolute inset-0 bg-navy-800 animate-pulse opacity-0 group-[.loading]:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Enhanced version with multiple rows
interface MultiRowInfiniteGalleryProps {
  imageRows: ScrollImage[][];
  speeds?: number[];
  directions?: ('left' | 'right')[];
  className?: string;
  onImageClick?: (image: ScrollImage, rowIndex: number, imageIndex: number) => void;
}

export function MultiRowInfiniteGallery({
  imageRows,
  speeds = [50, 40, 60],
  directions = ['left', 'right', 'left'],
  className,
  onImageClick,
}: MultiRowInfiniteGalleryProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {imageRows.map((images, rowIndex) => (
        <InfiniteScrollGallery
          key={rowIndex}
          images={images}
          direction={directions[rowIndex % directions.length]}
          speed={speeds[rowIndex % speeds.length]}
          onImageClick={(image, imageIndex) => 
            onImageClick?.(image, rowIndex, imageIndex)
          }
        />
      ))}
    </div>
  );
}

// Masonry-style infinite scroll
interface MasonryScrollGalleryProps {
  images: ScrollImage[];
  columns?: number;
  speed?: number;
  className?: string;
  onImageClick?: (image: ScrollImage, index: number) => void;
}

export function MasonryScrollGallery({
  images,
  columns = 3,
  speed = 30,
  className,
  onImageClick,
}: MasonryScrollGalleryProps) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Distribute images across columns
  const imageColumns = Array.from({ length: columns }, () => [] as ScrollImage[]);
  images.forEach((image, index) => {
    imageColumns[index % columns].push(image);
  });

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex gap-4">
        {imageColumns.map((columnImages, columnIndex) => (
          <div key={columnIndex} className="flex-1">
            <InfiniteScrollGallery
              images={columnImages}
              direction={columnIndex % 2 === 0 ? 'left' : 'right'}
              speed={speed + (columnIndex * 10)}
              pauseOnHover={false}
              aspectRatio="portrait"
              onImageClick={(image, imageIndex) => {
                const originalIndex = images.findIndex(img => img.id === image.id);
                onImageClick?.(image, originalIndex);
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-navy-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-navy-950 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
