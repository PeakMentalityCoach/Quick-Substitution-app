/**
 * Tablet-specific animations for smooth, touch-friendly transitions
 * Optimized for iPad and other tablet devices
 */

export const animations = {
  // Slide in from right (for drawers)
  slideInRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },

  // Slide in from bottom (for modals)
  slideInBottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },

  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Scale in (for confirmations and highlights)
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },

  // Pulse (for selected items)
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  },

  // Shake (for errors or invalid actions)
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  },

  // Bounce (for successful actions)
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: 1,
      },
    },
  },
};

/**
 * CSS class-based animations for non-React scenarios
 */
export const cssAnimations = {
  // Highlight selected player
  highlight: 'animate-pulse ring-4 ring-green-500 ring-opacity-75',

  // Player out (leaving field)
  playerOut: 'opacity-50 bg-red-100 border-red-400',

  // Player in (entering field)
  playerIn: 'opacity-100 bg-green-100 border-green-400',

  // Position change
  positionChange: 'bg-yellow-100 border-yellow-400',

  // Dragging
  dragging: 'opacity-60 scale-105 rotate-2 shadow-2xl z-50',

  // Drop target
  dropTarget: 'ring-4 ring-blue-400 ring-opacity-50 bg-blue-50',

  // Touch feedback
  touchFeedback: 'active:scale-95 transition-transform duration-100',

  // Disabled state
  disabled: 'opacity-40 cursor-not-allowed grayscale',

  // Card hover/press
  cardPress: 'transition-all duration-150 active:scale-98 active:shadow-md',
};

/**
 * Spring configuration for drag-and-drop
 */
export const dragSpring = {
  type: 'spring',
  damping: 15,
  stiffness: 200,
  mass: 0.5,
};

/**
 * Timing constants for various animations (in milliseconds)
 */
export const timing = {
  quick: 150,
  normal: 300,
  slow: 500,
  substitutionPreview: 600,
  drawerSlide: 400,
  modalFade: 250,
};

/**
 * Easing functions for CSS transitions
 */
export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

/**
 * Helper function to combine animation classes
 */
export function combineAnimations(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Helper to get touch-friendly ripple effect
 */
export function getRippleClasses(color: 'green' | 'blue' | 'red' | 'yellow' = 'green'): string {
  const colors = {
    green: 'after:bg-green-400',
    blue: 'after:bg-blue-400',
    red: 'after:bg-red-400',
    yellow: 'after:bg-yellow-400',
  };

  return `relative overflow-hidden after:absolute after:inset-0 after:opacity-0 hover:after:opacity-20 active:after:opacity-30 after:transition-opacity after:duration-200 ${colors[color]}`;
}

/**
 * Stagger animation for lists
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * Generate inline style for stagger animation
 */
export function getStaggerStyle(index: number, baseDelay: number = 50): React.CSSProperties {
  return {
    animationDelay: `${getStaggerDelay(index, baseDelay)}ms`,
  };
}
