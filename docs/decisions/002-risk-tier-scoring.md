# ADR 002: Hybrid, explainable risk-tier scoring

**Status:** accepted, 2026-09-27

**Context.** A tier must be defensible in a risk committee. Pure points can under-rate one severe factor; pure decision
trees are rigid. Agentic AI adds factors (autonomy, oversight, system access, reversibility) that classic questionnaires
miss.

**Decision.**
- Each answer carries visible points (`data/questions.json`).
- Tiers follow the four SDAIA risk levels: Little/No < 20 ≤ Limited < 45 ≤ High.
- Hard triggers set a minimum tier: prohibited uses → Unacceptable; autonomous decisions about people, decisions using
  sensitive data, or autonomous irreversible actions on the public → High.
- Tier = max(points tier, highest trigger).
- The Quick check has 8 questions. The Deep-dive has 10 and can only raise the tier.
- Six calibration fixtures, confirmed by the product owner, are locked as tests.

**Alternatives.** Points only; decision tree; weighted matrix per framework. All were rejected as either less explainable
or less robust.

**Consequences.** Changing weights or triggers requires the fixtures to pass and this ADR to be updated. The in-app "How
scoring works" page renders the same data, so the published logic and the code cannot drift apart.
