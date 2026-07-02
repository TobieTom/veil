import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "0x4c9e1a2b7f3d..." style truncation for wallet addresses. */
export function truncateAddress(address: string, lead = 6, trail = 4): string {
  if (address.length <= lead + trail + 3) return address;
  return `${address.slice(0, lead)}…${address.slice(-trail)}`;
}

/** Deterministic initials from a display name, for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
