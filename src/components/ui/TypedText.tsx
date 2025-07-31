'use client';

import React, { useEffect, useRef } from 'react';
import { ReactTyped as Typed } from 'react-typed';

interface TypedTextProps {
  strings: string[];
  typeSpeed?: number;
  backSpeed?: number;
  loop?: boolean;
  showCursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

export default function TypedText({
  strings,
  typeSpeed = 50,
  backSpeed = 30,
  loop = false,
  showCursor = true,
  className = '',
  onComplete,
}: TypedTextProps) {
  return (
    <span className={className}>
      <Typed
        strings={strings}
        typeSpeed={typeSpeed}
        backSpeed={backSpeed}
        loop={loop}
        showCursor={showCursor}
        cursorChar="|"
        onComplete={onComplete || (() => {})}
      />
    </span>
  );
}
