# ADR 018: Control dependencies for a fix-in-this-order list

**Status:** accepted, 2026-11-09

**Context.** A committee that sees 20 controls at Gap needs to know where to start. Some controls only make sense once
another is in place: re-tiering needs a register with tiers in it, and an agent audit trail builds on event logging.

**Decision.**
- Controls get an optional `depends_on` list of other control IDs. It orders the work; it never changes which
  controls apply, the tier or the autonomy level.
- A link is added only when the dependent control's own wording presupposes the other control, or a cited source
  puts them in that order. Each link and its basis is listed in the content audit. Judgement calls stay out of the
  data until a second reader confirms them.
- `check:data` and a unit test reject unknown IDs, self-links and cycles.

**Alternatives.** A priority number per control: rejected, because it would invent an urgency the sources do not give.
Free-text "do first" notes: rejected, because they cannot be sorted or checked.

**Consequences.** The fix-order list (next change) can sort controls at Gap or Partly so that prerequisites come
first. Links to a control that does not apply to the use case are ignored.
