# ADR 014: An action matrix per use case

**Status:** accepted, 2026-10-15

**Context.** "Autonomous" is too broad to approve. The recommended level (ADR 004) says how far a use case may go,
not what the AI may do. An agent brief needs that per action.

**Decision.**
- Six actions, as in the release-ladder guide: classify or route, recommend, draft, update an internal record,
  communicate with the customer or citizen, decide or trigger an irreversible action. Each is Allowed, Needs approval
  or Blocked.
- A ceiling per action comes from the recommended level, then tier floors: High needs approval to decide or
  communicate; deciding needs approval when hard to reverse or regulated; Unacceptable blocks all. Without the
  prioritisation answers, level 3 applies, marked provisional.
- Users may tighten a row, never loosen it: a looser choice is refused with a warning; a looser imported value is
  ignored and flagged.
- Optional per row: limits, reversible, approver role. Saved in the use case, the backup (now with `kitVersion` and
  `exportedAt`) and the XLSX exports.
- One use case, one matrix, even when several agents share the work.

**Alternatives.** One matrix per sub-agent: deferred.

**Consequences.** Register format stays at version 1; older files load unchanged.
