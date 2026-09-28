import { recommendAutonomy, nextSteps } from './autonomy';

// Levels follow the official UAE AI-assistant priority matrix (ADR 006):
// 1 = full autonomous execution, 2 = supervised autonomy, 3 = AI assistance, 4 = not suitable yet.
const base = { usage: 'high', complexity: 'low', readiness: 'high', autonomy: 'full' };

describe('recommendAutonomy', () => {
  it('is incomplete until the three prioritisation answers exist', () => {
    expect(recommendAutonomy({ autonomy: 'full' }, 'limited').complete).toBe(false);
  });
  it('high usage, low complexity, high readiness -> level 1 (full autonomous execution)', () => {
    expect(recommendAutonomy(base, 'limited').recommended).toBe(1);
  });
  it('low usage -> level 4 (not suitable yet), whatever the readiness', () => {
    for (const readiness of ['high', 'medium', 'low'])
      expect(recommendAutonomy({ ...base, usage: 'low', readiness }, 'limited')).toMatchObject({ recommended: 4, notSuitable: ['usage'] });
  });
  it('high complexity -> level 4 (not suitable yet), whatever the readiness', () => {
    for (const readiness of ['high', 'medium', 'low'])
      expect(recommendAutonomy({ ...base, complexity: 'high', readiness }, 'limited')).toMatchObject({ recommended: 4, notSuitable: ['complexity'] });
    expect(recommendAutonomy({ ...base, usage: 'low', complexity: 'high' }, 'limited').notSuitable).toEqual(['usage', 'complexity']);
  });
  it('high readiness outside the high-usage, low-complexity cell -> level 2', () => {
    expect(recommendAutonomy({ ...base, usage: 'medium' }, 'limited').recommended).toBe(2);
    expect(recommendAutonomy({ ...base, complexity: 'medium' }, 'limited').recommended).toBe(2);
  });
  it('medium readiness -> level 2 (supervised autonomy)', () => {
    for (const [usage, complexity] of [['high', 'low'], ['medium', 'medium'], ['high', 'medium'], ['medium', 'low']])
      expect(recommendAutonomy({ ...base, usage, complexity, readiness: 'medium' }, 'limited').recommended).toBe(2);
  });
  it('low readiness -> level 3 (AI assistance)', () => {
    for (const [usage, complexity] of [['high', 'low'], ['medium', 'medium']])
      expect(recommendAutonomy({ ...base, usage, complexity, readiness: 'low' }, 'limited').recommended).toBe(3);
  });
  it('a High tier or a regulated domain never allows level 1', () => {
    expect(recommendAutonomy(base, 'high')).toMatchObject({ recommended: 2, capReasons: ['tier-high'] });
    expect(recommendAutonomy({ ...base, regulated: 'yes' }, 'limited')).toMatchObject({ recommended: 2, capReasons: ['regulated'] });
    expect(recommendAutonomy({ ...base, readiness: 'low' }, 'high').capReasons).toEqual([]);
  });
  it('unacceptable tier -> level 4', () => {
    expect(recommendAutonomy(base, 'unacceptable')).toMatchObject({ recommended: 4, capReasons: ['tier-unacceptable'], notSuitable: [] });
  });
  it('maps the designed autonomy onto the same scale', () => {
    const lvl = (autonomy: string) => recommendAutonomy({ ...base, autonomy }, 'limited').actual;
    expect([lvl('suggests'), lvl('approval'), lvl('monitored'), lvl('full')]).toEqual([3, 2, 2, 1]);
  });
  it('flags when the design is more autonomous (a lower number) than recommended', () => {
    const r = recommendAutonomy({ ...base, complexity: 'medium' }, 'limited');
    expect(r).toMatchObject({ recommended: 2, actual: 1, exceeds: true });
    expect(recommendAutonomy({ ...base, complexity: 'medium', autonomy: 'approval' }, 'limited').exceeds).toBe(false);
    expect(recommendAutonomy({ ...base, readiness: 'low', autonomy: 'suggests' }, 'limited').exceeds).toBe(false);
  });
  it('all-"low" answers (the tester case) -> not suitable yet, and even a suggest-only design is flagged', () => {
    const r = recommendAutonomy({ usage: 'low', complexity: 'low', readiness: 'low', autonomy: 'suggests' }, 'limited');
    expect(r).toMatchObject({ recommended: 4, actual: 3, exceeds: true, notSuitable: ['usage'] });
  });
});

describe('nextSteps (level 4, not suitable yet)', () => {
  const steps = (answers: Record<string, string>, tier: 'limited' | 'unacceptable' = 'limited') =>
    nextSteps(recommendAutonomy({ autonomy: 'suggests', ...answers }, tier), answers);

  it('gives no steps unless the recommendation is level 4', () => {
    expect(steps({ usage: 'high', complexity: 'low', readiness: 'low' })).toEqual([]);
    expect(steps({ usage: 'high', complexity: 'low' })).toEqual([]);
  });
  it('a prohibited use gets no readiness steps', () => {
    expect(steps({ usage: 'high', complexity: 'low', readiness: 'high' }, 'unacceptable')).toEqual([]);
  });
  it('high complexity -> simplify and standardise the process first', () => {
    expect(steps({ usage: 'high', complexity: 'high', readiness: 'high' })).toEqual(['simplify', 'owner', 'reassess']);
  });
  it('low usage -> check the case for AI', () => {
    expect(steps({ usage: 'low', complexity: 'low', readiness: 'high' })).toEqual(['volume', 'owner', 'reassess']);
  });
  it('readiness below high adds data and systems work', () => {
    expect(steps({ usage: 'low', complexity: 'high', readiness: 'low' })).toEqual(['simplify', 'volume', 'data', 'owner', 'reassess']);
  });
});
