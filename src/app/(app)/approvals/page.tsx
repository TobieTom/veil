import { CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTreasuryAccount } from "@/lib/mock-data";

export default function ApprovalsPage() {
  const account = mockTreasuryAccount;

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Approvals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Payout proposals awaiting cosigner threshold.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          {account.threshold.required}-of-{account.threshold.total} required
        </Badge>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <CheckSquare className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">
              No pending proposals
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Payout proposals will appear here once cosigners can review and
              sign toward the {account.threshold.required}-of-{account.threshold.total} threshold.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
