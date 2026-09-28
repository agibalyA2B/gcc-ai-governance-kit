# ADR 002: Hybrid, explainable risk-tier scoring

**Status:** accepted, 2026-09-27; amended 2026-09-28

**Context.** A tier must be defensible in a risk committee. Pure points under-rate one severe factor; decision trees are
rigid. Agentic AI adds factors (autonomy, oversight, system access, reversibility) that classic questionnaires
miss.

**Decision.**
- Each answer carries visible points (`data/questions.json`).
- Tiers follow the four SDAIA risk levels: Little/No < 20 ≤ Limited < 45 ≤ High.
- Hard triggers set a minimum tier: prohibited uses → Unacceptable; autonomous decisions about people or about other
  companies, decisions using sensitive data, or autonomous irreversible actions on the public → High.
- A company-to-company impact option (claims, contracts, commercial or credit decisions on firms) scores 20.
- Tier = max(points tier, highest trigger).
- Quick check: 8 questions. Deep-dive: 10, and it can only raise the tier.
- Eight owner-confirmed calibration fixtures (the two B2B cases on 28 Sep 2026) are locked as tests.

**Alternatives.** Points only; decision tree; weighted matrix per framework. All less explainable or less robust.

**Consequences.** Changing weights or triggers requires passing fixtures and an update here. The "How scoring
works" page renders the same data, so published logic and code cannot drift apart.
