"use client";

import { motion, MotionConfig, type Variants } from "motion/react";

export const revealContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Orchestrates a top-down staggered reveal for direct motion.div children
 * using revealItem. Wrapped in MotionConfig reducedMotion="user" — Motion's
 * animations run via WAAPI/rAF, not CSS transitions, so the
 * prefers-reduced-motion guard in globals.css (which only zeroes CSS
 * transition/animation durations) doesn't reach them. This is the mechanism
 * that actually does: when the OS setting is on, Motion collapses all
 * animations on these children to instant, no-motion updates.
 */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={revealContainer}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
