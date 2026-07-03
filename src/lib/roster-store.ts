"use client";

import { useSyncExternalStore } from "react";
import { mockRoster, type RosterMember } from "@/lib/mock-data";

/**
 * A tiny module-level store for roster members, shared across pages — same
 * pattern as proposal-store.ts.
 *
 * Roster was previously local `useState` in RosterPage, which meant an added
 * member lived only in that component instance: navigating away (e.g. to
 * Approvals) unmounted the page and discarded the addition, so it vanished on
 * return. Lifting it here behind `useSyncExternalStore` makes the roster
 * survive navigation (it does NOT survive a full refresh — that's expected;
 * this is mock state that real Miden/Guardian sync replaces later).
 *
 * When Guardian is wired up, this module is the seam that gets replaced by real
 * account/roster state — the components don't change.
 */

let members: RosterMember[] = [...mockRoster];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): RosterMember[] {
  return members;
}

export type NewMemberInput = Omit<RosterMember, "id" | "status">;

/**
 * Add a member. Mirrors the real flow's eventual shape: a new member joins as
 * `pending` (a proposal to add them would need cosigner approval before they're
 * `active`), even though the mock adds them to local state immediately.
 */
export function addMember(input: NewMemberInput): RosterMember {
  const member: RosterMember = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
  };
  members = [...members, member];
  emit();
  return member;
}

export function useRoster(): RosterMember[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
