import { computeTier, topReasons, tierFromPoints, QUESTIONS, type Answers } from './scoring';

// Calibration fixtures (FR-8a). Expected tiers were confirmed by the product owner on 27 Sep 2026.
// Changing weights or triggers must not change these results without updating ADR 002.
const fixtures: { name: string; answers: Answers; tier: string; trigger?: string }[] = [
  { name: 'Website FAQ chatbot', tier: 'limited',
    answers: { impact: 'public-info', data: 'none', affected: 'public', ai_type: 'generative', autonomy: 'monitored', oversight: 'exceptions', access: 'none', reversibility: 'easy' } },
  { name: 'Internal document summariser', tier: 'little',
    answers: { impact: 'internal', data: 'internal', affected: 'staff', ai_type: 'generative', autonomy: 'suggests', oversight: 'every', access: 'none', reversibility: 'easy' } },
  { name: 'Loan-approval model', tier: 'high', trigger: 'T-SENSITIVE-DECISIONS',
    answers: { impact: 'decide-individuals', data: 'sensitive', affected: 'public', ai_type: 'predictive', autonomy: 'approval', oversight: 'every', access: 'none', reversibility: 'effort' } },
  { name: 'Citizen service triage agent', tier: 'high',
    answers: { impact: 'recommend-individuals', data: 'personal', affected: 'public', ai_type: 'agentic', autonomy: 'monitored', oversight: 'exceptions', access: 'record', reversibility: 'easy' } },
  { name: 'Autonomous benefits-decision agent', tier: 'high', trigger: 'T-AUTONOMOUS-DECISIONS',
    answers: { impact: 'decide-individuals', data: 'sensitive', affected: 'public', ai_type: 'agentic', autonomy: 'full', oversight: 'none', access: 'record', reversibility: 'hard' } },
  { name: 'Social scoring of citizens', tier: 'unacceptable', trigger: 'T-PROHIBITED',
    answers: { impact: 'prohibited', data: 'personal', affected: 'public', ai_type: 'predictive', autonomy: 'monitored', oversight: 'none', access: 'record', reversibility: 'hard' } },
];

describe('calibration fixtures', () => {
  for (const f of fixtures) {
    it(`${f.name} -> ${f.tier}`, () => {
      const r = computeTier(f.answers);
      expect(r.quickComplete).toBe(true);
      expect(r.tier).toBe(f.tier);
      if (f.trigger) expect(r.firedTriggers.map((t) => t.id)).toContain(f.trigger);
    });
  }
});

describe('computeTier', () => {
  const base = fixtures[0].answers;

  it('is deterministic', () => {
    expect(computeTier(base)).toEqual(computeTier({ ...base }));
  });

  it('reports incomplete quick check', () => {
    const r = computeTier({ impact: 'internal' });
    expect(r.quickComplete).toBe(false);
    expect(r.quickTier).toBeNull();
  });

  it('deep-dive answers never lower the tier', () => {
    const quick = computeTier(base);
    const deep = computeTier({ ...base, scale: 'small', explain: 'yes', third_party: 'no', cross_border: 'no',
      bias_tested: 'yes', security_tested: 'yes', monitoring: 'yes', incident: 'yes', regulated: 'no', disclosure: 'yes' });
    expect(deep.deepComplete).toBe(true);
    expect(deep.tier).toBe(quick.tier);
  });

  it('deep-dive answers can raise the tier', () => {
    const deep = computeTier({ ...base, scale: 'large', explain: 'no', third_party: 'external', bias_tested: 'no' });
    expect(deep.tier).toBe('high');
    expect(deep.quickTier).toBe('limited');
  });

  it('applies the thresholds', () => {
    const t = QUESTIONS.thresholds;
    expect(tierFromPoints(t.limited - 1, t)).toBe('little');
    expect(tierFromPoints(t.limited, t)).toBe('limited');
    expect(tierFromPoints(t.high, t)).toBe('high');
  });
});

describe('topReasons', () => {
  it('lists fired triggers first, in the requested language', () => {
    const r = computeTier(fixtures[5].answers);
    expect(topReasons(r, 'en')[0]).toMatch(/prohibited/i);
    expect(topReasons(r, 'ar')[0]).toMatch(/محظورة/);
  });
  it('returns at least one reason for any tier', () => {
    expect(topReasons(computeTier(fixtures[1].answers), 'en').length).toBeGreaterThan(0);
  });
});

describe('question data', () => {
  it('has 8 quick questions including the four agentic factors', () => {
    const quick = QUESTIONS.questions.filter((q) => q.level === 'quick').map((q) => q.id);
    expect(quick).toHaveLength(8);
    for (const id of ['autonomy', 'oversight', 'access', 'reversibility']) expect(quick).toContain(id);
  });
  it('has about 10 deep-dive questions', () => {
    expect(QUESTIONS.questions.filter((q) => q.level === 'deep').length).toBeGreaterThanOrEqual(9);
  });
  it('prioritisation answers describe the service, not a risk level', () => {
    const prio = QUESTIONS.questions.filter((q) => q.level === 'prio');
    expect(prio.map((q) => q.id)).toEqual(['usage', 'complexity', 'readiness']);
    for (const q of prio)
      for (const o of q.options) {
        expect(o.en, `${q.id}:${o.id}`).not.toMatch(/\b(low|medium|high)\b/i);
        expect(o.ar, `${q.id}:${o.id}`).not.toMatch(/منخفض|متوسط[ةه]?$|مرتفع/);
      }
    const readiness = prio.find((q) => q.id === 'readiness')!;
    expect(readiness.options.map((o) => o.id)).toEqual(['high', 'medium', 'low']);
    expect(readiness.options.map((o) => o.en)).toEqual(['Ready (digital, integrated)', 'Partly ready', 'Not ready (manual, fragmented)']);
  });
  it('every trigger references real questions and options', () => {
    for (const tr of QUESTIONS.triggers)
      for (const c of tr.when) {
        const q = QUESTIONS.questions.find((x) => x.id === c.q);
        expect(q, `${tr.id}:${c.q}`).toBeDefined();
        for (const v of c.in) expect(q!.options.map((o) => o.id)).toContain(v);
      }
  });
});
