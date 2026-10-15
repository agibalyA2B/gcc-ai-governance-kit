# ADR 015: A rule-based agent brief with two outputs

**Status:** accepted, 2026-10-15

**Context.** Builders and buyers got nothing to work from. Reviewers asked for a delegation contract, not a prompt.

**Decision.**
- A step after Controls builds a six-block brief, rule-based: intent and outcome (with when to stop and escalate),
  context, constraints (where payloads are processed; entity versus vendor duties), authority (the action matrix,
  ADR 014, plus "role for accountability, task for privilege"; no sub-agent exceeds its caller),
  evidence, done.
- Evidence is four records (manifest, authorisation, each consequential action, outcome), adapted from Hasbini and
  Seow (2026, CC BY 4.0). Each points to existing controls and their evidence status: no second register.
- Done follows the level: sample audit (1), stop and approve (2), a person decides every output (3). Level 4 gets a
  readiness note; Unacceptable, nothing.
- Two Markdown outputs to copy or download: a committee annex (with sign-off) and an engineering handover.
- Selective warnings, only where triggered: risk, platform requirement, manual fallback, evidence, owner. Approval
  rates are triggers to investigate, never pass marks.
- A visible notice says the brief is not an enforcement mechanism.

**Alternatives.** An agent-instruction draft: deferred (it reads as a security boundary).

**Consequences.** One extra screen; every string is in English and Arabic.
