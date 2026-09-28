# ADR 011: Per-deployment profiles as linked use cases

**Status:** accepted, 2026-09-28

**Context.** A tester assessed one product three ways: used internally, sold as SaaS, and as an agent that sends
notices. Each deployment had a different tier. The kit had no way to show that they belong together.

**Decision.**
- Each deployment stays a full use case, with its own answers, evidence and report. Two optional fields link them:
  `product` (a shared name) and `deployment` (a label such as Internal, SaaS or Agent).
- The register groups deployments under a product row that shows the number of deployments and the product's
  highest tier, taken from deployments whose quick check is complete. Grouping ignores case and spacing.
- "Add deployment" copies the details and answers into a new use case with a blank label and no evidence.
- Registers without the fields load unchanged, and the register format stays at version 1.

**Alternatives.** Nesting several answer sets inside one use case: rejected, because every step, export and report
would need a deployment selector, a large change for the same result.

**Consequences.** Product-level evidence is not shared; each deployment records its own.
