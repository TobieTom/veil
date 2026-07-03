"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { RevealGroup, revealItem } from "@/components/dashboard/reveal";
import { RosterList } from "@/components/roster/roster-list";
import { AddMemberDialog } from "@/components/roster/add-member-dialog";
import { NewProposalDialog } from "@/components/approvals/new-proposal-dialog";
import type { RecipientValue } from "@/components/approvals/recipient-select";
import { Button } from "@/components/ui/button";
import { mockTreasuryAccount, type RosterMember } from "@/lib/mock-data";
import { addMember, useRoster, type NewMemberInput } from "@/lib/roster-store";
import { createProposal, type NewProposalInput } from "@/lib/proposal-store";

export default function RosterPage() {
  const { required, total } = mockTreasuryAccount.threshold;
  const members = useRoster();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Pay flow: the shared proposal dialog, pre-filled with the chosen member.
  const [payOpen, setPayOpen] = useState(false);
  const [payRecipient, setPayRecipient] = useState<RecipientValue | null>(null);

  async function handleCreate(input: NewMemberInput) {
    // Mock latency to keep the "Creating proposal…" state honest — this is
    // where the multisig proposal call goes once Guardian is wired up. Writes
    // to the shared roster store so the addition survives navigation.
    await new Promise((resolve) => setTimeout(resolve, 600));
    addMember(input);
  }

  function handlePay(member: RosterMember) {
    setPayRecipient({ name: member.name, address: member.walletAddress });
    setPayOpen(true);
  }

  async function handleCreateProposal(input: NewProposalInput) {
    // Same seam as Approvals — writes to the shared store, so the new proposal
    // shows up in the Approvals queue.
    await new Promise((r) => setTimeout(r, 700));
    createProposal(input);
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
              Roster
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Contractors and employees eligible for payout.
            </p>
          </div>
          {members.length > 0 && (
            <Button onClick={() => setDialogOpen(true)}>Add member</Button>
          )}
        </motion.div>

        <RosterList
          members={members}
          onAddClick={() => setDialogOpen(true)}
          onPay={handlePay}
        />
      </RevealGroup>

      <AddMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
      />

      <NewProposalDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        members={members}
        required={required}
        total={total}
        prefillRecipient={payRecipient}
        onCreate={handleCreateProposal}
      />
    </div>
  );
}
