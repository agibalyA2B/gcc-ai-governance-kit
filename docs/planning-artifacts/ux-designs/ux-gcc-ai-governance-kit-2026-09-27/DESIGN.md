---
title: "DESIGN: gcc-ai-governance-kit"
status: final
created: 2026-09-27
note: "Seed tokens. The final visual design supersedes these; exported tokens in /design/export/tokens.json replace these."
colors:
  primary: "#0F5257"        # deep teal
  primary-contrast: "#FFFFFF"
  accent: "#C8A96A"         # sand
  surface: "#FFFFFF"
  surface-muted: "#F6F3EC"  # warm sand tint
  text: "#1B2426"
  text-muted: "#5B6668"
  border: "#E3DED3"
  tier-little: "#2E7D5B"
  tier-limited: "#B7791F"
  tier-high: "#C2410C"
  tier-unacceptable: "#9F1239"
  verified: "#2E7D5B"
  needs-verification: "#B7791F"
typography:
  family-latin: "IBM Plex Sans"
  family-arabic: "IBM Plex Sans Arabic"
  scale: { xs: 12, sm: 14, base: 16, lg: 18, xl: 22, 2xl: 28, 3xl: 36 }
  line-height-arabic: 1.7
rounded: { sm: 6, md: 10, lg: 16 }
spacing: { unit: 4, scale: [4, 8, 12, 16, 24, 32, 48, 64] }
components: [button, checkbox-chip, stepper, tier-badge, verification-badge, data-table, card, drawer, toast, empty-state]
---

## Brand & Style
The look is calm, authoritative, government-grade and modern. There is generous white space. The accent is a deep teal
with a sand tint, and a subtle Arabic geometric motif appears only in hero and empty states, never behind data. It has
its own identity: no government emblems, colours or design-system look-alikes, so there is no implied endorsement.

## Colors
Teal is for primary actions and headers, and sand is for highlights and muted surfaces. The tier colours are semantic
and are always paired with a text label, never colour alone. Every text pair meets WCAG AA contrast.

## Typography
IBM Plex Sans and IBM Plex Sans Arabic are self-hosted. Arabic gets more line height (1.7). Numbers use Western digits
in both languages [can be changed to Arabic-Indic in AR later].

## Layout & Spacing
A 4-point grid. The content width is 1120 px maximum; the stepper content is 720 px maximum. The layout mirrors fully in
RTL, with logical properties only (margin-inline, etc.).

## Components
- **Tier badge:** colour + icon + label, e.g. "High / مرتفع".
- **Verification badge:** "Verified" (with a tick) or "Needs verification" (with a clock icon).
- **Framework chips:** toggleable checkbox chips.

## Do's and Don'ts
- Do: show sources and reasons next to every conclusion.
- Don't: use red and green without labels; use decorative motifs inside tables; use any government logo.
