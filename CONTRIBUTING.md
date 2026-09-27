# Contributing

Thank you for helping keep GCC AI governance practical and accurate.

## Most valuable contributions
1. **Mapping corrections.** If a control's reference is wrong or missing, open an issue with the official source URL
   and the exact clause, article or principle.
2. **Verification.** Confirm a `needs-verification` row against its official source. Send a PR that sets
   `verified: true` and `verified_on`, adds the source URL, and updates `docs/content-audit.md`.
3. **Arabic wording.** Better, natural Modern Standard Arabic is always welcome.

## Rules for content
- Public sources only. Never paste text from paid standards (for example ISO/IEC 42001): cite clause numbers and
  paraphrase.
- Keep controls practical: one to two sentences on what to do.
- Every change to `data/questions.json` weights or rules must keep the calibration fixtures passing
  (`src/core/scoring.test.ts`) and update `docs/decisions/002-risk-tier-scoring.md`.

## Development
```bash
npm ci
npm run dev
npm run check:data && npm run check:i18n && npm test && npm run e2e
```
Use Conventional Commits (`feat:`, `fix:`, `docs:`, ...). CI must be green.
