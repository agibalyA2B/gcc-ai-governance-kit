# ADR 010: Split AI security testing out of CTL-SEC-02

**Status:** accepted, 2026-09-28

**Context.** A tester asked for explicit red-team and jailbreak testing and for model supply-chain risk. CTL-SEC-02
("AI-specific security assessment") names prompt injection and data poisoning as threats to assess, but it does not
require anyone to attack the system, and it says nothing about where models, datasets and AI libraries come from.

**Decision.** Split rather than extend:
- CTL-SEC-02 stays the threat assessment, with unchanged text and references;
- CTL-SEC-09, red-team and jailbreak testing (generative and agentic AI, from Limited): testers who did not build the
  system, including indirect prompt injection through content it reads, before launch and after major changes;
- CTL-SEC-10, model supply chain security (all AI types, from Limited): an inventory with source, version and
  licence, trusted sources, integrity checks, pinned versions and vulnerability tracking.
Every reference was checked against NIST AI 100-1, the NIST-hosted ISO crosswalk and the Official Journal text.

**Alternatives.** Extending CTL-SEC-02: rejected. One control would carry three distinct pieces of evidence, which
weakens the evidence map.

**Consequences.** 58 controls, 50 verified. CTL-SEC-10 complements CTL-ACC-06 (supplier due diligence).
