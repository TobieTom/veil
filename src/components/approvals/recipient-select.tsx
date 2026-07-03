"use client";

import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { MemberAvatar } from "@/components/roster/member-avatar";
import { Input } from "@/components/ui/input";
import { cn, truncateAddress } from "@/lib/utils";
import type { RosterMember } from "@/lib/mock-data";

export type RecipientValue = {
  name: string;
  address: string;
};

/**
 * Searchable recipient picker over the roster, with free-entry fallback for a
 * one-off address. Deliberately a plain input + inline results list, not a
 * cmdk command-palette modal (the generic pattern) — a payout recipient is one
 * field in a form, not a global command surface.
 */
export function RecipientSelect({
  members,
  value,
  onChange,
  invalid,
  disabled,
}: {
  members: RosterMember[];
  value: RecipientValue;
  onChange: (v: RecipientValue) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFromRoster, setSelectedFromRoster] = useState(false);
  const listId = useId();
  const blurTimer = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.walletAddress.toLowerCase().includes(q),
    );
  }, [members, query]);

  // What the input displays: a chosen member's name, or the raw typed query.
  const display = selectedFromRoster ? value.name : query;

  function choose(member: RosterMember) {
    onChange({ name: member.name, address: member.walletAddress });
    setSelectedFromRoster(true);
    setQuery(member.name);
    setOpen(false);
  }

  function handleType(next: string) {
    setSelectedFromRoster(false);
    setQuery(next);
    setOpen(true);
    // Free-entry: if it looks like an address, treat the typed value as the
    // recipient directly (name falls back to a truncated address downstream).
    const looksLikeAddress = /^0x[a-fA-F0-9]+$/.test(next.trim());
    onChange({
      name: looksLikeAddress ? "" : next.trim(),
      address: looksLikeAddress ? next.trim() : "",
    });
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={display}
          disabled={disabled}
          aria-invalid={invalid}
          placeholder="Search roster or paste an address…"
          onChange={(e) => handleType(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on a result registers before the list closes.
            blurTimer.current = window.setTimeout(() => setOpen(false), 120);
          }}
          className="pr-8"
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1"
            onMouseDown={() => {
              // Cancel the blur-close so the click selects.
              if (blurTimer.current) window.clearTimeout(blurTimer.current);
            }}
          >
            {matches.length === 0 ? (
              <li className="px-2.5 py-2 text-xs text-muted-foreground">
                No roster match.{" "}
                {/^0x[a-fA-F0-9]+$/.test(query.trim())
                  ? "Paying this address directly."
                  : "Paste a 0x… address to pay directly."}
              </li>
            ) : (
              matches.map((m) => {
                const isSelected =
                  selectedFromRoster && value.address === m.walletAddress;
                return (
                  <li key={m.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => choose(m)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                        "hover:bg-accent/50",
                        isSelected && "bg-accent/40",
                      )}
                    >
                      <MemberAvatar name={m.name} id={m.id} className="size-6" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">
                          {m.name}
                        </span>
                        <span className="text-figure block truncate text-xs text-muted-foreground">
                          {truncateAddress(m.walletAddress)}
                        </span>
                      </span>
                      {isSelected && (
                        <Check className="size-4 shrink-0 text-primary" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
