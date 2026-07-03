"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { RevealGroup, revealItem } from "@/components/dashboard/reveal";
import { ProposalQueue } from "@/components/approvals/proposal-queue";
import { NewProposalDialog } from "@/components/approvals/new-proposal-dialog";
import { Button } from "@/components/ui/button";
import { mockCosigners, mockTreasuryAccount } from "@/lib/mock-data";
import { useRoster } from "@/lib/roster-store";
import {
  createProposal,
  executeProposal,
  signProposal,
  useProposals,
  type NewProposalInput,
} from "@/lib/proposal-store";

/** A truncated-looking mock note id, e.g. "0x7ad9…e5c1". */
function mockNoteId(): string {
  const hex = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  return `0x${hex()}…${hex()}`;
}

export default function ApprovalsPage() {
  const account = mockTreasuryAccount;
  const { required, total } = account.threshold;
  const self = mockCosigners.find((c) => c.self)!;

  const proposals = useProposals();
  const roster = useRoster();
  const [signingId, setSigningId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState<{
    proposalId: string;
    cosignerId: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleSign(id: string) {
    setSigningId(id);
    // Mock the round-trip where the connected account signs and the signature
    // propagates through Guardian. The meter animates when signedBy updates.
    await new Promise((r) => setTimeout(r, 700));
    signProposal(id, self.id);
    setSigningId(null);
  }

  async function handleExecute(id: string) {
    setExecutingId(id);
    await new Promise((r) => setTimeout(r, 900));
    executeProposal(id, mockNoteId());
    setExecutingId(null);
  }

  async function handleCreate(input: NewProposalInput) {
    // Mock latency where the proposal is built + circulated through Guardian.
    await new Promise((r) => setTimeout(r, 700));
    createProposal(input);
  }

  // Dev-only: stand in for another cosigner signing from their own device. See
  // SimulateSignPanel — one browser session can't legitimately hold multiple
  // cosigners' keys, so this makes that explicit rather than faking it silently.
  async function handleSimulateSign(proposalId: string, cosignerId: string) {
    setSimulating({ proposalId, cosignerId });
    await new Promise((r) => setTimeout(r, 700));
    signProposal(proposalId, cosignerId);
    setSimulating(null);
  }

  return (
    <div className="bg-mesh min-h-full">
      <RevealGroup className="mx-auto max-w-6xl px-8 py-10">
        <motion.div
          variants={revealItem}
          className="mb-8 flex items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              Approvals
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Payout proposals in the {required}-of-{total} signing flow — sign,
              reach threshold, execute.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-figure hidden rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground sm:inline">
              {required}-of-{total} threshold
            </span>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              New proposal
            </Button>
          </div>
        </motion.div>

        <ProposalQueue
          proposals={proposals}
          cosigners={mockCosigners}
          required={required}
          selfId={self.id}
          onSign={handleSign}
          onExecute={handleExecute}
          onSimulateSign={handleSimulateSign}
          onNew={() => setDialogOpen(true)}
          signingId={signingId}
          executingId={executingId}
          simulating={simulating}
        />
      </RevealGroup>

      <NewProposalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        members={roster}
        required={required}
        total={total}
        onCreate={handleCreate}
      />
    </div>
  );
}
