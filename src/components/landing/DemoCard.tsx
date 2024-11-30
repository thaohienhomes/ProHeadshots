"use client"

import Image from 'next/image';
import { useRef, useEffect, useState, useCallback } from 'react';

interface CardData {
  id: number;
  aiImage: string;
  selfieImage: string;
  alt: string;
}

const demoCards: CardData[] = [
  {
    id: 1,
    aiImage: "/democard/demo1-ai.webp",
    selfieImage: "/democard/demo1-selfie.webp",
    alt: "AI Generated Headshot 1",
  },
  {
    id: 2,
    aiImage: "/democard/demo2-ai.webp",
    selfieImage: "/democard/demo2-selfie.webp",
    alt: "AI Generated Headshot 2",
  },
  {
    id: 3,
    aiImage: "/democard/demo3-ai.webp",
    selfieImage: "/democard/demo3-selfie.webp",
    alt: "AI Generated Headshot 3",
  },
  {
    id: 4,
    aiImage: "/democard/demo4-ai.webp",
    selfieImage: "/democard/demo4-selfie.webp",
    alt: "AI Generated Headshot 4",
  },
  {
    id: 5,
    aiImage: "/democard/demo5-ai.webp",
    selfieImage: "/democard/demo5-selfie.webp",
    alt: "AI Generated Headshot 5",
  },
  {
    id: 6,
    aiImage: "/democard/demo6-ai.webp",
    selfieImage: "/democard/demo6-selfie.webp",
    alt: "AI Generated Headshot 6",
  },
  {
    id: 7,
    aiImage: "/democard/demo7-ai.webp",
    selfieImage: "/democard/demo7-selfie.webp",
    alt: "AI Generated Headshot 7",
  },
  {
    id: 8,
    aiImage: "/democard/demo8-ai.webp",
    selfieImage: "/democard/demo8-selfie.webp",
    alt: "AI Generated Headshot 8",
  },
];

const DemoCard: React.FC<CardData> = ({ aiImage, selfieImage, alt }) => {
  const preventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="aspect-[4/5] relative rounded-lg overflow-hidden">
        <Image
          src={aiImage}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          quality={100}
          className="object-cover"
          onContextMenu={preventDefault}
          draggable="false"
        />
        <div className="absolute bottom-4 left-4 w-1/4 aspect-square">
          <Image
            src={selfieImage}
            alt="Original Selfie"
            fill
            sizes="(max-width: 768px) 25vw, 12.5vw"
            quality={100}
            className="object-cover rounded-md"
            onContextMenu={preventDefault}
            draggable="false"
          />
        </div>
        <div className="absolute bottom-4 right-4 bg-mainBlack bg-opacity-70 text-mainWhite text-xs px-2 py-1 rounded">
          AI GENERATED
        </div>
      </div>
    </div>
  );
};

const ParallaxCards = () => {
  const [animationDuration, setAnimationDuration] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateAnimationDuration = () => {
      const containerWidth = container.scrollWidth / 2; // Divide by 2 because we duplicated the content
      const viewportWidth = window.innerWidth;
      const newDuration = (containerWidth / viewportWidth) * 20; // Adjust 20 to change base speed
      setAnimationDuration(newDuration);
    };

    updateAnimationDuration();
    window.addEventListener('resize', updateAnimationDuration);

    return () => window.removeEventListener('resize', updateAnimationDuration);
  }, []);

  return (
    <div className="w-full overflow-hidden">
      <div 
        ref={containerRef} 
        className="flex space-x-8 py-16 animate-scroll"
        style={{ 
          width: 'max-content',
          animationDuration: `${animationDuration}s`,
        }}
      >
        {[...demoCards, ...demoCards, ...demoCards].map((card, index) => (
          <div key={`${card.id}-${index}`} className="w-96">
            <DemoCard 
              id={card.id}
              aiImage={card.aiImage}
              selfieImage={card.selfieImage}
              alt={card.alt}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParallaxCards;
