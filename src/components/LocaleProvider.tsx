'use client';

import React from 'react';

interface LocaleProviderProps {
  children: React.ReactNode;
  locale?: string;
}

/**
 * LocaleProvider Component
 * 
 * Simple locale provider for internationalization support
 * This is a placeholder component that can be extended for full i18n support
 */
export default function LocaleProvider({ children, locale = 'en' }: LocaleProviderProps) {
  // For now, this is just a passthrough component
  // In the future, this could provide locale context for internationalization
  
  return (
    <>
      {children}
    </>
  );
}
