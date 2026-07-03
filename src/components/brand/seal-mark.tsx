import { cn } from "@/lib/utils";

/**
 * The Veil seal — the product's one identity motif.
 *
 * Veil is named for concealment: the treasury stays *sealed* until enough
 * cosigners sign to release a payout. The mark encodes that literally — a ring
 * split into `total` segments (the cosigners), with `signed` of them drawn in
 * the "engaged" colour and the rest left as faint outline. At rest it reads as
 * a closed vault seal; as signatures land it visibly completes.
 *
 * Deliberately NOT a glowing/gradient ring (the crypto-wallet default). It's a
 * flat two-tone stroke on the token palette — precision, not decoration. The
 * same "ring completes toward threshold" idea drives the Approvals signature
 * meter, so this reinforces an existing concept rather than inventing a new one.
 */
export function SealMark({
  total,
  signed = 0,
  required,
  sealed = false,
  className,
}: {
  total: number;
  signed?: number;
  required?: number;
  /** When true (locked/at-rest), engaged segments use the muted seal tone
      instead of the active primary — "sealed, not in-progress". */
  sealed?: boolean;
  className?: string;
}) {
  const size = 20;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  // Each cosigner gets an arc segment with a small gap between them, so the
  // ring reads as "made of parts" (a threshold), not one continuous meter.
  const gap = total > 1 ? 3 : 0; // px of blank between segments
  const segLen = circumference / total - gap;

  const engaged = sealed ? "text-muted-foreground" : "text-primary";

  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={
        required
          ? `${signed} of ${required} required signatures, ${total} cosigners`
          : `${total}-party seal`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="-rotate-90"
        aria-hidden
      >
        {Array.from({ length: total }).map((_, i) => {
          const isEngaged = i < signed;
          const offset = -(i * (segLen + gap));
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              strokeWidth={stroke}
              strokeLinecap="round"
              className={cn(
                "transition-colors duration-300",
                isEngaged ? engaged : "text-border",
              )}
              stroke="currentColor"
              strokeDasharray={`${Math.max(segLen, 0.001)} ${circumference}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      {/* Center dot — the "kept" core. Solid when fully released, hollow while sealed. */}
      <span
        className={cn(
          "absolute size-1 rounded-full transition-colors duration-300",
          required && signed >= required ? "bg-primary" : "bg-muted-foreground/50",
        )}
        aria-hidden
      />
    </span>
  );
}
