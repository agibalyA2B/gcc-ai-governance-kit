---
inputDocuments:
  - docs/planning-artifacts/prds/prd-gcc-ai-governance-kit-2026-09-27/prd.md
  - docs/planning-artifacts/prds/prd-gcc-ai-governance-kit-2026-09-27/addendum.md
  - docs/planning-artifacts/ux-designs/ux-gcc-ai-governance-kit-2026-09-27/DESIGN.md
  - docs/planning-artifacts/ux-designs/ux-gcc-ai-governance-kit-2026-09-27/EXPERIENCE.md
  - docs/planning-artifacts/briefs/brief-gcc-ai-governance-kit-2026-09-27/addendum.md
---

# gcc-ai-governance-kit: Epic Breakdown

## Overview
The v0.1 epics and stories, built from the PRD (FR-1 to FR-15 plus FR-8a), the technical addendum and the UX spines.
Each story carries a risk tag (HIGH = extra review and test depth). The timebox is about 17h.

## Requirements Inventory
### Functional Requirements
- FR-1 framework selection
- FR-2 use-case create/edit
- FR-3 register table
- FR-4 register import/export
- FR-5 local-only data
- FR-6 two-level questionnaire
- FR-7 explainable tier
- FR-8 hard triggers
- FR-8a calibration fixtures
- FR-9 control list
- FR-10 verification transparency
- FR-11 CSV/XLSX export
- FR-12 committee PDF
- FR-13 templates
- FR-14 AR/EN + RTL
- FR-15 sources & disclaimers

### NonFunctional Requirements
- NFR-1: WCAG 2.1 AA, keyboard-complete.
- NFR-2: no network calls that carry user data; works offline.
- NFR-3: deterministic scoring.
- NFR-4: CI blocks missing i18n keys and fixture regressions.
- NFR-5: the site stays deployable after every story.

### Additional Requirements
- Clean-room rule.
- ISO clause references only.
- Every crosswalk row has source_urls and a verified flag; at least 30 core rows are verified at launch.

### UX Design Requirements
- A register home plus a guided stepper.
- Seed tokens for now; the final design tokens (`design/export/tokens.json`) replace them.
- The tier is never shown by colour alone.

### FR Coverage Map
| Epic | FRs covered |
|---|---|
| E1 | NFR-5, FR-14 (skeleton) |
| E2 | FR-9, FR-10, FR-15 (data) |
| E3 | FR-6, FR-7, FR-8, FR-8a |
| E4 | FR-1, FR-2, FR-3, FR-4, FR-5 |
| E5 | FR-9, FR-10, FR-11, FR-12 |
| E6 | FR-13, FR-14, FR-15 |
| E7 | launch |

## Epic List
- E1 Walking skeleton
- E2 Crosswalk data
- E3 Scoring engine
- E4 Register & stepper
- E5 Controls & exports
- E6 Templates, i18n polish & trust pages
- E7 Design & launch

## Epic 1: Walking skeleton
Get a deployable, bilingual shell live on day 1.

### Story 1.1: Bilingual shell deployed to GitHub Pages `risk: HIGH`
As a visitor, I want the site live in EN and AR, so every later story ships to a real URL.
**Given** a fresh repo, **When** CI runs on push to main, **Then** Vite+TS builds, Vitest and a Playwright smoke test
pass, and GitHub Pages serves the site.
**And** the language follows the browser (ar* → AR with `dir=rtl`), the toggle is remembered, and a missing-i18n-key
check runs in CI.
**And** ADR 001 records the stack and "no backend".

## Epic 2: Crosswalk data
A trustworthy, source-linked control dataset.

### Story 2.1: Schemas and validation `risk: LOW`
**Given** `crosswalk.schema.json`, `usecase.schema.json` and `questions.schema.json`, **When** the data files change,
**Then** CI validates them, and the build fails on an invalid row.

### Story 2.2: Core control set, about 30 verified rows `risk: HIGH`
As an AI office lead, I want controls I can trust.
**Given** the six themes, **When** the controls are authored, **Then** there are about 30 core controls in AR/EN, each
mapped to the framework references with `source_urls`.
**And** ISO appears as clause/Annex-A numbers with our own paraphrase, and no ISO text is reproduced.
**And** a row is `verified: true` only after checking its source; otherwise it is `needs-verification` with a note.
**And** `docs/content-audit.md` summarises the verified %.

### Story 2.3: Extended rows (flagged) `risk: LOW`
**Given** the remaining mappings, **When** they are added, **Then** each is marked needs-verification, and the UI treats
them as such.

## Epic 3: Scoring engine
Explainable, deterministic risk tiers.

### Story 3.1: Questions data, quick check and deep-dive `risk: HIGH`
**Given** `questions.json`, **When** it loads, **Then** it has 8 quick questions (including autonomy, human-in-the-loop,
tool/system access and reversibility) and about 10 deep-dive questions, each with AR/EN text, an explainer, options
and weights.

### Story 3.2: Hybrid scoring and hard triggers `risk: HIGH`
**Given** the answers, **When** the tier is computed, **Then** tier = max(points tier, trigger tier) and the result is
deterministic.
**And** deep-dive answers can never lower the tier.
**And** the result includes the per-factor points and plain-language reasons.
**And** ADR 002 documents the weights and thresholds.

### Story 3.3: Calibration fixtures `risk: HIGH`
**Given** 6 reference cases (FAQ chatbot → Limited; internal summariser → Little/No; loan approval → High;
citizen-triage agent → High; autonomous benefits-decision agent → High via a trigger; citizen social scoring →
Unacceptable), **When** CI runs, **Then** any change to a fixture's tier fails the build.
**And** the expected tiers were confirmed by Ahmed on 27 Sep 2026.

## Epic 4: Register and stepper
Capture use cases and walk users to a tier.

### Story 4.1: Browser storage layer `risk: LOW`
**Given** IndexedDB, with a localStorage fallback, **When** use cases are saved, **Then** they persist across reloads.
**And** a storage-unavailable warning appears when needed.
**And** "Clear all data" requires confirmation.
**And** no network request carries the data.

### Story 4.2: Register home with framework chips `risk: LOW`
**Given** a register, **When** Home loads, **Then** the table shows each use case with its tier badge and deep-dive
status, sortable and filterable.
**And** the framework chips persist.
**And** the empty state offers "Load 2 sample use cases".

### Story 4.3: Stepper: details, quick check, tier, deep-dive `risk: LOW`
**Given** a new use case, **When** the user moves through the stepper, **Then** answers autosave, Back never loses data,
and the tier card shows the badge, the top reasons, the trigger and the points accordion.
**And** a High tier prompts the deep-dive.

### Story 4.4: Register import/export (JSON/XLSX) `risk: LOW`
**Given** an exported JSON, **When** it is imported, **Then** the schema is validated, merge or replace is confirmed,
and bad files are rejected with a clear message.

## Epic 5: Controls and exports
Turn the tier into actions people can carry.

### Story 5.1: Applicable controls view `risk: LOW`
**Given** the tier, the use-case attributes and the selected frameworks, **When** the controls step loads, **Then** the
controls are grouped by theme with reference chips, source links and verification badges.
**And** the verified-% note shows.
**And** there are filters for framework and verified-only.

### Story 5.2: CSV and XLSX export `risk: HIGH`
**Given** the controls list, **When** it is exported, **Then** the CSV has a UTF-8 BOM, and the XLSX opens in Excel
with Arabic rendered right-to-left.

### Story 5.3: Committee-ready PDF (print CSS) `risk: HIGH`
**Given** a tiered use case, **When** "Committee PDF" is chosen, **Then** an A4 1–2 page "AI Use-Case Risk Summary"
prints in AR and EN with the sign-off block and the disclaimer.

## Epic 6: Templates, i18n polish and trust pages
### Story 6.1: Templates pack `risk: LOW`
**Given** the shared schema, **When** a release is built, **Then** the register, impact assessment and control
checklist exist in AR and EN as XLSX/CSV/MD, and download from the app and the release assets.

### Story 6.2: How scoring works, and About the data `risk: LOW`
**Given** ADR 002 and the source list, **When** the pages render, **Then** they show the weights, thresholds and
triggers, the framework sources with the date checked, the ISO note, the NIST crosswalk credit and the licences.

### Story 6.3: Accessibility and RTL pass `risk: HIGH`
**Given** every screen, **When** it is audited, **Then** it meets WCAG 2.1 AA, the full flow works by keyboard, the RTL
mirroring is correct, and the tier is never shown by colour alone.

## Epic 7: Design and launch
### Story 7.1: Apply the final design tokens and screens `risk: LOW`
**Given** `design/export/`, **When** it is applied, **Then** one theme file drives the tokens, and all screens match the
design in EN and AR.
**And** design-review findings are fixed.

### Story 7.2: Launch kit `risk: LOW`
**Given** the live site, **When** it is released, **Then** the hiring-manager README, demo GIF, topics, CONTRIBUTING,
issue templates, CITATION.cff, CHANGELOG, social preview and tag v0.1.0 are all in place.
**And** the LinkedIn launch post draft is written.
