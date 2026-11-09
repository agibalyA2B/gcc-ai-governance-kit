import { applicableControls, type Control } from './controls';
import { computeTier } from './scoring';
import type { FrameworkId } from './frameworks';
import type { EvidenceMap } from './evidence';
import type { UseCase } from './usecase';

export interface GapCount { total: number; gap: number; partly: number; met: number; na: number; unset: number; open: number }
export const NIST_FUNCTIONS = ['GOVERN', 'MAP', 'MEASURE', 'MANAGE'] as const;
export type NistFunction = (typeof NIST_FUNCTIONS)[number];

function tally(controls: Control[], ev: EvidenceMap): GapCount {
  const g: GapCount = { total: controls.length, gap: 0, partly: 0, met: 0, na: 0, unset: 0, open: 0 };
  for (const c of controls) g[ev[c.id]?.status || 'unset']++;
  g.open = g.gap + g.partly;
  return g;
}

/** Controls that apply to this use case and map to the target framework, whatever frameworks are selected. */
function targetControls(uc: Pick<UseCase, 'answers'>, fw: FrameworkId): Control[] {
  const r = computeTier(uc.answers);
  return r.tier === 'unacceptable' ? [] : applicableControls(r.tier, uc.answers, [fw]);
}

/**
 * Target-framework gap count (G8, ADR 019): how many kit controls mapped to one framework are still open for this
 * use case. It counts kit controls; it is not a conformity assessment against the framework.
 */
export function gapCount(uc: Pick<UseCase, 'answers'>, fw: FrameworkId, ev: EvidenceMap = {}): GapCount {
  return tally(targetControls(uc, fw), ev);
}

/** The NIST AI RMF view, grouped by function. A control that cites two functions counts once in each. */
export function nistByFunction(uc: Pick<UseCase, 'answers'>, ev: EvidenceMap = {}): Record<NistFunction, GapCount> {
  const list = targetControls(uc, 'nist_ai_rmf');
  return Object.fromEntries(NIST_FUNCTIONS.map((fn) => [fn, tally(list.filter((c) => c.refs.nist_ai_rmf.some((x) => x.startsWith(`${fn} `))), ev)])) as Record<NistFunction, GapCount>;
}
