import { computeTier, QUESTIONS, type Answers, type Trigger, type TierResult } from './scoring';

/**
 * "What would lower your tier": re-scores the use case as if every operational gap were closed.
 * Operational answers (testing, monitoring, incident handling, hosting, disclosure) can be fixed without
 * redesigning the product; structural ones (what the AI does, its data, autonomy, access) cannot. Each
 * operational question declares its fix in data/questions.json, so the rule is visible (ADR 009).
 */
export const OPERATIONAL = QUESTIONS.questions.filter((q) => q.fix).map((q) => q.id);

export interface Change { questionId: string; from: string; to: string; pointsSaved: number }
export interface Sensitivity {
  current: TierResult;
  fixed: TierResult;
  changes: Change[];
  lowers: boolean;
  /** Rules that still set the tier after the fixes. */
  structural: Trigger[];
}

export function sensitivity(answers: Answers): Sensitivity {
  const current = computeTier(answers);
  const fixedAnswers = { ...answers };
  const changes: Change[] = [];
  for (const q of QUESTIONS.questions.filter((x) => x.fix)) {
    const from = q.options.find((o) => o.id === answers[q.id]);
    const to = q.options.find((o) => o.id === q.fix)!;
    if (!from || from.id === to.id || from.points <= to.points) continue;
    fixedAnswers[q.id] = to.id;
    changes.push({ questionId: q.id, from: from.id, to: to.id, pointsSaved: from.points - to.points });
  }
  const fixed = changes.length ? computeTier(fixedAnswers) : current;
  return { current, fixed, changes, lowers: fixed.tier !== current.tier, structural: fixed.firedTriggers };
}
