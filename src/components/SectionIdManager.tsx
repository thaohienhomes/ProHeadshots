'use client';

import { useEffect } from 'react';
import { useSectionIds } from '@/hooks/useSectionIds';

interface SectionIdManagerProps {
  enableDebugMode?: boolean;
}

export default function SectionIdManager({ enableDebugMode = false }: SectionIdManagerProps) {
  const { isInitialized, sectionsFound, navigateToSection, testNavigation } = useSectionIds();

  useEffect(() => {
    if (isInitialized && enableDebugMode) {
      console.log('🔧 SectionIdManager: Initialization complete');
      console.log('📋 Sections found:', sectionsFound);
      
      // Run navigation test in debug mode
      setTimeout(() => {
        const testResults = testNavigation();
        console.log('🧪 Navigation test completed:', testResults);
      }, 1000);
    }
  }, [isInitialized, sectionsFound, enableDebugMode, testNavigation]);

  // Handle hash navigation on page load and hash changes
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1);
      if (hash && isInitialized) {
        setTimeout(() => {
          const success = navigateToSection(hash);
          if (enableDebugMode) {
            console.log(`🔗 Hash navigation to "${hash}":`, success ? 'Success' : 'Failed');
          }
        }, 100);
      }
    };

    // Handle initial hash on page load
    if (isInitialized) {
      handleHashNavigation();
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, [isInitialized, navigateToSection, enableDebugMode]);

  // Add global navigation function for testing
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      // Add global function for easy testing in browser console
      (window as any).coolpixNavigate = (sectionId: string) => {
        const success = navigateToSection(sectionId);
        console.log(`🧭 Navigate to "${sectionId}":`, success ? 'Success' : 'Failed');
        return success;
      };

      (window as any).coolpixTest = () => {
        const results = testNavigation();
        console.log('🧪 Navigation test results:', results);
        return results;
      };

      if (enableDebugMode) {
        console.log('🌐 Global functions added: coolpixNavigate(sectionId), coolpixTest()');
      }
    }
  }, [isInitialized, navigateToSection, testNavigation, enableDebugMode]);

  // This component doesn't render anything visible
  return null;
}

// Export navigation utilities for use in other components
export const navigationUtils = {
  scrollToSection: (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    return false;
  },
  
  testAllSections: () => {
    const expectedSections = ['hero', 'how-it-works', 'gallery', 'features', 'benefits', 'pricing', 'testimonials', 'faq'];
    const results: Record<string, boolean> = {};
    
    expectedSections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      results[sectionId] = !!element;
    });

    return results;
  },

  getAllSectionIds: () => {
    const sections = document.querySelectorAll('section[id]');
    return Array.from(sections).map(section => section.id);
  }
};
