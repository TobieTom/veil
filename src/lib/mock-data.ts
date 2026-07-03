/**
 * Placeholder data for the app shell. No real chain/PSM data yet — this is
 * skeleton-and-skin scaffolding only.
 */

export const mockTreasuryAccount = {
  name: "Core Treasury",
  accountId: "0x8f3a...c21e",
  network: "devnet" as const,
  threshold: { required: 2, total: 3 },
  /**
   * Opening treasury balance. The Dashboard's *current* balance is derived:
   * opening − executed payouts (see lib/treasury.ts). Kept here (not a live
   * chain read) because it's the baseline the mock counts down from; the real
   * balance will come from MidenClient later.
   */
  openingBalance: 128_450,
  balanceUnit: "USDC",
};

export type RosterStatus = "active" | "pending";

export type RosterMember = {
  id: string;
  name: string;
  role: string;
  walletAddress: string;
  status: RosterStatus;
};

export const mockRoster: RosterMember[] = [
  {
    id: "r1",
    name: "Priya Natarajan",
    role: "Engineering",
    walletAddress: "0x4c9e1a2b7f3d6890e1c4a7b2f8d3e6901ac4b7f2",
    status: "active",
  },
  {
    id: "r2",
    name: "Marcus Oduya",
    role: "Design",
    walletAddress: "0x91d3f6a0c7e4b1289a6d3f0c7e4b1289a6d3f0c7",
    status: "active",
  },
  {
    id: "r3",
    name: "Elena Voss",
    role: "Operations",
    walletAddress: "0x2b7e4a1d8f5c0369b7e4a1d8f5c0369b7e4a1d8f",
    status: "pending",
  },
];

/**
 * Cosigners of the multisig treasury — the "approvers" in the propose → sign →
 * threshold → execute flow. In the real Guardian/PSM model each of these holds
 * a key on a separate device; a proposal needs `threshold.required` of their
 * signatures before anyone can execute it on-chain.
 *
 * `self: true` marks the account this UI is connected as — the one we can sign
 * with (mocked). The others sign from their own devices; here their signatures
 * are pre-seeded into the mock proposals.
 */
export type Cosigner = {
  id: string;
  name: string;
  self?: boolean;
};

export const mockCosigners: Cosigner[] = [
  { id: "c1", name: "You", self: true },
  { id: "c2", name: "Marcus Oduya" },
  { id: "c3", name: "Elena Voss" },
];

/**
 * A payout proposal in the multisig flow. Status is *derived* from signatures
 * vs. threshold and whether it has been executed — it is never stored directly,
 * mirroring the real flow where "ready to execute" simply means enough real
 * signatures exist, not a flag someone set.
 */
export type ProposalExecution = {
  executedAt: string; // human display string; mock
  noteId: string; // the resulting private payout note's id (truncated)
};

export type Proposal = {
  id: string;
  reference: string; // short human handle, e.g. "PMT-0294"
  recipientName: string;
  recipientAddress: string;
  amount: string; // display-formatted, e.g. "12,000.00"
  unit: string;
  /** The payout note's memo — private by default per Miden's note model. */
  note: string;
  proposedBy: string;
  createdAt: string; // human display string; mock
  /** Cosigner ids that have submitted a signature so far. */
  signedBy: string[];
  /** Present only once executed. */
  execution?: ProposalExecution;
};

export type ProposalStatus =
  | "awaiting_signatures"
  | "ready_to_execute"
  | "executed";

/** Derive status from signatures + threshold + execution — never stored. */
export function proposalStatus(
  proposal: Proposal,
  required: number,
): ProposalStatus {
  if (proposal.execution) return "executed";
  if (proposal.signedBy.length >= required) return "ready_to_execute";
  return "awaiting_signatures";
}

export const mockProposals: Proposal[] = [
  {
    id: "p1",
    reference: "PMT-0294",
    recipientName: "Priya Natarajan",
    recipientAddress: "0x4c9e1a2b7f3d6890e1c4a7b2f8d3e6901ac4b7f2",
    amount: "12,000.00",
    unit: "USDC",
    note: "September engineering retainer",
    proposedBy: "Elena Voss",
    createdAt: "2h ago",
    // Signed by another cosigner but NOT self — so the connected account can
    // still sign, and signing it here reaches the 2-of-2 threshold, moving it
    // live into "Ready to execute".
    signedBy: ["c3"],
  },
  {
    id: "p2",
    reference: "PMT-0293",
    recipientName: "Marcus Oduya",
    recipientAddress: "0x91d3f6a0c7e4b1289a6d3f0c7e4b1289a6d3f0c7",
    amount: "8,500.00",
    unit: "USDC",
    note: "Brand system — milestone 2",
    proposedBy: "Elena Voss",
    createdAt: "1d ago",
    signedBy: ["c3", "c2"], // 2 of 2 — threshold met, ready to execute
  },
  {
    id: "p3",
    reference: "PMT-0288",
    recipientName: "Elena Voss",
    recipientAddress: "0x2b7e4a1d8f5c0369b7e4a1d8f5c0369b7e4a1d8f",
    amount: "5,000.00",
    unit: "USDC",
    note: "Ops contractor — August",
    proposedBy: "You",
    createdAt: "4d ago",
    signedBy: ["c1", "c2"],
    execution: { executedAt: "3d ago", noteId: "0x7ad9…e5c1" },
  },
];
