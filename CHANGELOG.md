# Changelog

## 0.3.1 (2026-10-03)
More features requested by community testers.
- **Per-deployment profiles.** One product can have several deployments (for example internal, SaaS and agent), each
  assessed separately. The register groups them under the product and shows its highest tier. "Add deployment" copies
  a use case as a new deployment. See ADR 011.
- **Import a filled register (.xlsx or .csv).** Teams that fill the register template in Excel can bring it into the
  app. Columns are matched by field name, answers can be option ids or their English or Arabic labels, unrecognised
  values are counted rather than guessed, and tiers are always recomputed. The register template gains `product` and
  `deployment` columns. See ADR 012.
- **Private-sector examples.** Six illustrative use cases load in one click: HR, Marketing, Sales, Finance, Supply
  chain and construction claims.
- **Level 4 explained.** Wherever the matrix's "not suitable yet" appears, the kit adds: "Not ready for autonomy yet.
  This is about readiness, not whether AI can help."
- **Updated answer notes for commercial tools**, from **Syed Hasan**'s revised notes, with thanks: when a solution has
  no AI at runtime, the rule for unapproved company decisions, personal-data minimisation as a real lever, and not
  softening the complexity answer.
- **Worked example: Causa Claims.** A founder assessed his construction-claims AI product in three deployment
  profiles; the example shows why personal-data minimisation was the lever and why the autonomous-notice agent was
  never shipped. Contributed and reviewed by **Syed Hasan**, founder of Causa Claims, with thanks. See
  `docs/worked-examples/causa-claims.md`.
- **Sector note: AI use and disclosure in arbitration.** What the Ciarb *Guideline on the Use of AI in Arbitration
  (2025)* means for AI tools that prepare claims and submissions, and what to record per matter. Paraphrased with
  article references only. Reviewed for accuracy by **Syed Hasan**. See `docs/sector-notes/arbitration-ai-disclosure.md`.

## 0.3.0 (2026-09-28)
Features requested by community testers of 0.2.x.
- **Control-evidence map.** Each applicable control now takes a status (Met, Partly met, Gap or N/A) and an evidence
  note, with a running tally. Evidence is saved per use case, kept in backups, and printed in the committee report and
  the XLSX and CSV exports. Registers saved by earlier versions still load. See ADR 008.
- **What would lower your tier.** The tier card shows the tier you would reach by closing operational gaps (hosting,
  cross-border data, bias and security testing, monitoring, incident handling, disclosure), with the points each fix
  saves. When the tier would not move, it explains that the cause is structural. The committee report shows the tier
  after operational fixes. Scoring is unchanged. See ADR 009.
- **Two new security controls**, split out of CTL-SEC-02: CTL-SEC-09 red-team and jailbreak testing, and CTL-SEC-10
  model supply chain security. Both are verified against NIST AI 100-1, the NIST-hosted ISO/IEC 42001 crosswalk and
  the EU AI Act. The totals are now 58 controls, 50 verified. See ADR 010.
- **Three new templates** in Arabic and English (XLSX, CSV, Markdown): a vendor AI risk assessment that extends
  CTL-ACC-06, an AI governance committee charter, and a RACI matrix.
- **Answer notes for commercial and B2B tools** under the relevant questions, adapted from answer-mapping notes by
  **Syed Hasan**, with thanks.

## 0.2.2 (2026-09-28)
Accuracy and clarity fixes from community testing of 0.2.1.
- **Corrected: autonomy levels now use the official numbering.** Earlier releases numbered recommended autonomy in
  reverse of the UAE AI-assistant priority matrix. The matrix, and now the kit, say level 1 is full autonomous
  execution, 2 supervised autonomy, 3 AI assistance and 4 not suitable yet. The cut-offs now follow the matrix grid:
  low usage or high complexity gives level 4, and otherwise readiness decides. If you noted a level from 0.2.1 or
  earlier, or built on the old numbering, please reassess. See ADR 006, which supersedes ADR 004.
- **Prioritisation answers no longer read as risk.** Low/Medium/High become descriptive labels (for example Ready,
  Partly ready, Not ready), and a note says these are not risk questions.
- **Clearer tier card.** It says the tier comes from the 8 quick-check questions and that skipping the optional
  sections never raises it. The deep-dive and prioritisation headers carry an Optional badge.
- **New scope question:** "Does the solution use AI when it runs?" If not, the kit shows that AI governance controls
  don't apply and gives general software quality and security pointers instead of a tier. See ADR 007.
- **New impact option for company-to-company decisions** (claims, contract positions, commercial or credit decisions
  on firms), with a rule that makes such decisions High when no person approves each one. Two new calibration cases
  are locked as tests. ADR 002 is amended.
- **Actionable level 4.** When a service is not suitable for AI yet, the card and the committee report list concrete
  steps: simplify the process, check the case for AI, improve data and systems, name an owner, then reassess.
- The register template gains a `runtime_ai` column; the guide, screenshots and PDFs are refreshed.

## 0.2.1 (2026-09-27)
UX fixes from feedback on 0.2.0.
- **English by default.** The site now always opens in English; the عربي toggle switches to Arabic and is remembered.
  See ADR 005.
- **The questionnaire is the obvious path.** Home shows three steps (add a use case, answer 8 questions, get your
  tier, controls and PDF) with one *Start your first assessment* button. Backup and restore move into a *Save or
  restore* menu, and import is now *Restore a saved register (.json)*. The Templates page is reframed as the offline
  option and says that no upload is needed.
- **User guide.** A new in-app Guide page in Arabic and English, with screenshots, that prints to A4. It is also
  available as `docs/USER-GUIDE.pdf` and `docs/USER-GUIDE-ar.pdf`.
- Fixed: on phones, the register table no longer makes the whole page scroll sideways.

## 0.2.0 (2026-09-27)
- New framework: **UAE Code for Government Services and Zero Bureaucracy**, adopted by the UAE Cabinet in April 2026.
  It is cited together with the federal agentic-AI service design guide, the Agentic AI National Reference (July 2026)
  and the Government Services Data Sharing Policy (May 2026).
- 13 new controls, mostly agentic:
  - governance review and an approved scope document for each agent;
  - classification against the national agentic definition;
  - specific approval for each action, and one-step revocation of permissions;
  - handover to a person with full context, and explicit consent before payment;
  - "ask once", authoritative data sources, and disclosure of the data an agent used;
  - an identity and authority check before each action;
  - KPIs and a continue/stop decision for each agent.
- 21 existing controls now cite the new UAE sources. The totals are 56 controls, 48 verified.
- New **recommended autonomy** feature: three prioritisation questions (usage, complexity, readiness), from the UAE
  AI-assistant priority matrix, recommend an autonomy level. A warning shows when the design exceeds it. See ADR 004.
- The agentic-AI help text now follows the national definition.
- Resolved: the April 2026 UAE Cabinet target to deploy agentic AI across 50% of government sectors and operations within
  two years is now cited.

## 0.1.0 (2026-09-27)
First public release.
- Browser-only AI use-case register with JSON/XLSX export and import.
- Two-level risk questionnaire (8 quick + 10 deep-dive questions), including four agentic-AI factors.
- Explainable hybrid tiering aligned to SDAIA's four risk levels, with named minimum-tier rules and six locked
  calibration fixtures.
- 43 controls across six themes, mapped to the UAE AI Charter, Dubai AI Ethics, SDAIA, ISO/IEC 42001 (clause numbers
  only), NIST AI RMF and the EU AI Act; 35 verified against official sources.
- Control exports (CSV, XLSX with RTL for Arabic) and a committee-ready A4 risk summary.
- Templates pack in Arabic and English (XLSX, CSV, Markdown).
- Full Arabic/English interface with right-to-left layout; self-hosted fonts; works offline once loaded.
