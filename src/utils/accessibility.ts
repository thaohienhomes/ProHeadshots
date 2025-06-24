// Accessibility utilities and helpers

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  
  // Focus the first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Skip link component
export function createSkipLink(targetId: string, text: string = 'Skip to main content') {
  return {
    href: `#${targetId}`,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded z-50',
    children: text,
    onFocus: () => announceToScreenReader('Skip link focused'),
  };
}

// Keyboard navigation helpers
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) {
  const { key } = event;
  let newIndex = currentIndex;

  if (orientation === 'vertical') {
    if (key === 'ArrowDown') {
      newIndex = (currentIndex + 1) % items.length;
      event.preventDefault();
    } else if (key === 'ArrowUp') {
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      event.preventDefault();
    }
  } else {
    if (key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % items.length;
      event.preventDefault();
    } else if (key === 'ArrowLeft') {
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      event.preventDefault();
    }
  }

  if (key === 'Home') {
    newIndex = 0;
    event.preventDefault();
  } else if (key === 'End') {
    newIndex = items.length - 1;
    event.preventDefault();
  }

  if (newIndex !== currentIndex) {
    items[newIndex]?.focus();
    return newIndex;
  }

  return currentIndex;
}

// ARIA attributes helpers
export function generateAriaAttributes(config: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  busy?: boolean;
  controls?: string;
  owns?: string;
  haspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  level?: number;
  setsize?: number;
  posinset?: number;
}) {
  const attributes: Record<string, string | boolean | number> = {};

  if (config.label) attributes['aria-label'] = config.label;
  if (config.labelledBy) attributes['aria-labelledby'] = config.labelledBy;
  if (config.describedBy) attributes['aria-describedby'] = config.describedBy;
  if (config.expanded !== undefined) attributes['aria-expanded'] = config.expanded;
  if (config.selected !== undefined) attributes['aria-selected'] = config.selected;
  if (config.checked !== undefined) attributes['aria-checked'] = config.checked;
  if (config.disabled !== undefined) attributes['aria-disabled'] = config.disabled;
  if (config.required !== undefined) attributes['aria-required'] = config.required;
  if (config.invalid !== undefined) attributes['aria-invalid'] = config.invalid;
  if (config.live) attributes['aria-live'] = config.live;
  if (config.atomic !== undefined) attributes['aria-atomic'] = config.atomic;
  if (config.busy !== undefined) attributes['aria-busy'] = config.busy;
  if (config.controls) attributes['aria-controls'] = config.controls;
  if (config.owns) attributes['aria-owns'] = config.owns;
  if (config.haspopup !== undefined) attributes['aria-haspopup'] = config.haspopup;
  if (config.level) attributes['aria-level'] = config.level;
  if (config.setsize) attributes['aria-setsize'] = config.setsize;
  if (config.posinset) attributes['aria-posinset'] = config.posinset;

  return attributes;
}

// Color contrast checker
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  // Convert hex to RGB
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Calculate relative luminance
  function getLuminance(r: number, g: number, b: number) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return { ratio: 0, wcagAA: false, wcagAAA: false };
  }

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast detection
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Focus visible utility
export function setupFocusVisible() {
  if (typeof window === 'undefined') return;

  let hadKeyboardEvent = true;
  const keyboardThrottleTimeout = 100;

  function onPointerDown() {
    hadKeyboardEvent = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }
    hadKeyboardEvent = true;
  }

  function onFocus(e: FocusEvent) {
    const target = e.target as HTMLElement;
    if (hadKeyboardEvent || target.matches(':focus-visible')) {
      target.classList.add('focus-visible');
    }
  }

  function onBlur(e: FocusEvent) {
    const target = e.target as HTMLElement;
    target.classList.remove('focus-visible');
  }

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('mousedown', onPointerDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('touchstart', onPointerDown, true);
  document.addEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);

  // Cleanup function
  return () => {
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('mousedown', onPointerDown, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('touchstart', onPointerDown, true);
    document.removeEventListener('focus', onFocus, true);
    document.removeEventListener('blur', onBlur, true);
  };
}

// Screen reader only text utility
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0',
};

// Accessible form validation
export function createAccessibleFormValidation(
  input: HTMLInputElement,
  errorMessage: string
) {
  const errorId = `${input.id}-error`;
  let errorElement = document.getElementById(errorId);

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'text-red-500 text-sm mt-1';
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    input.parentNode?.insertBefore(errorElement, input.nextSibling);
  }

  // Set error state
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
  errorElement.textContent = errorMessage;

  // Announce error
  announceToScreenReader(`Error: ${errorMessage}`, 'assertive');

  // Return cleanup function
  return () => {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    errorElement?.remove();
  };
}
