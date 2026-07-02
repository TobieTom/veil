---
name: veil-anti-slop
description: Use for every UI/design task in Veil. Explicit negative 
constraints against generic "AI slop" aesthetics — the model defaults 
to these patterns unless explicitly forbidden.
---

Never use, under any circumstances, in any Veil UI:
- Inter, Roboto, Arial, or any system-default font
- Purple-to-blue gradients
- Gradient text on numbers or headings
- Cards nested inside cards (more than one visual container layer per element)
- Blur effects without a specific functional purpose
- Inconsistent/ad-hoc shadows — use only the shadow tokens defined in 
  globals.css, nothing improvised per-component
- Uniform rounded corners applied everywhere by default
- Generic centered-hero layouts, icon-grid feature sections, testimonial 
  carousels, three-column footers (not relevant to a dashboard app, but 
  the same "reach for the template" instinct applies to any new page shape)
- Buttons/transitions that snap instead of easing
- The exact "big hero number + small label + accent dot on the left" 
  pattern without deliberately subverting it — this is the single most 
  common AI-dashboard cliché, watch for it specifically since Veil's 
  Dashboard sits close to it already
- Space Grotesk as a "safe" fallback choice — it's the next-most-common 
  pattern after Inter, treat it with the same suspicion, not as an 
  automatic safe pick

Always, for every new interactive element:
- Design the empty, loading, error, and disabled states intentionally 
  as part of the initial build, not bolted on after
- Use only the existing token system (--font-heading, --font-numeric, 
  --font-sans, spacing/radius tokens) — no ad-hoc values

Before presenting any UI, self-check: if someone said "AI made this," 
would they believe it immediately? If yes, revise before showing it.
