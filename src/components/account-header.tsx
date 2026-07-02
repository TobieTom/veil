import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockTreasuryAccount } from "@/lib/mock-data";

export function AccountHeader() {
  const account = mockTreasuryAccount;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="text-sm text-muted-foreground">
        <span className="text-foreground font-medium">Team Treasury</span>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="border-positive/30 text-positive gap-1.5"
        >
          <span className="size-1.5 rounded-full bg-positive" aria-hidden />
          {account.network}
        </Badge>

        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="size-3" aria-hidden />
          {account.threshold.required}-of-{account.threshold.total}
        </Badge>

        <div className="mx-1 h-6 w-px bg-border" aria-hidden />

        <div className="flex items-center gap-2.5">
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
