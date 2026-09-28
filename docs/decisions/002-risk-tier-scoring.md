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
- Eight calibration fixtures are locked as tests.

**Alternatives.** Points only; decision tree; weighted matrix per framework. All were rejected as less explainable or
less robust.

**Consequences.** Changing weights or triggers requires the fixtures to pass and this ADR to be updated. The in-app "How
scoring works" page renders the same data, so the published logic and the code cannot drift apart.
