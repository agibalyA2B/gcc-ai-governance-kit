# Addendum: landscape research (27 Sep 2026), for the PRD and the crosswalk build

VERIFIED means confirmed this session. UNVERIFIED means it must be checked manually before it is used in data or copy.

## Framework sources
| Framework | Status | Source |
|---|---|---|
| UAE Charter for the Development and Use of AI (Jul 2024, 12 principles, non-binding) | UNVERIFIED (site 403) | likely https://uaelegislation.gov.ae/en/policy/details/the-uae-charter-for-the-development-and-use-of-artificial-intelligence |
| Dubai AI Ethics Principles & Guidelines + AI System Ethics Self-Assessment Tool (beta, AR toggle, no control export) | VERIFIED | https://www.digitaldubai.ae/self-assessment |
| SDAIA AI Ethics Principles 2025 (SDAIA-P114E v1; listed as draft; 4 risk tiers: little/no, limited, high, unacceptable) | VERIFIED | https://sdaia.gov.sa/en/SDAIA/about/Documents/ai-principles.pdf |
| SDAIA AI Adoption Framework; GenAI Guidelines (Government / Public) | listed, PDF date UNVERIFIED | https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx |
| DIFC Data Protection Regulation 10 (autonomous systems) | exists VERIFIED; date UNVERIFIED | https://www.difc.ae/business/registrars-and-commissioners/commissioner-of-data-protection/regulation-10 |
| ISO/IEC 42001:2023 (paid, © ISO; cite clause/Annex A numbers + own paraphrase only) | VERIFIED | https://www.iso.org/standard/42001 |
| NIST AI RMF ↔ ISO/IEC 42001 crosswalk (Microsoft-authored, maps to the 42001 FDIS) | VERIFIED | https://airc.nist.gov/docs/NIST_AI_RMF_to_ISO_IEC_42001_Crosswalk.pdf |
| Abu Dhabi DGE AI policy; QCB AI Guideline; Bahrain draft AI law | UNVERIFIED | — |
| UAE federal target for agentic AI in government services (~50%) | NOT CONFIRMED; do not cite | — |

## Competitors and comparables (GitHub stars on 27 Sep 2026)
- verifywise-ai/verifywise (359): full platform covering the EU AI Act, ISO 42001 and NIST. English, no GCC coverage.
  This is the main comparable.
- Template repos with ≤20 stars: an ISO 42001 toolkit, an AI-Governance-Starter-Pack, a Responsible-AI-Risk-Register.
- robertfels/iso-42001-aims-links-and-resources (70) is a links list.
- Arabic/GCC repos, all with 0 stars: imtithal-ai-governance (an Arabic self-assessment against the SDAIA Adoption
  Framework, the closest in concept), ksa-ai-evals, ai-governance-map-uae.
- Official: the Digital Dubai self-assessment tool, which is beta, covers Dubai only and has no export.

## Design implications
- Align the tier labels with SDAIA's four tiers, and map the EU AI Act tiers alongside them.
- Credit the NIST-hosted crosswalk as a reference and note that it maps to the 42001 FDIS.
- The verified flag and the source URL on every row are both a product feature and a legal safeguard.
