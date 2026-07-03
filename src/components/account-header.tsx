import { SealMark } from "@/components/brand/seal-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockTreasuryAccount } from "@/lib/mock-data";

/**
 * The header's job on a treasury tool is to answer, at a glance and with
 * precision: which account, on which network, guarded by what signing policy.
 * Those are the trust-bearing facts, so this is Veil's one deliberately dense,
 * Bloomberg-precise cluster — tabular figures, tight tracking, a seal mark that
 * encodes the policy — rather than default status badges.
 */
export function AccountHeader() {
  const account = mockTreasuryAccount;
  const { required, total } = account.threshold;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="text-sm text-muted-foreground">
        <span className="text-foreground font-medium">Team Treasury</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Signing-policy seal: the motif + the precise readout, together. */}
        <div className="flex items-center gap-2.5">
          <SealMark total={total} signed={total} required={required} sealed />
          <dl className="text-figure flex items-center gap-3 text-xs leading-none">
            <div className="flex flex-col gap-0.5">
              <dt className="text-[0.625rem] font-medium tracking-wider text-muted-foreground/70 uppercase">
                Network
              </dt>
              <dd className="text-positive">{account.network}</dd>
            </div>
            <div className="h-6 w-px bg-border" aria-hidden />
            <div className="flex flex-col gap-0.5">
              <dt className="text-[0.625rem] font-medium tracking-wider text-muted-foreground/70 uppercase">
                Policy
              </dt>
              <dd className="text-foreground">
                {required}
                <span className="text-muted-foreground/60">/</span>
                {total}
                <span className="ml-1 text-muted-foreground/60">signers</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="h-6 w-px bg-border" aria-hidden />

        <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors hover:bg-accent/40">
          <Avatar className="size-7">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-medium">
              TT
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="text-sm font-medium text-foreground">
              {account.name}
            </div>
            <div className="text-figure text-xs text-muted-foreground">
              {account.accountId}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
