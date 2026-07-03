"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CheckSquare } from "lucide-react";
import { SealMark } from "@/components/brand/seal-mark";
import { mockTreasuryAccount } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roster", label: "Roster", icon: Users },
  { href: "/approvals", label: "Approvals", icon: CheckSquare },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { required, total } = mockTreasuryAccount.threshold;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 px-5">
        {/* The seal mark IS the Veil logo — sealed at rest (all segments in the
            muted seal tone), the same motif the header and signing UI share. */}
        <SealMark total={total} signed={total} required={required} sealed />
        <span className="font-heading text-sm font-semibold tracking-wide text-foreground">
          Veil
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                // Active gets a short accent edge-marker anchoring it to the
                // rail — "you are here" spatially, not just a fill (Apple HIG
                // Clarity: current location unambiguous).
                "before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-colors before:content-['']",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground before:bg-primary"
                  : "text-sidebar-foreground/70 before:bg-transparent hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
                )}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-3 text-xs text-sidebar-foreground/50">
        Infrastructure verification:{" "}
        <Link href="/status" className="underline underline-offset-2 hover:text-sidebar-foreground">
          /status
        </Link>
      </div>
    </aside>
  );
}
