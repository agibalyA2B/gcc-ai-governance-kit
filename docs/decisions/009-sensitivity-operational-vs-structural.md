# ADR 009: "What would lower your tier": operational versus structural answers

**Status:** accepted, 2026-09-28

**Context.** Testers asked what they could do about a High tier. One product was High only because of missing tests,
monitoring and in-country hosting; another stayed High whatever was fixed. Teams need to tell the two apart.

**Decision.**
- Seven deep-dive questions are *operational*, meaning fixable without redesign: third-party hosting, cross-border
  data, bias testing, security testing, monitoring, incident handling and disclosure. Each declares its fix in
  `data/questions.json` (`"fix"`). Hosting's fix is "in-country under our control", not "built in-house".
- The sensitivity view re-scores the use case with those answers fixed and shows the resulting tier and each change.
- Quick-check answers are structural and never changed, so the result cannot drop below the quick-check tier, and a
  rule that still fires keeps its tier and is named.
- The committee report shows the tier after operational fixes.

**Alternatives.** Rank every answer by points saved: rejected, because it would suggest changing what the AI does.

**Consequences.** Two sensitivity fixtures, confirmed by the owner on 28 Sep 2026, are locked as tests. Scoring is unchanged.
