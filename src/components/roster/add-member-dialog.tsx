"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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
import type { RosterMember } from "@/lib/mock-data";

type FormState = { name: string; role: string; walletAddress: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = { name: "", role: "", walletAddress: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.role.trim()) errors.role = "Role is required.";
  if (!/^0x[a-fA-F0-9]{8,}$/.test(form.walletAddress.trim())) {
    errors.walletAddress = "Enter a valid wallet address (0x…).";
  }
  return errors;
}

/**
 * Adding a member here doesn't add them to the roster directly — once this
 * connects to the multisig, it creates a proposal that cosigners approve.
 * The copy and submit label say so now, even though the wiring underneath
 * is mock state, so the mental model doesn't have to be relearned later.
 */
export function AddMemberDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (member: Omit<RosterMember, "id" | "status">) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formId = useId();
  const shouldReduceMotion = useReducedMotion();

  function reset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (!submitting) {
      onOpenChange(next);
      if (!next) reset();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onCreate({
        name: form.name.trim(),
        role: form.role.trim(),
        walletAddress: form.walletAddress.trim(),
      });
      onOpenChange(false);
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not create the proposal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Propose a new roster member</DialogTitle>
          <DialogDescription>
            This creates a proposal for cosigners to approve — the member
            joins the roster once the threshold is met, not immediately.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              aria-invalid={Boolean(errors.name)}
              disabled={submitting}
              placeholder="Jordan Lee"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-role">Role</Label>
            <Input
              id="member-role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              aria-invalid={Boolean(errors.role)}
              disabled={submitting}
              placeholder="Engineering"
            />
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-wallet">Wallet address</Label>
            <Input
              id="member-wallet"
              value={form.walletAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, walletAddress: e.target.value }))
              }
              aria-invalid={Boolean(errors.walletAddress)}
              disabled={submitting}
              placeholder="0x…"
              className="text-figure"
            />
            {errors.walletAddress && (
              <p className="text-xs text-destructive">
                {errors.walletAddress}
              </p>
            )}
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
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={submitting}>
            {submitting ? "Creating proposal…" : "Create proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
