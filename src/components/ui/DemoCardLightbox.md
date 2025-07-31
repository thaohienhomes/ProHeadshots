# DemoCardLightbox Component

A comprehensive lightbox/modal component for displaying demo card images with enhanced navigation and accessibility features.

## Features

- **Full-screen image display** with optimized loading
- **Dual view modes** - Switch between AI-generated and original selfie images
- **Keyboard navigation** - Arrow keys for navigation, ESC to close, 1/2 to switch views
- **Touch/click navigation** - Previous/next buttons and backdrop click to close
- **Responsive design** - Adapts to mobile and desktop layouts
- **Accessibility** - ARIA labels, focus management, keyboard support
- **Error handling** - Graceful fallback for failed image loads
- **Smooth animations** - Framer Motion powered transitions

## Props

```typescript
interface DemoCardLightboxProps {
  isOpen: boolean;                    // Controls lightbox visibility
  onClose: () => void;               // Callback when lightbox closes
  selectedCard: CardData | null;     // Currently selected card data
  cards: CardData[];                 // Array of all available cards
  currentIndex: number;              // Index of current card in array
  onNavigate: (direction: 'prev' | 'next') => void; // Navigation callback
}
```

## Usage

```tsx
import DemoCardLightbox from '@/components/ui/DemoCardLightbox';

function MyComponent() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCardClick = (card: CardData) => {
    const cardIndex = cards.findIndex(c => c.id === card.id);
    setSelectedCard(card);
    setCurrentIndex(cardIndex);
    setLightboxOpen(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + cards.length) % cards.length
      : (currentIndex + 1) % cards.length;
    
    setCurrentIndex(newIndex);
    setSelectedCard(cards[newIndex]);
  };

  return (
    <>
      {/* Your card grid */}
      <DemoCardLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        selectedCard={selectedCard}
        cards={cards}
        currentIndex={currentIndex}
        onNavigate={handleNavigate}
      />
    </>
  );
}
```

## Keyboard Shortcuts

- **← →** - Navigate between cards
- **1** - Switch to AI-generated image view
- **2** - Switch to original selfie view
- **ESC** - Close lightbox

## Accessibility Features

- Focus management when opening/closing
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast design
- Proper semantic HTML structure

## Design System Integration

The component follows the existing navy/cyan theme:
- Navy backgrounds (`navy-900`, `navy-800`)
- Cyan accents (`cyan-400`)
- Consistent border radius and spacing
- Backdrop blur effects
- Smooth transitions

## Performance Optimizations

- Uses `OptimizedImage` component for efficient loading
- Priority loading for main images
- Lazy loading for comparison thumbnails
- Efficient re-renders with proper dependency arrays
- Smooth animations without layout thrashing
