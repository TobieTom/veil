"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { RevealGroup, revealItem } from "@/components/dashboard/reveal";
import { RosterList } from "@/components/roster/roster-list";
import { AddMemberDialog } from "@/components/roster/add-member-dialog";
import { Button } from "@/components/ui/button";
import { mockRoster, type RosterMember } from "@/lib/mock-data";

export default function RosterPage() {
  const [members, setMembers] = useState<RosterMember[]>(mockRoster);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleCreate(input: Omit<RosterMember, "id" | "status">) {
    // Mock latency to keep the "Creating proposal…" state honest — this is
    // where the multisig proposal call goes once Guardian is wired up.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setMembers((prev) => [
      ...prev,
      { ...input, id: crypto.randomUUID(), status: "pending" },
    ]);
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

        <RosterList members={members} onAddClick={() => setDialogOpen(true)} />
      </RevealGroup>

      <AddMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}
