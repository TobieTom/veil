import { Check } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { Cosigner } from "@/lib/mock-data";

/**
 * Shows every cosigner, not just the ones who've signed — a threshold multisig
 * is as much about who's outstanding as who's approved. Signed cosigners get a
 * solid chip with a check; unsigned ones stay outlined and muted. Deliberately
 * not an overlapping avatar stack (the generic "team" cliché), because here the
 * gaps carry meaning.
 */
export function CosignerRow({
  cosigners,
  signedBy,
}: {
  cosigners: Cosigner[];
  signedBy: string[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {cosigners.map((c) => {
        const hasSigned = signedBy.includes(c.id);
        return (
          <li
            key={c.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-1 text-xs",
              hasSigned
                ? "border-positive/25 bg-positive/10 text-foreground"
                : "border-dashed border-border text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[0.625rem] font-medium",
                hasSigned
                  ? "bg-positive/20 text-positive"
                  : "bg-muted text-muted-foreground",
              )}
              aria-hidden
            >
              {hasSigned ? <Check className="size-3" /> : initials(c.name)}
            </span>
            <span className="font-medium">
              {c.name}
              {c.self && !hasSigned && (
                <span className="ml-1 text-muted-foreground/70">· you</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
