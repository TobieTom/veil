"use client";

import { AnimatePresence, motion } from "motion/react";
import { Inbox, Plus } from "lucide-react";
import { revealItem } from "@/components/dashboard/reveal";
import { ProposalCard } from "@/components/approvals/proposal-card";
import { Button } from "@/components/ui/button";
import {
  proposalStatus,
  type Cosigner,
  type Proposal,
  type ProposalStatus,
} from "@/lib/mock-data";

// Pending states first (they need action), executed last (historical record).
const GROUP_ORDER: { status: ProposalStatus; label: string }[] = [
  { status: "ready_to_execute", label: "Ready to execute" },
  { status: "awaiting_signatures", label: "Awaiting signatures" },
  { status: "executed", label: "Executed" },
];

export function ProposalQueue({
  proposals,
  cosigners,
  required,
  selfId,
  onSign,
  onExecute,
  onSimulateSign,
  onNew,
  signingId,
  executingId,
  simulating,
}: {
  proposals: Proposal[];
  cosigners: Cosigner[];
  required: number;
  selfId: string;
  onSign: (id: string) => void;
  onExecute: (id: string) => void;
  onSimulateSign: (proposalId: string, cosignerId: string) => void;
  onNew?: () => void;
  signingId: string | null;
  executingId: string | null;
  /** which {proposal, cosigner} pair is mid-simulation, or null. */
  simulating: { proposalId: string; cosignerId: string } | null;
}) {
  if (proposals.length === 0) {
    return (
      <motion.div
        variants={revealItem}
        className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-20 text-center"
      >
        <div className="flex size-10 items-center justify-center rounded-md bg-accent/60 text-accent-foreground ring-1 ring-inset ring-accent-foreground/10">
          <Inbox className="size-4.5" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="font-heading text-base font-semibold text-foreground">
            Nothing to approve
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When a payout is proposed, it lands here for cosigners to review
            and sign toward the threshold before it can be executed.
          </p>
        </div>
        {onNew && (
          <Button onClick={onNew} size="sm" className="mt-1">
            <Plus className="size-3.5" aria-hidden />
            Propose the first payout
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {GROUP_ORDER.map(({ status, label }) => {
        const group = proposals.filter(
          (p) => proposalStatus(p, required) === status,
        );
        if (group.length === 0) return null;

        return (
          <motion.section key={status} variants={revealItem} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
              </h2>
              <span className="text-figure text-xs text-muted-foreground/60">
                {group.length}
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {group.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    cosigners={cosigners}
                    required={required}
                    selfId={selfId}
                    onSign={onSign}
                    onExecute={onExecute}
                    onSimulateSign={onSimulateSign}
                    signing={signingId === proposal.id}
                    executing={executingId === proposal.id}
                    simulatingCosignerId={
                      simulating?.proposalId === proposal.id
                        ? simulating.cosignerId
                        : null
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
