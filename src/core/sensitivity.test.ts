import { sensitivity, OPERATIONAL } from './sensitivity';
import { computeTier, QUESTIONS, type Answers } from './scoring';

// Sensitivity fixtures, confirmed by the product owner on 28 Sep 2026. Changing the operational set or the
// weights must not change these results without updating ADR 009.
const fixtures: { name: string; answers: Answers; now: string; afterFixes: string }[] = [
  { name: 'Internal B2B claims-drafting tool with operational gaps', now: 'high', afterFixes: 'limited',
    answers: { impact: 'decide-organisations', data: 'personal', affected: 'staff', ai_type: 'generative', autonomy: 'suggests', oversight: 'every', access: 'none', reversibility: 'easy',
      scale: 'small', explain: 'yes', third_party: 'external', cross_border: 'yes', bias_tested: 'planned', security_tested: 'no', monitoring: 'no', incident: 'no', regulated: 'no', disclosure: 'yes' } },
  { name: 'Autonomous benefits-decision agent with operational gaps', now: 'high', afterFixes: 'high',
    answers: { impact: 'decide-individuals', data: 'sensitive', affected: 'public', ai_type: 'agentic', autonomy: 'full', oversight: 'none', access: 'record', reversibility: 'hard',
      scale: 'large', explain: 'no', third_party: 'external', cross_border: 'unsure', bias_tested: 'no', security_tested: 'no', monitoring: 'no', incident: 'no', regulated: 'yes', disclosure: 'no' } },
];

describe('sensitivity fixtures', () => {
  for (const f of fixtures)
    it(`${f.name}: ${f.now} now, ${f.afterFixes} after operational fixes`, () => {
      const s = sensitivity(f.answers);
      expect(s.current.tier).toBe(f.now);
      expect(s.fixed.tier).toBe(f.afterFixes);
    });
});

describe('sensitivity', () => {
  it('only operational deep-dive answers are changed, each to its declared fix', () => {
    const s = sensitivity(fixtures[0].answers);
    expect(s.changes.map((c) => [c.questionId, c.from, c.to])).toEqual([
      ['third_party', 'external', 'local'], ['cross_border', 'yes', 'no'], ['bias_tested', 'planned', 'yes'],
      ['security_tested', 'no', 'yes'], ['monitoring', 'no', 'yes'], ['incident', 'no', 'yes'],
    ]);
    expect(s.changes.reduce((n, c) => n + c.pointsSaved, 0)).toBe(s.current.points - s.fixed.points);
    for (const c of s.changes) expect(OPERATIONAL).toContain(c.questionId);
  });
  it('the operational set is declared in the data and never includes a quick-check question', () => {
    const declared = QUESTIONS.questions.filter((q) => q.fix).map((q) => q.id);
    expect(declared).toEqual(OPERATIONAL);
    for (const q of QUESTIONS.questions.filter((x) => x.fix)) {
      expect(q.level).toBe('deep');
      expect(q.options.map((o) => o.id)).toContain(q.fix);
    }
  });
  it('a structural rule keeps the tier, and is reported as the reason', () => {
    const s = sensitivity(fixtures[1].answers);
    expect(s.lowers).toBe(false);
    expect(s.structural.map((t) => t.id)).toContain('T-AUTONOMOUS-DECISIONS');
  });
  it('never raises the tier, and has nothing to change when there are no operational gaps', () => {
    const quickOnly = { impact: 'internal', data: 'internal', affected: 'staff', ai_type: 'generative', autonomy: 'suggests', oversight: 'every', access: 'none', reversibility: 'easy' };
    const s = sensitivity(quickOnly);
    expect(s.changes).toEqual([]);
    expect(s.fixed).toEqual(computeTier(quickOnly));
    expect(s.lowers).toBe(false);
  });
  it('the fixed tier is never below the quick-check tier (deep-dive answers only raise it)', () => {
    const s = sensitivity(fixtures[0].answers);
    expect(s.fixed.tier).toBe(s.current.quickTier);
  });
});
