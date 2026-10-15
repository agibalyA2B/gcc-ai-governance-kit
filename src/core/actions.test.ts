import { actionMatrix, setAction, normaliseActions, ACTIONS, PROVISIONAL_LEVEL } from './actions';

// Prioritisation answers that give each recommended level (see autonomy.test.ts).
const L1 = { usage: 'high', complexity: 'low', readiness: 'high' };
const L2 = { usage: 'high', complexity: 'low', readiness: 'medium' };
const L3 = { usage: 'high', complexity: 'low', readiness: 'low' };
const L4 = { usage: 'low', complexity: 'low', readiness: 'high' };
const easy = { reversibility: 'easy' };
const perms = (answers: Record<string, string>, tier: 'little' | 'limited' | 'high' | 'unacceptable' = 'limited') =>
  actionMatrix(answers, tier).rows.map((r) => r.permission);

describe('actionMatrix pre-fill', () => {
  it('follows the recommended level, one ceiling per action', () => {
    expect(perms({ ...L1, ...easy })).toEqual(['allowed', 'allowed', 'allowed', 'allowed', 'allowed', 'allowed']);
    expect(perms({ ...L2, ...easy })).toEqual(['allowed', 'allowed', 'allowed', 'allowed', 'approval', 'approval']);
    expect(perms({ ...L3, ...easy })).toEqual(['approval', 'allowed', 'allowed', 'approval', 'approval', 'blocked']);
    expect(perms({ ...L4, ...easy })).toEqual(Array(6).fill('blocked'));
  });
  it('level 3: a person decides every output, so the AI never decides', () => {
    expect(actionMatrix({ ...L3, ...easy }, 'little').rows.find((r) => r.id === 'decide')!.permission).toBe('blocked');
  });
  it('is provisional at level 3 until the prioritisation questions are answered', () => {
    const m = actionMatrix(easy, 'limited');
    expect(m).toMatchObject({ provisional: true, level: PROVISIONAL_LEVEL });
    expect(actionMatrix({ ...L2, ...easy }, 'limited').provisional).toBe(false);
  });
  it('tier floors: High caps deciding and communicating at "needs approval"', () => {
    // A High tier caps the level at 2 anyway; check the floor on its own by forcing level 1 answers.
    const m = actionMatrix({ ...L1, ...easy }, 'high');
    expect(m.rows.find((r) => r.id === 'decide')).toMatchObject({ ceiling: 'approval' });
    expect(m.rows.find((r) => r.id === 'communicate')).toMatchObject({ ceiling: 'approval' });
  });
  it('irreversible or regulated decisions always need approval, even at level 1', () => {
    const hard = actionMatrix({ ...L1, reversibility: 'hard' }, 'limited').rows;
    expect(hard.find((r) => r.id === 'decide')).toMatchObject({ ceiling: 'approval', capReasons: ['irreversible'] });
    expect(hard.find((r) => r.id === 'update')!.ceiling).toBe('approval');
    // A regulated domain already caps level 1 at level 2; deciding still needs approval.
    expect(actionMatrix({ ...L1, ...easy, regulated: 'yes' }, 'limited').rows.find((r) => r.id === 'decide')!.ceiling).toBe('approval');
  });
  it('an Unacceptable tier blocks everything', () => {
    expect(perms({ ...L1, ...easy }, 'unacceptable')).toEqual(Array(6).fill('blocked'));
  });
});

describe('tighten, never loosen', () => {
  it('accepts a stricter setting and applies it', () => {
    const s = setAction({}, 'classify', { permission: 'approval' }, 'allowed')!;
    expect(actionMatrix({ ...L1, ...easy }, 'limited', s).rows[0]).toMatchObject({ permission: 'approval', loosened: false });
  });
  it('refuses a looser setting', () => {
    expect(setAction({}, 'decide', { permission: 'allowed' }, 'approval')).toBeNull();
  });
  it('ignores and flags a looser setting that arrives in an imported file', () => {
    const row = actionMatrix({ ...L3, ...easy }, 'limited', { decide: { permission: 'allowed' } }).rows.find((r) => r.id === 'decide')!;
    expect(row).toMatchObject({ permission: 'blocked', loosened: true });
  });
  it('a stricter setting stays when the recommendation later drops', () => {
    const s = { communicate: { permission: 'blocked' as const } };
    expect(actionMatrix({ ...L2, ...easy }, 'limited', s).rows.find((r) => r.id === 'communicate')!.permission).toBe('blocked');
  });
  it('keeps limits, reversibility and approver role per row', () => {
    const s = setAction({}, 'update', { limits: 'Up to 50 a day', reversible: 'yes', approver: 'Duty supervisor' }, 'allowed')!;
    expect(actionMatrix({ ...L1, ...easy }, 'limited', s).rows[3]).toMatchObject({ limits: 'Up to 50 a day', reversible: 'yes', approver: 'Duty supervisor' });
  });
});

describe('normaliseActions', () => {
  it('drops unknown actions, bad values and empty rows', () => {
    expect(normaliseActions({ hack: { permission: 'allowed' }, draft: { permission: 'maybe', reversible: 'x' }, decide: { permission: 'blocked' } }))
      .toEqual({ decide: { permission: 'blocked' } });
    expect(normaliseActions('nope')).toBeUndefined();
    expect(normaliseActions({})).toBeUndefined();
  });
  it('caps free text', () => {
    expect(normaliseActions({ draft: { limits: 'x'.repeat(900) } })!.draft!.limits).toHaveLength(500);
  });
  it('covers the six actions of the release-ladder guide', () => {
    expect(ACTIONS).toEqual(['classify', 'recommend', 'draft', 'update', 'communicate', 'decide']);
  });
});
