# Guide: the autonomy release ladder

**Who this is for:** teams that already know which autonomy level an AI use case *should* reach (the kit's
recommended level) and now need to decide *when* it may actually operate at that level.

The kit tells you the ceiling. This guide is about earning it. Autonomy is a promotion, not a switch: an AI system
moves up one step at a time, on evidence, and can be moved back down.

It uses the kit's autonomy levels (see [ADR 006](../decisions/006-autonomy-levels-follow-official-numbering.md)):
4 = not suitable yet, 3 = AI assistance, 2 = supervised autonomy, 1 = full autonomous execution.

## The principle

> Earn autonomy through evidence, grant it through explicit authorisation, constrain it through technical controls,
> and keep it only while the evidence still supports it.

Two kinds of evidence are needed, and passing one does not pass the other:

- **Performance evidence:** does the system decide and act well enough, across the cases it will meet?
- **Authorisation evidence:** is the organisation permitted to delegate this decision or action, who owns the residual
  risk, and what would make it withdraw the delegation?

A system can be accurate enough to recommend a decision and still not be authorised to make it.

## Grant autonomy per action, not per system

"Autonomous" is too broad to approve. Within one case, an AI system may:

1. classify or route a request;
2. recommend an outcome;
3. prepare a draft decision or letter;
4. update an internal record;
5. communicate with the customer or citizen;
6. decide, approve, refuse, or trigger an irreversible action.

Each of these is a separate authority. The same system can classify routine requests on its own, draft complex
assessments for staff, and have no authority at all over final decisions in sensitive cases. Record it per action in
the kit's action matrix (on the risk-tier screen), which never lets an action go beyond the recommended level.

## The five stages

| Stage | Question it answers | AI authority | Exit gate |
|---|---|---|---|
| Replay | Does it handle known cases correctly? | None | Baseline quality and critical-failure tests passed |
| Shadow | Does it hold up in the real environment? | None (outputs logged, never used) | Pre-agreed quality, coverage and safety thresholds met |
| Assisted (level 3) | Does human + AI beat human alone? | Suggests; a person decides | Better outcomes with demonstrated real oversight |
| Bounded (level 2) | Can it act safely within limits? | Acts on approved actions, with monitoring and escalation | Documented risk acceptance and operational readiness |
| Expansion (level 1 where allowed) | Does it stay safe as conditions change? | Widened one action or segment at a time | Ongoing evidence, never a permanent approval |

Stages have names, not numbers, so they are never confused with the autonomy levels. Before replay starts, a
deployment is at **Pre-pilot**.

The ladder is not one-way. A model, prompt, tool, data-source or policy change, or a serious incident, can send an
action back to an earlier stage. Different actions of the same system can sit on different stages at the same time.
The kit's rule still applies: a High tier or regulated domain never reaches level 1.

### Replay: historical cases

Cheap, and it catches obvious failures early. Make it time-correct:

- use the inputs, documents and **policy version in force at the time** of each case;
- make sure the system cannot see facts created later (appeal results, later notes, corrections);
- replay the whole workflow (retrieval, tool calls, permissions), not only the final answer;
- add a curated set of edge cases, rare exceptions and deliberately injected failures, because history under-samples
  the cases that matter most.

Past decisions are not ground truth. They contain human errors too, and archives hold only the cases that were
formally submitted, with the final verdict but rarely the verbal context or the exceptions made along the way.
Benchmark against a re-adjudicated sample, not against past decisions alone.

### Shadow: live cases, nothing committed

The system sees real cases as they arrive, but its output changes nothing. Run two kinds:

- **Decision shadow:** the recommendation or verdict is logged and compared.
- **Execution shadow:** the actions it *would* take (record updates, messages, transactions) are generated and
  intercepted, never committed, at production-equivalent permissions.

Shadow mode must never be a reason to expose more personal data or to grant broader access than production.

### Assisted (level 3)

Shadow mode cannot measure automation bias, because staff never see the AI's output. The assisted stage exists to
test the human and the AI together. Design it so the numbers mean something:

- where it is operationally and legally appropriate, capture the officer's own assessment **before** revealing the
  AI's suggestion;
- record the final decision, the override reason and the evidence checked;
- seed a small number of deliberately flawed suggestions to detect rubber-stamping;
- on a random share of cases, hide the suggestion to keep a human-only baseline;
- judge the **quality** of overrides (was the person right when they overrode?), not only how often they override;
- review a sample of cases where human and AI **agreed**, not only where they disagreed.

Staff must keep real authority and enough time to review. Do not run experiments on citizens' rights to measure
bias; use controlled studies and independent review for high-stakes cases.

### Bounded autonomy (level 2)

Start with reversible, low-impact actions. Before any action runs without a person deciding:

- **least privilege:** only the permissions that action needs. Many back-end systems only offer broad service
  accounts; then the narrowing has to happen in a policy layer or API gateway in front of them;
- **limits:** caps on the number, value or impact of actions without further approval;
- **approval gates** for anything irreversible or legally consequential;
- **idempotency:** no duplicate submissions or repeated actions;
- **kill switch and rollback**, tested;
- **remediation:** how affected people are identified, informed where appropriate, and given a route to correction or
  appeal. Rollback restores software, not a notice already sent.

### Controlled expansion

Widen one action or segment at a time. Keep independent sampling after release, watch for drift in inputs and
outcomes, and name the owner of the "is it still safe?" decision.

### Suspension and recovery

Decide before release, per action:

- who can withdraw the authority, and how fast;
- which actions stop, and what the safe state is (usually: back to Assisted, a person decides);
- how cases in flight are handled and who reviews them;
- what must be shown before the authority is restored. Restoration is a new release decision, not a switch back on.

## How to measure

**Agreement is a diagnostic, not a release criterion.** Compare the AI three ways:

1. with the original human decision (agreement with current practice);
2. with an **independently adjudicated** reference outcome (decision quality);
3. with what happened downstream: corrections, appeals, complaints (real-world effect).

**Adjudicate disagreements independently.** Set up the adjudication panel before shadow starts, and keep it separate
from the original decision-makers. Triage by severity: opposite outcomes (approve against refuse) go to dual review;
minor differences can be batched.

**Weight errors by severity.** A typo, a reversible routing error and an unlawful refusal are not the same error.
Set thresholds per action and risk tier. Some failures are unacceptable at any average rate.

**Zero errors is not zero risk.** If no errors are seen in *n* independent, representative cases, the true error rate
can still be up to about 3/*n* at 95% confidence (the "rule of three"):

| Cases observed, 0 errors | Error rate still possible (approx. upper bound) |
|---|---|
| 30 | 10% |
| 100 | 3% |
| 1,000 | 0.3% |

This assumes independent, representative cases and errors your evaluation can detect. It does not cover correlated
failures (one shared defect across many similar cases) or failure modes nobody has seen yet. Rare, high-stakes case
types may never collect enough natural volume: test them with challenge sets and expert review, or keep them out of
autonomy for good. That is a valid answer.

**Exit on evidence, not on the calendar.** A fixed "six months" is a guess. Write the release contract **before**
data collection starts, so the goalposts cannot move.

## The release contract

Agree it in writing before replay starts, per action:

| Dimension | Evidence required |
|---|---|
| Decision quality | Accuracy against independently adjudicated reference outcomes |
| Critical failures | No unresolved failure mode classed as unacceptable |
| Coverage | Enough evidence across case types, edge cases and relevant groups |
| Operational reliability | Acceptable behaviour under tool failures, missing data, timeouts and retries |
| Human oversight | Staff can detect and correct errors where oversight is required |
| Security and authority | Verified permissions, action limits, audit logs, access control |
| Legal and procedural basis | Approval of the delegated role and the accountability arrangements |
| Ongoing control | Monitoring, drift detection, incident handling, suspension and recovery |

A pass means the evidence is sufficient for this bounded authorisation. It never means the system is proved safe.

Four outcomes are possible: **pass** (for the specific level requested), **conditional pass** (narrower boundaries,
extra controls), **fail**, and **not yet demonstrated** (too little evidence, which is neither a pass nor a failure).

Questions every release gate must answer:

- What exactly is the system authorised to decide or do?
- What evidence shows it performs adequately?
- Which failures are unacceptable regardless of average performance?
- Which cases must always be escalated to a person?
- Who accepts the residual risk and approves the release?
- What evidence would suspend or revoke the autonomy?

## A familiar analogy, with one limit

Contact centres have onboarded people this way for decades: a new agent listens in, then takes calls with a
supervisor on the line, then handles simple call types alone, and only later the complex ones. The ladder is the same
idea.

The limit: a new human agent makes one mistake at a time and learns from feedback. An AI system can repeat the same
mistake across thousands of cases in an hour, and it does not learn on the job unless someone deliberately changes it.
That is why limits, monitoring and a fast suspension route matter more for AI than for people.

## How this fits the kit

- The **risk tier** and **recommended autonomy level** set the ceiling; this ladder sets the pace.
- The **action matrix** ([ADR 014](../decisions/014-action-matrix.md)) records the authority per action.
- Each deployment has a **release stage** field ([ADR 016](../decisions/016-release-stage.md)). At Bounded or
  Expansion, the kit shows a warning while a stop-switch, logging or oversight control is marked Gap.
- The **release contract** template (Templates page, English and Arabic) is the one-page version of the contract
  below.
- The **agent brief** ([ADR 015](../decisions/015-agent-brief.md)) carries the stage and the action matrix to the
  committee and to the team that builds it.
- The **control evidence map** ([ADR 008](../decisions/008-control-evidence-map.md)) is where the stage evidence and
  the signed release contract can be filed.
- **Per-deployment profiles** ([ADR 011](../decisions/011-per-deployment-profiles.md)) let each deployment sit on its
  own stage.

*This guide is practitioner guidance, not legal advice. Check the rules that govern your sector and the delegation
of decision-making powers in your organisation.*
