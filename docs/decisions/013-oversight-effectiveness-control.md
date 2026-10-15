# ADR 013: Add an oversight effectiveness control

**Status:** accepted, 2026-10-15

**Context.** Independent reviews of the v0.4 proposals agreed that the commonest failure of human oversight is a review
that happens but catches nothing: approval rates near 100%, seconds per approval, a person who copies the AI. CTL-HUM-01
defines who oversees, and CTL-HUM-03 trains reviewers and tracks override rates. Neither asks for evidence that the
review actually catches errors.

**Decision.** Add CTL-HUM-11, oversight effectiveness (all AI types, from Limited): known flawed cases in testing or
pilots, blind re-review of a sample of approved cases, approval reasons that cite evidence, volume caps per reviewer,
and approval-rate and review-time signals treated as triggers to investigate, never as pass/fail thresholds. Seeded
flawed cases stay in testing and pilots, not live decisions about people. References are the ones already checked for
CTL-HUM-01.

**Alternatives.** Extending CTL-HUM-03: rejected. It applies only from High and is about training; effectiveness is
separate evidence.

**Consequences.** 59 controls, all verified.
