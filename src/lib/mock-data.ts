/**
 * Placeholder data for the app shell. No real chain/PSM data yet — this is
 * skeleton-and-skin scaffolding only.
 */

export const mockTreasuryAccount = {
  name: "Core Treasury",
  accountId: "0x8f3a...c21e",
  network: "devnet" as const,
  threshold: { required: 2, total: 3 },
  balanceDisplay: "128,450.00",
  balanceUnit: "USDC",
};

export type RosterStatus = "active" | "pending";

export type RosterMember = {
  id: string;
  name: string;
  role: string;
  walletAddress: string;
  status: RosterStatus;
};

export const mockRoster: RosterMember[] = [
  {
    id: "r1",
    name: "Priya Natarajan",
    role: "Engineering",
    walletAddress: "0x4c9e1a2b7f3d6890e1c4a7b2f8d3e6901ac4b7f2",
    status: "active",
  },
  {
    id: "r2",
    name: "Marcus Oduya",
    role: "Design",
    walletAddress: "0x91d3f6a0c7e4b1289a6d3f0c7e4b1289a6d3f0c7",
    status: "active",
  },
  {
    id: "r3",
    name: "Elena Voss",
    role: "Operations",
    walletAddress: "0x2b7e4a1d8f5c0369b7e4a1d8f5c0369b7e4a1d8f",
    status: "pending",
  },
];
