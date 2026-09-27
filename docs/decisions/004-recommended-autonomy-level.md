# ADR 004: Recommended autonomy level from the UAE AI-assistant priority matrix

**Status:** accepted, 2026-09-27

**Context.** Risk tiering asks how dangerous a use case is. Agentic adoption also asks a second question: how much should
the AI be allowed to do on its own? The UAE government's AI-assistant priority matrix answers it from three factors
(usage intensity, complexity, readiness) and four levels:
- 4: full autonomous execution;
- 3: supervised autonomy;
- 2: AI assistance, where a person decides;
- 1: not suitable yet.

**Decision.** Add three unscored *prioritisation* questions and a pure function `recommendAutonomy`:
- low readiness → 1;
- high complexity → 2 when readiness is high, otherwise 1;
- medium complexity → 3;
- low complexity → 4 only when usage and readiness are both high, otherwise 3.

A High risk tier or a regulated domain caps level 4 at 3, and an Unacceptable tier gives 1. The actual autonomy answer
maps to a level (suggests 2, approval or monitored 3, full 4). The kit warns when the design exceeds the recommendation.

**Alternatives.**
- Folding the three factors into risk points: rejected, because it mixes "how risky" with "how ready".
- A 27-cell lookup table: rejected, because it is harder to explain.

**Consequences.**
- The cut-offs are this kit's interpretation of the matrix descriptions, not an official mapping.
- They are covered by unit tests, and changes must update this ADR.
