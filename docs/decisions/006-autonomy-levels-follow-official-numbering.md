# ADR 006: Autonomy levels follow the official matrix numbering and grid

**Status:** accepted, 2026-09-28 (supersedes ADR 004)

**Context.** ADR 004 numbered the levels in reverse of the UAE AI-assistant priority matrix, and its
cut-offs loosely read the matrix text rather than its grid.

**Decision.** Use the matrix's numbering and grid:
- 1 = full autonomous execution, 2 = supervised autonomy, 3 = AI assistance, 4 = not suitable yet;
- low usage or high complexity → 4;
- otherwise high readiness → 1 only with high usage and low complexity, else 2; medium readiness → 2; low → 3.

A High tier or a regulated domain never allows level 1 (it becomes 2); Unacceptable gives 4. The design maps to the
same scale (suggests or approval 3, monitored 2, full 1); approving every output means the person decides, which is AI
assistance. The kit warns when the design is more autonomous (a lower number) than recommended.

**Alternatives.** Keep the old numbering with a note: rejected, because it contradicts the cited source.

**Consequences.** Some recommendations change; stored answers do not, so no migration. Combining the separate usage and
complexity columns by taking the stricter one is this kit's interpretation.
