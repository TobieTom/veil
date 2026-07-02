"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

function formatWithSameDecimals(value: number, sample: string): string {
  const decimals = sample.includes(".") ? sample.split(".")[1].length : 0;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Animates a numeric string (e.g. "128,450.00") counting up from 0 on mount.
 * Renders the final value immediately when the user prefers reduced motion.
 */
export function CountUp({
  value,
  className,
  duration = 1.1,
  delay = 0,
}: {
  value: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const target = Number(value.replace(/,/g, ""));
  const spanRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    if (shouldReduceMotion || Number.isNaN(target)) {
      node.textContent = value;
      return;
    }

    node.textContent = formatWithSameDecimals(0, value);
    const controls = animate(motionValue, target, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = formatWithSameDecimals(latest, value);
      },
    });

    return () => controls.stop();
  }, [value, target, duration, delay, shouldReduceMotion, motionValue]);

  return (
    <span ref={spanRef} className={className}>
      {value}
    </span>
  );
}
