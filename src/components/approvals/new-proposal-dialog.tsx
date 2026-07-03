"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Lock, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SealMark } from "@/components/brand/seal-mark";
import {
  RecipientSelect,
  type RecipientValue,
} from "@/components/approvals/recipient-select";
import { truncateAddress } from "@/lib/utils";
import type { RosterMember } from "@/lib/mock-data";
import type { NewProposalInput } from "@/lib/proposal-store";

// Placeholder guardrail until real balance/policy limits exist. Keeps the
// "amount too large" error state honest and demonstrable.
const MAX_AMOUNT = 100_000;

type FormState = {
  recipient: RecipientValue;
  amount: string;
  unit: string;
  note: string;
};

type FormErrors = Partial<Record<"recipient" | "amount" | "note", string>>;

function parseAmount(raw: string): number {
  return Number(raw.replace(/,/g, ""));
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  const hasRecipient =
    form.recipient.name.trim() || form.recipient.address.trim();
  if (!hasRecipient) {
    errors.recipient = "Choose a roster member or paste an address.";
  } else if (
    form.recipient.address &&
    !/^0x[a-fA-F0-9]{8,}$/.test(form.recipient.address.trim())
  ) {
    errors.recipient = "That doesn't look like a valid 0x… address.";
  }

  const amount = parseAmount(form.amount);
  if (!form.amount.trim()) {
    errors.amount = "Enter an amount.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be a positive number.";
  } else if (amount > MAX_AMOUNT) {
    errors.amount = `Exceeds the ${formatAmount(MAX_AMOUNT)} per-payout limit.`;
  }

  if (!form.note.trim()) {
    errors.note = "Add a short note so cosigners know what they're signing.";
  }

  return errors;
}

/**
 * Creating a proposal is the "propose" step of the Guardian flow — it
 * circulates a payout for signing, it does NOT sign it. The policy preview and
 * submit copy make that explicit: it lands with zero signatures, awaiting the
 * threshold. Mirrors AddMemberDialog's form-state discipline (empty / inline
 * validation / submitting / error).
 *
 * The shell mounts the form only while open, keyed per open-session, so the
 * form's own initial state picks up `prefillRecipient` fresh each time and
 * resets on close — no reset-in-effect, no stale fields.
 */
export function NewProposalDialog({
  open,
  onOpenChange,
  members,
  required,
  total,
  prefillRecipient,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: RosterMember[];
  required: number;
  total: number;
  /** When opened from a Roster row's "Pay", the recipient is pre-selected. */
  prefillRecipient?: RecipientValue | null;
  onCreate: (input: NewProposalInput) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <ProposalForm
            members={members}
            required={required}
            total={total}
            prefillRecipient={prefillRecipient ?? null}
            onCreate={onCreate}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProposalForm({
  members,
  required,
  total,
  prefillRecipient,
  onCreate,
  onClose,
}: {
  members: RosterMember[];
  required: number;
  total: number;
  prefillRecipient: RecipientValue | null;
  onCreate: (input: NewProposalInput) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    recipient: prefillRecipient ?? { name: "", address: "" },
    amount: "",
    unit: "USDC",
    note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formId = useId();
  const shouldReduceMotion = useReducedMotion();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const address = form.recipient.address.trim();
      await onCreate({
        recipientName: form.recipient.name.trim() || truncateAddress(address),
        recipientAddress: address,
        amount: formatAmount(parseAmount(form.amount)),
        unit: form.unit,
        note: form.note.trim(),
      });
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not create the proposal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>New payout proposal</DialogTitle>
        <DialogDescription>
          This circulates a payout for cosigners to sign. It doesn&rsquo;t move
          funds — it lands unsigned and waits for the threshold.
        </DialogDescription>
      </DialogHeader>

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="proposal-recipient">Recipient</Label>
          <RecipientSelect
            members={members}
            value={form.recipient}
            onChange={(recipient) => setForm((f) => ({ ...f, recipient }))}
            invalid={Boolean(errors.recipient)}
            disabled={submitting}
          />
          {errors.recipient && (
            <p className="text-xs text-destructive">{errors.recipient}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proposal-amount">Amount</Label>
          <div className="flex gap-2">
            <Input
              id="proposal-amount"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              aria-invalid={Boolean(errors.amount)}
              disabled={submitting}
              placeholder="0.00"
              className="text-figure"
            />
            <span className="text-figure inline-flex h-8 shrink-0 items-center rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
              {form.unit}
            </span>
          </div>
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proposal-note" className="flex items-center gap-1.5">
            Note
            <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <Lock className="size-3" aria-hidden />
              private
            </span>
          </Label>
          <Input
            id="proposal-note"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            aria-invalid={Boolean(errors.note)}
            disabled={submitting}
            placeholder="e.g. September engineering retainer"
          />
          {errors.note ? (
            <p className="text-xs text-destructive">{errors.note}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Carried on the payout note — private by default, visible only to
              the treasury&rsquo;s cosigners.
            </p>
          )}
        </div>

        {/* What happens next: the policy, made concrete. Not decorative — it
            tells the creator the proposal lands unsigned and needs `required`
            signatures. Uses the shared seal motif at its empty state. */}
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5">
          <SealMark total={total} signed={0} required={required} />
          <p className="text-xs text-muted-foreground">
            Lands as{" "}
            <span className="text-foreground">awaiting signatures</span> —{" "}
            <span className="text-figure">0 of {required}</span> collected.
            You&rsquo;ll still need to sign it yourself.
          </p>
        </div>

        {submitError && (
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-destructive"
            role="alert"
          >
            {submitError}
          </motion.p>
        )}
      </form>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={submitting}>
          {submitting ? (
            "Creating proposal…"
          ) : (
            <>
              Create proposal
              <ArrowRight className="size-3.5" aria-hidden />
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
