import { mockTreasuryAccount, type Proposal } from "@/lib/mock-data";

/**
 * Dashboard figures derived from proposal store state — NOT stored, NOT a new
 * store access path. The Dashboard reads `useProposals()` exactly like the
 * Approvals queue does, then runs the snapshot through these pure helpers. When
 * the store is rewired to real MidenClient/MultisigClient data, these keep
 * working unchanged — they only depend on the public `Proposal` shape.
 */

/** Parse a display amount like "12,000.00" into a number. */
export function parseAmount(display: string): number {
  const n = Number(display.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Format a number back into the display convention, e.g. 123450 → "123,450.00". */
export function formatAmount(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Executed proposals only — the ones that actually moved funds. */
export function executedProposals(proposals: Proposal[]): Proposal[] {
  return proposals.filter((p) => p.execution);
}

/**
 * Total outflow: sum of every executed payout. (All proposals are payouts, so
 * every execution is an outflow.)
 */
export function totalOutflow(proposals: Proposal[]): number {
  return executedProposals(proposals).reduce(
    (sum, p) => sum + parseAmount(p.amount),
    0,
  );
}

/**
 * Current treasury balance = opening balance − everything paid out.
 * An executed proposal from Approvals therefore lowers this immediately.
 */
export function currentBalance(proposals: Proposal[]): number {
  return mockTreasuryAccount.openingBalance - totalOutflow(proposals);
}
