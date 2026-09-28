# ADR 007: Ask first whether the solution uses AI when it runs

**Status:** accepted, 2026-09-28

**Context.** A tester assessed a product that was built with AI coding tools but has no AI inside. The questionnaire
still forced a risk tier, and the answers felt misaligned. AI-governance controls target AI behaviour at runtime, not
the tools used to write code.

**Decision.**
- The quick check opens with one scope question: "Does the solution use AI when it runs?"
- If the answer is No, the kit shows no tier. It says AI-governance controls don't apply and gives general
  software-quality and security pointers (secure development, code review, data protection, an AI coding-tool policy),
  citing NIST SP 800-218.
- The question carries no points and never changes a tier. An unanswered question counts as in scope, so saved
  registers keep their results.
- The register shows "No AI at runtime" for such entries, and the register template gains a `runtime_ai` column.

**Alternatives.** A note on the Home page only: rejected, because users would still get a meaningless tier.

**Consequences.** Out-of-scope entries stay in the register for completeness but have no controls or report.
