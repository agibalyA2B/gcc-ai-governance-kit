# Content audit: control crosswalk

Audit of `data/crosswalk.json`, carried out on 27 Sep 2026. A row is marked **verified** only when every reference in it
was checked against an official source fetched on that date. Rows that fail this test ship with `verified: false` and a
`needs-verification:` note, and the app labels them as such.

## Summary

| Theme | Controls | Verified |
|---|---|---|
| accountability | 8 | 6 |
| transparency | 7 | 6 |
| data | 7 | 5 |
| human-oversight | 6 | 4 |
| safety-security | 7 | 6 |
| monitoring | 8 | 8 |
| **Total** | **43** | **35 (81%)** |

- 8 controls are specific to agentic AI: CTL-ACC-08, CTL-HUM-04, CTL-HUM-05, CTL-HUM-06, CTL-SEC-04, CTL-SEC-05,
  CTL-MON-03 and CTL-MON-08. 7 of them are verified. CTL-HUM-05 is not, because it carries a UAE Charter reference.
- 4 controls are specific to generative AI (CTL-TRA-02, CTL-DAT-06, CTL-DAT-07, CTL-SEC-03), all verified.
- All 8 unverified rows are unverified for one reason only: they carry a UAE Charter principle name, and the Charter
  could not be fetched. Every other reference in those rows was confirmed.

## Sources (all checked 27 Sep 2026)

| Key | Source | Result |
|---|---|---|
| NIST | NIST AI 100-1, AI RMF 1.0: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf | Fetched. Subcategory IDs checked against Tables 1–4. |
| XW | NIST-hosted AI RMF ↔ ISO/IEC 42001 crosswalk: https://airc.nist.gov/docs/NIST_AI_RMF_to_ISO_IEC_42001_Crosswalk.pdf | Fetched. Source for ISO/IEC 42001 numbering (see limitation 2). |
| EU | Regulation (EU) 2024/1689 (AI Act), EUR-Lex: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401689 | Fetched. Article numbers and headings checked. |
| SDA | SDAIA AI Ethics Principles 2025: https://sdaia.gov.sa/en/SDAIA/about/Documents/ai-principles.pdf | Fetched. Seven principle names checked. |
| DUB | Dubai AI Ethics Principles & Guidelines (PDF): https://www.digitaldubai.ae/docs/default-source/ai-principles-resources/ai-ethics.pdf | Fetched. Principle and sub-principle names checked. |
| — | Dubai AI System Ethics Self-Assessment Tool: https://www.digitaldubai.ae/self-assessment | Fetched (context only; no refs taken from it). |
| — | UAE Charter for the Development and Use of AI: https://uaelegislation.gov.ae/en/policy/details/the-uae-charter-for-the-development-and-use-of-artificial-intelligence and https://ai.gov.ae/ai-charter/ | **HTTP 403 (blocked)** on both, in English and Arabic. The u.ae AI pages were also checked and do not give the principle list. |

Checking method: each source was downloaded and converted to text. The build script then rejects any NIST ID, ISO
number, EU article or SDAIA/Dubai name that does not appear in the fetched text. After that, each mapping was reviewed
by hand for fit, for example that Art. 14 really covers the ability to stop the system (Art. 14(4)(e)) and that SDAIA
Reliability & Safety really requires human oversight for irreversible decisions.

## Naming conventions used in `refs`

- **Dubai:** the four sub-principles of the Ethics principle (Fairness, Accountability, Transparency, Explainability),
  plus Security ("safe, secure and controllable by humans") and Privacy ("We will respect people's privacy", which sits
  under the Inclusiveness principle).
- **SDAIA:** the seven principle names exactly as published, for example "Accountability & Responsibility".
- **ISO/IEC 42001:** Annex A control numbers only. No ISO text is reproduced.
- **NIST AI RMF:** subcategory IDs, for example "MEASURE 2.11".
- **EU AI Act:** article numbers only. Some cited articles bind providers, or apply to high-risk systems only (Arts. 9–15,
  26, 27, 72, 73, 86). They are cited as the nearest source of the obligation, and this does not mean the Act applies to
  a GCC deployer.

## Per-row audit

Source keys are listed in the table above.

| id | refs checked | sources opened | verified? | note |
|---|---|---|---|---|
| CTL-ACC-01 | Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.2.2, A.2.4; NIST: GOVERN 1.2, GOVERN 2.3 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-ACC-02 | UAE: Governance and accountability; Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.3.2; NIST: GOVERN 2.1 | DUB, SDA, XW, NIST | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-ACC-03 | SDAIA: Accountability & Responsibility; ISO: A.4.2; NIST: GOVERN 1.6 | SDA, XW, NIST | yes | all refs confirmed |
| CTL-ACC-04 | Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.5.2, A.5.3, A.5.4; NIST: MAP 1.1, MAP 5.1; EU: Art. 9, Art. 27 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-ACC-05 | SDAIA: Accountability & Responsibility, Reliability & Safety; ISO: A.6.2.5; NIST: MANAGE 1.1, GOVERN 2.3 | SDA, XW, NIST | yes | all refs confirmed |
| CTL-ACC-06 | Dubai: Accountability; SDAIA: Transparency & Explainability; ISO: A.10.2, A.10.3; NIST: GOVERN 6.1, MANAGE 3.1; EU: Art. 25 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-ACC-07 | UAE: Promoting AI awareness for an inclusive society; ISO: A.4.6; NIST: GOVERN 2.2, MAP 3.4; EU: Art. 4 | XW, NIST, EU | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-ACC-08 | Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.3.2; NIST: GOVERN 2.1, GOVERN 3.2 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-TRA-01 | UAE: Transparency; Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.8.2; EU: Art. 50 | DUB, SDA, XW, EU | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-TRA-02 | Dubai: Security; SDAIA: Transparency & Explainability; ISO: A.8.2; EU: Art. 50 | DUB, SDA, XW, EU | yes | all refs confirmed |
| CTL-TRA-03 | Dubai: Explainability; SDAIA: Transparency & Explainability; ISO: A.8.2; NIST: MEASURE 2.9; EU: Art. 86 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-TRA-04 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.8.5; EU: Art. 26 | DUB, SDA, XW, EU | yes | all refs confirmed |
| CTL-TRA-05 | Dubai: Transparency; SDAIA: Reliability & Safety, Transparency & Explainability; ISO: A.6.2.3, A.6.2.7; NIST: MAP 2.1, MAP 2.2; EU: Art. 11 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-TRA-06 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.8.5; NIST: GOVERN 4.2 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-TRA-07 | SDAIA: Transparency & Explainability; ISO: A.8.2; NIST: MAP 2.2; EU: Art. 13 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-DAT-01 | Dubai: Privacy; SDAIA: Privacy & Security; ISO: A.7.2, A.7.3, A.7.5; NIST: MAP 2.3; EU: Art. 10 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-DAT-02 | Dubai: Fairness; SDAIA: Fairness, Accountability & Responsibility; ISO: A.7.4, A.7.6; NIST: MAP 2.3; EU: Art. 10 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-DAT-03 | UAE: Data privacy; Dubai: Privacy; SDAIA: Privacy & Security; ISO: A.2.3, A.7.3; NIST: MEASURE 2.10 | DUB, SDA, XW, NIST | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-DAT-04 | Dubai: Fairness; SDAIA: Fairness; ISO: A.7.4; NIST: MEASURE 2.11; EU: Art. 10 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-DAT-05 | UAE: Algorithmic bias; Dubai: Fairness; SDAIA: Fairness; ISO: A.5.4, A.6.2.4; NIST: MEASURE 2.11; EU: Art. 10 | DUB, SDA, XW, NIST, EU | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-DAT-06 | Dubai: Privacy; SDAIA: Privacy & Security; ISO: A.2.3, A.9.2; NIST: GOVERN 6.1, MEASURE 2.10 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-DAT-07 | SDAIA: Transparency & Explainability; ISO: A.7.3, A.7.5; NIST: MAP 4.1, GOVERN 6.1; EU: Art. 53 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-HUM-01 | UAE: Human oversight; Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.6.1.3; NIST: MAP 3.5, GOVERN 3.2; EU: Art. 14, Art. 26 | DUB, SDA, XW, NIST, EU | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-HUM-02 | Dubai: Accountability; SDAIA: Transparency & Explainability; ISO: A.8.3; NIST: MEASURE 3.3 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-HUM-03 | ISO: A.4.6; NIST: MAP 3.4, GOVERN 3.2; EU: Art. 14 | XW, NIST, EU | yes | all refs confirmed |
| CTL-HUM-04 | Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.9.4; NIST: MAP 3.3, GOVERN 3.2; EU: Art. 14 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-HUM-05 | UAE: Human oversight; Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.1.3; NIST: MAP 3.5, GOVERN 3.2; EU: Art. 14 | DUB, SDA, XW, NIST, EU | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-HUM-06 | Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.6.2.6; NIST: MANAGE 2.4; EU: Art. 14 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-SEC-01 | UAE: Safety; Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.2.4; NIST: MEASURE 2.5, MEASURE 2.6; EU: Art. 15 | DUB, SDA, XW, NIST, EU | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-SEC-02 | Dubai: Security; SDAIA: Privacy & Security; ISO: A.6.2.2; NIST: MEASURE 2.7; EU: Art. 15 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-SEC-03 | Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.2.4; NIST: MEASURE 2.6 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-SEC-04 | Dubai: Security; SDAIA: Privacy & Security; ISO: A.4.4, A.6.2.2; NIST: MAP 4.2; EU: Art. 15 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-SEC-05 | Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.2.4, A.6.2.5; NIST: MEASURE 2.3, MEASURE 2.6 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-SEC-06 | SDAIA: Accountability & Responsibility; NIST: MANAGE 2.1, MEASURE 2.6; EU: Art. 15 | SDA, NIST, EU | yes | all refs confirmed |
| CTL-SEC-07 | Dubai: Security; SDAIA: Reliability & Safety; ISO: A.9.4; NIST: MANAGE 1.1; EU: Art. 5 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-MON-01 | SDAIA: Accountability & Responsibility, Reliability & Safety; ISO: A.6.2.6; NIST: MEASURE 2.4, MANAGE 4.1; EU: Art. 26, Art. 72 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-MON-02 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.6.2.8; NIST: MEASURE 2.4; EU: Art. 12, Art. 26 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-MON-03 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.6.2.8; NIST: MEASURE 2.4; EU: Art. 12 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-MON-04 | SDAIA: Transparency & Explainability; ISO: A.8.4; NIST: MANAGE 4.3, MANAGE 2.3; EU: Art. 73 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-MON-05 | SDAIA: Reliability & Safety; ISO: A.6.2.6; NIST: GOVERN 1.5, MEASURE 3.1; EU: Art. 9 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-MON-06 | SDAIA: Transparency & Explainability; ISO: A.3.3, A.8.3; NIST: GOVERN 5.1, MEASURE 3.3 | SDA, XW, NIST | yes | all refs confirmed |
| CTL-MON-07 | Dubai: Security; ISO: A.6.2.6; NIST: GOVERN 1.7, MANAGE 2.4 | DUB, XW, NIST | yes | all refs confirmed |
| CTL-MON-08 | Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.6.2.6; NIST: MEASURE 2.4, MANAGE 2.4 | DUB, SDA, XW, NIST | yes | all refs confirmed |

## What could not be verified, and why

1. **UAE Charter principle names (8 rows).** Both official hosts returned HTTP 403 to automated access on 27 Sep 2026.
   The names used ("Governance and accountability", "Promoting AI awareness for an inclusive society", "Transparency",
   "Data privacy", "Algorithmic bias", "Human oversight", "Safety") come from secondary knowledge of the July 2024
   Charter and are **unconfirmed**. The exact official wording, especially of the awareness principle, must be checked
   by hand in a browser. These rows become verified once the names are confirmed or corrected. UAE refs were
   deliberately kept off the other 35 rows so that they could be verified. When the Charter is confirmed, UAE refs can
   be added to more rows. Until then, a user who selects only the UAE Charter will see just 8 controls, all unverified.
2. **ISO/IEC 42001 numbering (the main residual risk in verified rows).** ISO/IEC 42001 is paid and its text was not
   opened. Numbers were confirmed through the NIST-hosted crosswalk, and it has three caveats:
   (a) it maps to the **FDIS**, not the published 2023 edition;
   (b) it cites the **Annex B** implementation-guidance clauses (for example B.6.2.8), and these were converted to
   Annex A control numbers (A.6.2.8) on the basis that Annex B guidance is numbered in parallel with the Annex A
   controls. No fetched source confirmed this one-to-one correspondence;
   (c) the crosswalk has two evident labelling errors ("B.2.2 Customers" and "B.3.2 Management review inputs"). Neither
   title was used. A.2.2 and A.3.2 were used only in their correctly labelled sense (AI policy; AI roles and
   responsibilities).
   Recommended check before v0.1.0: someone with access to the published standard confirms the Annex A numbers used
   (A.2.2, A.2.3, A.2.4, A.3.2, A.3.3, A.4.2, A.4.4, A.4.6, A.5.2–A.5.4, A.6.1.3, A.6.2.2–A.6.2.8, A.7.2–A.7.6,
   A.8.2–A.8.5, A.9.2, A.9.4, A.10.2, A.10.3).
3. **Mapping judgement.** "Verified" means that each reference exists in the official source and that its subject matter
   matches the control. It does not mean that the source body endorses the mapping. The mappings are the kit's own
   interpretation.
4. **Agentic controls.** None of the frameworks has agent-specific clauses. The agentic rows are mapped to the closest
   general provisions (human oversight, levels of autonomy, stop/override, logging, least privilege), and this is
   interpretive by nature.
5. **SDAIA status.** The 2025 document is listed as a draft (SDAIA-P114E v1), so its principle names may change in
   the final version.
