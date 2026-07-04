---
name: build-on-miden
description: Use whenever writing, reviewing, or planning code for the Veil project — a private team treasury/payroll app built on Miden's OpenZeppelin Private Multisig (PSM/Guardian). Use when touching Miden accounts, notes, assets, the midenup toolchain, @miden-sdk/miden-sdk, or @openzeppelin/miden-multisig-client. This skill grounds Claude in verified, current facts about Miden — its own training data on Miden is thin and stale, and it WILL hallucinate APIs, package names, and CLI commands if this skill is not consulted first.
---

# Building on Miden — Verified Ground Truth

Miden is early and moves fast. Do not trust pretrained knowledge about its APIs,
CLI commands, or package names — verify against this file and, when in doubt,
re-check https://docs.miden.xyz before writing code. If something here conflicts
with the live docs, the live docs win; flag the conflict rather than silently
picking one.

## Core primitives (the only four things Miden is built from)

- **Accounts** — smart contracts that hold assets and run code. Private by default.
- **Notes** — programmable messages that move assets *and* data between accounts.
  Private by default. This is how value moves.
- **Assets** — fungible or non-fungible tokens.
- **Transactions** — state changes proven locally via ZK proofs, then verified
  (not re-executed) by the network. This is why Miden calls itself an "edge
  blockchain": execution happens client-side, the network only checks proofs.

Every account, note, and transaction is private unless explicitly made public.
There is no "privacy mode" to turn on — it's the default you have to opt out of.

## Toolchain (verified working, July 2026)

Do NOT use `npm i @miden-sdk/miden-sdk` alone as a project bootstrap — that
package is real but is only the browser client library, not the full toolchain.
The actual toolchain manager is `midenup`:

```bash
# One-time setup (already done for this project — do not re-run blindly)
cargo install --git https://github.com/0xMiden/midenup.git midenup
midenup init
midenup install stable
midenup show active-toolchain   # should print "stable"
```

`which miden` should resolve to `~/.cargo/bin/miden`. On-chain contract logic
is written in **Rust**, compiled to Miden Assembly (MASM) via the Miden
compiler. Client-side interaction (our web app) is **TypeScript**, via the
WASM-compiled web client.

## Real package names — do not substitute or guess alternatives

- `@miden-sdk/miden-sdk` — the public client class is `MidenClient` (NOT
  `WebClient`; `WebClient` exists but is the low-level wasm-bindgen class marked
  `@internal` — "use MidenClient instead"). Runs as WASM in the browser. Talks
  directly to a Miden RPC node. This is how the frontend executes transactions
  and builds notes locally.
- `@openzeppelin/miden-multisig-client` — the MultisigClient. Talks to a PSM
  (Private State Manager) endpoint to coordinate proposals and threshold
  signatures among cosigners. Note: the SDK's own config key for this endpoint
  is `guardianEndpoint` (NOT `psmEndpoint`) — see the endpoint block below.
  Source moved: it now lives in `github.com/OpenZeppelin/guardian` (the renamed
  PSM repo) at `packages/miden-multisig-client`. npm package name + v0.15.0 unchanged.
- (Optional, only if we need external ECDSA wallet support) `@getpara/react-sdk-lite`

## MidenClient API surface — verified against installed types, 2026-07-04

Confirmed by reading installed `@miden-sdk/miden-sdk@0.15.3` types AND by
actually creating real private wallets against live devnet (unique account ids,
persisted, advancing sync heights). Three corrections the SDK's own layout makes
easy to get wrong — do not relearn these the hard way:

1. **The authoritative type file is `dist/st/api-types.d.ts`** — not
   `dist/st/index.d.ts` (which does NOT even declare `MidenClient`; it only
   declares the `@internal` low-level `WebClient`) and not
   `dist/st/crates/miden_client_web.d.ts` (the raw wasm-bindgen `WebClient`).
   When checking whether a `MidenClient` method/field exists, read
   `api-types.d.ts`. If a method is only in the crates `.d.ts`, it is a
   low-level `WebClient` method and is probably NOT on the public client.

2. **The API is resource-namespaced.** `MidenClient` exposes resource objects:
   `.accounts`, `.transactions`, `.notes`, `.tags`, `.settings`, `.compile`,
   `.keystore`, `.pswap`. Account creation is
   **`client.accounts.create(opts?)` → `Promise<Account>`** (defaults to a
   wallet), where
   `opts = { storage?: "public" | "private", auth?: "falcon" | "ecdsa", seed? }`
   — **string** values. Example (Miden accounts are private by default; Falcon
   is the scheme Guardian ACKs use):
   ```ts
   const account = await client.accounts.create({ storage: "private", auth: "falcon" });
   const id = account.id().toString();
   ```

3. **Do NOT use `client.newWallet(AccountStorageMode.private(), AuthScheme.AuthRpoFalcon512)`.**
   That flat method is a low-level `WebClient` method from the crates `.d.ts`;
   it is NOT on the public `MidenClient` type (`tsc` rejects it) and the enum
   form is wrong for the resource API. Note `AuthScheme` is **overloaded**: a
   crates enum (`AuthRpoFalcon512 = 2`) vs. an api-types const
   (`AuthScheme.Falcon === "falcon"`). The resource API wants the string.

Node vs browser backend: the SDK has a working Node/napi entry
(`js/node-index.js`, native `.node` addon, SQLite-backed) that runs account
creation headlessly — useful to prove the API + devnet connectivity without a
browser. But it is a *different backend* than the browser-WASM client Veil
ships (IndexedDB, JS sign callbacks). Node proves the API works; it does NOT
prove the exact production browser path. Confirm the browser path separately.

## Private Multisig / PSM / Guardian — the foundation Veil is built on

Vocabulary, precisely:
- **PSM (Private State Management)** is the *protocol* — co-developed by Miden
  and OpenZeppelin — for coordinating private multisig accounts off-chain.
- **Guardian** is OpenZeppelin's specific product/implementation of PSM. When
  people say "Guardian," they mean "an instance of PSM."

Why PSM exists: on a fully private chain, account state lives client-side on
each signer's device. There's no shared public ledger to coordinate against.
PSM solves this with three layers working together during a signing cycle:
- **Synchronization** — keeps all signers on the latest account state.
- **Coordination** — circulates proposals, collects threshold signatures.
- **Authentication** — verifies each signer's action against account policy.

Trust model (important for security-first building): PSM is semi-trusted for
*availability and coordination only* — it never holds cosigner private keys,
and it cannot forge authorization. Authorization is enforced by actual cosigner
signatures and on-chain checks, so a malicious or down PSM can block or corrupt
local sync state but cannot move funds without real signatures. Treat any data
coming back from a PSM endpoint as unverified until checked client-side —
OpenZeppelin's own audit flagged missing client-side validation of PSM-provided
data as a real risk area, so our client code should not blindly trust PSM
responses.

**SECURITY — required check when wiring real signing (not optional hardening):**
Guardian is a *coordination cache, not a ledger* (its own CONCEPTS.md). A
substituted/malicious Guardian can ACK deltas with its *own* key if the client
doesn't pin the right one. The audit-flagged gap: **Guardian `/pubkey` responses
must be cross-checked against the expected/on-chain commitment — this is not
done for you by default and must be treated as required.** The repo's client
verification checklist (docs/CONCEPTS.md), which our real integration MUST satisfy:
  1. Pin Guardian's `/pubkey` (fetched once over a trusted channel); refuse any
     Guardian returning a different key.
  2. Verify the ACK signature on every accepted delta.
  3. Validate the commitment chain (`delta_n.new_commitment` ==
     `delta_{n+1}.prev_commitment`).
  4. Check freshness against Miden before signing high-value txns — match the
     latest canonical commitment against the account's *on-chain* commitment.
  5. Treat unexpected pubkey changes as a security event; halt until confirmed
     intentional rotation.
The repo *claims* the TS/Rust SDKs do 1–4 automatically and that #5 is
application-level (ours). **Do NOT take that claim on faith** — verify against
the actually-installed `@openzeppelin/miden-multisig-client` version that it
performs the `/pubkey`↔on-chain-commitment check, since the audit specifically
flagged this as historically missing. If it doesn't, we implement 1–4 ourselves.
We own #5 regardless.

The signing flow: propose → cosigners sign → threshold met → anyone can execute
on-chain → all signers sync.

## Reference architecture (from Miden's own official PoC — 0xMiden/MultiSig)

```
Frontend (Next.js + WASM)
├── MidenClient (@miden-sdk/miden-sdk)            ──► Miden RPC Node
├── MultisigClient (@openzeppelin/miden-multisig-client) ──► PSM Endpoint
└── (optional) Para Wallet (@getpara/react-sdk-lite)      ──► External wallets

Coordinator Server (Rust/Axum) [OPTIONAL — skip for MVP]
├── MultisigEngine ──► Miden RPC Node
└── MultisigStore  ──► PostgreSQL
```

For Veil's MVP, we do NOT need the optional Rust coordinator server — build
directly against MidenClient + MultisigClient talking to devnet endpoints. Add
the coordinator later only if we need a centralized audit trail.

Endpoints:
```
NEXT_PUBLIC_MIDEN_RPC_URL=https://rpc.devnet.miden.io   # devnet RPC — verified live
NEXT_PUBLIC_PSM_ENDPOINT=http://localhost:3000          # self-hosted Guardian (see below)
```
Keep the `NEXT_PUBLIC_PSM_ENDPOINT` env var name for continuity, but note that
the SDK's internal config key for this endpoint is `guardianEndpoint` (passed to
`new MultisigClient(midenClient, { guardianEndpoint, midenRpcEndpoint })`) — not
`psmEndpoint`. Map the env var onto `guardianEndpoint` when constructing the client.

### Self-hosting Guardian locally (verified working 2026-07-03)

The hosted staging endpoint `psm-stg.openzeppelin.com` was down for days, so we
self-host. **The repo has been RENAMED: `OpenZeppelin/private-state-manager` →
`github.com/OpenZeppelin/guardian`** (a Rust monorepo; the old URL 301-redirects).
The `@openzeppelin/miden-multisig-client` npm package (still v0.15.0, still valid)
now lives in that monorepo at `packages/miden-multisig-client`.

Self-hosting is well-documented and confirmed working — the repo's own QUICKSTART:
```bash
git clone https://github.com/OpenZeppelin/guardian.git && cd guardian
docker compose up --build -d        # filesystem backend, no Postgres / .env needed
# HTTP :3000, gRPC :50051
curl http://localhost:3000/          # -> 200 "Hello, World!"  (liveness)
curl http://localhost:3000/pubkey    # -> { "commitment": "0x..." }  (ACK key to pin)
```
Caveats learned doing this here (2026-07-03):
- It's a **full-source Rust release build** (~20 min cold for the server crate,
  workspace toolchain 1.93.0). Cold, not hard — the compile "just works", it's
  only slow. Docker layer cache makes re-runs cheap.
- If `docker compose` (the plugin) is missing, the plain **legacy builder works**
  (`DOCKER_BUILDKIT=0 docker build --target server-runner --build-arg
  GUARDIAN_SERVER_FEATURES= -t guardian-local .`) then `docker run -p 3000:3000
  -p 50051:50051` with the three `/var/guardian/{storage,metadata,keystore}`
  volumes + matching `GUARDIAN_*_PATH` envs (mirror `docker-compose.yml`).
  Downside: the legacy builder doesn't skip the unused benchmark stage, so it
  also compiles `guardian-prod-benchmarks` (another ~10 min) before the runtime
  image — annoying but harmless.
- Empty `GUARDIAN_SERVER_FEATURES` = filesystem backend (what compose uses).
  The Dockerfile ARG *defaults to `postgres`*, so if you build without overriding
  it you'll pull in the Postgres path — pass it empty for the simple local run.
- Startup auto-generates the ACK keypair; `/pubkey` returns its commitment (this
  is the value clients pin — see the security note below).
- The running container / cloned source do **not** survive this environment's
  scratch resets — if `curl localhost:3000/` stops answering, the Docker image
  (`guardian-local`) is likely still cached, so just `docker run` it again
  (re-clone + re-build only if the image is gone; the compile layer is cached so
  it's fast). This is a **dev/testing** instance only, not anything durable.

## Honest caveats — do not paper over these

- The public multisig.miden.xyz demo has been described by Miden itself as a
  "minimal, non-private version meant to demonstrate workflow and UX" while
  PSM/Guardian is under active development. The primitive is real and audited,
  but treat it as early-stage, not a mature managed service. Build defensively.
- Mainnet timing is inconsistently reported across sources (Miden's community
  FAQ says Q2 2026, Miden's own roadmap page says "early July 2026," an
  OpenZeppelin post says Q3 2026). Do not hardcode a launch date into product
  copy or countdown logic — check @0xMiden on X for the live date instead.
- Miden is on active, breaking-change territory. Toolchain version 0.15.0 as of
  this setup — re-verify SDK method signatures against actual installed
  `node_modules` types, don't assume method names from memory.

## Veil product mapping

Veil = private team treasury + payroll, built ON TOP of the Private Multisig
primitive, not a reimplementation of it. Concretely:
- The multisig account IS the treasury.
- A payout proposal = a transaction proposal in the PSM flow (recipient, amount,
  note type — private by default).
- Approvers = the multisig's cosigners.
- Execution once threshold is met = the payout note gets created and sent.
- Optional public receipt = a deliberately-public note or a hash commitment,
  for cases where proof-of-payment needs to be shareable without revealing amount.
- Our actual product surface (the part NOT already built by OpenZeppelin's PoC):
  contractor/employee roster, recurring payout scheduling, batch approval UX,
  a treasury dashboard, and receipt generation. We build this layer; we do not
  rebuild multisig coordination — that's OpenZeppelin's audited code.

## When unsure

If an API surface, method name, or CLI flag isn't confirmed in this file, say
so explicitly rather than inventing one. Prefer reading actual installed
package types (`node_modules/@miden-sdk/miden-sdk`, `node_modules/@openzeppelin/miden-multisig-client`)
over guessing from naming conventions.
