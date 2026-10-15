# ADR 016: One release stage per deployment, with a warning banner

**Status:** accepted, 2026-10-15

**Context.** The recommended level is a ceiling, not permission to run at it today. The release-ladder guide explains
how a deployment earns autonomy in stages. Reviewers split between a full per-action tracker and a guide only.

**Decision.**
- Each deployment gets one optional release-stage field: Pre-pilot, Replay, Shadow, Assisted, Bounded autonomy or
  Controlled expansion. Stages are named, never numbered, so they cannot be read as autonomy levels.
- The date is recorded when the stage changes, and both are kept in the backup, the register XLSX and the brief.
- A banner shows on every assessment step when the stage is Bounded or Expansion while any applicable stop-switch
  (CTL-HUM-06, CTL-SEC-06), logging (CTL-MON-02, CTL-MON-03) or oversight (CTL-HUM-01, CTL-HUM-11) control is marked
  Gap. It warns; it does not block.
- The guide joins the repository, and a one-page release-contract template joins the templates pack (EN and AR).

**Alternatives.** A per-action stage tracker with history: deferred to v0.5 with assessment history.

**Consequences.** Unset or unanswered evidence never triggers the banner; only an explicit Gap does.
