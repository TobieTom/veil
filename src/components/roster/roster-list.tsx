"use client";

import { AnimatePresence, motion } from "motion/react";
import { UserPlus, ArrowUpRight } from "lucide-react";
import { revealItem } from "@/components/dashboard/reveal";
import { MemberAvatar } from "@/components/roster/member-avatar";
import { RosterStatusBadge } from "@/components/roster/status-badge";
import { Button } from "@/components/ui/button";
import { truncateAddress, cn } from "@/lib/utils";
import type { RosterMember } from "@/lib/mock-data";

/**
 * The list itself is the surface — a single bordered, rule-divided section,
 * not a Table nested inside a Card. One container layer, not two.
 */
export function RosterList({
  members,
  onAddClick,
  onPay,
}: {
  members: RosterMember[];
  onAddClick: () => void;
  onPay: (member: RosterMember) => void;
}) {
  if (members.length === 0) {
    return (
      <motion.div
        variants={revealItem}
        className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-20 text-center"
      >
        <div className="flex size-10 items-center justify-center rounded-md bg-accent/60 text-accent-foreground ring-1 ring-inset ring-accent-foreground/10">
          <UserPlus className="size-4.5" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="font-heading text-base font-semibold text-foreground">
            The roster is empty
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add the first contractor or employee to start building payout
            proposals from the treasury.
          </p>
        </div>
        <Button onClick={onAddClick} size="sm" className="mt-1">
          Add first member
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={revealItem}
      className="overflow-hidden rounded-lg border border-border"
      role="table"
      aria-label="Roster members"
    >
      <div
        role="row"
        className="grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid-cols-[2fr_1fr_auto_auto]"
      >
        <span role="columnheader">Member</span>
        <span role="columnheader" className="hidden sm:block">
          Wallet
        </span>
        <span role="columnheader" className="text-right sm:text-left">
          Status
        </span>
        <span role="columnheader" className="sr-only">
          Actions
        </span>
      </div>

      <AnimatePresence initial={false}>
        {members.map((member) => (
          <motion.div
            key={member.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="row"
            className={cn(
              "group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[2fr_1fr_auto_auto]",
              "hover:bg-accent/20 transition-colors",
            )}
          >
            <div role="cell" className="flex min-w-0 items-center gap-3">
              <MemberAvatar name={member.name} id={member.id} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {member.name}
                </div>
                <div className="truncate text-xs text-muted-foreground sm:hidden">
                  {member.role} &middot; {truncateAddress(member.walletAddress, 4, 4)}
                </div>
                <div className="hidden truncate text-xs text-muted-foreground sm:block">
                  {member.role}
                </div>
              </div>
            </div>

            <div
              role="cell"
              className="text-figure hidden text-xs text-muted-foreground sm:block"
            >
              {truncateAddress(member.walletAddress)}
            </div>

            <div role="cell" className="flex justify-end sm:justify-start">
              <RosterStatusBadge status={member.status} />
            </div>

            {/* Contextual "Pay" — calm at rest, present on row hover/focus.
                Always reachable by keyboard (focus-within reveals it); it just
                doesn't shout on every row. Opens the proposal form pre-filled
                with this member. */}
            <div role="cell" className="flex justify-end">
              <Button
                variant="outline"
                size="xs"
                onClick={() => onPay(member)}
                aria-label={`Propose a payout to ${member.name}`}
                className={cn(
                  "opacity-0 transition-opacity",
                  "group-hover:opacity-100 focus-visible:opacity-100",
                )}
              >
                <ArrowUpRight className="size-3" aria-hidden />
                Pay
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
