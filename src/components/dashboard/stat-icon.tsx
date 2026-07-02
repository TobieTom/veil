import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-accent/60 text-accent-foreground ring-accent-foreground/10",
  positive: "bg-positive/10 text-positive ring-positive/20",
  negative: "bg-negative/10 text-negative ring-negative/20",
} as const;

/**
 * Small token-driven icon tile. Deliberately square with a soft inner ring
 * rather than a circular "badge" — reads as a data glyph, not a notification
 * dot borrowed from a generic dashboard template.
 */
export function StatIcon({
  icon: Icon,
  tone = "neutral",
  className,
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
    </div>
  );
}
