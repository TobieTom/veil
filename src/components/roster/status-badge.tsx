import { cn } from "@/lib/utils";
import type { RosterStatus } from "@/lib/mock-data";

const STATUS_STYLE: Record<RosterStatus, string> = {
  active: "border-positive/30 text-positive",
  pending: "border-muted-foreground/30 text-muted-foreground",
};

const STATUS_LABEL: Record<RosterStatus, string> = {
  active: "Active",
  pending: "Pending",
};

/**
 * Text-only status indicator — deliberately not a leading colored dot (the
 * default "AI dashboard" tell). The border/text colour alone carries the
 * state; no separate glyph competing for attention.
 */
export function RosterStatusBadge({ status }: { status: RosterStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
