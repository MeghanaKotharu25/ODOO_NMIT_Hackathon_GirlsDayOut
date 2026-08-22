// src/utils/motion.js

// Standard Dayflow ease: Snappy but physical
export const dayflowEase = [0.16, 1, 0.3, 1];
// Slow, fluid ease for larger transitions
export const fluidEase = [0.65, 0, 0.35, 1];

// Shared transition settings
export const transitionSnappy = {
  duration: 0.5,
  ease: dayflowEase
};

export const transitionFluid = {
  duration: 0.8,
  ease: fluidEase
};

// Page Transition Variants
export const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitionSnappy },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.3, ease: dayflowEase } }
};

// Staggered Container Variants
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: transitionSnappy }
};

// Drawing horizontal line
export const drawLine = {
  initial: { width: '0%' },
  animate: { width: '100%', transition: { duration: 0.8, ease: dayflowEase } }
};
