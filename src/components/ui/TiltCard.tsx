'use client';

import React from 'react';
import Tilt from 'react-tilt';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  options?: {
    reverse?: boolean;
    max?: number;
    perspective?: number;
    scale?: number;
    speed?: number;
    transition?: boolean;
    axis?: string | null;
    reset?: boolean;
    easing?: string;
  };
}

export default function TiltCard({
  children,
  className = '',
  options = {
    reverse: false,
    max: 15,
    perspective: 1000,
    scale: 1.02,
    speed: 1000,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
  },
}: TiltCardProps) {
  return (
    <Tilt className={className} options={options}>
      {children}
    </Tilt>
  );
}
