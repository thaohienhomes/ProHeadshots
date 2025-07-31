'use client';

import { useEffect } from 'react';
import { initializeTrackDesk } from '@/utils/trackdesk';

/**
 * TrackDesk Provider Component
 * 
 * Initializes TrackDesk affiliate tracking on the client side
 * This component should be included in the root layout
 */
export default function TrackDeskProvider() {
  useEffect(() => {
    // Initialize TrackDesk tracking when component mounts
    initializeTrackDesk();
  }, []);

  // This component doesn't render anything visible
  return null;
}
