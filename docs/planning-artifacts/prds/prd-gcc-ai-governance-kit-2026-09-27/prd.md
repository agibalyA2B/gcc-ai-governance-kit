---
title: "PRD: gcc-ai-governance-kit"
status: final
created: 2026-09-27
updated: 2026-09-27
---

# PRD: gcc-ai-governance-kit

## 0. Document Purpose
This document defines the v0.1 capabilities of an open, bilingual (AR/EN) AI-governance starter kit for GCC
organisations. It is the source for epics and stories. Technology choices live in `addendum.md`.
Input: `docs/planning-artifacts/briefs/brief-gcc-ai-governance-kit-2026-09-27/` (brief and landscape addendum).

## 1. Vision
Give a GCC AI office lead a way to register an AI use case, understand its risk and export the controls that apply under
the frameworks they must follow, in one afternoon, in Arabic or English, for free, without their data leaving the browser.

## 2. Target User
**Primary:** the government AI office lead in a UAE/GCC entity. **Secondary:** a bank's model-risk or CX-AI owner; a
consultant; any GCC organisation starting an AI register.

### 2.1 Jobs To Be Done
- When a new AI use case is proposed, I want to classify its risk quickly and defensibly, so the committee can decide.
- When agentic AI is proposed, I want to see what autonomy and oversight imply for its risk, so we don't under-govern it.
- When asked "which frameworks apply?", I want one control list filtered to my frameworks, with sources, so I don't
  build a crosswalk by hand.
- When starting from zero, I want copyable templates in Arabic and English, so my team adopts a common format.

### 2.2 Non-Users (v0.1)
Model developers who want technical testing (bias metrics, red-teaming) are not served here. Neither are auditors who
need a certification-grade ISO 42001 gap assessment.

### 2.3 Key User Journeys
**UJ-1: Mariam tiers an agentic use case.** Mariam heads the AI office of a federal entity. Her operations team proposes
an agent that triages citizen service requests and routes them automatically.
1. She opens the site; it loads in Arabic because her browser is Arabic.
2. She ticks the UAE Charter, Dubai AI Ethics and ISO/IEC 42001, and adds a use case: name, owner, purpose, data types,
   affected people.
3. She answers the questionnaire, including the agentic questions: it acts on its own for routing, a human reviews
   refusals, it can write to the case system, and its actions are reversible.
4. She sees **High** with the reasons listed ("acts on citizen requests", "writes to a system of record"), and the
   weights are visible.
5. She reviews 14 applicable controls, each with its framework reference, source link and verification status.
6. She exports the committee-ready PDF in Arabic and the control list as XLSX for the project team.

**UJ-2: Omar builds a register.** Omar is a bank model-risk lead. He adds five use cases over a week, and the register
table shows each one's tier and status. He exports the full register to XLSX for the risk committee and imports it again
on another laptop.

**UJ-3: A consultant takes the templates.** From the README, a consultant downloads the register, impact-assessment and
control-checklist templates (AR/EN, XLSX/CSV/MD) and adapts them for a client, without using the app.

## 3. Glossary
- **Use case:** one AI system or application being assessed.
- **Register:** the collection of use cases saved in the user's browser.
- **Framework:** one of the six selectable sources: UAE AI Charter · Dubai AI Ethics · SDAIA AI Ethics Principles ·
  ISO/IEC 42001 · NIST AI RMF · EU AI Act.
- **Control:** a governance action (e.g. "assign an accountable owner"), mapped to one or more framework references.
- **Crosswalk:** the dataset that links each control to framework references, with sources and verification status.
- **Tier:** the risk class, aligned to SDAIA's four tiers: Little/No · Limited · High · Unacceptable.
- **Hard trigger:** an answer that sets a minimum tier regardless of the points score.
- **Verified:** a crosswalk row whose mapping was checked against the cited official source.

## 4. Features

### 4.1 Framework selection
**Description:** The user chooses which frameworks apply. Every later view and export respects the selection. The
default is all six frameworks selected.

#### FR-1: Select frameworks
The user can tick any subset of the six frameworks. The selection persists in the browser. Realizes UJ-1.
**Consequences (testable):**
- With zero frameworks ticked, the controls view shows a prompt to select at least one.
- Changing the selection updates the control list immediately, without a reload.

### 4.2 Use-case register
**Description:** The user creates, edits, duplicates and deletes use cases, saved in the browser. A table lists them with
their tier, owner and last-updated date. Realizes UJ-1 and UJ-2.

#### FR-2: Create and edit a use case
The user can record the name, owner, business unit, purpose, AI type (predictive / generative / agentic), data types
(including personal and sensitive), affected groups, deployment status and notes.
**Consequences:** name and owner are required, and validation messages appear in the active language.

#### FR-3: Register table
The user can view all use cases in a table, sortable by tier and date and filterable by tier.
**Consequences:** the table reflects edits without a reload, and an empty register shows a "start here" state with
2 sample use cases that can be loaded.

#### FR-4: Import and export the register
The user can export the whole register as JSON and XLSX, and import a JSON file.
**Consequences:**
- An import with the wrong schema is rejected with a clear message.
- Import never silently overwrites: the user is asked whether to merge or replace.

#### FR-5: Local-only data
All data stays in the browser.
**Consequences:**
- No network request carries any use-case data.
- A "clear all data" action exists, with a confirmation step.

### 4.3 Risk questionnaire and tier
**Description:** A two-level questionnaire. The **Quick check** has 8 questions (purpose and impact, data
sensitivity, affected groups, and the four agentic factors: autonomy level, human-in-the-loop, tool and system access,
reversibility) and gives a first tier in about 2 minutes. The **Deep-dive** has about 10 more questions (e.g. scale,
vulnerable groups, explainability needs, third-party models, monitoring). It is offered for every use case and strongly
prompted when the quick tier is High. Deep-dive answers can raise the tier and add controls. Scoring is hybrid:
weighted points plus hard triggers. Realizes UJ-1.

#### FR-6: Answer the questionnaire (two levels)
The user can complete the Quick check to get a first tier, then optionally the Deep-dive. Answers are saved with the use
case.
**Consequences:**
- A quick tier appears once all 8 quick questions are answered.
- High quick tiers show a "Complete the deep-dive" prompt.
- Deep-dive completion is shown as a status in the register.
- A tier never drops as a result of deep-dive answers; they can only raise it or add controls.

#### FR-7: Explainable tier
The system computes the tier and shows the points per factor, the thresholds, and any hard trigger that fired.
**Consequences:**
- The same answers always give the same tier (deterministic).
- Every tier displays at least one plain-language reason.
- The weights and triggers are published in the repo docs and in an in-app "How scoring works" panel.

#### FR-8: Hard triggers
Defined answers set a minimum tier: prohibited-use indicators → Unacceptable; fully autonomous plus irreversible actions
affecting individuals → at least High.
**Consequences:** covered by unit tests with fixture cases for each trigger.

#### FR-8a: Calibration fixtures
Six realistic reference use cases are locked as tests, each with an expected tier that Ahmed confirms before launch:
FAQ chatbot → Limited; internal document summariser → Little/No or Limited; loan-approval model → High; citizen-triage
agent writing to a system of record → High; fully autonomous benefits-decision agent → High, with a trigger; social
scoring of citizens → Unacceptable.
**Consequences:** CI fails if any fixture's tier changes; weight changes require updating ADR 002.

### 4.4 Applicable controls
**Description:** Based on the tier, the use-case attributes and the selected frameworks, the system lists the controls
that apply, with their framework references. Realizes UJ-1.

#### FR-9: Control list
The user can view the applicable controls, grouped by theme (accountability, transparency, data, human oversight,
safety and security, monitoring).
**Consequences:** each control shows the framework references (ISO clause numbers only), the source links and a
Verified / Needs-verification badge.

#### FR-10: Verification transparency
The system shows the share of verified controls in the current list, and a global coverage note.
**Consequences:** any row with verified = false is always labelled; there is no silent mixing.

### 4.5 Exports
**Description:** Outputs that people can carry into their organisation. Realizes UJ-1 and UJ-2.

#### FR-11: Control list export
The user can export the applicable controls as CSV and XLSX in the active language.
**Consequences:** Arabic text renders correctly when the XLSX is opened in Excel (right-to-left sheet, UTF-8).

#### FR-12: Committee-ready PDF
The user can produce a 1–2 page "AI Use-Case Risk Summary". It contains the use-case details, the tier with its reasons,
the selected frameworks, a control checklist with sources, the verification note and a sign-off block (prepared by /
reviewed by / decision / date).
**Consequences:** it prints cleanly to A4 in AR (RTL) and EN, and a disclaimer states it is guidance, not legal advice.

### 4.6 Templates pack
**Description:** Standalone files for people who never open the app. Realizes UJ-3.

#### FR-13: Downloadable templates
The repo and the app provide the use-case register, impact assessment and control checklist in AR and EN, as XLSX,
CSV and Markdown.
**Consequences:** the templates share field names with the app's JSON schema, so data moves between them.

### 4.7 Bilingual and accessible
#### FR-14: AR/EN with RTL
All UI text, questions, controls, exports and templates exist in both languages. On first load the language follows the
browser (ar* → AR/RTL, otherwise EN), and the toggle choice is remembered.
**Consequences:** no untranslated keys ship (a CI check fails on missing keys), and the layout mirrors correctly in RTL.

**Feature-specific NFRs:** WCAG 2.1 AA; the whole flow is usable with the keyboard alone.

### 4.8 Trust and provenance
#### FR-15: Sources and disclaimers
An "About the data" page lists each framework, its official source link, the date checked, the ISO copyright note (clause
references only), the credit for the NIST-hosted crosswalk as a reference, and the licences (MIT for code, CC BY 4.0 for
content).

## 5. Non-Goals (Explicit)
- It is not a GRC platform: no accounts, workflow approvals or multi-user collaboration.
- It is not a certification tool: it does not replace an ISO 42001 audit or legal advice.
- It does no model testing (bias metrics, evaluations, red-teaming).
- It has no LLM features and makes no calls to external AI services.
- It contains no content from any former employer of the author.

## 6. MVP Scope
### 6.1 In Scope
FR-1 to FR-15; ≥30 core controls fully verified; a GitHub Pages deploy; a hiring-manager README with a demo GIF.

### 6.2 Out of Scope for MVP
- Full verification of every crosswalk row. It is deferred to v0.2 and the rows ship flagged.
- Sector packs (CBUAE, QCB, telco), deferred to v0.2.
- Additional GCC frameworks (Qatar, Bahrain, DIFC Reg. 10 as a separate framework), deferred to v0.2 as candidates.
- A shareable link that encodes a use case, deferred.

## 7. Success Metrics
**Primary**
- **SM-1:** qualified professional conversations about the kit (GCC organisations, practitioners, hiring managers),
  ≥5 within 30 days of launch. Validates real-world relevance.

**Secondary**
- **SM-2:** GitHub stars ≥50 and forks ≥10 within 60 days.
- **SM-3:** the verified share of core controls at launch, ≥30 rows verified. Validates FR-10.
- **SM-4:** template downloads, counted via GitHub release asset downloads.

**Counter-metrics (do not optimise)**
- **SM-C1:** the number of frameworks or controls added. Breadth without verification undermines trust
  (counterbalances SM-2).
- **SM-C2:** feature count. Beyond FR-1 to FR-15 it threatens the 15h timebox and SM-1 timing.

## 8. Open Questions
1. The official URL and wording of the UAE AI Charter must be confirmed manually (site blocked automated access).
2. The UAE federal target for agentic AI in government services: find an official source before any mention.
3. RESOLVED: the weights are calibrated against 6 fixture cases that Ahmed confirms (FR-8a).

## 9. Assumptions Index
- §4.3: two levels (8 quick + about 10 deep-dive questions); Ahmed chose this over a single 12–15 question set; it adds about 2h (timebox now about 17h).
- §4.2: localStorage/IndexedDB capacity is enough for about 200 use cases.
