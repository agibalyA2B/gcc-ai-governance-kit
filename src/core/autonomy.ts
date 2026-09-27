import type { Answers, Tier } from './scoring';

/**
 * Indicative autonomy level from a UAE government AI-assistant priority matrix
 * (usage intensity x complexity x readiness). Level 4 = full autonomous execution,
 * 3 = supervised autonomy, 2 = AI assistance (human decides), 1 = not suitable yet.
 * The cut-offs are this kit's interpretation of the matrix descriptions (ADR 004).
 */
export type AutonomyLevel = 1 | 2 | 3 | 4;

export interface AutonomyResult {
  complete: boolean;
  recommended: AutonomyLevel | null;
  actual: AutonomyLevel | null;
  exceeds: boolean;
  capReasons: string[];
}

const ACTUAL: Record<string, AutonomyLevel> = { suggests: 2, approval: 3, monitored: 3, full: 4 };

export function recommendAutonomy(answers: Answers, tier: Tier): AutonomyResult {
  const { usage, complexity, readiness } = answers;
  const actual = ACTUAL[answers.autonomy] ?? null;
  if (!usage || !complexity || !readiness) return { complete: false, recommended: null, actual, exceeds: false, capReasons: [] };

  const capReasons: string[] = [];
  let level: AutonomyLevel;
  if (readiness === 'low') level = 1;
  else if (complexity === 'high') level = readiness === 'high' ? 2 : 1;
  else if (complexity === 'medium') level = 3;
  else level = readiness === 'high' && usage === 'high' ? 4 : 3;

  if (tier === 'unacceptable') { level = 1; capReasons.push('tier-unacceptable'); }
  else if (level === 4 && (tier === 'high' || answers.regulated === 'yes')) { level = 3; capReasons.push(tier === 'high' ? 'tier-high' : 'regulated'); }

  return { complete: true, recommended: level, actual, exceeds: actual !== null && actual > level, capReasons };
}
