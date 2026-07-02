"use client";

import { useEffect, useState } from "react";
import {
  checkMidenConnection,
  checkGuardianConnection,
  type MidenConnectionResult,
  type GuardianConnectionResult,
} from "@/lib/miden";

type State =
  | { phase: "connecting" }
  | { phase: "done"; result: MidenConnectionResult };

type GuardianState =
  | { phase: "connecting" }
  | { phase: "done"; result: GuardianConnectionResult };

export default function StatusClient() {
  const [state, setState] = useState<State>({ phase: "connecting" });
  const [guardian, setGuardian] = useState<GuardianState>({
    phase: "connecting",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Runs only in the browser; the Miden SDK is WASM and cannot run on the server.
      const result = await checkMidenConnection();
      if (!cancelled) setState({ phase: "done", result });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Independent probe of the Guardian (PSM) endpoint — separate from the RPC check.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await checkGuardianConnection();
      if (!cancelled) setGuardian({ phase: "done", result });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connecting = state.phase === "connecting";
  const ok = state.phase === "done" && state.result.ok;

  const guardianConnecting = guardian.phase === "connecting";
  const guardianOk = guardian.phase === "done" && guardian.result.ok;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
        <h1 className="text-lg font-semibold">Miden devnet status</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Infrastructure verification only — not a Veil feature.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <span
            aria-hidden
            className={[
              "inline-block h-3 w-3 rounded-full",
              connecting
                ? "animate-pulse bg-amber-400"
                : ok
                  ? "bg-emerald-500"
                  : "bg-red-500",
            ].join(" ")}
          />
          <span className="text-sm font-medium">
            {connecting
              ? "Connecting to Miden RPC…"
              : ok
                ? "Connected"
                : "Connection failed"}
          </span>
        </div>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-400">RPC endpoint</dt>
            <dd className="font-mono text-xs text-neutral-300 break-all text-right">
              {state.phase === "done" ? state.result.rpcUrl : "…"}
            </dd>
          </div>
          {state.phase === "done" && state.result.ok && (
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-400">Sync height</dt>
              <dd className="font-mono text-neutral-300">
                {state.result.syncHeight}
              </dd>
            </div>
          )}
        </dl>

        {state.phase === "done" && !state.result.ok && (
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-red-950/40 border border-red-900 p-3 text-xs text-red-300">
            {state.result.error}
          </pre>
        )}

        <hr className="my-6 border-neutral-800" />

        {/* Guardian (PSM) endpoint — independent of the RPC check above. */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={[
              "inline-block h-3 w-3 rounded-full",
              guardianConnecting
                ? "animate-pulse bg-amber-400"
                : guardianOk
                  ? "bg-emerald-500"
                  : "bg-red-500",
            ].join(" ")}
          />
          <span className="text-sm font-medium">
            {guardianConnecting
              ? "Reaching Guardian endpoint…"
              : guardianOk
                ? "Guardian reachable"
                : "Guardian unreachable"}
          </span>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-400">Guardian endpoint</dt>
            <dd className="font-mono text-xs text-neutral-300 break-all text-right">
              {guardian.phase === "done" ? guardian.result.endpoint : "…"}
            </dd>
          </div>
        </dl>

        {guardian.phase === "done" && !guardian.result.ok && (
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-red-950/40 border border-red-900 p-3 text-xs text-red-300">
            {guardian.result.error}
          </pre>
        )}
      </div>
    </main>
  );
}
