"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Lock } from "lucide-react";
import { StatIcon } from "@/components/dashboard/stat-icon";
import { formatAmount, parseAmount } from "@/lib/treasury";
import type { Proposal } from "@/lib/mock-data";

/**
 * Recent treasury activity, derived from executed proposals. A single ruled
 * list (one container layer — the parent Card), not a stack of nested cards.
 * Empty state is designed, not a bare string: it names *why* it's empty and
 * points at the flow that fills it.
 */
export function ActivityFeed({ executed }: { executed: Proposal[] }) {
  if (executed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No activity yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Executed payouts appear here. Sign a proposal to threshold on
          Approvals, then execute it, and it lands in this feed.
        </p>
      </div>
    );
  }

  return (
    <ul className="-mx-1">
      <AnimatePresence initial={false}>
        {executed.map((p) => (
          <motion.li
            key={p.id}
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 border-b border-border px-1 py-2.5 last:border-b-0"
          >
            <StatIcon icon={ArrowUpRight} tone="negative" />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-foreground">
                  {p.recipientName}
                </span>
                <span className="text-figure shrink-0 text-sm font-semibold text-foreground tabular-nums">
                  &minus;{formatAmount(parseAmount(p.amount))}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {p.unit}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <Lock className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{p.note}</span>
                </span>
                <span className="text-figure shrink-0">
                  {p.execution?.executedAt}
                </span>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
