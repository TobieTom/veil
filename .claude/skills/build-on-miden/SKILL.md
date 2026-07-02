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
- (Optional, only if we need external ECDSA wallet support) `@getpara/react-sdk-lite`

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

Known working devnet/staging endpoints (verify these are still live before use —
devnet endpoints rotate):
```
NEXT_PUBLIC_PSM_ENDPOINT=https://psm-stg.openzeppelin.com
NEXT_PUBLIC_MIDEN_RPC_URL=https://rpc.devnet.miden.io
```
Keep the `NEXT_PUBLIC_PSM_ENDPOINT` env var name for continuity, but note that
the SDK's internal config key for this endpoint is `guardianEndpoint` (passed to
`new MultisigClient(midenClient, { guardianEndpoint, midenRpcEndpoint })`) — not
`psmEndpoint`. Map the env var onto `guardianEndpoint` when constructing the client.

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
