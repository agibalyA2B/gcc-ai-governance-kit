# Content audit: control crosswalk

Audit of `data/crosswalk.json`, carried out on 27 Sep 2026. A row is marked **verified** only when every reference in it
was checked against an official source fetched on that date. Rows that fail this test ship with `verified: false` and a
`needs-verification:` note, and the app labels them as such.

## Summary

| Theme | Controls | Verified |
|---|---|---|
| accountability | 11 | 9 |
| transparency | 9 | 8 |
| data | 9 | 7 |
| human-oversight | 10 | 8 |
| safety-security | 8 | 7 |
| monitoring | 9 | 9 |
| **Total** | **56** | **48 (86%)** |

- 13 controls were added on 27 Sep 2026 from the UAE federal government-services sources (see "UAE Government
  Services Code framework" below): CTL-ACC-09, CTL-ACC-10, CTL-ACC-11, CTL-TRA-08, CTL-TRA-09, CTL-DAT-08, CTL-DAT-09,
  CTL-HUM-07, CTL-HUM-08, CTL-HUM-09, CTL-HUM-10, CTL-SEC-08 and CTL-MON-09. All 13 are verified.
- 17 controls apply only to agentic AI: CTL-ACC-08, CTL-ACC-09, CTL-ACC-10, CTL-TRA-08, CTL-TRA-09, CTL-HUM-04,
  CTL-HUM-05, CTL-HUM-06, CTL-HUM-07, CTL-HUM-08, CTL-HUM-10, CTL-SEC-04, CTL-SEC-05, CTL-SEC-08, CTL-MON-03,
  CTL-MON-08 and CTL-MON-09. 16 of them are verified. CTL-HUM-05 is not, because it carries a UAE Charter reference.
- 2 controls apply to generative and agentic AI (CTL-DAT-09, CTL-HUM-09), both verified.
- 4 controls apply only to generative AI (CTL-TRA-02, CTL-DAT-06, CTL-DAT-07, CTL-SEC-03), all verified.
- 34 controls cite the UAE Government Services Code framework (`uae_gov_code`): 21 existing rows and the 13 new ones.
- All 8 unverified rows are unverified for one reason only: they carry a UAE Charter principle name, and the Charter
  could not be fetched. Every other reference in those rows was confirmed, including any `uae_gov_code` refs.

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
| CODE | UAE Code for Government Services and Zero Bureaucracy (كود الإمارات للخدمات الحكومية وتصفير البيروقراطية), adopted by the UAE Cabinet, April 2026. Announcement: https://uaecabinet.ae/en/news/under-directives-of-uae-president-and-in-world-first-mohammed-bin-rashid-reveals-new-uae-government-framework-to-deploy-agentic-ai-across-50-of-government-sectors-operations-within-two-years | Full Arabic text read page by page. Card numbers and requirement wording checked. |
| EGS | Guide to designing government service experiences with agentic AI (دليل تصميم تجارب الخدمات الحكومية بالذكاء الاصطناعي المساعد), Emirates Government Services Excellence Program: https://uaemodel.egsep.ae/agentic_ai_guide_website.html | Read in a browser on 27 Sep 2026 (scripted fetches are blocked). Section numbers §01–§06 checked. |
| DSP | UAE Government Services Data Sharing Policy (سياسة مشاركة بيانات الخدمات الحكومية), May 2026 | Full Arabic text read. Article numbers checked. **No public URL known**, so it is cited in `notes`, not in `source_urls`. |
| AGR | Agentic AI National Reference (الدليل التعريفي للذكاء الاصطناعي المساعد), UAE government, July 2026, 15 pages | Full Arabic text read page by page. PDF page numbers checked. **No public URL known**, so it is cited in `notes`, not in `source_urls`. |

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
- **UAE Government Services Code framework (`uae_gov_code`)** bundles four UAE federal sources, each with its own
  prefix: "Code N.N" (CODE, the card number), "Agentic Guide §0N" (EGS, the section number), "Data Sharing Policy
  Art. N" (DSP) and "Agentic Reference p.N" (AGR, the PDF page). Code refs are given at card level (for example
  "Code 5.2"), not at requirement level (5.2.7), because the two-column PDF layout scrambles the position of the
  requirement numbers in the extracted text. The card was always confirmed. No source text is reproduced beyond short
  Arabic key phrases in this audit.

## UAE Government Services Code framework: what each citation rests on

Checked on 27 Sep 2026 against the full text of each source. The Arabic phrases are short key phrases from the source.
The paraphrase next to each one is ours.

| Ref | What the source requires (our paraphrase) | Key phrase | Cited by |
|---|---|---|---|
| Code 1.5 | Pre-fill from verified government records; apply "ask once" | «طلب البيانات مرة واحدة» | CTL-DAT-09 |
| Code 1.6 | Show fee details and the total before payment is confirmed | «إظهار القيمة الإجمالية قبل تأكيد الدفع» | CTL-HUM-10 |
| Code 1.7 | When live chat cannot answer, escalate to a specialist and keep the full conversation context | «الاحتفاظ بسياق المحادثة كاملًا» | CTL-HUM-09 |
| Code 2.1 | Periodic KPIs for AI tools with corrective action; runtime monitoring of the AI assistant; governance review before launch for each agent and on change; a review log per agent; a documented continue / modify / stop decision | «مراجعة حوكمة قبل الإطلاق لكل وكيل»، «سجل مراجعة لكل وكيل» | CTL-ACC-05, CTL-ACC-09, CTL-MON-01, CTL-MON-05, CTL-MON-09 |
| Code 2.3 | KPIs per agent covering decision quality, bias and service impact, linked to customer satisfaction, with a continue / modify / stop decision | «مؤشرات أداء شاملة لكل وكيل» | CTL-MON-09 |
| Code 2.4 | Right to object in real time to decisions by an AI agent, with human review | «حق المتعامل في الاعتراض» | CTL-HUM-02 |
| Code 4.5 | Tell the customer clearly when the AI assistant cannot complete the service, with next steps | «تعذر إكمال الخدمة» | CTL-TRA-09 |
| Code 5.1 | Verify the user's identity and permissions before automated actions, including agent actions; restrict actions to approved permissions; review role-based access | «تقييد تنفيذ الإجراءات ضمن الصلاحيات المعتمدة» | CTL-SEC-04, CTL-SEC-08 |
| Code 5.2 | State the data sources used when an agent delivers the service; legal basis or consent when an agent uses data; consent before an agent takes a decision with financial, legal or irreversible effect; withdraw consent in one step | «قبل قيام وكيل الذكاء الاصطناعي بتنفيذ أي قرار» | CTL-DAT-03, CTL-HUM-05, CTL-HUM-07, CTL-HUM-08, CTL-TRA-08 |
| Code 5.3 | Use accurate and complete data for automated decisions, including by an agent | «بيانات دقيقة ومكتملة» | CTL-DAT-02, CTL-DAT-08 |
| Code 5.4 | Reuse data already verified by another entity instead of asking again; an approved, current scope document per agent (services, permissions, decisions it may take alone or must refer to a person); no operation outside scope | «وثيقة نطاق معتمدة ومحدثة لكل وكيل» | CTL-ACC-10, CTL-DAT-09, CTL-HUM-01, CTL-HUM-04 |
| Code 5.5 | Safe-stop triggers per agent; immediate suspension on abnormal behaviour; documented reasons and reactivation conditions | «محفزات الإيقاف الآمن لكل وكيل» | CTL-HUM-06, CTL-MON-08 |
| Code 5.6 | Immutable audit logs that include agent actions and decisions; traceable inputs, decision logic and outputs; clear disclosure that an agent is used; understandable, reviewable AI decisions | «عدم إخفاء استخدام الذكاء الاصطناعي المساعد» | CTL-TRA-01, CTL-TRA-03, CTL-TRA-04, CTL-MON-02, CTL-MON-03 |
| Code 5.7 | Collect only the minimum personal data; keep agent data use within what the service needs; no reuse for other purposes without a new legal basis or consent | «ضمن الحدود اللازمة لتقديم الخدمة» | CTL-DAT-03, CTL-DAT-08, CTL-SEC-04 |
| Code 5.8 | Payments only through secure, approved channels | «قنوات دفع آمنة وموثوقة» | CTL-HUM-10 |
| Code 6.2 | Qualify staff who design, operate or review agent-based services | «تأهيل الكوادر» | CTL-ACC-07 |
| Code 8.2 | A clear route to a person when the AI assistant cannot complete the service; service continuity when an agent cannot execute | «مسار واضح للتحويل إلى تدخل بشري» | CTL-HUM-09, CTL-SEC-06 |
| Code 8.8 | Operational, decision and integration tests before launch; approve results before go-live and block activation without them; retest after changes | «منع التفعيل دون استيفائها» | CTL-ACC-05, CTL-SEC-01 |
| Agentic Guide §02 | Customer control: the customer can stop the assistant or revoke its permission | «التحكم للمتعامل» | CTL-HUM-08 |
| Agentic Guide §03 | Stage rules: ask once; a plan showing actions, data and cost; approval per action, not open permission; handover with full context; payment only after fees are shown and explicit consent; objection from the same place | «الطلب مرة واحدة» | CTL-DAT-09, CTL-HUM-02, CTL-HUM-05, CTL-HUM-07, CTL-HUM-09, CTL-HUM-10, CTL-TRA-08, CTL-TRA-09 |
| Agentic Guide §05 | Required outputs: scope statement, permissions and approvals matrix, baseline and impact KPIs | — | CTL-ACC-10, CTL-HUM-01, CTL-HUM-04, CTL-MON-09 |
| Agentic Guide §06 | Pre-launch readiness gate with auditable evidence: revocation in one step, self-identification, action log, specific approvals, context handover, payment consent, objection path, tests against a baseline | — | CTL-ACC-05, CTL-ACC-09, CTL-DAT-09, CTL-HUM-02, CTL-HUM-07, CTL-HUM-08, CTL-HUM-09, CTL-HUM-10, CTL-MON-03, CTL-MON-09, CTL-SEC-01, CTL-TRA-01 |
| Data Sharing Policy Art. 5 | Share only what is needed and with consent where required; ask once; use only for authorised purposes; no retention for reuse or parallel databases; draw from the golden source | «قواعد بيانات موازية» | CTL-DAT-03, CTL-DAT-08, CTL-DAT-09 |
| Data Sharing Policy Art. 8 | Beneficiary entities: authorised purpose only, draw from golden sources, no parallel databases, do not ask customers for data held in golden records | «الامتناع عن طلب البيانات من المتعاملين» | CTL-DAT-08, CTL-DAT-09 |
| Agentic Reference p.6 | Generative AI: responds to a prompt, keeps no context without memory, uses no external tools to act | — | CTL-ACC-11 |
| Agentic Reference p.7 | Agentic AI definition and its four characteristics; works within defined permissions, governance and human supervision | — | CTL-ACC-11, CTL-HUM-01 |
| Agentic Reference p.8 | Multi-agent supervision: limits on time, budget and steps; stop execution when controls are breached | — | CTL-HUM-04, CTL-MON-08 |
| Agentic Reference p.9 | Multi-agent criteria, including a complete auditable record of all actions and clear accountability for the whole system; common misclassification | — | CTL-ACC-02, CTL-ACC-11, CTL-MON-03 |
| Agentic Reference p.13 | Five-question self-assessment; all five must be "yes" for a system to count as agentic | — | CTL-ACC-11 |
| Agentic Reference p.14 | FAQ: chatbots, avatars, RPA and reply-drafting copilots are not agentic by themselves | — | CTL-ACC-11 |

Candidate controls checked and folded into existing rows rather than added: the right to object to an agent's decision
(Code 2.4, Agentic Guide §03, §06) is covered by CTL-HUM-02, and restricting agent actions to approved permissions
(Code 5.1) is covered by CTL-SEC-04 and CTL-HUM-04. Code 5.1's identity and permission check before each automated
action is a separate control (CTL-SEC-08).

**Resolved open question: the UAE agentic-AI target.** The planning brief listed the "~50% agentic AI" figure as not
confirmed. It is now confirmed: in April 2026 the UAE Cabinet announced a government framework to deploy agentic AI
across 50% of government sectors, services and operations within two years
(https://uaecabinet.ae/en/news/under-directives-of-uae-president-and-in-world-first-mohammed-bin-rashid-reveals-new-uae-government-framework-to-deploy-agentic-ai-across-50-of-government-sectors-operations-within-two-years).
The Agentic AI National Reference (July 2026, p.4 and p.12) repeats the same target.

## Per-row audit

Source keys are listed in the table above.

| id | refs checked | sources opened | verified? | note |
|---|---|---|---|---|
| CTL-ACC-01 | Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.2.2, A.2.4; NIST: GOVERN 1.2, GOVERN 2.3 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-ACC-02 | UAE: Governance and accountability; Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.3.2; NIST: GOVERN 2.1; Gov: Agentic Reference p.9 | DUB, SDA, XW, NIST, AGR | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed; AGR ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-ACC-03 | SDAIA: Accountability & Responsibility; ISO: A.4.2; NIST: GOVERN 1.6 | SDA, XW, NIST | yes | all refs confirmed |
| CTL-ACC-04 | Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.5.2, A.5.3, A.5.4; NIST: MAP 1.1, MAP 5.1; EU: Art. 9, Art. 27 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-ACC-05 | SDAIA: Accountability & Responsibility, Reliability & Safety; ISO: A.6.2.5; NIST: MANAGE 1.1, GOVERN 2.3; Gov: Code 2.1, Code 8.8, Agentic Guide §06 | SDA, XW, NIST, CODE, EGS | yes | all refs confirmed |
| CTL-ACC-06 | Dubai: Accountability; SDAIA: Transparency & Explainability; ISO: A.10.2, A.10.3; NIST: GOVERN 6.1, MANAGE 3.1; EU: Art. 25 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-ACC-07 | UAE: Promoting AI awareness for an inclusive society; ISO: A.4.6; NIST: GOVERN 2.2, MAP 3.4; EU: Art. 4; Gov: Code 6.2 | XW, NIST, EU, CODE | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-ACC-08 | Dubai: Accountability; SDAIA: Accountability & Responsibility; ISO: A.3.2; NIST: GOVERN 2.1, GOVERN 3.2 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-ACC-09 | Gov: Code 2.1, Agentic Guide §06; SDAIA: Accountability & Responsibility; ISO: A.6.2.5; NIST: MANAGE 1.1 | CODE, EGS, SDA, XW, NIST | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-ACC-10 | Gov: Code 5.4, Agentic Guide §05; NIST: MAP 3.3 | CODE, EGS, NIST | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-ACC-11 | Gov: Agentic Reference p.6, Agentic Reference p.7, Agentic Reference p.9, Agentic Reference p.13, Agentic Reference p.14; NIST: MAP 2.1 | AGR, NIST | yes | new control (27 Sep 2026); all refs confirmed; AGR ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-TRA-01 | UAE: Transparency; Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.8.2; EU: Art. 50; Gov: Code 5.6, Agentic Guide §06 | DUB, SDA, XW, EU, CODE, EGS | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-TRA-02 | Dubai: Security; SDAIA: Transparency & Explainability; ISO: A.8.2; EU: Art. 50 | DUB, SDA, XW, EU | yes | all refs confirmed |
| CTL-TRA-03 | Dubai: Explainability; SDAIA: Transparency & Explainability; ISO: A.8.2; NIST: MEASURE 2.9; EU: Art. 86; Gov: Code 5.6 | DUB, SDA, XW, NIST, EU, CODE | yes | all refs confirmed |
| CTL-TRA-04 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.8.5; EU: Art. 26; Gov: Code 5.6 | DUB, SDA, XW, EU, CODE | yes | all refs confirmed |
| CTL-TRA-05 | Dubai: Transparency; SDAIA: Reliability & Safety, Transparency & Explainability; ISO: A.6.2.3, A.6.2.7; NIST: MAP 2.1, MAP 2.2; EU: Art. 11 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-TRA-06 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.8.5; NIST: GOVERN 4.2 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-TRA-07 | SDAIA: Transparency & Explainability; ISO: A.8.2; NIST: MAP 2.2; EU: Art. 13 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-TRA-08 | Gov: Code 5.2, Agentic Guide §03; Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.8.2 | CODE, EGS, DUB, SDA, XW | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-TRA-09 | Gov: Code 4.5, Agentic Guide §03 | CODE, EGS | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-DAT-01 | Dubai: Privacy; SDAIA: Privacy & Security; ISO: A.7.2, A.7.3, A.7.5; NIST: MAP 2.3; EU: Art. 10 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-DAT-02 | Dubai: Fairness; SDAIA: Fairness, Accountability & Responsibility; ISO: A.7.4, A.7.6; NIST: MAP 2.3; EU: Art. 10; Gov: Code 5.3 | DUB, SDA, XW, NIST, EU, CODE | yes | all refs confirmed |
| CTL-DAT-03 | UAE: Data privacy; Dubai: Privacy; SDAIA: Privacy & Security; ISO: A.2.3, A.7.3; NIST: MEASURE 2.10; Gov: Code 5.2, Code 5.7, Data Sharing Policy Art. 5 | DUB, SDA, XW, NIST, CODE, DSP | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed; DSP ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-DAT-04 | Dubai: Fairness; SDAIA: Fairness; ISO: A.7.4; NIST: MEASURE 2.11; EU: Art. 10 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-DAT-05 | UAE: Algorithmic bias; Dubai: Fairness; SDAIA: Fairness; ISO: A.5.4, A.6.2.4; NIST: MEASURE 2.11; EU: Art. 10 | DUB, SDA, XW, NIST, EU | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-DAT-06 | Dubai: Privacy; SDAIA: Privacy & Security; ISO: A.2.3, A.9.2; NIST: GOVERN 6.1, MEASURE 2.10 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-DAT-07 | SDAIA: Transparency & Explainability; ISO: A.7.3, A.7.5; NIST: MAP 4.1, GOVERN 6.1; EU: Art. 53 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-DAT-08 | Gov: Code 5.3, Code 5.7, Data Sharing Policy Art. 5, Data Sharing Policy Art. 8 | CODE, DSP | yes | new control (27 Sep 2026); all refs confirmed; DSP ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-DAT-09 | Gov: Code 1.5, Code 5.4, Agentic Guide §03, Agentic Guide §06, Data Sharing Policy Art. 5, Data Sharing Policy Art. 8 | CODE, EGS, DSP | yes | new control (27 Sep 2026); all refs confirmed; DSP ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-HUM-01 | UAE: Human oversight; Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.6.1.3; NIST: MAP 3.5, GOVERN 3.2; EU: Art. 14, Art. 26; Gov: Code 5.4, Agentic Guide §05, Agentic Reference p.7 | DUB, SDA, XW, NIST, EU, CODE, EGS, AGR | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed; AGR ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-HUM-02 | Dubai: Accountability; SDAIA: Transparency & Explainability; ISO: A.8.3; NIST: MEASURE 3.3; Gov: Code 2.4, Agentic Guide §03, Agentic Guide §06 | DUB, SDA, XW, NIST, CODE, EGS | yes | all refs confirmed |
| CTL-HUM-03 | ISO: A.4.6; NIST: MAP 3.4, GOVERN 3.2; EU: Art. 14 | XW, NIST, EU | yes | all refs confirmed |
| CTL-HUM-04 | Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.9.4; NIST: MAP 3.3, GOVERN 3.2; EU: Art. 14; Gov: Code 5.4, Agentic Guide §05, Agentic Reference p.8 | DUB, SDA, XW, NIST, EU, CODE, EGS, AGR | yes | all refs confirmed; AGR ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-HUM-05 | UAE: Human oversight; Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.1.3; NIST: MAP 3.5, GOVERN 3.2; EU: Art. 14; Gov: Code 5.2, Agentic Guide §03 | DUB, SDA, XW, NIST, EU, CODE, EGS | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-HUM-06 | Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.6.2.6; NIST: MANAGE 2.4; EU: Art. 14; Gov: Code 5.5 | DUB, SDA, XW, NIST, EU, CODE | yes | all refs confirmed |
| CTL-HUM-07 | Gov: Code 5.2, Agentic Guide §03, Agentic Guide §06 | CODE, EGS | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-HUM-08 | Gov: Code 5.2, Agentic Guide §02, Agentic Guide §06 | CODE, EGS | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-HUM-09 | Gov: Code 1.7, Code 8.2, Agentic Guide §03, Agentic Guide §06 | CODE, EGS | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-HUM-10 | Gov: Code 1.6, Code 5.8, Agentic Guide §03, Agentic Guide §06 | CODE, EGS | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-SEC-01 | UAE: Safety; Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.2.4; NIST: MEASURE 2.5, MEASURE 2.6; EU: Art. 15; Gov: Code 8.8, Agentic Guide §06 | DUB, SDA, XW, NIST, EU, CODE, EGS | no | UAE Charter name(s) unconfirmed (source blocked); all other refs confirmed |
| CTL-SEC-02 | Dubai: Security; SDAIA: Privacy & Security; ISO: A.6.2.2; NIST: MEASURE 2.7; EU: Art. 15 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-SEC-03 | Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.2.4; NIST: MEASURE 2.6 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-SEC-04 | Dubai: Security; SDAIA: Privacy & Security; ISO: A.4.4, A.6.2.2; NIST: MAP 4.2; EU: Art. 15; Gov: Code 5.1, Code 5.7 | DUB, SDA, XW, NIST, EU, CODE | yes | all refs confirmed |
| CTL-SEC-05 | Dubai: Security; SDAIA: Reliability & Safety; ISO: A.6.2.4, A.6.2.5; NIST: MEASURE 2.3, MEASURE 2.6 | DUB, SDA, XW, NIST | yes | all refs confirmed |
| CTL-SEC-06 | SDAIA: Accountability & Responsibility; NIST: MANAGE 2.1, MEASURE 2.6; EU: Art. 15; Gov: Code 8.2 | SDA, NIST, EU, CODE | yes | all refs confirmed |
| CTL-SEC-07 | Dubai: Security; SDAIA: Reliability & Safety; ISO: A.9.4; NIST: MANAGE 1.1; EU: Art. 5 | DUB, SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-SEC-08 | Gov: Code 5.1; Dubai: Security; SDAIA: Privacy & Security | CODE, DUB, SDA | yes | new control (27 Sep 2026); all refs confirmed |
| CTL-MON-01 | SDAIA: Accountability & Responsibility, Reliability & Safety; ISO: A.6.2.6; NIST: MEASURE 2.4, MANAGE 4.1; EU: Art. 26, Art. 72; Gov: Code 2.1 | SDA, XW, NIST, EU, CODE | yes | all refs confirmed |
| CTL-MON-02 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.6.2.8; NIST: MEASURE 2.4; EU: Art. 12, Art. 26; Gov: Code 5.6 | DUB, SDA, XW, NIST, EU, CODE | yes | all refs confirmed |
| CTL-MON-03 | Dubai: Transparency; SDAIA: Transparency & Explainability; ISO: A.6.2.8; NIST: MEASURE 2.4; EU: Art. 12; Gov: Code 5.6, Agentic Guide §06, Agentic Reference p.9 | DUB, SDA, XW, NIST, EU, CODE, EGS, AGR | yes | all refs confirmed; AGR ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-MON-04 | SDAIA: Transparency & Explainability; ISO: A.8.4; NIST: MANAGE 4.3, MANAGE 2.3; EU: Art. 73 | SDA, XW, NIST, EU | yes | all refs confirmed |
| CTL-MON-05 | SDAIA: Reliability & Safety; ISO: A.6.2.6; NIST: GOVERN 1.5, MEASURE 3.1; EU: Art. 9; Gov: Code 2.1 | SDA, XW, NIST, EU, CODE | yes | all refs confirmed |
| CTL-MON-06 | SDAIA: Transparency & Explainability; ISO: A.3.3, A.8.3; NIST: GOVERN 5.1, MEASURE 3.3 | SDA, XW, NIST | yes | all refs confirmed |
| CTL-MON-07 | Dubai: Security; ISO: A.6.2.6; NIST: GOVERN 1.7, MANAGE 2.4 | DUB, XW, NIST | yes | all refs confirmed |
| CTL-MON-08 | Dubai: Security; SDAIA: Accountability & Responsibility; ISO: A.6.2.6; NIST: MEASURE 2.4, MANAGE 2.4; Gov: Code 5.5, Agentic Reference p.8 | DUB, SDA, XW, NIST, CODE, AGR | yes | all refs confirmed; AGR ref(s) confirmed against the text but not publicly hosted, recorded in notes |
| CTL-MON-09 | Gov: Code 2.1, Code 2.3, Agentic Guide §05, Agentic Guide §06; SDAIA: Reliability & Safety; ISO: A.6.2.6; NIST: MEASURE 2.4, MANAGE 1.1 | CODE, EGS, SDA, XW, NIST | yes | new control (27 Sep 2026); all refs confirmed |

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
4. **Agentic controls.** Of the seven frameworks, only the UAE Government Services Code framework has agent-specific
   requirements (per-agent governance review, scope document, stop triggers, logging, consent and handover). For the
   other six, the agentic rows are mapped to the closest general provisions (human oversight, levels of autonomy,
   stop/override, logging, least privilege), and this is interpretive by nature.
5. **SDAIA status.** The 2025 document is listed as a draft (SDAIA-P114E v1), so its principle names may change in
   the final version.
6. **Sources without a public URL (DSP, AGR).** The Data Sharing Policy (May 2026) and the Agentic AI National
   Reference (July 2026) were read in full, and every article or page cited was confirmed in the text. No public URL is
   known for either, so they are recorded in each row's `notes` and not in `source_urls`. No row is verified on the
   strength of these two sources alone: CTL-DAT-08 also rests on Code 5.3 and 5.7, CTL-DAT-09 on Code 1.5 and 5.4 and
   Agentic Guide §03 and §06, and CTL-ACC-11 on NIST MAP 2.1. If a public URL is published, add it to `source_urls`.
7. **Code card attribution.** The Code PDF is laid out in two columns, and the extracted text interleaves requirements
   from neighbouring cards on the same page. Each citation was assigned to its card by the card's own numbered
   requirements and headings on that page. Two assignments rely on this reasoning more than the others: the per-agent
   KPIs (Code 2.3, placed next to card 2.4 on the page) and the agent scope document (Code 5.4, placed next to card 5.5).
   Both were checked against the sequence of requirement numbers in each card, and both fit only the card cited.
8. **EGS notes.** The EGSEP guide blocks scripted access, so it was read in a browser and its sections were noted by
   hand. The §-numbers cited come from those notes.
