import questionsData from '../../data/questions.json';

export type Tier = 'little' | 'limited' | 'high' | 'unacceptable';
export const TIER_ORDER: Tier[] = ['little', 'limited', 'high', 'unacceptable'];

export interface Option { id: string; points: number; en: string; ar: string }
export interface Question {
  id: string; level: 'intake' | 'quick' | 'deep' | 'prio'; factor: string;
  text_en: string; text_ar: string; help_en: string; help_ar: string; options: Option[];
  /** Operational (fixable without redesign) questions name the option that closes the gap. */
  fix?: string;
}
export interface Trigger {
  id: string; min_tier: Tier; when: { q: string; in: string[] }[]; reason_en: string; reason_ar: string;
}
export interface QuestionSet { version: number; thresholds: { limited: number; high: number }; questions: Question[]; triggers: Trigger[] }
export type Answers = Record<string, string>;

export interface FactorScore { questionId: string; factor: string; optionId: string; points: number }
export interface TierResult {
  tier: Tier;
  quickTier: Tier | null;
  pointsTier: Tier;
  points: number;
  factors: FactorScore[];
  firedTriggers: Trigger[];
  quickComplete: boolean;
  deepComplete: boolean;
}

export const QUESTIONS = questionsData as QuestionSet;

/** False only when the owner says the solution uses no AI at runtime; unanswered counts as in scope (older registers). */
export const aiInScope = (answers: Answers): boolean => answers.runtime_ai !== 'no';

export const maxTier = (a: Tier, b: Tier): Tier =>
  TIER_ORDER.indexOf(a) >= TIER_ORDER.indexOf(b) ? a : b;

export function tierFromPoints(points: number, t: QuestionSet['thresholds']): Tier {
  if (points >= t.high) return 'high';
  if (points >= t.limited) return 'limited';
  return 'little';
}

function scoreLevel(set: QuestionSet, answers: Answers, levels: Question['level'][]) {
  const factors: FactorScore[] = [];
  for (const q of set.questions.filter((x) => levels.includes(x.level))) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (opt) factors.push({ questionId: q.id, factor: q.factor, optionId: opt.id, points: opt.points });
  }
  const points = factors.reduce((s, f) => s + f.points, 0);
  const fired = set.triggers.filter((tr) => tr.when.every((c) => c.in.includes(answers[c.q])));
  const tier = fired.reduce<Tier>((acc, tr) => maxTier(acc, tr.min_tier), tierFromPoints(points, set.thresholds));
  return { factors, points, fired, tier };
}

/** Deterministic hybrid scoring: tier = max(points tier, highest fired trigger). Deep-dive answers can only raise it. */
export function computeTier(answers: Answers, set: QuestionSet = QUESTIONS): TierResult {
  const isAnswered = (q: Question) => q.options.some((o) => o.id === answers[q.id]);
  const quickComplete = set.questions.filter((q) => q.level === 'quick').every(isAnswered);
  const deepComplete = set.questions.filter((q) => q.level === 'deep').every(isAnswered);
  const quick = scoreLevel(set, answers, ['quick']);
  const all = scoreLevel(set, answers, ['quick', 'deep']);
  const quickTier = quickComplete ? quick.tier : null;
  const tier = maxTier(quick.tier, all.tier);
  return {
    tier,
    quickTier,
    pointsTier: tierFromPoints(all.points, set.thresholds),
    points: all.points,
    factors: all.factors,
    firedTriggers: all.fired,
    quickComplete,
    deepComplete,
  };
}

/** Top plain-language reasons: fired triggers first, then the highest-scoring answers. */
export function topReasons(result: TierResult, lang: 'en' | 'ar', set: QuestionSet = QUESTIONS, n = 3): string[] {
  const reasons = result.firedTriggers.map((t) => (lang === 'ar' ? t.reason_ar : t.reason_en));
  const ranked = [...result.factors].filter((f) => f.points > 0).sort((a, b) => b.points - a.points);
  for (const f of ranked) {
    if (reasons.length >= n) break;
    const q = set.questions.find((x) => x.id === f.questionId)!;
    const o = q.options.find((x) => x.id === f.optionId)!;
    reasons.push(lang === 'ar' ? o.ar : o.en);
  }
  return reasons.slice(0, n);
}
