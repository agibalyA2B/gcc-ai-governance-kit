import { computeTier } from './scoring';
import { recommendAutonomy } from './autonomy';
import { actionMatrix } from './actions';
import { applicableControls } from './controls';
import { ALL_FRAMEWORKS } from './frameworks';
import { buildBrief } from './brief';
import { blankUseCase, parseRegister, showsEuNote, EU_EXPOSURE, type UseCase } from './usecase';
import { sampleUseCases } from './usecase';

describe('EU exposure question (ADR 017)', () => {
  const base = sampleUseCases('en')[0];
  const variants: UseCase[] = [undefined, ...EU_EXPOSURE].map((euExposure) => ({ ...base, euExposure }));

  it('never changes the tier, the recommended autonomy, the action matrix or the controls', () => {
    const shape = (u: UseCase) => {
      const r = computeTier(u.answers);
      return JSON.stringify([r.tier, r.points, recommendAutonomy(u.answers, r.tier), actionMatrix(u.answers, r.tier, u.actions),
        applicableControls(r.tier, u.answers, [...ALL_FRAMEWORKS]).map((c) => c.id)]);
    };
    for (const v of variants) expect(shape(v)).toBe(shape(base));
  });
  it('only surfaces the note, for Yes and Not sure', () => {
    expect(variants.map(showsEuNote)).toEqual([false, false, true, true]);
    const brief = buildBrief({ ...base, euExposure: 'yes' }, 'en', [...ALL_FRAMEWORKS]);
    expect(brief.blocks.find((b) => b.id === 'constraints')!.items.join(' ')).toContain('see the EN 18286 note');
    expect(buildBrief(base, 'en', [...ALL_FRAMEWORKS]).blocks.find((b) => b.id === 'constraints')!.items.join(' ')).not.toContain('EN 18286');
  });
  it('is kept in a backup, and an unknown value is dropped', () => {
    const u = { ...blankUseCase('x'), name: 'A', owner: 'B' };
    const out = parseRegister({ format: 'gcc-ai-governance-kit/register', version: 1, useCases: [{ ...u, euExposure: 'yes' }, { ...u, id: 'z', euExposure: 'maybe' }] })!;
    expect(out.map((x) => x.euExposure)).toEqual(['yes', undefined]);
  });
});
