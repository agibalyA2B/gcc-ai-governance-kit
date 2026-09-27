# Design brief: gcc-ai-governance-kit

A self-contained brief for the visual design of v0.1.

## What it is
An open, free, bilingual (Arabic/English) web tool for AI governance in the Gulf. A government AI office lead
registers an AI use case, answers a short risk questionnaire (including questions about agentic AI), gets an explainable
risk tier, sees the controls that apply under the frameworks they select, and exports a committee-ready report.
It runs entirely in the browser: no login, no backend. It is a personal open-source project and must NOT look like an
official government product.

## Look and feel
- Calm, authoritative, government-grade and modern, with generous white space.
- Deep teal (#0F5257) primary, sand (#C8A96A) accent, warm off-white (#F6F3EC) muted surfaces, near-black text (#1B2426).
- A subtle Arabic geometric motif ONLY in the hero and empty states. Never in tables or data.
- Type: IBM Plex Sans and IBM Plex Sans Arabic. Arabic line height 1.7.
- Tier colours, always paired with a label and an icon: Little/No #2E7D5B · Limited #B7791F · High #C2410C ·
  Unacceptable #9F1239.
- No government emblems, flags or look-alike official branding.

## Screens to design (EN, and AR mirrored RTL)
1. **Home / Register**
   - Header: logo wordmark "GCC AI Governance Kit"; language toggle "عربي / English"; links to "How scoring works",
     "Templates" and GitHub.
   - Hero line: "Adopt AI governance in one afternoon."
   - Framework selector as checkbox chips: UAE AI Charter · Dubai AI Ethics · SDAIA · ISO/IEC 42001 · NIST AI RMF ·
     EU AI Act.
   - Register table: Name, Owner, AI type, Tier (badge), Deep-dive status, Updated, Actions.
   - Primary button "New use case". Secondary buttons "Import" and "Export register".
   - Also design the empty state, with a "Load 2 sample use cases" button.
2. **Stepper: Details → Quick check**
   - A stepper with the steps Details · Quick check · Tier · Deep-dive · Controls · Export.
   - One question card per question: radio options and an ⓘ explainer.
   - A summary side panel on desktop.
3. **Tier result**
   - A large tier badge, e.g. "High / مرتفع".
   - "Why this tier": the top 3 plain-language reasons, plus the hard trigger shown if one fired.
   - An accordion with the points per factor and the thresholds.
   - A prompt card: "Complete the deep-dive (≈5 min) for a fuller control list."
4. **Controls and export**
   - Controls grouped by theme (Accountability, Transparency, Data, Human oversight, Safety & security, Monitoring).
   - Each row shows: the control title and text, framework reference chips (e.g. "ISO 42001 A.x.y", "NIST GOVERN 1.x",
     "SDAIA"), a source link, and a badge ("Verified ✓" or "Needs verification ⏱").
   - Filters: by framework, and "Verified only".
   - An export bar: "Committee PDF" · "XLSX" · "CSV".
5. **Committee PDF (A4 print layout)**
   - Title: "AI Use-Case Risk Summary".
   - Use-case details, then the tier with its reasons, then the selected frameworks, then the control checklist with
     sources, then a verification note.
   - A sign-off block: Prepared by / Reviewed by / Decision / Date.
   - A footer disclaimer: "Guidance only, not legal advice."

## Sample data to use in the mockups
- **Use case A:** "Citizen service triage agent". Owner: Customer Service Dept. AI type: Agentic. Data: personal. It
  routes requests automatically and a human reviews refusals. It writes to the case system, and its actions are
  reversible. Tier: **High**. Reasons: "Acts on citizen requests", "Writes to a system of record", "Processes personal
  data". 14 controls, 9 of them verified.
- **Use case B:** "Website FAQ chatbot". Owner: Digital Channels. AI type: Generative. Data: none. It gives answers only
  and escalates to a human. Tier: **Limited**. 6 controls, all verified.

## Arabic copy samples (natural MSA)
- "اعتمد حوكمة الذكاء الاصطناعي في فترة ما بعد الظهر" (hero)
- "حالة استخدام جديدة" (New use case)
- "صِف ما يفعله نظام الذكاء الاصطناعي" (Tell us what the AI does)
- "لماذا هذا المستوى؟" (Why this tier?)
- "تم التحقق" / "بحاجة إلى تحقق" (Verified / Needs verification)
- Tiers: "منخفض أو معدوم" · "محدود" · "مرتفع" · "غير مقبول"

## Accessibility
WCAG 2.1 AA contrast. Tier colour is never the only signal. Visible focus states. Full RTL mirroring using logical
properties.

## Please return
1. The 5 screens in EN and AR, at desktop width, plus mobile for Home and Tier result.
2. **Design tokens as JSON**: colours, typography scale, spacing, radius, shadows, and component specs for the tier
   badge, verification badge, chips, stepper and data table. The developers will import this file as
   `design/export/tokens.json`.
