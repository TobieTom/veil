"use client";

import { useSyncExternalStore } from "react";
import { mockProposals, type Proposal } from "@/lib/mock-data";

/**
 * A tiny module-level store for proposals, shared across pages.
 *
 * Proposal creation can start from two places — the Approvals "New proposal"
 * action and a Roster member's "Pay" quick-action — and a proposal created from
 * either must show up in the single Approvals queue. Per-page `useState` would
 * let those two views diverge, so the mock proposals live here instead, behind
 * `useSyncExternalStore`. When Guardian is wired up, this module is the seam
 * that gets replaced by real MultisigClient calls + sync — the components don't
 * change.
 */

let proposals: Proposal[] = [...mockProposals];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Proposal[] {
  return proposals;
}

/** Next sequential PMT-#### reference, based on the highest existing one. */
function nextReference(): string {
  const max = proposals.reduce((acc, p) => {
    const n = Number(p.reference.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `PMT-${String(max + 1).padStart(4, "0")}`;
}

export type NewProposalInput = {
  recipientName: string;
  recipientAddress: string;
  amount: string; // display-formatted, e.g. "12,000.00"
  unit: string;
  note: string;
};

/**
 * Create a proposal in the "awaiting signatures" state with ZERO signatures —
 * not even the creator's. Proposing circulates the transaction for signing; it
 * is a distinct step from signing it (per the real Guardian flow: propose →
 * cosigners sign → threshold → execute). The creator still has to sign
 * separately afterward.
 */
export function createProposal(input: NewProposalInput): Proposal {
  const proposal: Proposal = {
    id: crypto.randomUUID(),
    reference: nextReference(),
    recipientName: input.recipientName,
    recipientAddress: input.recipientAddress,
    amount: input.amount,
    unit: input.unit,
    note: input.note,
    proposedBy: "You",
    createdAt: "just now",
    signedBy: [], // creating is NOT signing
  };
  proposals = [proposal, ...proposals];
  emit();
  return proposal;
}

/** Add a cosigner's signature (idempotent per cosigner). */
export function signProposal(id: string, cosignerId: string): void {
  proposals = proposals.map((p) =>
    p.id === id && !p.signedBy.includes(cosignerId)
      ? { ...p, signedBy: [...p.signedBy, cosignerId] }
      : p,
  );
  emit();
}

/** Mark a proposal executed with a mock note id. */
export function executeProposal(id: string, noteId: string): void {
  proposals = proposals.map((p) =>
    p.id === id ? { ...p, execution: { executedAt: "just now", noteId } } : p,
  );
  emit();
}

export function useProposals(): Proposal[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
