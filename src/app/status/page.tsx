import StatusClient from "./StatusClient";

// Force dynamic: this page probes a live external RPC at request time and must
// never be statically prerendered.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Miden devnet status · Veil",
};

export default function StatusPage() {
  return <StatusClient />;
}
