/** Per-control evidence recorded for one use case: a status plus a free-text note (the control-evidence map). */
export const EVIDENCE_STATUSES = ['met', 'partly', 'gap', 'na'] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export interface EvidenceEntry { status: EvidenceStatus | ''; note: string }
export type EvidenceMap = Record<string, EvidenceEntry>;

const CONTROL_ID = /^CTL-[A-Z]{2,4}-[0-9]{2}$/;
const MAX_NOTE = 4000;
const isStatus = (s: unknown): s is EvidenceStatus => (EVIDENCE_STATUSES as readonly unknown[]).includes(s);
const isEmpty = (e: EvidenceEntry) => !e.status && !e.note.trim();

/** Cleans stored or imported evidence: unknown ids, bad statuses and empty entries are dropped. */
export function normaliseEvidence(raw: unknown): EvidenceMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: EvidenceMap = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!CONTROL_ID.test(id) || !v || typeof v !== 'object') continue;
    const { status, note } = v as { status?: unknown; note?: unknown };
    const entry: EvidenceEntry = { status: isStatus(status) ? status : '', note: typeof note === 'string' ? note.slice(0, MAX_NOTE) : '' };
    if (!isEmpty(entry)) out[id] = entry;
  }
  return out;
}

export function setEvidence(map: EvidenceMap, id: string, patch: Partial<EvidenceEntry>): EvidenceMap {
  const next = { ...map };
  const cur = map[id] as EvidenceEntry | undefined;
  const entry: EvidenceEntry = { status: cur?.status ?? '', note: cur?.note ?? '', ...patch };
  if (isEmpty(entry)) delete next[id]; else next[id] = entry;
  return next;
}

export type EvidenceSummary = Record<EvidenceStatus | 'unset', number>;

export function evidenceSummary(controlIds: string[], map: EvidenceMap): EvidenceSummary {
  const sum: EvidenceSummary = { met: 0, partly: 0, gap: 0, na: 0, unset: 0 };
  for (const id of controlIds) sum[map[id]?.status || 'unset']++;
  return sum;
}
