import type { Answers, Tier } from './scoring';

/**
 * Indicative autonomy level from the UAE government AI-assistant priority matrix
 * (usage intensity x complexity x readiness), numbered as the matrix numbers them:
 * 1 = full autonomous execution, 2 = supervised autonomy, 3 = AI assistance (a person decides),
 * 4 = not suitable yet. A lower number means more autonomy (ADR 006).
 */
export type AutonomyLevel = 1 | 2 | 3 | 4;
export type NotSuitableFactor = 'usage' | 'complexity';

export interface AutonomyResult {
  complete: boolean;
  recommended: AutonomyLevel | null;
  actual: AutonomyLevel | null;
  /** The design is more autonomous than recommended (its level number is lower). */
  exceeds: boolean;
  capReasons: string[];
  /** Matrix factors that put the service at level 4. */
  notSuitable: NotSuitableFactor[];
}

const ACTUAL: Record<string, AutonomyLevel> = { suggests: 3, approval: 2, monitored: 2, full: 1 };

export function recommendAutonomy(answers: Answers, tier: Tier): AutonomyResult {
  const { usage, complexity, readiness } = answers;
  const actual = ACTUAL[answers.autonomy] ?? null;
  if (!usage || !complexity || !readiness)
    return { complete: false, recommended: null, actual, exceeds: false, capReasons: [], notSuitable: [] };

  const notSuitable: NotSuitableFactor[] = [];
  if (usage === 'low') notSuitable.push('usage');
  if (complexity === 'high') notSuitable.push('complexity');

  const capReasons: string[] = [];
  let level: AutonomyLevel;
  if (notSuitable.length) level = 4;
  else if (readiness === 'high') level = usage === 'high' && complexity === 'low' ? 1 : 2;
  else if (readiness === 'medium') level = 2;
  else level = 3;

  if (tier === 'unacceptable') { level = 4; notSuitable.length = 0; capReasons.push('tier-unacceptable'); }
  else if (level === 1 && (tier === 'high' || answers.regulated === 'yes')) { level = 2; capReasons.push(tier === 'high' ? 'tier-high' : 'regulated'); }

  return { complete: true, recommended: level, actual, exceeds: actual !== null && actual < level, capReasons, notSuitable };
}

export type NextStep = 'simplify' | 'volume' | 'data' | 'owner' | 'reassess';

/** Concrete steps to take before applying AI when the matrix says "not suitable yet" (level 4). */
export function nextSteps(a: AutonomyResult, answers: Answers): NextStep[] {
  if (a.recommended !== 4 || !a.notSuitable.length) return [];
  const steps: NextStep[] = [];
  if (a.notSuitable.includes('complexity')) steps.push('simplify');
  if (a.notSuitable.includes('usage')) steps.push('volume');
  if (answers.readiness !== 'high') steps.push('data');
  return [...steps, 'owner', 'reassess'];
}
