---
title: "EXPERIENCE: gcc-ai-governance-kit"
status: final
created: 2026-09-27
sources: ["../../prds/prd-gcc-ai-governance-kit-2026-09-27/prd.md", "./DESIGN.md"]
---

## Foundation
A responsive web app (desktop first, usable on a tablet), offline and with no login. It has no UI framework library, and
its visual identity is DESIGN.md.

## Information Architecture
1. **Home / Register:** a value line, framework chips `{components.checkbox-chip}`, the register table and a "New use
   case" button. The empty state offers "Load 2 sample use cases".
2. **Use-case stepper:** Details → Quick check (8) → Tier → Deep-dive (~10, optional) → Controls → Export.
3. **How scoring works:** weights, thresholds and triggers.
4. **Templates:** download AR/EN × XLSX/CSV/MD.
5. **About the data:** sources, verification status, ISO note, licences, disclaimer.

The header holds: the language toggle (عربي / English), the "How scoring works" link, the Templates link and the GitHub
link.

## Voice and Tone
Plain and direct: "Tell us what the AI does", "Who could be affected?". The Arabic is natural Modern Standard Arabic,
written as its own copy and not translated word for word. There is no jargon without an inline explainer (ⓘ).

## Component Patterns
- **Stepper:** progress is always visible, Back never loses answers, and the user can jump to completed steps.
- **Question card:** one question, radio options and an ⓘ explainer, with the points shown after answering (in
  "show scoring" mode).
- **Tier result:** a large tier badge, the top 3 reasons, a points breakdown in an accordion, and the triggers that
  fired, highlighted.
- **Controls list:** grouped by theme, with filters (framework, verified only), each row carrying references, sources
  and a badge.

## State Patterns
Empty register · answers in progress (autosaved) · quick tier shown · deep-dive pending (a prompt on High) · import
error · storage unavailable (a warning with export still available) · print preview.

## Interaction Primitives
Autosave on every change. Destructive actions (delete, clear all, replace on import) need confirmation. The language
switch keeps the current step.

## Accessibility Floor
WCAG 2.1 AA. The full flow works with the keyboard. Every step moves focus to its heading. Tier colour is never the only
signal. Language is set with `lang` and `dir` on `<html>`.

## Key Flows
**Mariam (UJ-1).** The site opens in Arabic. She ticks 3 frameworks, adds a use case and answers the quick check.
**Climax:** the tier card shows "مرتفع / High", with the reason "writes to a system of record" and the trigger visible.
She completes the deep-dive and exports the committee PDF in Arabic.

**Omar (UJ-2).** He opens the register with 5 use cases, filters to High, exports the register as XLSX and imports it
again on another laptop.

## Responsive & Platform
At 1024 px and above: a two-column stepper with a summary side panel. Below 1024 px: a single column. The print CSS
lays out the committee PDF on A4.
