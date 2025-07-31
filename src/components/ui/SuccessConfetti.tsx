'use client';

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface SuccessConfettiProps {
  show: boolean;
  duration?: number;
  colors?: string[];
  onComplete?: () => void;
}

export default function SuccessConfetti({
  show,
  duration = 3000,
  colors = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  onComplete,
}: SuccessConfettiProps) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (show) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!isActive || windowDimensions.width === 0) {
    return null;
  }

  return (
    <Confetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      recycle={false}
      numberOfPieces={200}
      colors={colors}
      gravity={0.3}
      initialVelocityY={-10}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
