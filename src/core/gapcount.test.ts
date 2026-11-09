import { gapCount, nistByFunction, NIST_FUNCTIONS } from './gapcount';
import { applicableControls } from './controls';
import { computeTier } from './scoring';
import { sampleUseCases } from './usecase';

describe('target-framework gap count (G8, ADR 019)', () => {
  const uc = sampleUseCases('en')[0];
  const r = computeTier(uc.answers);
  const csc = applicableControls(r.tier, uc.answers, ['uae_csc_ai']).map((c) => c.id);

  it('counts only applicable controls that map to the target, by evidence status', () => {
    const ev = { [csc[0]]: { status: 'gap' as const, note: '' }, [csc[1]]: { status: 'partly' as const, note: '' }, [csc[2]]: { status: 'met' as const, note: '' }, 'CTL-DAT-09': { status: 'gap' as const, note: '' } };
    const g = gapCount(uc, 'uae_csc_ai', ev);
    expect(g.total).toBe(csc.length);
    expect(g).toMatchObject({ gap: 1, partly: 1, met: 1, na: 0, unset: csc.length - 3, open: 2 });
  });
  it('every applicable control is counted exactly once in the totals', () => {
    const g = gapCount(uc, 'uae_pdpl', {});
    expect(g.total).toBe(g.gap + g.partly + g.met + g.na + g.unset);
  });
  it('returns nothing for a prohibited (unacceptable) use case', () => {
    expect(gapCount({ ...uc, answers: { ...uc.answers, impact: 'prohibited' } }, 'nist_ai_rmf', {}).total).toBe(0);
  });
  it('groups NIST by function; a control citing two functions counts once in each', () => {
    const fns = nistByFunction(uc, {});
    expect(Object.keys(fns)).toEqual([...NIST_FUNCTIONS]);
    const all = applicableControls(r.tier, uc.answers, ['nist_ai_rmf']);
    for (const fn of NIST_FUNCTIONS) expect(fns[fn].total).toBe(all.filter((c) => c.refs.nist_ai_rmf.some((x) => x.startsWith(`${fn} `))).length);
    expect(fns.GOVERN.total + fns.MAP.total + fns.MEASURE.total + fns.MANAGE.total).toBeGreaterThanOrEqual(all.length);
  });
});
