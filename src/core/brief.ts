import { t, type Lang } from '../i18n';
import { QUESTIONS, computeTier, topReasons, type Tier } from './scoring';
import { recommendAutonomy, nextSteps, type AutonomyLevel } from './autonomy';
import { actionMatrix, type ActionRow } from './actions';
import { applicableControls, type Control } from './controls';
import type { FrameworkId } from './frameworks';
import type { UseCase } from './usecase';
import { warningsFor, WARNING_FIELDS, type Severity } from './warnings';

/**
 * Agent brief (ADR 015): a rule-based delegation brief assembled from the assessment, with no AI at runtime.
 * Six blocks; two audiences (a committee or procurement annex, and an engineering handover spec).
 */
export const BLOCKS = ['intent', 'context', 'constraints', 'authority', 'evidence', 'done'] as const;
export type BlockId = (typeof BLOCKS)[number];
export type Audience = 'annex' | 'handover';
export interface Table { head: string[]; rows: string[][] }
export interface Block { id: BlockId; title: string; items: string[]; table?: Table; afterTitle?: string; after?: string[] }
export interface WarningCard { id: string; severity: Severity; gcc: boolean; title: string; fields: [string, string][] }
export interface Brief {
  kind: 'brief' | 'readiness' | 'prohibited';
  audience: Audience;
  title: string;
  name: string;
  level: AutonomyLevel;
  provisional: boolean;
  blocks: Block[];
  /** Level 4 only: why there is no brief, and what to do first. */
  readiness: string[];
  /** Selective bad-practice warnings (plan §4): only those whose trigger fires here. */
  warnings: WarningCard[];
}

/** The four records (Hasbini & Seow, 2026) as references to existing controls: no second register (plan §1). */
export const RECORDS: { id: 'manifest' | 'auth' | 'action' | 'outcome'; controls: string[] }[] = [
  { id: 'manifest', controls: ['CTL-ACC-08', 'CTL-ACC-10', 'CTL-TRA-05', 'CTL-ACC-03'] },
  { id: 'auth', controls: ['CTL-ACC-02', 'CTL-ACC-05', 'CTL-HUM-04', 'CTL-HUM-07', 'CTL-SEC-08'] },
  { id: 'action', controls: ['CTL-MON-03', 'CTL-MON-02', 'CTL-HUM-05'] },
  { id: 'outcome', controls: ['CTL-MON-01', 'CTL-MON-09', 'CTL-HUM-02', 'CTL-MON-06'] },
];

const answerLabel = (lang: Lang, qid: string, oid: string | undefined): string => {
  const q = QUESTIONS.questions.find((x) => x.id === qid);
  const o = q?.options.find((x) => x.id === oid);
  return q && o ? `${lang === 'ar' ? q.text_ar : q.text_en} ${lang === 'ar' ? o.ar : o.en}` : '';
};
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');

function intent(lang: Lang, uc: UseCase, level: AutonomyLevel): Block {
  const T = (k: string) => t(lang, k);
  return {
    id: 'intent', title: T('br.b.intent'),
    items: [
      `${T('br.i.purpose')}: ${uc.purpose.trim() || T('br.i.nopurpose')}`,
      `${T('uc.owner')}: ${uc.owner}${uc.businessUnit ? ` (${uc.businessUnit})` : ''}`,
      `${T('br.i.outcome')}: ${T(`br.i.l${level}`)}`,
    ],
    afterTitle: T('br.i.stop'), after: [1, 2, 3, 4, 5].map((n) => T(`br.stop.${n}`)),
  };
}

function context(lang: Lang, uc: UseCase, tier: Tier, points: number, level: AutonomyLevel, provisional: boolean): Block {
  const T = (k: string) => t(lang, k);
  const r = computeTier(uc.answers);
  const a = uc.answers;
  return {
    id: 'context', title: T('br.b.context'),
    items: [
      `${T('reg.tier')}: ${T(`tier.${tier}`)} (${points} ${T('tier.points')}). ${T('br.c.why')}: ${topReasons(r, lang).join(T('br.sep'))}`,
      `${T('auto.title')}: ${T('auto.level')} ${level}${T('br.comma')}${T(`auto.l${level}`)}${provisional ? ` (${T('br.c.provisional')})` : ''}`,
      ...(uc.product ? [`${T('reg.product')}: ${uc.product}${uc.deployment ? ` · ${uc.deployment}` : ''}`] : []),
      `${T('uc.status')}: ${T(`status.${uc.status}`)}`,
      ...(uc.releaseStage ? [`${T('uc.releaseStage')}: ${T(`stage.${uc.releaseStage}`)}${uc.stageDate ? ` (${T('stage.since').replace('{date}', uc.stageDate)})` : ''}`] : []),
      ...['ai_type', 'data', 'affected', 'access', 'reversibility'].map((q) => answerLabel(lang, q, a[q])).filter(Boolean),
    ],
  };
}

function constraints(lang: Lang, uc: UseCase, tier: Tier): Block {
  const T = (k: string) => t(lang, k);
  const a = uc.answers;
  const items: string[] = [];
  if (a.data === 'personal' || a.data === 'sensitive') items.push(T('br.c.personal'));
  if (a.data === 'sensitive') items.push(T('br.c.sensitive'));
  items.push(T('br.c.residency'));
  if (a.cross_border === 'yes') items.push(T('br.c.cross.yes'));
  else if (a.cross_border === 'unsure') items.push(T('br.c.cross.unsure'));
  if (a.affected === 'public' || a.affected === 'vulnerable') items.push(T('br.c.disclose'));
  if (a.affected === 'vulnerable') items.push(T('br.c.vulnerable'));
  if (tier === 'high') items.push(T('br.c.high'));
  const vendor = a.third_party === 'local' || a.third_party === 'external';
  return { id: 'constraints', title: T('br.b.constraints'), items, afterTitle: T('br.c.resp'), after: [T('br.c.resp.entity'), T(vendor ? 'br.c.resp.vendor' : 'br.c.resp.inhouse')] };
}

function authority(lang: Lang, rows: ActionRow[], audience: Audience): Block {
  const T = (k: string) => t(lang, k);
  return {
    id: 'authority', title: T('br.b.authority'), items: [],
    table: {
      head: ['act.col.action', 'act.col.setting', 'act.col.limits', 'act.col.rev', 'act.col.approver'].map(T),
      rows: rows.map((r) => [T(`act.${r.id}`), T(`perm.${r.permission}`), r.limits || '—', r.reversible ? T(`act.rev.${r.reversible}`) : '—', r.approver || '—']),
    },
    after: [T('br.a.role'), T('br.a.sub'), T('br.a.whole'), T('br.a.content'), ...(audience === 'handover' ? [T('br.a.enforce')] : [])],
  };
}

function evidence(lang: Lang, uc: UseCase, applicable: Control[], audience: Audience): Block {
  const T = (k: string) => t(lang, k);
  const byId = new Map(applicable.map((c) => [c.id, c]));
  const ref = (id: string) => {
    const c = byId.get(id)!;
    const st = uc.evidence?.[id]?.status;
    return `${id} ${lang === 'ar' ? c.title_ar : c.title_en} (${T(st ? `ev.${st}` : 'ev.unset')})`;
  };
  return {
    id: 'evidence', title: T('br.b.evidence'), items: [T('br.e.intro')],
    table: {
      head: [T('br.e.record'), T('br.e.holds'), T('br.e.controls')],
      rows: RECORDS.map((rec) => {
        const ids = rec.controls.filter((id) => byId.has(id));
        return [T(`br.e.${rec.id}.h`), T(`br.e.${rec.id}.p`), ids.length ? ids.map(ref).join(T('br.sep')) : T('br.e.none')];
      }),
    },
    after: [T('br.e.assume'), ...(audience === 'handover' ? [T('br.e.hand')] : []), T('br.e.cite')],
  };
}

function done(lang: Lang, level: AutonomyLevel): Block {
  const T = (k: string) => t(lang, k);
  return { id: 'done', title: T('br.b.done'), items: [T(`br.d.l${level}`), ...(level === 1 ? [T('br.d.l1.down')] : []), T('br.d.review')] };
}

export function buildBrief(uc: UseCase, lang: Lang, frameworks: FrameworkId[], audience: Audience = 'annex'): Brief {
  const r = computeTier(uc.answers);
  const a = recommendAutonomy(uc.answers, r.tier);
  const m = actionMatrix(uc.answers, r.tier, uc.actions);
  const base = { audience, title: t(lang, `br.${audience}`), name: uc.name, level: m.level, provisional: m.provisional, blocks: [] as Block[], readiness: [] as string[], warnings: [] as WarningCard[] };
  if (r.tier === 'unacceptable') return { ...base, kind: 'prohibited', readiness: [t(lang, 'br.x')] };
  if (m.level === 4)
    return { ...base, kind: 'readiness', readiness: [fill(t(lang, 'br.r.p'), { clarify: t(lang, 'auto.l4.clarify') }), ...nextSteps(a, uc.answers).map((s) => t(lang, `auto.step.${s}`)), t(lang, 'br.r.allowed')] };
  const applicable = applicableControls(r.tier, uc.answers, frameworks);
  const T = (k: string) => t(lang, k);
  const warnings = warningsFor({ answers: uc.answers, tier: r.tier, level: m.level, rows: m.rows, evidence: uc.evidence ?? {}, applicable: new Set(applicable.map((c) => c.id)) })
    .map((w): WarningCard => ({
      id: w.id, severity: w.severity, gcc: !!w.gcc, title: T(`wr.${w.id}.title`),
      fields: [...WARNING_FIELDS.map((f): [string, string] => [T(`wr.f.${f}`), T(`wr.${w.id}.${f}`)]), [T('wr.f.owner'), T(`wr.role.${w.owner}`)]],
    }));
  return {
    ...base, kind: 'brief', warnings,
    blocks: [
      intent(lang, uc, m.level), context(lang, uc, r.tier, r.points, m.level, m.provisional), constraints(lang, uc, r.tier),
      authority(lang, m.rows, audience), evidence(lang, uc, applicable, audience), done(lang, m.level),
    ],
  };
}

const mdCell = (s: string) => s.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
const mdTable = (tb: Table) => [`| ${tb.head.map(mdCell).join(' | ')} |`, `|${tb.head.map(() => '---').join('|')}|`, ...tb.rows.map((r) => `| ${r.map(mdCell).join(' | ')} |`)].join('\n');
const oneLine = (s: string) => s.replace(/\r?\n/g, ' ');

/** The brief as Markdown, ready to attach to a committee pack, an RFP or a sprint epic. */
export function briefMarkdown(b: Brief, lang: Lang, date = new Date().toISOString().slice(0, 10)): string {
  const T = (k: string) => t(lang, k);
  const out = [`# ${T('br.title')}: ${oneLine(b.name)}`, `*${b.title} · ${date}*`, '', `> ${T('br.notice')}`, ''];
  if (b.kind !== 'brief') {
    out.push(`## ${T(b.kind === 'prohibited' ? 'br.x.h' : 'br.r.h')}`, '', ...b.readiness.map((x, i) => (i === 0 ? `${x}\n` : `- ${x}`)));
  } else {
    for (const bl of b.blocks) {
      out.push(`## ${bl.title}`, '', ...bl.items.map((x) => `- ${oneLine(x)}`));
      if (bl.table) out.push(...(bl.items.length ? [''] : []), mdTable(bl.table));
      if (bl.afterTitle) out.push('', `**${bl.afterTitle}**`);
      if (bl.after?.length) out.push('', ...bl.after.map((x) => `- ${x}`));
      out.push('');
    }
    out.push(`## ${T('wr.h')}`, '', ...(b.warnings.length ? [] : [T('wr.none'), '']));
    for (const w of b.warnings) out.push(`### ${w.title} (${T(`wr.sev.${w.severity}`)}${w.gcc ? `${T('br.comma')}${T('wr.gcc')}` : ''})`, '', ...w.fields.map(([k, v]) => `- **${k}:** ${v}`), '');
    if (b.audience === 'annex') out.push(`## ${T('rep.signoff')}`, '', mdTable({ head: [T('rep.prepared'), T('rep.reviewed'), T('rep.decision')], rows: [['', '', `☐ ${T('rep.approve')} ☐ ${T('rep.conditions')} ☐ ${T('rep.reject')}`]] }), '');
  }
  out.push('', `*${T('rep.disclaimer')}*`, '');
  return out.join('\n');
}
