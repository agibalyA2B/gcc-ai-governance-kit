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

function writeMdFile(path, { title, intro, sections }) {
  const parts = [`# ${title}`, '', intro, '', LICENCE_LINE, ...sections.flatMap((s) => ['', ...s])];
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
      purpose: 'Answers general questions and hands over to a person when needed.', status: 'production', ai_type: 'generative',
      impact: 'public-info', data: 'none', affected: 'public', autonomy: 'monitored', oversight: 'exceptions', access: 'none',
      reversibility: 'easy', tier: 'limited', deep_dive_complete: 'false', updatedAt: '2026-01-15',
    },
    {
      id: 'uc-example-triage', name: 'Citizen service triage agent', owner: 'Customer Service Dept.', businessUnit: 'Operations',
      purpose: 'Routes incoming requests automatically; staff review refusals.', status: 'pilot', ai_type: 'agentic',
      impact: 'recommend-individuals', data: 'personal', affected: 'public', autonomy: 'monitored', oversight: 'exceptions',
      access: 'record', reversibility: 'easy', tier: 'high', deep_dive_complete: 'false', updatedAt: '2026-01-15',
    },
  ],
  ar: [
    {
      id: 'uc-example-chatbot', name: 'روبوت محادثة للأسئلة الشائعة', owner: 'القنوات الرقمية', businessUnit: 'تجربة المتعاملين',
      purpose: 'يجيب عن الأسئلة العامة ويحيل إلى موظف عند الحاجة.', status: 'production', ai_type: 'generative',
      impact: 'public-info', data: 'none', affected: 'public', autonomy: 'monitored', oversight: 'exceptions', access: 'none',
      reversibility: 'easy', tier: 'limited', deep_dive_complete: 'false', updatedAt: '2026-01-15',
    },
    {
      id: 'uc-example-triage', name: 'وكيل فرز طلبات خدمات المتعاملين', owner: 'إدارة خدمة المتعاملين', businessUnit: 'العمليات',
      purpose: 'يوجّه الطلبات الواردة تلقائياً، ويراجع موظفٌ حالات الرفض.', status: 'pilot', ai_type: 'agentic',
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
    qq.level === 'quick' ? T('step.quick', lang) : qq.level === 'deep' ? T('step.deep', lang) : T('prio.title', lang),
    qq[`text_${lang}`],
    qq.options.map((o) => (qq.level === 'prio' ? o[lang] : `${o[lang]} (${o.points})`)).join('; '),
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
};

const TITLES = {
  register: { en: 'AI Use-Case Register', ar: 'سجل حالات استخدام الذكاء الاصطناعي' },
  impact: { en: 'AI Impact Assessment', ar: 'تقييم أثر الذكاء الاصطناعي' },
  checklist: { en: 'AI Control Checklist', ar: 'قائمة التحقق من ضوابط الذكاء الاصطناعي' },
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
}

for (const lang of LANGS) buildForLang(lang);

console.log(`Wrote 18 template files to public/templates/{${LANGS.join(',')}}/`);
