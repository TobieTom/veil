"use client";

import { Wallet, ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockTreasuryAccount } from "@/lib/mock-data";
import { CountUp } from "@/components/dashboard/count-up";
import { StatIcon } from "@/components/dashboard/stat-icon";
import { RevealGroup, revealItem } from "@/components/dashboard/reveal";
import { motion } from "motion/react";

export default function DashboardPage() {
  const account = mockTreasuryAccount;

  return (
    <div className="bg-mesh min-h-full">
      <RevealGroup className="mx-auto max-w-6xl px-8 py-10">
        <motion.div variants={revealItem} className="mb-8">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Treasury balance and recent activity.
          </p>
        </motion.div>

        {/* Hero: Total Balance dominates. No card chrome competing for
            attention — a quiet rule beneath it is enough separation. */}
        <motion.div variants={revealItem} className="border-b border-border pb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="size-4" aria-hidden />
            Total balance
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <CountUp
              value={account.balanceDisplay}
              className="font-heading text-figure text-6xl font-semibold leading-none tracking-tight text-foreground sm:text-7xl"
            />
            <span className="text-xl font-medium text-muted-foreground">
              {account.balanceUnit}
            </span>
          </div>
        </motion.div>

        {/* Secondary: inflow/outflow — smaller, flanking, not equal-weight cards. */}
        <motion.div
          variants={revealItem}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-4 py-3">
            <StatIcon icon={ArrowUpRight} tone="positive" />
            <div>
              <div className="text-xs font-medium text-muted-foreground">
                Inflow (30d)
              </div>
              <div className="text-figure text-lg font-semibold text-positive">
                +0.00{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {account.balanceUnit}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-4 py-3">
            <StatIcon icon={ArrowDownRight} tone="negative" />
            <div>
              <div className="text-xs font-medium text-muted-foreground">
                Outflow (30d)
              </div>
              <div className="text-figure text-lg font-semibold text-negative">
                &minus;0.00{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {account.balanceUnit}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={revealItem}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground" aria-hidden />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="text-sm font-medium text-foreground">
                  No activity yet
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Payouts and deposits for {account.name} will appear here
                  once the treasury account is connected.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </RevealGroup>
    </div>
  );
}
