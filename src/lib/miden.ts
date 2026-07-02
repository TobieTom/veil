/**
 * Miden client bootstrap for Veil.
 *
 * Grounded against the actually-installed package types (verified July 2026):
 *   - @miden-sdk/miden-sdk@0.15.3
 *   - @openzeppelin/miden-multisig-client@0.15.0
 *
 * IMPORTANT — divergences from the build-on-miden skill, confirmed against
 * node_modules types and the packages' own README examples:
 *
 *   1. The public client class is `MidenClient`, NOT `WebClient`. `WebClient`
 *      exists but is the low-level wasm-bindgen class marked "@internal — use
 *      MidenClient instead". We use MidenClient everywhere.
 *
 *   2. We import from the `/lazy` entry point. @miden-sdk's README explicitly
 *      warns that the default (eager) entry uses top-level await, which "hangs
 *      on ... Next.js". The `/lazy` entry defers WASM init to first use, which
 *      is what the SDK's own Next.js example uses.
 *
 *   3. The WASM module cannot load under SSR. Everything here is browser-only
 *      and must be called from a "use client" component inside an effect, never
 *      during render or on the server.
 *
 *   4. The multisig client config key is `guardianEndpoint` (+ `midenRpcEndpoint`),
 *      not `psmEndpoint`. "Guardian" is OpenZeppelin's implementation of the PSM
 *      protocol — the SDK surfaces it under the Guardian name. We keep the
 *      skill's PSM env var name but map it onto `guardianEndpoint` here.
 */

// Types are safe to import at module scope (erased at build time). Values from
// the SDK are loaded lazily inside functions so WASM never touches the server.
import type { MidenClient } from "@miden-sdk/miden-sdk/lazy";

/**
 * The Miden devnet RPC endpoint. Matches the SDK's built-in `devnet` shorthand
 * (RPC_URLS.devnet === "https://rpc.devnet.miden.io"), so the two agree.
 */
export const MIDEN_RPC_URL =
  process.env.NEXT_PUBLIC_MIDEN_RPC_URL ?? "https://rpc.devnet.miden.io";

/**
 * The PSM / Guardian coordination endpoint. `NEXT_PUBLIC_PSM_ENDPOINT` is the
 * skill's name; `NEXT_PUBLIC_GUARDIAN_ENDPOINT` is the SDK's own vocabulary.
 * Either is accepted.
 */
export const GUARDIAN_ENDPOINT =
  process.env.NEXT_PUBLIC_GUARDIAN_ENDPOINT ??
  process.env.NEXT_PUBLIC_PSM_ENDPOINT ??
  "https://psm-stg.openzeppelin.com";

function assertBrowser(fn: string): void {
  if (typeof window === "undefined") {
    throw new Error(
      `${fn}() is browser-only: the Miden SDK runs as WASM and cannot be ` +
        `initialized during SSR. Call it from a "use client" component effect.`,
    );
  }
}

/**
 * Create a MidenClient connected to the configured Miden RPC endpoint.
 *
 * The caller owns the returned client and MUST call `client.terminate()` when
 * done (it holds a WASM worker / store handle).
 */
export async function createMidenClient(): Promise<MidenClient> {
  assertBrowser("createMidenClient");

  // Dynamic import keeps the WASM module out of the server bundle entirely.
  const { MidenClient } = await import("@miden-sdk/miden-sdk/lazy");

  // `create({ rpcUrl })` accepts a raw URL or a shorthand ("devnet", etc.).
  return MidenClient.create({ rpcUrl: MIDEN_RPC_URL });
}

/**
 * Result of a connectivity probe against the Miden RPC node.
 */
export type MidenConnectionResult =
  | { ok: true; rpcUrl: string; syncHeight: number }
  | { ok: false; rpcUrl: string; error: string };

/**
 * Attempt to connect to the Miden devnet RPC and confirm we can reach it.
 *
 * `getSyncHeight()` round-trips to the node, so a successful return proves the
 * RPC endpoint is live and reachable. This is infrastructure verification only.
 */
export async function checkMidenConnection(): Promise<MidenConnectionResult> {
  let client: MidenClient | undefined;
  try {
    client = await createMidenClient();
    const syncHeight = await client.getSyncHeight();
    return { ok: true, rpcUrl: MIDEN_RPC_URL, syncHeight };
  } catch (err) {
    return {
      ok: false,
      rpcUrl: MIDEN_RPC_URL,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    // Always release the WASM handle, even on failure.
    client?.terminate();
  }
}

/**
 * Result of a reachability probe against the Guardian (PSM) endpoint.
 */
export type GuardianConnectionResult =
  | { ok: true; endpoint: string }
  | { ok: false; endpoint: string; error: string };

/**
 * Attempt to reach the Guardian (PSM) coordination endpoint.
 *
 * Unlike the RPC check — which uses the WASM MidenClient to make a real Miden
 * RPC round-trip — the multisig client needs a fully-constructed multisig
 * account before it will talk to Guardian, so it can't serve as a bare
 * infrastructure probe. Instead we do a plain browser `fetch` liveness check,
 * the in-page equivalent of the `curl` probe used to verify the endpoint.
 *
 * NOTE on CORS: `psm-stg.openzeppelin.com` is cross-origin and is not expected
 * to send CORS headers for an arbitrary probe. We therefore use
 * `mode: "no-cors"`, which yields an opaque response we cannot read — but that
 * is fine here: a resolved fetch proves the host accepted the connection (it's
 * reachable), while a thrown fetch means DNS/connection failure (unreachable).
 * This distinguishes reachable vs. unreachable; it deliberately does NOT assert
 * the endpoint is a healthy/correct Guardian server.
 */
export async function checkGuardianConnection(): Promise<GuardianConnectionResult> {
  assertBrowser("checkGuardianConnection");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    await fetch(GUARDIAN_ENDPOINT, {
      method: "GET",
      mode: "no-cors",
      signal: controller.signal,
    });
    // Resolved (even opaquely) => the host accepted the connection.
    return { ok: true, endpoint: GUARDIAN_ENDPOINT };
  } catch (err) {
    return {
      ok: false,
      endpoint: GUARDIAN_ENDPOINT,
      error:
        err instanceof Error
          ? err.name === "AbortError"
            ? "Timed out after 10s"
            : err.message
          : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}
