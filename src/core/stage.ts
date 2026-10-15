import type { EvidenceMap } from './evidence';

/**
 * Release stage per deployment (ADR 016), named as in the autonomy release-ladder guide. Stages have names, not
 * numbers, so they are never confused with the autonomy levels. Pre-pilot means the ladder has not started.
 */
export const STAGES = ['pre-pilot', 'replay', 'shadow', 'assisted', 'bounded', 'expansion'] as const;
export type Stage = (typeof STAGES)[number];
export const isStage = (s: unknown): s is Stage => (STAGES as readonly unknown[]).includes(s);

/** Stages where the AI acts without a person deciding each case. */
export const ACTING_STAGES: Stage[] = ['bounded', 'expansion'];

/** Controls an acting stage cannot do without: stop switch, logging and oversight. */
export const RELEASE_GATE_CONTROLS = {
  stop: ['CTL-HUM-06', 'CTL-SEC-06'],
  logging: ['CTL-MON-02', 'CTL-MON-03'],
  oversight: ['CTL-HUM-01', 'CTL-HUM-11'],
} as const;

/**
 * Banner rule: an acting stage while any applicable stop-switch, logging or oversight control is marked Gap.
 * Returns the controls in Gap (empty means no banner).
 */
export function stageGaps(stage: Stage | undefined, evidence: EvidenceMap = {}, applicable: Set<string>): string[] {
  if (!stage || !ACTING_STAGES.includes(stage)) return [];
  return Object.values(RELEASE_GATE_CONTROLS).flat().filter((id) => applicable.has(id) && evidence[id]?.status === 'gap');
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const normaliseStage = (s: unknown): Stage | undefined => (isStage(s) ? s : undefined);
export const normaliseStageDate = (d: unknown): string | undefined => (typeof d === 'string' && DATE.test(d) ? d : undefined);
