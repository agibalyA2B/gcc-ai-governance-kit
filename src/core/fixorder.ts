import { THEMES, type Control } from './controls';
import type { EvidenceMap, EvidenceStatus } from './evidence';

export type OpenStatus = 'gap' | 'partly';
export interface Prerequisite { id: string; status: OpenStatus | 'unset' }
export interface FixItem { id: string; status: OpenStatus; after: Prerequisite[] }

const OPEN: OpenStatus[] = ['gap', 'partly'];
const DONE: EvidenceStatus[] = ['met', 'na'];

/**
 * Fix-in-this-order list (ADR 018): the applicable controls at Gap or Partly, each after the controls it depends on.
 * Ordering only; it never changes which controls apply or the tier. Among controls that are ready, Gap comes before
 * Partly, then theme order, then id, so the list is stable. Dependencies on controls that do not apply are ignored.
 */
export function fixOrder(applicable: Control[], evidence: EvidenceMap = {}): FixItem[] {
  const byId = new Map(applicable.map((c) => [c.id, c]));
  const status = (id: string) => evidence[id]?.status || 'unset';
  const open = applicable.filter((c) => (OPEN as string[]).includes(status(c.id)));
  const deps = (c: Control) => (c.depends_on ?? []).filter((d) => byId.has(d));
  const rank = (c: Control) => [OPEN.indexOf(status(c.id) as OpenStatus), THEMES.indexOf(c.theme as (typeof THEMES)[number])] as const;
  const before = (a: Control, b: Control) => {
    const [ra, rb] = [rank(a), rank(b)];
    return ra[0] - rb[0] || ra[1] - rb[1] || a.id.localeCompare(b.id);
  };

  const placed = new Set<string>();
  const out: FixItem[] = [];
  let pending = open;
  while (pending.length) {
    // A control is ready when every open prerequisite has been placed (prerequisites at Met, N/A or unreviewed never wait).
    const ready = pending.filter((c) => deps(c).every((d) => placed.has(d) || !open.some((o) => o.id === d)));
    // Cycles are rejected by check:data; if one slips through, fall back to the plain order rather than loop.
    const next = (ready.length ? ready : pending).slice().sort(before)[0];
    out.push({
      id: next.id,
      status: status(next.id) as OpenStatus,
      after: deps(next).filter((d) => !(DONE as string[]).includes(status(d))).map((d) => ({ id: d, status: status(d) as Prerequisite['status'] })),
    });
    placed.add(next.id);
    pending = pending.filter((c) => c !== next);
  }
  return out;
}
