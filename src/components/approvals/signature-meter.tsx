"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A discrete threshold meter — one segment per required signature, not a
 * continuous progress bar. A 2-of-3 multisig needs exactly 2 signatures, so
 * two segments is the honest representation: it fills, it doesn't "load".
 *
 * `tone` shifts the filled colour so the meter reads differently across the
 * three proposal states without being the *only* signal (each state also
 * changes layout and actions):
 *   - collecting: primary (steel-blue) — in progress
 *   - met:        positive (green)     — threshold reached
 *   - executed:   muted                — settled, historical
 */
export function SignatureMeter({
  signed,
  required,
  tone = "collecting",
  className,
}: {
  signed: number;
  required: number;
  tone?: "collecting" | "met" | "executed";
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  const fillClass = {
    collecting: "bg-primary",
    met: "bg-positive",
    executed: "bg-muted-foreground/50",
  }[tone];

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="meter"
      aria-valuenow={signed}
      aria-valuemin={0}
      aria-valuemax={required}
      aria-label={`${signed} of ${required} signatures`}
    >
      <div className="flex gap-1">
        {Array.from({ length: required }).map((_, i) => {
          const isFilled = i < signed;
          return (
            <div
              key={i}
              className="h-1.5 w-7 overflow-hidden rounded-full bg-border"
            >
              <motion.div
                className={cn("h-full rounded-full", fillClass)}
                initial={shouldReduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: isFilled ? 1 : 0 }}
                style={{ originX: 0 }}
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                  // Later segments fill slightly after earlier ones, so a
                  // fresh signature reads as "the next one landing".
                  delay: shouldReduceMotion ? 0 : i * 0.08,
                }}
              />
            </div>
          );
        })}
      </div>
      <span className="text-figure text-xs tabular-nums text-muted-foreground">
        {signed}/{required}
      </span>
    </div>
  );
}
