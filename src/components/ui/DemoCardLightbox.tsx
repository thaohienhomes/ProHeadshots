"use client";

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { modalBackdrop, modalContent } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface CardData {
  id: number;
  aiImage: string;
  selfieImage: string;
  alt: string;
  title?: string;
  category?: string;
}

interface DemoCardLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCard: CardData | null;
  cards: CardData[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const DemoCardLightbox: React.FC<DemoCardLightboxProps> = ({
  isOpen,
  onClose,
  selectedCard,
  cards,
  currentIndex,
  onNavigate,
}) => {
  const [imageView, setImageView] = useState<'ai' | 'selfie'>('ai');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image view and loading state when card changes
  useEffect(() => {
    if (selectedCard) {
      setImageView('ai');
      setImageLoaded(false);
      setImageError(false);
    }
  }, [selectedCard]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate('next');
          break;
        case '1':
          setImageView('ai');
          break;
        case '2':
          setImageView('selfie');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus management for accessibility
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const preventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (!selectedCard) return null;

  const currentImage = imageView === 'ai' ? selectedCard.aiImage : selectedCard.selfieImage;
  const currentAlt = imageView === 'ai' ? selectedCard.alt : 'Original Selfie';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative w-full max-w-6xl max-h-[90vh] bg-navy-900 rounded-2xl overflow-hidden shadow-2xl border border-cyan-400/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-navy-900/95 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedCard.title || 'Professional Headshot'}
                    </h2>
                    {selectedCard.category && (
                      <p className="text-cyan-400 text-sm">{selectedCard.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-navy-400 text-sm">
                      {currentIndex + 1} of {cards.length}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 text-navy-400 hover:text-white transition-colors rounded-lg hover:bg-navy-800"
                  aria-label="Close lightbox"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row h-full min-h-[60vh]">
              {/* Image Display */}
              <div className="flex-1 relative bg-navy-950 flex items-center justify-center p-8 pt-20">
                {!imageLoaded && (
                  <div className="absolute inset-8 bg-navy-800 animate-pulse rounded-lg" />
                )}
                
                <div className="relative w-full h-full max-w-2xl max-h-[70vh]">
                  <OptimizedImage
                    src={currentImage}
                    alt={currentAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className={cn(
                      "object-contain transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onContextMenu={preventDefault}
                    onLoad={() => {
                      setImageLoaded(true);
                      setImageError(false);
                    }}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(true);
                    }}
                    priority
                  />

                  {/* Error state */}
                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-800 rounded-lg">
                      <div className="text-center text-navy-400">
                        <p className="text-sm">Failed to load image</p>
                        <button
                          onClick={() => {
                            setImageError(false);
                            setImageLoaded(false);
                          }}
                          className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm underline"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Arrows */}
                {cards.length > 1 && (
                  <>
                    <button
                      onClick={() => onNavigate('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-navy-800/80 hover:bg-navy-700 text-white rounded-full transition-colors backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => onNavigate('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-navy-800/80 hover:bg-navy-700 text-white rounded-full transition-colors backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:w-80 bg-navy-900 border-t lg:border-t-0 lg:border-l border-navy-700 p-6">
                {/* Image Toggle */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">View Options</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImageView('ai')}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        imageView === 'ai'
                          ? "bg-cyan-400 text-navy-900"
                          : "bg-navy-800 text-navy-300 hover:bg-navy-700 hover:text-white"
                      )}
                    >
                      AI Generated
                    </button>
                    <button
                      onClick={() => setImageView('selfie')}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        imageView === 'selfie'
                          ? "bg-cyan-400 text-navy-900"
                          : "bg-navy-800 text-navy-300 hover:bg-navy-700 hover:text-white"
                      )}
                    >
                      Original
                    </button>
                  </div>
                </div>

                {/* Comparison Preview */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Comparison</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-navy-800">
                      <OptimizedImage
                        src={selectedCard.aiImage}
                        alt="AI Generated"
                        fill
                        sizes="150px"
                        className="object-cover"
                        onContextMenu={preventDefault}
                      />
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="bg-cyan-400/90 text-navy-900 text-xs font-medium px-2 py-1 rounded text-center">
                          AI Generated
                        </div>
                      </div>
                    </div>
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-navy-800">
                      <OptimizedImage
                        src={selectedCard.selfieImage}
                        alt="Original Selfie"
                        fill
                        sizes="150px"
                        className="object-cover"
                        onContextMenu={preventDefault}
                      />
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="bg-navy-600/90 text-white text-xs font-medium px-2 py-1 rounded text-center">
                          Original
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="text-navy-400 text-xs space-y-1">
                  <p className="font-medium text-navy-300 mb-2">Keyboard Shortcuts:</p>
                  <p>← → Navigate images</p>
                  <p>1 / 2 Switch view</p>
                  <p>ESC Close</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoCardLightbox;
