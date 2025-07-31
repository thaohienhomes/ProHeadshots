import { useEffect, useState } from 'react';

interface SectionMapping {
  id: string;
  identifier: (section: Element) => boolean;
  priority: number;
}

export const useSectionIds = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sectionsFound, setSectionsFound] = useState<string[]>([]);

  useEffect(() => {
    const initializeSectionIds = () => {
      try {
        // Define section mappings with intelligent identification
        const sectionMappings: SectionMapping[] = [
          {
            id: 'hero',
            identifier: (section) => {
              // Hero section: Look for main heading with "Professional AI Headshots" or similar
              const headings = section.querySelectorAll('h1, h2');
              return Array.from(headings).some(h => 
                h.textContent?.toLowerCase().includes('professional') ||
                h.textContent?.toLowerCase().includes('headshots') ||
                h.textContent?.toLowerCase().includes('coolpix')
              ) && section.querySelector('button, a[href*="generate"]') !== null;
            },
            priority: 1
          },
          {
            id: 'how-it-works',
            identifier: (section) => {
              // HeroSteps: Look for step indicators or "how it works" content
              const text = section.textContent?.toLowerCase() || '';
              return (
                text.includes('step') || 
                text.includes('how it works') ||
                text.includes('upload') ||
                section.querySelectorAll('[class*="step"]').length > 0 ||
                section.querySelectorAll('ol li, ul li').length >= 3
              );
            },
            priority: 2
          },
          {
            id: 'gallery',
            identifier: (section) => {
              // Gallery: Look for multiple images or grid layout
              const images = section.querySelectorAll('img');
              const text = section.textContent?.toLowerCase() || '';
              return (
                images.length >= 4 || 
                text.includes('gallery') ||
                text.includes('examples') ||
                section.querySelectorAll('[class*="grid"]').length > 0
              );
            },
            priority: 3
          },
          {
            id: 'features',
            identifier: (section) => {
              // Pitch1/Features: Look for feature lists or benefits
              const text = section.textContent?.toLowerCase() || '';
              return (
                text.includes('feature') ||
                text.includes('quality') ||
                text.includes('professional') ||
                text.includes('studio') ||
                (section.querySelectorAll('ul li, ol li').length >= 2 && 
                 !text.includes('step') && 
                 !text.includes('pricing'))
              );
            },
            priority: 4
          },
          {
            id: 'benefits',
            identifier: (section) => {
              // Pitch2/Benefits: Look for benefits or value propositions
              const text = section.textContent?.toLowerCase() || '';
              return (
                text.includes('benefit') ||
                text.includes('why choose') ||
                text.includes('advantage') ||
                text.includes('perfect for') ||
                (text.includes('save') && text.includes('time'))
              );
            },
            priority: 5
          },
          {
            id: 'pricing',
            identifier: (section) => {
              // Pricing: Look for price indicators
              const text = section.textContent?.toLowerCase() || '';
              return (
                text.includes('pricing') ||
                text.includes('$') ||
                text.includes('price') ||
                text.includes('plan') ||
                text.includes('transparent pricing') ||
                section.querySelector('[class*="price"]') !== null
              );
            },
            priority: 6
          },
          {
            id: 'testimonials',
            identifier: (section) => {
              // Testimonials: Look for testimonial content
              const text = section.textContent?.toLowerCase() || '';
              return (
                text.includes('testimonial') ||
                text.includes('review') ||
                text.includes('customer') ||
                text.includes('"') ||
                section.querySelectorAll('blockquote').length > 0 ||
                (text.includes('love') && text.includes('coolpix'))
              );
            },
            priority: 7
          }
        ];

        // Get all sections
        const sections = Array.from(document.querySelectorAll('section'));
        const foundSections: string[] = [];

        // Apply IDs based on intelligent matching
        sections.forEach((section, index) => {
          // Skip if section already has an ID (like FAQ)
          if (section.id) {
            foundSections.push(section.id);
            return;
          }

          // Find the best matching mapping
          const matches = sectionMappings
            .filter(mapping => mapping.identifier(section))
            .sort((a, b) => a.priority - b.priority);

          if (matches.length > 0) {
            const bestMatch = matches[0];
            // Check if this ID hasn't been used yet
            if (!foundSections.includes(bestMatch.id) && !document.getElementById(bestMatch.id)) {
              section.id = bestMatch.id;
              foundSections.push(bestMatch.id);
              console.log(`✅ Applied ID "${bestMatch.id}" to section ${index}`);
            }
          }
        });

        // Fallback: Apply remaining IDs in order for unmatched sections
        const remainingIds = ['hero', 'how-it-works', 'gallery', 'features', 'benefits', 'pricing', 'testimonials']
          .filter(id => !foundSections.includes(id) && !document.getElementById(id));

        const sectionsWithoutIds = sections.filter(section => !section.id);
        
        remainingIds.forEach((id, index) => {
          if (sectionsWithoutIds[index]) {
            sectionsWithoutIds[index].id = id;
            foundSections.push(id);
            console.log(`🔄 Fallback: Applied ID "${id}" to section ${index}`);
          }
        });

        // Ensure smooth scrolling CSS is applied
        const html = document.documentElement;
        const body = document.body;
        
        if (getComputedStyle(html).scrollBehavior !== 'smooth') {
          html.style.scrollBehavior = 'smooth';
          console.log('✅ Applied smooth scrolling to HTML');
        }
        
        if (getComputedStyle(body).scrollBehavior !== 'smooth') {
          body.style.scrollBehavior = 'smooth';
          console.log('✅ Applied smooth scrolling to Body');
        }

        setSectionsFound(foundSections);
        setIsInitialized(true);

        console.log('🎉 Section ID initialization complete:', foundSections);

      } catch (error) {
        console.error('❌ Error initializing section IDs:', error);
        setIsInitialized(true); // Set to true even on error to prevent infinite retries
      }
    };

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeSectionIds);
    } else {
      // DOM is already loaded, run immediately with a small delay to ensure all components are rendered
      setTimeout(initializeSectionIds, 100);
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initializeSectionIds);
    };
  }, []);

  // Navigation helper function
  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    return false;
  };

  // Test all navigation links
  const testNavigation = () => {
    const testResults: Record<string, boolean> = {};
    const expectedSections = ['hero', 'how-it-works', 'gallery', 'features', 'benefits', 'pricing', 'testimonials', 'faq'];
    
    expectedSections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      testResults[sectionId] = !!element;
    });

    console.log('🧪 Navigation test results:', testResults);
    return testResults;
  };

  return {
    isInitialized,
    sectionsFound,
    navigateToSection,
    testNavigation
  };
};
