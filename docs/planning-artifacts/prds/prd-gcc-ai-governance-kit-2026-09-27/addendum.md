# PRD addendum: technical approach (the architecture for this <20h project)

## Stack
- Vite + TypeScript, no framework, or a light one (Preact/Lit) chosen in story 001 via an ADR.
- Static build, deployed to GitHub Pages by GitHub Actions. No backend, no API keys.
- Storage: IndexedDB through a tiny wrapper, with a localStorage fallback. The schema is versioned for migrations.
- i18n: JSON message catalogues `src/i18n/{en,ar}.json`. The `dir` attribute is toggled on `<html>`. A CI script fails
  when keys are missing.
- Exports: native CSV (with a UTF-8 BOM); XLSX via SheetJS (sheet RTL flag set for AR); PDF via print CSS
  (`@page` A4) plus `window.print()`. This avoids PDF font-embedding problems with Arabic.
- Tests: Vitest for scoring, triggers, schema and i18n completeness; a Playwright smoke run of the full flow in EN and AR.
- Fonts: IBM Plex Sans Arabic / Noto Kufi Arabic, self-hosted so the site works offline.

## Data model
`/data/crosswalk.json`, validated by `/data/schema/crosswalk.schema.json`:
```json
{ "id": "CTL-ACC-01", "theme": "accountability",
  "title_en": "", "title_ar": "", "control_text_en": "", "control_text_ar": "",
  "applies_when": { "min_tier": "limited", "ai_types": ["agentic"], "data": ["personal"] },
  "refs": { "uae_charter": [], "dubai_ethics": [], "sdaia": [], "iso42001": ["A.x.y"], "nist_ai_rmf": ["GOVERN 1.x"], "eu_ai_act": [] },
  "source_urls": [], "verified": false, "verified_on": null, "notes": "" }
```
`/data/questions.json` holds the questions, answer options, weights and hard triggers.
`/data/usecase.schema.json` is shared by the app and the templates (FR-13).

## Scoring
- Points: the sum of the answer weights gives a score.
- Thresholds: Little/No < 20 ≤ Limited < 45 ≤ High. Unacceptable only via a trigger.
- Hard triggers: rules of the form `{when: [questionId=value...], min_tier}`.
- Tier = max(points tier, highest trigger tier).
- Pure function, fully unit-tested.
- The starting weights are placeholders that get tuned in the questionnaire story (ADR 002).

## Sources used for the crosswalk
See the brief addendum. The NIST-hosted AI RMF ↔ ISO/IEC 42001 crosswalk (Microsoft-authored, based on the FDIS) is a
reference only; every mapping is re-checked.

## Repo layout
```
/data  /src/{core,ui,i18n,export}  /templates/{en,ar}  /docs/{decisions,planning-artifacts}  /design/export  /e2e
```
