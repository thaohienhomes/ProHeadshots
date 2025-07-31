"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';
import { springConfigs } from '@/lib/animations';
import { ImageSkeleton } from '@/components/ui/LoadingSkeleton';
import { BorderBeam } from '@/components/ui/border-beam';
import toast from 'react-hot-toast';

interface CardData {
  id: number;
  aiImage: string;
  selfieImage: string;
  alt: string;
  title?: string;
  category?: string;
}

const demoCards: CardData[] = [
  {
    id: 1,
    aiImage: "/democard/demo1-ai.webp",
    selfieImage: "/democard/demo1-selfie.webp",
    alt: "AI Generated Headshot 1",
    title: "Professional Executive",
    category: "Business",
  },
  {
    id: 2,
    aiImage: "/democard/demo2-ai.webp",
    selfieImage: "/democard/demo2-selfie.webp",
    alt: "AI Generated Headshot 2",
    title: "Creative Professional",
    category: "Creative",
  },
  {
    id: 3,
    aiImage: "/democard/demo3-ai.webp",
    selfieImage: "/democard/demo3-selfie.webp",
    alt: "AI Generated Headshot 3",
    title: "Tech Leader",
    category: "Technology",
  },
  {
    id: 4,
    aiImage: "/democard/demo4-ai.webp",
    selfieImage: "/democard/demo4-selfie.webp",
    alt: "AI Generated Headshot 4",
    title: "Marketing Expert",
    category: "Marketing",
  },
  {
    id: 5,
    aiImage: "/democard/demo5-ai.webp",
    selfieImage: "/democard/demo5-selfie.webp",
    alt: "AI Generated Headshot 5",
    title: "Financial Advisor",
    category: "Finance",
  },
  {
    id: 6,
    aiImage: "/democard/demo6-ai.webp",
    selfieImage: "/democard/demo6-selfie.webp",
    alt: "AI Generated Headshot 6",
    title: "Healthcare Professional",
    category: "Healthcare",
  },
  {
    id: 7,
    aiImage: "/democard/demo7-ai.webp",
    selfieImage: "/democard/demo7-selfie.webp",
    alt: "AI Generated Headshot 7",
    title: "Legal Expert",
    category: "Legal",
  },
  {
    id: 8,
    aiImage: "/democard/demo8-ai.webp",
    selfieImage: "/democard/demo8-selfie.webp",
    alt: "AI Generated Headshot 8",
    title: "Consultant",
    category: "Consulting",
  },
];

interface EnhancedDemoCardProps extends CardData {
  onCardClick?: (card: CardData) => void;
  showHoverEffects?: boolean;
  showDetails?: boolean;
  priority?: boolean; // Add priority prop to control loading priority
}

const EnhancedDemoCard: React.FC<EnhancedDemoCardProps> = ({
  id,
  aiImage,
  selfieImage,
  alt,
  title,
  category,
  onCardClick,
  showHoverEffects = true,
  showDetails = true,
  priority = false,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const preventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleGenerateClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Show toast notification
    toast.success('🚀 Ready to create your AI headshots!', {
      duration: 3000,
      position: 'top-center',
    });

    // Navigate to signup
    router.push('/auth?mode=signup');
  }, [router]);



  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={springConfigs.gentle}
      className="relative w-full max-w-lg mx-auto group"
      onMouseEnter={() => showHoverEffects && setIsHovered(true)}
      onMouseLeave={() => showHoverEffects && setIsHovered(false)}
    >
      <motion.div
        whileHover={showHoverEffects ? { scale: 1.02, y: -5 } : {}}
        transition={springConfigs.snappy}
        className="aspect-[4/5] relative rounded-xl overflow-hidden bg-navy-900/20 shadow-lg"
      >
        {/* Main AI image */}
        <OptimizedImage
          src={aiImage}
          alt={alt}
          fill
          sizes="(max-width: 768px) 90vw, 320px"
          priority={priority}
          className={cn(
            "object-cover transition-transform duration-700",
            showHoverEffects && "group-hover:scale-110"
          )}
          onContextMenu={preventDefault}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0">
            <ImageSkeleton aspectRatio="portrait" className="w-full h-full" />
          </div>
        )}

        {/* Selfie overlay */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.3, ...springConfigs.gentle }}
          className="absolute bottom-4 left-4 w-1/4 aspect-square"
        >
          <OptimizedImage
            src={selfieImage}
            alt="Original Selfie"
            fill
            sizes="(max-width: 768px) 25vw, 12.5vw"
            className="object-cover rounded-lg border-2 border-white/20 shadow-lg"
            onContextMenu={preventDefault}
          />
        </motion.div>

        {/* AI Generated badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={imageLoaded ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5, ...springConfigs.gentle }}
          className="absolute bottom-4 right-4 bg-navy-900/80 backdrop-blur-sm text-cyan-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-cyan-400/20"
        >
          AI GENERATED
        </motion.div>

        {/* Always visible generate button */}
        <div className="absolute bottom-4 left-4 z-10">
          <button
            onClick={handleGenerateClick}
            className="relative px-3 py-1 bg-cyan-400/20 backdrop-blur-sm rounded-full text-cyan-400 text-xs font-medium border border-cyan-400/30 hover:bg-cyan-400/30 hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10">Click to generate</span>
            <BorderBeam size={80} duration={8} delay={0} />
          </button>
        </div>

        {/* Hover overlay with details */}
        {showHoverEffects && showDetails && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfigs.smooth}
            className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent flex items-end"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, ...springConfigs.gentle }}
              className="p-6 w-full"
            >
              {title && (
                <h3 className="text-white text-lg font-semibold mb-1">
                  {title}
                </h3>
              )}
              {category && (
                <p className="text-cyan-200 text-sm mb-3">
                  {category}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Subtle glow effect on hover */}
        {showHoverEffects && isHovered && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-navy-950" />
        )}
      </motion.div>
    </motion.div>
  );
};

interface EnhancedParallaxCardsProps {
  onCardClick?: (card: CardData) => void;
  speed?: number;
  pauseOnHover?: boolean;
  showHoverEffects?: boolean;
  showDetails?: boolean;
  direction?: 'left' | 'right';
}

const EnhancedParallaxCards: React.FC<EnhancedParallaxCardsProps> = ({
  speed = 50,
  pauseOnHover = true,
  showHoverEffects = true,
  showDetails = true,
  direction = 'left',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate cards for seamless loop
  const duplicatedCards = [...demoCards, ...demoCards, ...demoCards];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let startTime: number;
    let currentTranslate = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      if (!isPaused) {
        const elapsed = timestamp - startTime;
        const distance = (speed * elapsed) / 1000;
        
        if (direction === 'left') {
          currentTranslate -= distance;
        } else {
          currentTranslate += distance;
        }

        // Reset position when we've scrolled one full set
        const cardWidth = 400; // Approximate width including gap
        const resetPoint = -(cardWidth * demoCards.length);
        
        if (direction === 'left' && currentTranslate <= resetPoint) {
          currentTranslate = 0;
        } else if (direction === 'right' && currentTranslate >= 0) {
          currentTranslate = resetPoint;
        }

        container.style.transform = `translateX(${currentTranslate}px)`;
      }
      
      startTime = timestamp;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused, speed, direction]);

  return (
    <div className="w-full overflow-hidden relative">
      {/* Gradient overlays for seamless edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-navy-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-navy-950 to-transparent z-10 pointer-events-none" />
      
      <div
        ref={containerRef}
        className="py-16"
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex space-x-8 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {duplicatedCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className="w-72 sm:w-80 flex-shrink-0">
              <EnhancedDemoCard
                {...card}
                showHoverEffects={showHoverEffects}
                showDetails={showDetails}
                priority={index < 3} // Only prioritize first 3 cards
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedParallaxCards;
export { EnhancedDemoCard, demoCards };
export type { CardData };
