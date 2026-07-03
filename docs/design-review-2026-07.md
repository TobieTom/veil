# Design Review: Veil (elevation-pass audit)

**Date**: 2026-07-02
**Scope**: Dashboard, Roster, Approvals, AppSidebar, AccountHeader
**Method**: ⚠️ **Static/code-based** review against the design-review, bencium, and apple-hig checklists — **no browser/screenshots available in this environment**, so this is not the skill's normal visual pass. Findings are derived from reading the components + tokens, not from seeing them rendered. Human visual confirmation still owed.

## Overall Impression
Genuinely restrained and coherent — the token discipline, the borderless hero, the derived-status Approvals cards, and the text-only status pills are already well above "a developer designed this." It reads as one system. The weakness is not slop; it's **flatness of hierarchy** and **identity underuse**: the chrome (header badges, sidebar mark) is generic where the content is considered, and "Veil" as a privacy concept is nowhere in the interaction language. Against the Mercury reference it's close on restraint but missing Mercury's *one* confident precise moment; against Bloomberg it has no earned dense moment at all.

## Findings

### High
_None._ Nothing looks broken or unprofessional. No invisible text, no mismatched control heights, no raw-colour leaks (all semantic tokens), contrast checked previously at AA+.

### Medium
- **AccountHeader badges are default shadcn chrome** (`account-header.tsx:16–27`) — the `devnet` pill is the *exact* "outline badge + leading coloured dot" pattern veil-anti-slop calls out as the AI-dashboard tell, and `2-of-3` is a generic secondary Badge with a shield glyph. On a treasury tool, the two most trust-bearing facts (which network real money is on; what signing threshold guards it) are rendered as the most generic component in the app. → Redesign as a purpose-built treasury status cluster, not `<Badge>`.
- **"Veil" identity is inert** (`app-sidebar.tsx:20`) — the name means *concealment*; the product is private-by-default multisig. Yet the only brand expression is a stock Lucide `ShieldCheck` beside the wordmark, and the shield says "security" generically, not "sealed / private / threshold." The privacy concept never appears in the interaction language. → Introduce one restrained motif tied to *sealed-until-threshold*.
- **Threshold is stated three different ways** across the shell — header `2-of-3` badge, Approvals page pill `2-of-3 threshold`, and per-proposal meters. No single canonical treatment. → At minimum make the header the authoritative, legible "signing policy" readout so the others read as instances of it.
- **No earned dense/precise moment** (Mercury+Bloomberg brief) — everything is uniformly medium-density. The account identity (id `0x8f3a…c21e`, network, threshold policy) is the natural place for one deliberately Bloomberg-precise cluster, and it's currently the blandest.

### Low
- **Sidebar active state is a flat fill** (`app-sidebar.tsx:37`) — `bg-sidebar-accent` with no left-edge marker. Fine, but the active item doesn't feel "anchored"; a 1px accent rule would add spatial hierarchy for near-zero cost (Apple HIG "Clarity": current location should be unambiguous).
- **Header lacks a bottom-anchoring hover on the account cluster** — the avatar+name+id group looks interactive-ish but has no hover/focus affordance and isn't actually a control. Either make it a real menu target later or leave it visually inert (currently ambiguous).
- **Nav link transition is `transition-colors` only** — fine and on-spec (no snap), but the icon doesn't shift; a 1px icon nudge or opacity step on hover would meet bencium's "immediate feedback" more fully. Optional.

## What Looks Good (preserve)
- Borderless balance hero with the quiet rule beneath — correct subversion of the "hero number in a card" cliché.
- Approvals: three genuinely distinct states (layout + action + accent, not colour-swap), discrete segmented signature meter, all-cosigners-visible row. This is the strongest design thinking in the app.
- Roster text-only status pills (no leading dot) and the single-ruled list (no Table-in-Card).
- Motion system: one shared easing `[0.16, 1, 0.3, 1]`, staggered reveal, reduced-motion handled at the right layer.
- Token discipline: zero raw Tailwind colours, `text-figure` for all numerics.

## Top 3 Fixes (this pass)
1. **AccountHeader → purpose-built treasury status cluster** (replaces both generic badges). This is the single highest-visual-impact change and directly answers task #1.
2. **Introduce the "seal" motif** — one coherent idea expressing sealed-until-threshold, applied to the header network/threshold readout and echoed (not re-invented) in the signing UI. Answers task #2.
3. **Interaction/spatial polish** — sidebar active-edge marker, header account-cluster hover affordance, consistent focus-visible. Answers task #3.

## Cross-skill conflicts I had to resolve (flagged, not silently picked)
- **apple-hig-expert's headline aesthetic is "Liquid Glass" (translucency/materials)** — this directly contradicts veil-anti-slop's glassmorphism ban and the user's explicit "avoid glassmorphic cards / glowing borders." **Rejected the Liquid Glass recommendation**; kept apple-hig's stack-neutral principles only (Clarity/Deference/Depth, 44pt targets, accessibility-first semantics, What+Why+How).
- **bencium says use `@phosphor-icons/react`, `index.css`, `tailwind.config.js`, and "ask before implementing."** Veil uses lucide, `globals.css`, Tailwind v4 `@theme`, and this is an approved elevation pass — so I took bencium's *principles* (material honesty, functional layering, obsessive detail, immediate feedback) and ignored its stack-specific defaults.
- **Both bencium and apple-hig encourage shadows/gradients for depth**; veil-anti-slop forbids ad-hoc shadows and there are **zero shadow tokens** in globals.css. Resolved in favour of veil-anti-slop: depth stays border/ring/surface-step based, no shadows introduced.
