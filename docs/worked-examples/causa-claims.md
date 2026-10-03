# Worked example: Causa Claims

[Causa Claims](https://www.causaclaims.com/) is a construction-claims AI: it prepares claim packs for GCC projects, with
a verifiable citation behind every assertion. It was one of five winners of the OpenAI x Outskill hackathon. Its founder,
**Syed Hasan**, ran the product through this kit, built his own control-evidence map on top of it, and agreed to
publish this example. It describes the version he tested, which is newer than the MVP on the public site. It contains
no client or project details.

## Three deployment profiles, one tier
He assessed the same product three ways, which is why the kit now supports per-deployment profiles. Claim packs are
positions against other companies, so every profile answers *High-stakes decisions or positions about other
companies* on the impact question.

| Profile | Quick check | After deep-dive | What drives it |
|---|---|---|---|
| A. Internal consulting tool, every draft reviewed by a consultant | 46 pts, **High** | 74 pts, High | Company-to-company positions, plus personal data in contracts and correspondence |
| B. Multi-tenant SaaS for GCC contractors | 57 pts, **High** | 85 pts, High | As A, plus client-facing and harder to reverse |
| C. An agent that sends contractual notices itself | 98 pts, **High** | not needed | Rules T-AUTONOMOUS-B2B-DECISIONS and T-IRREVERSIBLE-ACTIONS: it acts on its own, and a sent notice cannot be undone |

The figures are from the founder's own re-scoring. They were checked against the kit's current version (0.3.x) and
match.

## Personal data is the lever
Real claim packs carry names, emails and signatures in contracts and correspondence, so most deployments of a tool like
this land High. The kit's own reference case, a claim-pack drafter with every output reviewed, scores Limited (42)
only because it assumes no personal data. Here, the personal data is enough to cross the line.

- **Operational fixes alone do not move Causa below High.** In-country hosting, security testing, monitoring, an
  incident process and partiality testing take profile A from 74 to 49 points, which is still High.
- **Redacting personal data the task does not need (CTL-DAT-03) is the main lever.** With redaction, profile A
  returns to Limited: 39 points at the quick check, and 42 after the deep-dive once the operational fixes are in place.
- **Profile B stays High whatever is fixed.** The founder's conclusion: position the SaaS as a High-tier system with a
  full, evidenced control set. That is a stronger procurement story than arguing for Limited.

**The design decision this led to: never ship profile C.** Notices stay behind per-notice human approval, and the
product is re-scored whenever an integration could let it send, file or submit anything.

## Recommended autonomy: not ready for autonomy yet
The UAE priority matrix rates claims preparation as high-complexity work, so it recommends **level 4, "not suitable
yet"**. Read it as *not ready for autonomy yet*. It is about readiness for autonomous execution, not a verdict that AI
cannot help.

Causa is assist-only by design: **level 3**, where the AI prepares the work and a person decides every output. It never
attempts autonomous execution. The path to more autonomy is evidence: approval gates, test results and reviewer
sign-off, shown alongside the recommendation. The kit's next steps still apply: name an owner and reassess.

## Control-evidence map: highlights (profile B)
His legend was *met by design* (the rule exists, but runtime evidence is still needed), *partly met* and *gap*. In the
kit's evidence map, "met by design" is recorded as *Partly met* until the runtime evidence is attached.
- **Met by design:** staged go/no-go controls before anything is produced; every assertion traced to a cited
  source; output checks that block unsupported statements; an independent challenge step; a hard stop to a gap
  report rather than a weak claim; a screen for prohibited practices such as backdating or fabricated notices.
- **Gaps identified at the time of assessment (September 2026), in his priority order:**
  1. assess indirect prompt injection through counterparty letters, subcontractor emails and PDFs (CTL-SEC-02; now
     also CTL-SEC-09);
  2. privacy review and redaction plus model-provider due diligence (CTL-DAT-03, CTL-ACC-06); this also settles
     hosting and the cross-border answer, and redaction is the only lever that moves the internal tool's tier;
  3. a provenance stamp on every pack, plus an arbitration AI-disclosure field (CTL-TRA-02; see the
     [arbitration sector note](../sector-notes/arbitration-ai-disclosure.md));
  4. an auditable record of every run, then metrics and an incident playbook (CTL-MON-02, CTL-MON-01, CTL-MON-04);
  5. policy, named owner and register (CTL-ACC-01, CTL-ACC-02, CTL-ACC-03), then re-score.
- **A reinterpretation worth copying:** for a tool that does not rank people, he read the bias question as
  *partiality* testing. Run the same event from the contractor's side and the employer's side, and check that
  entitlement is not overstated for whoever pays.

## Takeaways for other teams
- Assess each deployment separately, and re-score whenever an integration adds an action.
- Check what personal data the tool really needs: here, minimisation mattered more than any operational fix.
- Use the kit to make design decisions, not just to produce a report. Here, it stopped an agent from shipping.

*Thanks to Syed Hasan for the assessment, the evidence map and permission to publish. Guidance only, not
certification.*

Reviewed by Syed Hasan, founder of Causa Claims, October 2026.
