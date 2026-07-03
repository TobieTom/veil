@AGENTS.md

# Veil — Project Memory

## What this is
Veil: a private team treasury + payroll app built on Miden's
OpenZeppelin Private Multisig (Guardian/PSM). Built for a Miden
Pioneer grant application and genuine public shipping — not a demo.

## Design standard (non-negotiable)
Read .claude/skills/veil-anti-slop/ before any UI work, every time,
without being told. Reference direction: Mercury Bank's restraint
(soft off-black, heavy whitespace, quiet confident numbers) as the
default mode, with occasional Bloomberg-Terminal-style density where
precision earns its place. Never glassmorphism, glow, or gradient
accents — that's the current default in crypto dashboard design and
is exactly the convergence we're avoiding.

## Engineering discipline
- Verify against real installed types/CLI help output before assuming
  an API or flag — never guess from naming conventions or training data.
- Build foundation before content, verify each step before the next.
- Security-conscious by default — treat third-party responses (like
  PSM/Guardian data) as unverified until checked client-side.
- When two instructions conflict, or a real limitation is found (e.g.
  a skill file is stale, an endpoint is down), flag it explicitly and
  ask rather than silently picking one.
- Report what you had to override a default to follow, not just that
  something "works."

## Stack
Next.js (TypeScript, App Router, Tailwind), @miden-sdk/miden-sdk
(MidenClient), @openzeppelin/miden-multisig-client (MultisigClient).
Full Miden-specific ground truth lives in .claude/skills/build-on-miden/.

## Verification
Before reporting a task done: tsc --noEmit, eslint, all routes return
200. Browser visual confirmation happens separately, by the human,
after each build — always say plainly if that hasn't happened yet.
