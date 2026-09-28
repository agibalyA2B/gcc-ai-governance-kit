import { QUESTIONS } from './scoring';
import { newId, type Status, type UseCase } from './usecase';
import { t } from '../i18n';

/**
 * Imports a filled register spreadsheet (the kit's register template, XLSX or CSV). Row 1 holds the field names, so
 * columns are matched by name, not position. Answers may be option ids or their visible English/Arabic labels.
 * Tiers are never read from the sheet: they are recomputed from the answers.
 */
export interface ImportSkip { row: number; reason: 'name' | 'owner' }
export interface ImportWarning { row: number; field: string; value: string }
export interface ImportResult { cases: UseCase[]; skipped: ImportSkip[]; warnings: ImportWarning[] }

const STATUSES: Status[] = ['idea', 'pilot', 'production', 'retired'];
const TEXT_FIELDS = ['businessUnit', 'purpose', 'notes', 'product', 'deployment'] as const;
const norm = (v: unknown) => String(v ?? '').trim();
const fold = (v: string) => v.toLowerCase().replace(/\s+/g, ' ');

function matchOption(questionId: string, value: string): string | undefined {
  const q = QUESTIONS.questions.find((x) => x.id === questionId)!;
  const v = fold(value);
  return q.options.find((o) => o.id === value || fold(o.en) === v || fold(o.ar) === v)?.id;
}

export function casesFromRows(rows: unknown[][], now = new Date().toISOString()): ImportResult | null {
  const header = (rows[0] ?? []).map(norm);
  const col = (field: string) => header.indexOf(field);
  if (col('name') < 0 || col('owner') < 0) return null;
  const labelNames = [t('en', 'reg.name'), t('ar', 'reg.name')];
  const questionCols = QUESTIONS.questions.map((q) => q.id).filter((id) => col(id) >= 0);
  const out: ImportResult = { cases: [], skipped: [], warnings: [] };
  const ids = new Set<string>();

  rows.slice(1).forEach((raw, i) => {
    const row = i + 2; // spreadsheet row number, for messages
    const cell = (field: string) => (col(field) >= 0 ? norm(raw[col(field)]) : '');
    if (!raw.some((v) => norm(v))) return;
    if (i === 0 && labelNames.includes(cell('name'))) return; // the template's human-readable label row
    if (!cell('name')) { out.skipped.push({ row, reason: 'name' }); return; }
    if (!cell('owner')) { out.skipped.push({ row, reason: 'owner' }); return; }

    const status = cell('status');
    if (status && !STATUSES.includes(status as Status)) out.warnings.push({ row, field: 'status', value: status });
    const answers: Record<string, string> = {};
    for (const qid of questionCols) {
      const v = cell(qid);
      if (!v) continue;
      const opt = matchOption(qid, v);
      if (opt) answers[qid] = opt; else out.warnings.push({ row, field: qid, value: v });
    }
    let id = cell('id');
    if (!id || ids.has(id)) id = newId();
    ids.add(id);
    const uc: UseCase = { id, name: cell('name'), owner: cell('owner'), businessUnit: '', purpose: '', notes: '',
      status: STATUSES.includes(status as Status) ? (status as Status) : 'idea', answers, evidence: {}, createdAt: now, updatedAt: now };
    for (const f of TEXT_FIELDS) { const v = cell(f); if (v) uc[f] = v; }
    out.cases.push(uc);
  });
  return out;
}
