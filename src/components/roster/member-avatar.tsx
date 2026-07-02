import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

// Deterministic per-person tint so a list of many people doesn't read as
// identical anonymous placeholders, without introducing a new palette —
// all four are existing chart tokens, just applied at low opacity.
const TINTS = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
] as const;

function tintFor(seed: string): (typeof TINTS)[number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function MemberAvatar({
  name,
  id,
  className,
}: {
  name: string;
  id: string;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarFallback className={cn("text-xs font-medium", tintFor(id))}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
