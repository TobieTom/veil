"use client";

import { FlaskConical, Loader2 } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { Cosigner } from "@/lib/mock-data";

/**
 * Dev-only affordance to add a signature *as if from another cosigner*.
 *
 * This is not fake functionality papering over a gap — it makes a real
 * limitation explicit. In production each cosigner signs from their own device
 * with their own key; a single browser session legitimately holds exactly one
 * cosigner's key ("You"). So there is no honest in-app way for one user to
 * reach a 2-of-3 threshold alone. Rather than silently letting "You" sign for
 * everyone, this clearly-labelled panel stands in for the other signers' out-
 * of-band actions, so the demo can show a proposal crossing its threshold
 * without pretending one session can authorise multiple people.
 *
 * Deliberately styled as scaffolding — dashed warning-toned border, lab glyph,
 * "not a real signature" label — so it never reads as product chrome.
 */
export function SimulateSignPanel({
  cosigners,
  signedBy,
  selfId,
  onSimulate,
  simulatingId,
}: {
  cosigners: Cosigner[];
  signedBy: string[];
  selfId: string;
  onSimulate: (cosignerId: string) => void;
  /** cosigner id currently being simulated (spinner), or null. */
  simulatingId: string | null;
}) {
  // Other cosigners (never self — signing as yourself is the real button) who
  // haven't signed yet.
  const pending = cosigners.filter(
    (c) => c.id !== selfId && !signedBy.includes(c.id),
  );

  if (pending.length === 0) return null;

  return (
    <div className="rounded-lg border border-dashed border-chart-3/40 bg-chart-3/5 p-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <FlaskConical className="size-3 text-chart-3" aria-hidden />
        <span className="text-[0.6875rem] font-medium tracking-wide text-chart-3 uppercase">
          Simulate — not a real signature
        </span>
      </div>
      <p className="mb-2.5 text-[0.6875rem] leading-relaxed text-muted-foreground">
        Other cosigners sign from their own devices. This stands in for that so
        the flow can reach threshold in one session.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {pending.map((c) => {
          const busy = simulatingId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSimulate(c.id)}
              disabled={Boolean(simulatingId)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-chart-3/30 px-2 py-1 text-xs text-foreground transition-colors",
                "hover:bg-chart-3/10 disabled:opacity-50",
                "focus-visible:border-chart-3 focus-visible:outline-none",
              )}
            >
              {busy ? (
                <Loader2 className="size-3 animate-spin text-chart-3" aria-hidden />
              ) : (
                <span
                  className="flex size-4 items-center justify-center rounded-full bg-chart-3/15 text-[0.5625rem] font-medium text-chart-3"
                  aria-hidden
                >
                  {initials(c.name)}
                </span>
              )}
              Sign as {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
