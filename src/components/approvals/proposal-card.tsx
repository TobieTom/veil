"use client";

import { motion } from "motion/react";
import { ArrowRight, Lock, CircleCheck, Loader2 } from "lucide-react";
import { SignatureMeter } from "@/components/approvals/signature-meter";
import { CosignerRow } from "@/components/approvals/cosigner-row";
import { SimulateSignPanel } from "@/components/approvals/simulate-sign-panel";
import { SealMark } from "@/components/brand/seal-mark";
import { Button } from "@/components/ui/button";
import { cn, truncateAddress } from "@/lib/utils";
import {
  proposalStatus,
  type Cosigner,
  type Proposal,
} from "@/lib/mock-data";

export function ProposalCard({
  proposal,
  cosigners,
  required,
  selfId,
  onSign,
  onExecute,
  onSimulateSign,
  signing,
  executing,
  simulatingCosignerId,
}: {
  proposal: Proposal;
  cosigners: Cosigner[];
  required: number;
  selfId: string;
  onSign: (id: string) => void;
  onExecute: (id: string) => void;
  onSimulateSign: (proposalId: string, cosignerId: string) => void;
  signing: boolean;
  executing: boolean;
  /** cosigner id being simulated on THIS proposal, or null. */
  simulatingCosignerId: string | null;
}) {
  const status = proposalStatus(proposal, required);
  const selfHasSigned = proposal.signedBy.includes(selfId);

  // Left rule colour is a supporting cue, never the only difference between
  // states — layout, actions, and the meter all change too.
  const accent = {
    awaiting_signatures: "before:bg-primary/70",
    ready_to_execute: "before:bg-positive/80",
    executed: "before:bg-border",
  }[status];

  return (
    <motion.article
      layout
      className={cn(
        "relative overflow-hidden rounded-lg border border-border pl-5",
        "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
        accent,
        status === "executed" ? "bg-card/30" : "bg-card/60",
      )}
    >
      <div className="flex flex-col gap-4 p-4 pl-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: identity + payout detail */}
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            {/* The seal for THIS payout — engaged segments = signatures landed.
                Same motif as the header/logo, here reflecting live progress:
                the payout stays sealed until the ring completes to threshold. */}
            <SealMark
              total={cosigners.length}
              signed={proposal.signedBy.length}
              required={required}
              sealed={status === "executed"}
            />
            <span className="text-figure text-xs text-muted-foreground">
              {proposal.reference}
            </span>
            <StatusPill status={status} />
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-figure text-2xl font-semibold tracking-tight tabular-nums",
                status === "executed" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {proposal.amount}
            </span>
            <span className="text-sm text-muted-foreground">{proposal.unit}</span>
            <ArrowRight className="size-3.5 text-muted-foreground/60" aria-hidden />
            <span className="truncate text-sm font-medium text-foreground">
              {proposal.recipientName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="text-figure">
              {truncateAddress(proposal.recipientAddress)}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Lock className="size-3" aria-hidden />
              {proposal.note}
            </span>
          </div>
        </div>

        {/* Right: state-specific signing / execution zone */}
        <div className="shrink-0 sm:w-64 sm:border-l sm:border-border sm:pl-4">
          {status === "executed" ? (
            <ExecutedSummary proposal={proposal} />
          ) : (
            <div className="space-y-3">
              <SignatureMeter
                signed={proposal.signedBy.length}
                required={required}
                tone={status === "ready_to_execute" ? "met" : "collecting"}
              />
              <CosignerRow cosigners={cosigners} signedBy={proposal.signedBy} />

              {status === "awaiting_signatures" && (
                <>
                  {selfHasSigned ? (
                    <p className="text-xs text-muted-foreground">
                      You&rsquo;ve signed. Waiting on{" "}
                      {required - proposal.signedBy.length} more.
                    </p>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onSign(proposal.id)}
                      disabled={signing}
                    >
                      {signing ? (
                        <>
                          <Loader2
                            className="size-3.5 animate-spin"
                            aria-hidden
                          />
                          Signing…
                        </>
                      ) : (
                        "Sign proposal"
                      )}
                    </Button>
                  )}

                  <SimulateSignPanel
                    cosigners={cosigners}
                    signedBy={proposal.signedBy}
                    selfId={selfId}
                    onSimulate={(cosignerId) =>
                      onSimulateSign(proposal.id, cosignerId)
                    }
                    simulatingId={simulatingCosignerId}
                  />
                </>
              )}

              {status === "ready_to_execute" && (
                <div className="space-y-1.5">
                  <Button
                    size="sm"
                    className="w-full bg-positive text-primary-foreground hover:bg-positive/90"
                    onClick={() => onExecute(proposal.id)}
                    disabled={executing}
                  >
                    {executing ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        Executing…
                      </>
                    ) : (
                      "Execute payout"
                    )}
                  </Button>
                  <p className="text-center text-[0.6875rem] text-muted-foreground">
                    Threshold met — any cosigner can execute
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function StatusPill({
  status,
}: {
  status: ReturnType<typeof proposalStatus>;
}) {
  const config = {
    awaiting_signatures: {
      label: "Awaiting signatures",
      className: "border-primary/30 text-primary",
    },
    ready_to_execute: {
      label: "Ready to execute",
      className: "border-positive/30 text-positive",
    },
    executed: {
      label: "Executed",
      className: "border-border text-muted-foreground",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

function ExecutedSummary({ proposal }: { proposal: Proposal }) {
  return (
    <div className="space-y-2 text-xs text-muted-foreground">
      <div className="inline-flex items-center gap-1.5 text-positive">
        <CircleCheck className="size-3.5" aria-hidden />
        <span className="font-medium">Payout sent</span>
      </div>
      <dl className="space-y-1">
        <div className="flex justify-between gap-3">
          <dt>Executed</dt>
          <dd className="text-foreground/80">{proposal.execution?.executedAt}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Note</dt>
          <dd className="text-figure text-foreground/80">
            {proposal.execution?.noteId}
          </dd>
        </div>
      </dl>
    </div>
  );
}
