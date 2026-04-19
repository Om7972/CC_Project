export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

export const slideIn = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.24, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.16 } },
};

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

export const buttonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
};

export const navTransition = {
  layoutId: 'nav-indicator',
  transition: { type: 'spring', stiffness: 360, damping: 28 },
};

export const progressShimmer = {
  initial: { backgroundPositionX: '-200%' },
  animate: {
    backgroundPositionX: '200%',
    transition: { repeat: Infinity, duration: 1.4, ease: 'linear' },
  },
};
