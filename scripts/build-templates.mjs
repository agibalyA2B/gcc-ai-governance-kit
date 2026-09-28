// Builds the offline templates pack (public/templates/{en,ar}/*.{xlsx,csv,md}) from the
// same data the app uses (data/questions.json, data/crosswalk.json, src/i18n/*.json), so the
// spreadsheets stay in sync with the tool. Run via `npm run build:templates`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as XLSX from 'xlsx';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const questionsData = readJson('data/questions.json');
const crosswalk = readJson('data/crosswalk.json');
const enI18n = readJson('src/i18n/en.json');
const arI18n = readJson('src/i18n/ar.json');

const LANGS = ['en', 'ar'];
const T = (key, lang) => (lang === 'ar' ? arI18n : enI18n)[key] ?? key;
const q = (id) => questionsData.questions.find((x) => x.id === id);
const qText = (id, lang) => q(id)[`text_${lang}`];

// Mirrors src/core/frameworks.ts (kept here as data so this script has no dependency on TS sources).
const FRAMEWORKS = [
  { id: 'uae_charter', en: 'UAE AI Charter', ar: 'ميثاق الإمارات للذكاء الاصطناعي' },
  { id: 'uae_gov_code', en: 'UAE Gov Services Code', ar: 'كود الإمارات للخدمات الحكومية' },
  { id: 'dubai_ethics', en: 'Dubai AI Ethics', ar: 'أخلاقيات الذكاء الاصطناعي في دبي' },
  { id: 'sdaia', en: 'SDAIA AI Ethics', ar: 'مبادئ أخلاقيات الذكاء الاصطناعي (سدايا)' },
  { id: 'iso42001', en: 'ISO/IEC 42001', ar: 'آيزو/آي إي سي 42001' },
  { id: 'nist_ai_rmf', en: 'NIST AI RMF', ar: 'إطار NIST لإدارة مخاطر الذكاء الاصطناعي' },
  { id: 'eu_ai_act', en: 'EU AI Act', ar: 'قانون الاتحاد الأوروبي للذكاء الاصطناعي' },
];

// Labels the app's i18n files don't already carry (kept minimal, plain bilingual pairs).
const X = {
  section: { en: 'Section', ar: 'القسم' },
  options: { en: 'Options (points)', ar: 'الخيارات (النقاط)' },
  answer: { en: 'Answer', ar: 'الإجابة' },
  evidenceNotes: { en: 'Evidence / notes', ar: 'الأدلة / الملاحظات' },
  evidence: { en: 'Evidence', ar: 'الأدلة' },
  verification: { en: 'Verification', ar: 'حالة التحقق' },
  appliesFrom: { en: 'Applies from tier', ar: 'يُطبَّق من مستوى المخاطر' },
  resultingTier: { en: 'Resulting tier', ar: 'المستوى الناتج' },
  reasons: { en: 'Reasons', ar: 'الأسباب' },
  vendorAnswer: { en: 'Vendor answer', ar: 'إجابة المورّد' },
  notes: { en: 'Notes', ar: 'الملاحظات' },
  reviewerRating: { en: 'Reviewer rating', ar: 'تقييم المراجع' },
  ratingAcceptable: { en: 'Acceptable', ar: 'مقبول' },
  ratingFollowUp: { en: 'Needs follow-up', ar: 'يحتاج متابعة' },
  ratingUnacceptable: { en: 'Unacceptable', ar: 'غير مقبول' },
  content: { en: 'Content', ar: 'المحتوى' },
  activity: { en: 'Activity', ar: 'النشاط' },
};
// Status column values for the checklist (Not started / In progress / Done) are left as a blank
// cell for the user to fill in; the allowed values are named in the "how to use" note instead.

const LICENCE_LINE = 'Licensed under CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/';

// ---------- generic writers ----------

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsvFile(path, matrix) {
  const body = matrix.map((row) => row.map(csvEscape).join(',')).join('\r\n');
  writeFileSync(path, '﻿' + body, 'utf8');
}

function writeXlsxFile(path, matrix, { rtl, sheetName, colWidths, headerRows = 2 }) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(matrix);
  if (colWidths) ws['!cols'] = colWidths.map((wch) => ({ wch }));
  // Freeze panes: the installed community build of `xlsx` does not persist pane/freeze info on
  // write (only RTL is honoured on write), so header rows are repeated as bold-free plain rows
  // instead of a real frozen pane. `!freeze` is set defensively in case a future version reads it.
  ws['!freeze'] = { xSplit: 0, ySplit: headerRows };
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  wb.Workbook = { Views: [{ RTL: !!rtl }] };
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  writeFileSync(path, buf);
}

function mdEscapeCell(v) {
  return String(v ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function mdTable(headers, rows) {
  const head = `| ${headers.map(mdEscapeCell).join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map(mdEscapeCell).join(' | ')} |`).join('\n');
  return [head, sep, body].join('\n');
}

function writeMdFile(path, { title, lead, intro, sections }) {
  const parts = [`# ${title}`, '', ...(lead ? [`**${lead}**`, ''] : []), intro, '', LICENCE_LINE, ...sections.flatMap((s) => ['', ...s])];
  writeFileSync(path, parts.join('\n') + '\n', 'utf8');
}

// ---------- register.* ----------

const REGISTER_FIELDS = [
  ['id', (lang) => T('rep.id', lang)],
  ['name', (lang) => T('reg.name', lang)],
  ['owner', (lang) => T('reg.owner', lang)],
  ['businessUnit', (lang) => T('uc.businessUnit', lang)],
  ['purpose', (lang) => T('uc.purpose', lang)],
  ['status', (lang) => T('uc.status', lang)],
  ['product', (lang) => T('uc.product', lang)],
  ['deployment', (lang) => T('uc.deployment', lang)],
  ['runtime_ai', (lang) => qText('runtime_ai', lang)],
  ['ai_type', (lang) => T('reg.type', lang)],
  ['impact', (lang) => qText('impact', lang)],
  ['data', (lang) => qText('data', lang)],
  ['affected', (lang) => qText('affected', lang)],
  ['autonomy', (lang) => qText('autonomy', lang)],
  ['oversight', (lang) => qText('oversight', lang)],
  ['access', (lang) => qText('access', lang)],
  ['reversibility', (lang) => qText('reversibility', lang)],
  ['tier', (lang) => T('reg.tier', lang)],
  ['deep_dive_complete', (lang) => T('reg.deep', lang)],
  ['updatedAt', (lang) => T('reg.updated', lang)],
];

const REGISTER_EXAMPLES = {
  en: [
    {
      id: 'uc-example-chatbot', name: 'Website FAQ chatbot', owner: 'Digital Channels', businessUnit: 'Customer Experience',
      purpose: 'Answers general questions and hands over to a person when needed.', status: 'production', runtime_ai: 'yes', ai_type: 'generative',
      impact: 'public-info', data: 'none', affected: 'public', autonomy: 'monitored', oversight: 'exceptions', access: 'none',
      reversibility: 'easy', tier: 'limited', deep_dive_complete: 'false', updatedAt: '2026-01-15',
    },
    {
      id: 'uc-example-triage', name: 'Citizen service triage agent', owner: 'Customer Service Dept.', businessUnit: 'Operations',
      purpose: 'Routes incoming requests automatically; staff review refusals.', status: 'pilot', runtime_ai: 'yes', ai_type: 'agentic',
      impact: 'recommend-individuals', data: 'personal', affected: 'public', autonomy: 'monitored', oversight: 'exceptions',
      access: 'record', reversibility: 'easy', tier: 'high', deep_dive_complete: 'false', updatedAt: '2026-01-15',
    },
  ],
  ar: [
    {
      id: 'uc-example-chatbot', name: 'روبوت محادثة للأسئلة الشائعة', owner: 'القنوات الرقمية', businessUnit: 'تجربة المتعاملين',
      purpose: 'يجيب عن الأسئلة العامة ويحيل إلى موظف عند الحاجة.', status: 'production', runtime_ai: 'yes', ai_type: 'generative',
      impact: 'public-info', data: 'none', affected: 'public', autonomy: 'monitored', oversight: 'exceptions', access: 'none',
      reversibility: 'easy', tier: 'limited', deep_dive_complete: 'false', updatedAt: '2026-01-15',
    },
    {
      id: 'uc-example-triage', name: 'وكيل فرز طلبات خدمات المتعاملين', owner: 'إدارة خدمة المتعاملين', businessUnit: 'العمليات',
      purpose: 'يوجّه الطلبات الواردة تلقائياً، ويراجع موظفٌ حالات الرفض.', status: 'pilot', runtime_ai: 'yes', ai_type: 'agentic',
      impact: 'recommend-individuals', data: 'personal', affected: 'public', autonomy: 'monitored', oversight: 'exceptions',
      access: 'record', reversibility: 'easy', tier: 'high', deep_dive_complete: 'false', updatedAt: '2026-01-15',
    },
  ],
};

function buildRegister(lang) {
  const machineHeader = REGISTER_FIELDS.map(([key]) => key);
  const humanHeader = REGISTER_FIELDS.map(([, label]) => label(lang));
  const dataRows = REGISTER_EXAMPLES[lang].map((row) => REGISTER_FIELDS.map(([key]) => row[key]));
  return { machineHeader, humanHeader, dataRows };
}

// ---------- impact-assessment.* ----------

const IMPACT_FIELDS = ['section', 'question', 'options', 'answer', 'evidence'];

function impactHumanHeader(lang) {
  return [X.section[lang], T('tier.question', lang), X.options[lang], X.answer[lang], X.evidenceNotes[lang]];
}

function buildImpactAssessment(lang) {
  const machineHeader = IMPACT_FIELDS;
  const humanHeader = impactHumanHeader(lang);
  const questionRows = questionsData.questions.map((qq) => [
    qq.level === 'intake' ? T('intake.label', lang) : qq.level === 'quick' ? T('step.quick', lang) : qq.level === 'deep' ? T('step.deep', lang) : T('prio.title', lang),
    qq[`text_${lang}`],
    qq.options.map((o) => (qq.level === 'prio' || qq.level === 'intake' ? o[lang] : `${o[lang]} (${o.points})`)).join('; '),
    '',
    '',
  ]);
  const resultRows = [
    ['', X.resultingTier[lang], '', '', ''],
    ['', X.reasons[lang], '', '', ''],
    ['', T('rep.signoff', lang), '', '', ''],
    ['', T('rep.prepared', lang), '', '', ''],
    ['', T('rep.reviewed', lang), '', '', ''],
    ['', T('rep.decision', lang), '', '', ''],
    ['', T('rep.date', lang), '', '', ''],
  ];
  return { machineHeader, humanHeader, questionRows, resultRows };
}

// ---------- control-checklist.* ----------

const CHECKLIST_FIELDS = [
  ['id', (lang) => T('rep.id', lang)],
  ['theme', (lang) => T('rep.theme', lang)],
  ['title', (lang) => T('rep.control', lang)],
  ['control_text', (lang) => T('rep.text', lang)],
  ['references', (lang) => T('rep.refs', lang)],
  ['verified', (lang) => X.verification[lang]],
  ['applies_from_tier', (lang) => X.appliesFrom[lang]],
  ['owner', (lang) => T('reg.owner', lang)],
  ['status', (lang) => T('uc.status', lang)],
  ['evidence', (lang) => X.evidence[lang]],
];

function controlRow(c, lang) {
  const references = FRAMEWORKS
    .map((fw) => {
      const refs = c.refs[fw.id] ?? [];
      return refs.length ? `${fw[lang]}: ${refs.join(', ')}` : null;
    })
    .filter(Boolean)
    .join('; ');
  return {
    id: c.id,
    theme: T(`theme.${c.theme}`, lang),
    title: c[`title_${lang}`],
    control_text: c[`control_text_${lang}`],
    references,
    verified: c.verified ? T('ctl.verified', lang) : T('ctl.needs', lang),
    applies_from_tier: T(`tier.${c.applies_when.min_tier}`, lang),
    owner: '',
    status: '',
    evidence: '',
  };
}

function buildChecklist(lang) {
  const machineHeader = CHECKLIST_FIELDS.map(([key]) => key);
  const humanHeader = CHECKLIST_FIELDS.map(([, label]) => label(lang));
  const dataRows = crosswalk.map((c) => {
    const row = controlRow(c, lang);
    return CHECKLIST_FIELDS.map(([key]) => row[key]);
  });
  return { machineHeader, humanHeader, dataRows };
}

// ---------- vendor-ai-risk-assessment.* ----------
// Extends control CTL-ACC-06, "Third-party AI due diligence" (see data/crosswalk.json).

const VENDOR_SECTIONS = {
  model_provenance: { en: 'Model and provenance', ar: 'النموذج ومصدره' },
  data_handling: { en: 'Data handling and residency', ar: 'معالجة البيانات ومكان تخزينها' },
  security_testing: { en: 'Security testing', ar: 'اختبار الأمان' },
  documentation_limitations: { en: 'Documentation and known limitations', ar: 'التوثيق والحدود المعروفة' },
  performance_bias: { en: 'Performance and bias evaluation evidence', ar: 'أدلة تقييم الأداء والتحيز' },
  incident_change: { en: 'Incident and change notification', ar: 'الإخطار بالحوادث والتغييرات' },
  human_oversight: { en: 'Human oversight support', ar: 'دعم الإشراف البشري' },
  contract_exit: { en: 'Contract terms and exit/portability', ar: 'الشروط التعاقدية والخروج وقابلية النقل' },
};

const VENDOR_QUESTIONS = [
  { section: 'model_provenance', en: 'Who developed and trains the underlying model — an in-house team, a licensed foundation model, or an open-source model?', ar: 'من الذي طوّر النموذج الأساسي ويتولى تدريبه — فريق داخلي، أم نموذج أساسي مرخّص، أم نموذج مفتوح المصدر؟' },
  { section: 'model_provenance', en: 'Which model name and version is being proposed, and how will we be notified when it changes?', ar: 'ما اسم النموذج والإصدار المقترح، وكيف سنُخطَر عند تغييره؟' },
  { section: 'model_provenance', en: "What is the model's training-data cut-off date, and what are its general training-data sources (to the extent disclosed)?", ar: 'ما تاريخ آخر تحديث لبيانات تدريب النموذج، وما مصادر بيانات التدريب العامة (بالقدر الذي يُفصَح عنه)؟' },
  { section: 'model_provenance', en: 'How often is the model retrained or updated, and can an update change its behaviour without prior notice?', ar: 'كم مرة يُعاد تدريب النموذج أو تحديثه، وهل يمكن أن يغيّر التحديث سلوك النموذج دون إشعار مسبق؟' },
  { section: 'model_provenance', en: 'Is a model card or an equivalent technical summary available for our review?', ar: 'هل تتوفر بطاقة وصف للنموذج (model card) أو ملخص تقني مماثل يمكن مراجعته؟' },
  { section: 'data_handling', en: 'In which countries or regions is our data processed and stored?', ar: 'في أي دول أو مناطق تُعالَج بياناتنا وتُخزَّن؟' },
  { section: 'data_handling', en: 'Can data residency be restricted to a specific region or jurisdiction on request?', ar: 'هل يمكن حصر مكان تخزين البيانات في منطقة أو ولاية قضائية محددة بناءً على طلبنا؟' },
  { section: 'data_handling', en: 'How long is our data retained, and can we request that it be deleted earlier?', ar: 'ما مدة الاحتفاظ ببياناتنا، وهل يمكننا طلب حذفها قبل ذلك؟' },
  { section: 'data_handling', en: "Is our data used to train or fine-tune the vendor's models, and is there an opt-out?", ar: 'هل تُستخدم بياناتنا لتدريب نماذج المورّد أو ضبطها، وهل يتوفر خيار لإيقاف ذلك؟' },
  { section: 'data_handling', en: 'Which sub-processors or downstream providers have access to our data, and is a current list available?', ar: 'من هي الجهات الفرعية المعالِجة أو مقدّمو الخدمات التابعون الذين يصلون إلى بياناتنا، وهل تتوفر قائمة محدّثة بهم؟' },
  { section: 'data_handling', en: 'What encryption is applied to our data in transit and at rest?', ar: 'ما نوع التشفير المطبَّق على بياناتنا أثناء النقل وأثناء التخزين؟' },
  { section: 'security_testing', en: 'Has the model or service been tested for prompt-injection vulnerabilities, and what were the results?', ar: 'هل خضع النموذج أو الخدمة لاختبار ثغرات حقن الأوامر (prompt injection)، وما نتائج هذا الاختبار؟' },
  { section: 'security_testing', en: 'Has independent red-team or adversarial testing — including jailbreak attempts — been carried out?', ar: 'هل أُجري اختبار مستقل من فريق أحمر أو اختبار عدائي، بما يشمل محاولات كسر القيود (jailbreak)؟' },
  { section: 'security_testing', en: 'Is there a documented, accessible process for reporting security vulnerabilities to the vendor?', ar: 'هل توجد لدى المورّد آلية موثّقة ومتاحة للإبلاغ عن الثغرات الأمنية؟' },
  { section: 'security_testing', en: "What is the vendor's typical time to acknowledge and remediate a reported vulnerability?", ar: 'ما المدة المعتادة التي يستغرقها المورّد للإقرار بالثغرة المبلَّغ عنها ومعالجتها؟' },
  { section: 'security_testing', en: 'Does the vendor hold relevant security certifications, such as ISO/IEC 27001 or SOC 2?', ar: 'هل يحمل المورّد شهادات أمنية ذات صلة، مثل آيزو/آي إي سي 27001 أو SOC 2؟' },
  { section: 'documentation_limitations', en: "Is there documentation of the model's intended use cases and of uses it is not designed or approved for?", ar: 'هل يوجد توثيق لحالات الاستخدام المقصودة للنموذج، وللاستخدامات التي لم يُصمَّم أو يُعتمَد من أجلها؟' },
  { section: 'documentation_limitations', en: 'Are known failure modes, limitations and edge cases disclosed?', ar: 'هل يُفصَح عن أنماط الفشل المعروفة، وحدود النموذج، والحالات الاستثنائية؟' },
  { section: 'documentation_limitations', en: "Is guidance provided on how to correctly interpret the model's outputs or confidence scores?", ar: 'هل تتوفر إرشادات حول الطريقة الصحيحة لتفسير مخرجات النموذج أو درجات الثقة الخاصة به؟' },
  { section: 'performance_bias', en: 'What evidence is available of performance testing on data relevant to our use case or user population?', ar: 'ما الأدلة المتاحة على اختبار الأداء باستخدام بيانات ذات صلة بحالة استخدامنا أو الفئة المستفيدة لدينا؟' },
  { section: 'performance_bias', en: 'Has the model been evaluated for bias or for uneven performance across different demographic groups?', ar: 'هل خضع النموذج لتقييم للتحيز أو لتفاوت الأداء بين الفئات السكانية المختلفة؟' },
  { section: 'performance_bias', en: 'Are accuracy, error-rate or other relevant performance metrics shared, and under what test conditions were they measured?', ar: 'هل تُشارَك مقاييس الدقة أو معدل الخطأ أو غيرها من مؤشرات الأداء ذات الصلة، وما ظروف الاختبار التي قيست في ظلها؟' },
  { section: 'incident_change', en: "What is the vendor's process and timeline for notifying us of a security or data-privacy incident?", ar: 'ما آلية المورّد وجدوله الزمني لإخطارنا في حال وقوع حادثة أمنية أو تتعلق بخصوصية البيانات؟' },
  { section: 'incident_change', en: 'Will we be notified in advance of material changes to the model, pricing or contract terms?', ar: 'هل سنُخطَر مسبقاً بأي تغييرات جوهرية في النموذج أو التسعير أو الشروط التعاقدية؟' },
  { section: 'incident_change', en: 'Is there a status page or notification channel for service outages or degraded performance?', ar: 'هل تتوفر صفحة حالة أو قناة إشعار لانقطاع الخدمة أو تراجع أدائها؟' },
  { section: 'human_oversight', en: 'Does the service provide logs sufficient to review or audit individual outputs or decisions?', ar: 'هل توفّر الخدمة سجلات كافية لمراجعة أو تدقيق المخرجات أو القرارات الفردية؟' },
  { section: 'human_oversight', en: 'Can a human reviewer override, correct or reject an output before it takes effect?', ar: 'هل يمكن لمراجِع بشري تجاوز مخرَج ما أو تصحيحه أو رفضه قبل أن يصبح نافذاً؟' },
  { section: 'human_oversight', en: 'Can we disable or stop the service quickly if a serious problem is discovered?', ar: 'هل يمكننا إيقاف الخدمة أو تعطيلها بسرعة في حال اكتشاف مشكلة جسيمة؟' },
  { section: 'contract_exit', en: "Does the contract clearly define each party's responsibilities for oversight, monitoring and incident response?", ar: 'هل يحدّد العقد بوضوح مسؤوليات كل طرف في الإشراف والمراقبة والاستجابة للحوادث؟' },
  { section: 'contract_exit', en: "Do we have audit rights over the vendor's controls, directly or through an independent report?", ar: 'هل لدينا حق تدقيق ضوابط المورّد، سواء بشكل مباشر أو من خلال تقرير مستقل؟' },
  { section: 'contract_exit', en: 'What are the liability and indemnity terms if the AI causes harm or loss?', ar: 'ما شروط المسؤولية والتعويض في حال تسبّب الذكاء الاصطناعي بضرر أو خسارة؟' },
  { section: 'contract_exit', en: 'Can we export our data and configuration in a usable format if we end the contract?', ar: 'هل يمكننا تصدير بياناتنا وإعداداتنا بصيغة قابلة للاستخدام في حال إنهاء العقد؟' },
  { section: 'contract_exit', en: 'What is the notice period and transition support for moving to another vendor?', ar: 'ما مدة الإشعار المطلوبة والدعم المتاح للانتقال إلى مورّد آخر؟' },
];

const VENDOR_FIELDS = ['section', 'question', 'vendor_answer', 'evidence', 'reviewer_rating', 'notes'];

function buildVendorAssessment(lang) {
  const machineHeader = VENDOR_FIELDS;
  const humanHeader = [X.section[lang], T('tier.question', lang), X.vendorAnswer[lang], X.evidence[lang], X.reviewerRating[lang], X.notes[lang]];
  const dataRows = VENDOR_QUESTIONS.map((qq) => [VENDOR_SECTIONS[qq.section][lang], qq[lang], '', '', '', '']);
  return { machineHeader, humanHeader, dataRows };
}

// ---------- committee-charter.* ----------

const CHARTER_SECTIONS = [
  {
    id: 'purpose',
    title: { en: 'Purpose', ar: 'الغرض' },
    content: (lang) => (lang === 'ar'
      ? 'يُنشئ هذا الميثاق لجنة حوكمة الذكاء الاصطناعي في [المؤسسة]. تتولى اللجنة مراجعة حالات استخدام الذكاء الاصطناعي في ضوء إطار تصنيف المخاطر والضوابط المعتمد لدى المؤسسة، وتصدر قرارات الاعتماد اللازمة قبل تفعيل حالة الاستخدام أو استمرارها في التشغيل.'
      : 'This charter establishes the AI governance committee for [Organisation]. The committee reviews AI use cases against the organisation\'s risk-tiering and control framework, and takes the approval decisions needed before a use case can go live or continue in production.'),
  },
  {
    id: 'scope',
    title: { en: 'Scope', ar: 'النطاق' },
    content: (lang) => (lang === 'ar'
      ? `تُعرَض حالات استخدام الذكاء الاصطناعي على اللجنة وفق مستوى مخاطرها: تُعرَض عليها دائماً الحالات المصنَّفة ${T('tier.high', lang)}؛ وتُعرَض عليها عند الطلب فقط الحالات المصنَّفة ${T('tier.limited', lang)} (على سبيل المثال، بحسب تقدير مالك حالة الاستخدام أو المراجع)؛ أما الحالات المصنَّفة ${T('tier.unacceptable', lang)} فتُرفَض ولا تُعرَض على اللجنة.`
      : `AI use cases come to the committee according to their risk tier: ${T('tier.high', lang)} use cases always come to the committee; ${T('tier.limited', lang)} use cases come to the committee on request (for example, at the business owner's or reviewer's discretion); ${T('tier.unacceptable', lang)} uses are rejected and do not proceed to committee review.`),
  },
  {
    id: 'membership',
    title: { en: 'Membership', ar: 'العضوية' },
    content: (lang) => (lang === 'ar'
      ? 'العضوية تكون حسب الدور الوظيفي وليس حسب الأفراد بالاسم، وتُسند كل مؤسسة موظفيها إلى هذه الأدوار: رئيس اللجنة؛ ممثل المخاطر والامتثال؛ ممثل حماية البيانات؛ ممثل أمن المعلومات؛ الممثل القانوني؛ مالك حالة الاستخدام قيد المراجعة؛ والتدقيق الداخلي بصفة مراقب لا يملك حق التصويت.'
      : "Membership is by role, not by named individual, and each organisation maps its own staff to these roles: chair; risk and compliance; data protection; IT security; legal; the business owner of the use case under review; and internal audit as a non-voting observer."),
  },
  {
    id: 'quorum',
    title: { en: 'Quorum', ar: 'النصاب' },
    content: (lang) => (lang === 'ar'
      ? 'يتحقق النصاب القانوني بحضور رئيس اللجنة (أو من ينوب عنه) إلى جانب ثلاثة أعضاء تصويت آخرين على الأقل، من بينهم ممثل المخاطر والامتثال، وممثل واحد على الأقل من حماية البيانات أو أمن المعلومات. لا يُشترط حضور التدقيق الداخلي لاكتمال النصاب، بصفته مراقباً لا يصوّت.'
      : "A quorum requires the chair (or a delegate) plus at least three other voting members, including risk and compliance and at least one of data protection or IT security. Internal audit's attendance is not required for quorum, as it is a non-voting observer."),
  },
  {
    id: 'decision_rights',
    title: { en: 'Decision rights', ar: 'صلاحيات القرار' },
    content: (lang) => (lang === 'ar'
      ? `تسجّل اللجنة لكل حالة استخدام تراجعها أحد ثلاثة قرارات، بما يطابق قسم الاعتماد في تقرير حالة الاستخدام: ${T('rep.approve', lang)} / ${T('rep.conditions', lang)} / ${T('rep.reject', lang)}.`
      : `For each use case reviewed, the committee records one of three decisions, matching the sign-off block in the use-case report: ${T('rep.approve', lang)} / ${T('rep.conditions', lang)} / ${T('rep.reject', lang)}.`),
  },
  {
    id: 'inputs',
    title: { en: 'Inputs', ar: 'المدخلات' },
    content: (lang) => (lang === 'ar'
      ? 'قبل مراجعة حالة الاستخدام، تتوقع اللجنة توفر: سجل الحالة مكتملاً؛ وتقييم الأثر؛ وقائمة التحقق من الضوابط مرفقة بالأدلة؛ وعند استخدام نموذج أو خدمة من طرف ثالث، تقييم مخاطر المورّد.'
      : 'Before reviewing a use case, the committee expects: the completed register entry; the impact assessment; the control checklist with evidence attached; and, where a third-party model or service is involved, the vendor AI risk assessment.'),
  },
  {
    id: 'cadence',
    title: { en: 'Meeting cadence', ar: 'وتيرة الاجتماعات' },
    content: (lang) => (lang === 'ar'
      ? 'تجتمع اللجنة وفق وتيرة محددة (شهرياً مثلاً)، ويمكن عقد اجتماع استثنائي للحالات المرتفعة المخاطر العاجلة أو الحوادث التي تتطلب قراراً سريعاً.'
      : 'The committee meets on a set cadence (for example, monthly) and can convene an extraordinary session for urgent high-risk use cases or incidents that need a fast decision.'),
  },
  {
    id: 'escalation',
    title: { en: 'Escalation', ar: 'التصعيد' },
    content: (lang) => (lang === 'ar'
      ? 'تُصعَّد الخلافات التي لا يمكن حلّها داخل اللجنة، أو المسائل التي تمسّ شهية المخاطر العامة لدى [المؤسسة]، إلى [الراعي التنفيذي / لجنة المخاطر].'
      : "Disagreements that cannot be resolved within the committee, or matters affecting [Organisation]'s overall risk appetite, are escalated to [executive sponsor / risk committee]."),
  },
  {
    id: 'records',
    title: { en: 'Record-keeping', ar: 'حفظ السجلات' },
    content: (lang) => (lang === 'ar'
      ? 'يُحتفَظ بمحاضر الاجتماعات والقرارات والأدلة الداعمة وفق سياسة الاحتفاظ بالسجلات لدى [المؤسسة]، وتُتاح للتدقيق الداخلي عند الطلب.'
      : "Meeting minutes, decisions and supporting evidence are retained per [Organisation]'s records-retention policy and made available to internal audit on request."),
  },
  {
    id: 'review',
    title: { en: 'Annual charter review', ar: 'المراجعة السنوية للميثاق' },
    content: (lang) => (lang === 'ar'
      ? 'تتم مراجعة هذا الميثاق مرة واحدة على الأقل سنوياً، أو في وقت أقرب إذا طرأ تغيير جوهري على إطار مخاطر الذكاء الاصطناعي لدى [المؤسسة]، وتُعتمد التحديثات من قبل [الراعي التنفيذي].'
      : "This charter is reviewed at least once a year, or sooner if [Organisation]'s AI risk framework changes materially, with updates approved by [executive sponsor]."),
  },
];

function buildCharter(lang) {
  const machineHeader = ['section', 'content'];
  const humanHeader = [X.section[lang], X.content[lang]];
  const dataRows = CHARTER_SECTIONS.map((s) => [s.title[lang], s.content(lang)]);
  return { machineHeader, humanHeader, dataRows };
}

// ---------- raci.* ----------

const RACI_ROLES = [
  { id: 'uc_owner', en: 'Use-case owner', ar: 'مالك حالة الاستخدام' },
  { id: 'committee', en: 'AI governance committee', ar: 'لجنة حوكمة الذكاء الاصطناعي' },
  { id: 'risk_compliance', en: 'Risk & compliance', ar: 'المخاطر والامتثال' },
  { id: 'dpo', en: 'Data protection officer', ar: 'مسؤول حماية البيانات' },
  { id: 'it_security', en: 'IT security', ar: 'أمن المعلومات' },
  { id: 'legal', en: 'Legal', ar: 'الشؤون القانونية' },
  { id: 'procurement', en: 'Procurement', ar: 'المشتريات' },
  { id: 'internal_audit', en: 'Internal audit', ar: 'التدقيق الداخلي' },
];

// Exactly one "A" per row (see RACI_ROLES for the role order); other cells are R, C, I or blank.
const RACI_ACTIVITIES = [
  { en: 'Register a use case', ar: 'تسجيل حالة استخدام', letters: { uc_owner: 'A', risk_compliance: 'I' } },
  { en: 'Quick-check risk tiering', ar: 'الفحص السريع لتصنيف المخاطر', letters: { uc_owner: 'A', committee: 'I', risk_compliance: 'C' } },
  { en: 'Deep-dive assessment', ar: 'التقييم المعمّق', letters: { uc_owner: 'A', risk_compliance: 'C', dpo: 'C', it_security: 'C', committee: 'I' } },
  { en: 'Select and implement controls', ar: 'اختيار الضوابط وتنفيذها', letters: { uc_owner: 'R', risk_compliance: 'A', dpo: 'C', it_security: 'C', committee: 'I' } },
  { en: 'Collect control evidence', ar: 'جمع أدلة الضوابط', letters: { uc_owner: 'A', risk_compliance: 'C', internal_audit: 'I' } },
  { en: 'Third-party/vendor AI assessment', ar: 'تقييم مخاطر موردي الذكاء الاصطناعي من طرف ثالث', letters: { uc_owner: 'R', procurement: 'R', risk_compliance: 'A', dpo: 'C', it_security: 'C', legal: 'C', committee: 'I' } },
  { en: 'Committee review and approval', ar: 'مراجعة اللجنة واعتمادها', letters: { committee: 'A', uc_owner: 'I', risk_compliance: 'C', internal_audit: 'I' } },
  { en: 'Go-live decision', ar: 'قرار التفعيل', letters: { committee: 'A', uc_owner: 'R', risk_compliance: 'C', it_security: 'C' } },
  { en: 'Monitoring and KPIs', ar: 'المراقبة ومؤشرات الأداء', letters: { uc_owner: 'A', risk_compliance: 'C', committee: 'I' } },
  { en: 'Incident handling', ar: 'التعامل مع الحوادث', letters: { risk_compliance: 'A', uc_owner: 'R', it_security: 'R', dpo: 'C', legal: 'C', committee: 'I' } },
  { en: 'Periodic reassessment', ar: 'إعادة التقييم الدورية', letters: { uc_owner: 'A', risk_compliance: 'C', committee: 'I' } },
  { en: 'Retirement', ar: 'إيقاف الاستخدام (التقاعد)', letters: { uc_owner: 'A', it_security: 'C', risk_compliance: 'I', committee: 'I' } },
];

// Shown on every RACI file: the letters are this kit's suggestion, not taken from any standard.
const RACI_DISCLAIMER = {
  en: 'Illustrative starting point. Adapt the roles to your organisation.',
  ar: 'نقطة انطلاق توضيحية. عدّل الأدوار بما يلائم مؤسستك.',
};

function buildRaci(lang) {
  const machineHeader = ['activity', ...RACI_ROLES.map((r) => r.id)];
  const humanHeader = [X.activity[lang], ...RACI_ROLES.map((r) => r[lang])];
  const dataRows = RACI_ACTIVITIES.map((a) => [a[lang], ...RACI_ROLES.map((r) => a.letters[r.id] ?? '')]);
  return { machineHeader, humanHeader, dataRows };
}

// ---------- assembling + writing per language ----------

const HOW_TO = {
  register: {
    en: 'List every AI use case here — one row per use case — using the same field names as the app (row 1) so a completed register can be re-imported later; row 2 gives the human-readable label for each column. The two example rows show a low-risk chatbot and a high-risk agent scored with the option ids from data/questions.json.',
    ar: 'سجّل هنا كل حالات استخدام الذكاء الاصطناعي — صفٌّ واحد لكل حالة — باستخدام أسماء الحقول نفسها التي يستخدمها التطبيق (الصف الأول)، ليتيح ذلك إعادة استيراد السجل لاحقاً؛ ويوضح الصف الثاني التسمية المقروءة لكل عمود. يعرض الصفّان المثاليان روبوت محادثة منخفض المخاطر ووكيلاً مرتفع المخاطر، وقد قُيِّما باستخدام رموز الخيارات من data/questions.json.',
  },
  impact: {
    en: 'Work through this sheet question by question — quick check first, then the deep-dive — recording an answer and any supporting evidence for each. Use the result section at the end to record the tier this use case lands in, the main reasons, and the sign-off.',
    ar: 'اعمل على هذه الورقة سؤالاً بسؤال — الفحص السريع أولاً، ثم التقييم المعمّق — وسجّل إجابة وما يدعمها من أدلة لكل سؤال. استخدم قسم النتيجة في النهاية لتسجيل المستوى الذي وصلت إليه هذه الحالة، وأهم الأسباب، والاعتماد.',
  },
  checklist: {
    en: 'One row per control from the crosswalk. Confirm each control that applies to your use case (by tier, framework reference and verification status), then assign an owner, set Status to Not started / In progress / Done, and attach evidence as you implement it.',
    ar: 'صفّ واحد لكل ضابط من جدول المطابقة. تحقق من كل ضابط ينطبق على حالتك (وفق المستوى والمرجع الإطاري وحالة التحقق)، ثم عيّن مسؤولاً، وحدّد الحالة (لم يبدأ / قيد التنفيذ / مكتمل)، وأرفق الأدلة أثناء التنفيذ.',
  },
  vendor: {
    en: 'Use this questionnaire when buying or integrating a third-party AI model or service — it extends control CTL-ACC-06, "Third-party AI due diligence", from the crosswalk. Send the questions to the vendor, record their answer and any supporting evidence, then have a reviewer set a rating of Acceptable / Needs follow-up / Unacceptable for each item and add notes.',
    ar: 'استخدم هذا الاستبيان عند شراء نموذج أو خدمة ذكاء اصطناعي من طرف ثالث أو دمجها — فهو امتداد للضابط CTL-ACC-06، "العناية الواجبة تجاه موردي الذكاء الاصطناعي"، من جدول المطابقة. أرسل الأسئلة إلى المورّد، وسجّل إجابته وما يدعمها من أدلة، ثم يحدّد المراجع تقييماً لكل بند: مقبول / يحتاج متابعة / غير مقبول، مع إضافة الملاحظات.',
  },
  charter: {
    en: 'Adapt this charter for your organisation: replace the bracketed placeholders, confirm the membership roles and quorum against your own structure, and have it approved using the same decision rights the committee itself uses (Approve / Approve with conditions / Reject).',
    ar: 'عدّل هذا الميثاق ليلائم مؤسستك: استبدل العناصر النائبة الموضوعة بين قوسين، وتحقق من أدوار العضوية والنصاب بما يتوافق مع هيكل مؤسستك، واعتمده وفق صلاحيات القرار نفسها التي تستخدمها اللجنة (اعتماد / اعتماد بشروط / رفض).',
  },
  raci: {
    en: 'R = Responsible (does the work), A = Accountable (owns the outcome and signs it off — exactly one per row), C = Consulted (gives input beforehand), I = Informed (kept up to date afterwards). Adjust role names to match your own organisation structure.',
    ar: 'R = منفِّذ (يقوم بالعمل)، A = مسؤول (يملك النتيجة ويعتمدها — دور واحد فقط في كل صف)، C = مُستشار (يُستشار قبل التنفيذ)، I = يُبلَّغ (يُطلَع على النتيجة لاحقاً). عدّل أسماء الأدوار بما يلائم هيكل مؤسستك.',
  },
};

const TITLES = {
  register: { en: 'AI Use-Case Register', ar: 'سجل حالات استخدام الذكاء الاصطناعي' },
  impact: { en: 'AI Impact Assessment', ar: 'تقييم أثر الذكاء الاصطناعي' },
  checklist: { en: 'AI Control Checklist', ar: 'قائمة التحقق من ضوابط الذكاء الاصطناعي' },
  vendor: { en: 'Vendor AI Risk Assessment', ar: 'تقييم مخاطر موردي الذكاء الاصطناعي' },
  charter: { en: 'AI Governance Committee Charter', ar: 'ميثاق لجنة حوكمة الذكاء الاصطناعي' },
  raci: { en: 'AI Governance RACI Matrix', ar: 'مصفوفة المسؤوليات (RACI) لحوكمة الذكاء الاصطناعي' },
};

function outDir(lang) {
  const dir = join(ROOT, 'public/templates', lang);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function buildForLang(lang) {
  const dir = outDir(lang);
  const rtl = lang === 'ar';

  // register
  {
    const { machineHeader, humanHeader, dataRows } = buildRegister(lang);
    const matrix = [machineHeader, humanHeader, ...dataRows];
    const widths = [14, 28, 20, 20, 40, 14, 14, 30, 26, 22, 26, 26, 26, 24, 14, 18, 14];
    writeXlsxFile(join(dir, 'register.xlsx'), matrix, { rtl, sheetName: 'Register', colWidths: widths });
    writeCsvFile(join(dir, 'register.csv'), matrix);
    writeMdFile(join(dir, 'register.md'), {
      title: TITLES.register[lang],
      intro: HOW_TO.register[lang],
      sections: [[mdTable(humanHeader, dataRows)]],
    });
  }

  // impact-assessment
  {
    const { machineHeader, humanHeader, questionRows, resultRows } = buildImpactAssessment(lang);
    const matrix = [machineHeader, humanHeader, ...questionRows, ['', '', '', '', ''], ...resultRows];
    const widths = [14, 52, 60, 20, 30];
    writeXlsxFile(join(dir, 'impact-assessment.xlsx'), matrix, { rtl, sheetName: 'Impact assessment', colWidths: widths });
    writeCsvFile(join(dir, 'impact-assessment.csv'), matrix);
    const signoffTable = mdTable(
      [T('tier.question', lang), X.answer[lang]],
      [
        [X.resultingTier[lang], ''],
        [X.reasons[lang], ''],
        [T('rep.prepared', lang), ''],
        [T('rep.reviewed', lang), ''],
        [T('rep.decision', lang), ''],
        [T('rep.date', lang), ''],
      ],
    );
    writeMdFile(join(dir, 'impact-assessment.md'), {
      title: TITLES.impact[lang],
      intro: HOW_TO.impact[lang],
      sections: [
        [mdTable(humanHeader, questionRows)],
        [`## ${T('rep.signoff', lang)}`, '', signoffTable],
      ],
    });
  }

  // control-checklist
  {
    const { machineHeader, humanHeader, dataRows } = buildChecklist(lang);
    const matrix = [machineHeader, humanHeader, ...dataRows];
    const widths = [12, 16, 30, 60, 55, 20, 18, 18, 14, 24];
    writeXlsxFile(join(dir, 'control-checklist.xlsx'), matrix, { rtl, sheetName: 'Control checklist', colWidths: widths });
    writeCsvFile(join(dir, 'control-checklist.csv'), matrix);
    writeMdFile(join(dir, 'control-checklist.md'), {
      title: TITLES.checklist[lang],
      intro: HOW_TO.checklist[lang],
      sections: [[mdTable(humanHeader, dataRows)]],
    });
  }

  // vendor-ai-risk-assessment
  {
    const { machineHeader, humanHeader, dataRows } = buildVendorAssessment(lang);
    const matrix = [machineHeader, humanHeader, ...dataRows];
    const widths = [26, 60, 30, 30, 20, 30];
    writeXlsxFile(join(dir, 'vendor-ai-risk-assessment.xlsx'), matrix, { rtl, sheetName: 'Vendor AI risk assessment', colWidths: widths });
    writeCsvFile(join(dir, 'vendor-ai-risk-assessment.csv'), matrix);
    writeMdFile(join(dir, 'vendor-ai-risk-assessment.md'), {
      title: TITLES.vendor[lang],
      intro: HOW_TO.vendor[lang],
      sections: [[mdTable(humanHeader, dataRows)]],
    });
  }

  // committee-charter
  {
    const { machineHeader, humanHeader, dataRows } = buildCharter(lang);
    const matrix = [machineHeader, humanHeader, ...dataRows];
    const widths = [24, 90];
    writeXlsxFile(join(dir, 'committee-charter.xlsx'), matrix, { rtl, sheetName: 'Committee charter', colWidths: widths });
    writeCsvFile(join(dir, 'committee-charter.csv'), matrix);
    writeMdFile(join(dir, 'committee-charter.md'), {
      title: TITLES.charter[lang],
      intro: HOW_TO.charter[lang],
      sections: CHARTER_SECTIONS.map((s) => [`## ${s.title[lang]}`, '', s.content(lang)]),
    });
  }

  // raci
  {
    const { machineHeader, humanHeader, dataRows } = buildRaci(lang);
    const matrix = [machineHeader, humanHeader, ...dataRows, [RACI_DISCLAIMER[lang], ...RACI_ROLES.map(() => '')]];
    const widths = [34, 18, 22, 18, 20, 16, 14, 16, 16];
    writeXlsxFile(join(dir, 'raci.xlsx'), matrix, { rtl, sheetName: 'RACI', colWidths: widths });
    writeCsvFile(join(dir, 'raci.csv'), matrix);
    writeMdFile(join(dir, 'raci.md'), {
      title: TITLES.raci[lang],
      lead: RACI_DISCLAIMER[lang],
      intro: HOW_TO.raci[lang],
      sections: [[mdTable(humanHeader, dataRows)]],
    });
  }
}

for (const lang of LANGS) buildForLang(lang);

console.log(`Wrote 36 template files to public/templates/{${LANGS.join(',')}}/`);
