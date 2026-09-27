---
title: "Product Brief: gcc-ai-governance-kit"
status: final
created: 2026-09-27
updated: 2026-09-27
---

# Product Brief: gcc-ai-governance-kit

*Adopt AI governance in one afternoon, in Arabic and English.*

## Executive Summary

GCC governments and large organisations are deploying AI faster than they can govern it. The principles already exist:
the UAE Charter for the Development and Use of AI, Dubai's AI Ethics Guidelines, and SDAIA's AI Ethics Principles with
their four risk tiers. What's missing is the practical layer underneath them. Nothing turns those principles into a use-case register, a risk tier and a concrete control list
that a team can adopt this week, in Arabic as well as English.

gcc-ai-governance-kit is that layer, open and free. It has two parts. The first is a set of bilingual templates: an AI
use-case register, an AI impact assessment, and a control crosswalk. The second is a light web app. A government AI office
lead registers a use case, answers a short questionnaire that includes agentic-AI questions (autonomy, human oversight,
tool access), gets an explainable risk tier, and exports the controls that apply under the frameworks they select.

It is also a public portfolio piece. It shows that its author can turn AI governance policy into working instruments, and
the evidence is visible to GCC hiring managers.

## The Problem

A government AI office lead is asked to prove that the entity's AI use is governed. Today that means:
- reading six overlapping frameworks (UAE Charter, Dubai guidelines, SDAIA, ISO/IEC 42001, NIST AI RMF, EU AI Act for
  multinationals) and building a crosswalk by hand in Excel;
- finding that the open-source tools (for example VerifyWise and ISO 42001 starter packs) ignore GCC frameworks and are
  English-only;
- finding that the one official GCC assessment tool, Digital Dubai's AI System Ethics Self-Assessment, is still in beta,
  covers Dubai's guidelines only, and exports no control list;
- facing agentic AI, which raises new questions (how autonomous, who approves, what systems it can touch) that the
  classic risk questionnaires do not ask.

The cost: governance becomes a slide deck instead of an operating practice, rollouts stall at the risk committee, and
every entity reinvents the same spreadsheet.

## The Solution

- **Templates people can copy.** Use-case register, impact assessment and control checklist, in AR/EN, as CSV, XLSX
  and Markdown, released under CC BY 4.0.
- **A framework selector.** Checkboxes for the UAE Charter, Dubai AI Ethics, SDAIA, ISO/IEC 42001 (clause references
  only), NIST AI RMF and EU AI Act tiers. Every output filters to the selection.
- **An explainable risk tier.** A short questionnaire with visible weights. It includes agentic-readiness factors:
  autonomy level, human-in-the-loop, tool/system access, reversibility of actions. Its tiers align with SDAIA's
  little/limited/high/unacceptable model.
- **Controls and export.** The applicable controls, each with its source link and a verification status, exported to
  CSV, XLSX or PDF.
- **Offline and zero-cost.** A static site on GitHub Pages with no backend, no login and no API key. Nothing a user
  enters leaves the browser.

## What Makes This Different

- **GCC-first and bilingual.** No open governance kit with any traction maps UAE, Dubai and SDAIA frameworks together
  with ISO and NIST, in Arabic with right-to-left layout. The few Arabic or GCC repos found have no stars and are
  narrower.
- **Agentic-aware.** Autonomy and oversight drive the tier, not just data sensitivity.
- **Honest about verification.** Every mapping row shows its source and whether it has been verified. v0.1 fully
  verifies about 30 core controls; the rest ship flagged. That transparency is itself good governance practice.
- **Written by a practitioner.** It is framed by someone who has run AI adoption and governance inside UAE government,
  not by a vendor. The README author section states this without naming any former employer.

The moat is honest: being first in the niche, execution quality, and the author's credibility. It has no technical
moat.

## Who This Serves

- **Primary: the government AI office lead** in a UAE/GCC entity. This person needs to show alignment with the UAE Charter
  and the national push for agentic services, and needs a defensible register and control set before the next committee.
  Success: the first use cases are registered and tiered, and a control list is exported, in one afternoon.
- **Secondary:** a bank's model-risk or CX-AI owner (responsible, explainable AI controls); a consultant who needs a
  client-ready starter pack; any GCC organisation starting its AI register.

## Success Criteria

- **Primary:** qualified professional conversations about the kit (GCC organisations, practitioners, hiring managers)
  within 30 days of launch. Target: at least 5.
- **Secondary:** GitHub traction, with 50 or more stars and 10 or more forks in 60 days, plus template
  downloads.
- **Quality:** ≥30 core controls verified at launch; WCAG 2.1 AA; both languages load and export correctly.

## Scope

**In v0.1 (15h timebox):**
- a crosswalk dataset with a JSON Schema;
- the three templates in AR/EN;
- the app flow: register → questionnaire, including the agentic questions → tier → controls → export;
- the framework checkboxes;
- AR/EN and RTL;
- a GitHub Pages deploy;
- a hiring-manager README with a demo GIF.

**Out of scope:**
- user accounts, a backend or any data storage beyond the browser;
- LLM features;
- sector-specific packs, e.g. central-bank rules (CBUAE/QCB/telco packs go to v0.2);
- full verification of every row;
- any content, code or wording from a former employer (clean-room).

**Known unknowns:**
- The exact wording of the UAE federal "agentic AI in government services" target could not be sourced yet. It will
  not be cited until verified. *(Resolved 27 Sep 2026: the UAE Cabinet announced it in April 2026; now cited in the kit.)*
- Some UAE and Qatar source pages blocked automated access and need manual confirmation.

## Vision

Within 2–3 years this becomes the default open reference for AI governance in the GCC. It would have sector packs
(banking, telco, health), community-maintained mappings as regulators update, and a contribution model that lets GCC
practitioners keep it current. Its author becomes a recognised name in GCC AI governance.
