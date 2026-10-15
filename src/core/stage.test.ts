import { stageGaps, normaliseStage, normaliseStageDate, STAGES, RELEASE_GATE_CONTROLS } from './stage';
import { parseRegister } from './usecase';
import { CROSSWALK } from './controls';

const all = new Set(CROSSWALK.map((c) => c.id));
const gap = { status: 'gap' as const, note: '' };

describe('release stage banner rule', () => {
  it('shows for Bounded or Expansion while a stop-switch, logging or oversight control is Gap', () => {
    expect(stageGaps('bounded', { 'CTL-HUM-06': gap }, all)).toEqual(['CTL-HUM-06']);
    expect(stageGaps('expansion', { 'CTL-MON-02': gap, 'CTL-HUM-11': gap }, all)).toEqual(['CTL-MON-02', 'CTL-HUM-11']);
  });
  it('does not show for earlier stages, without gaps, or for controls that do not apply', () => {
    for (const s of ['pre-pilot', 'replay', 'shadow', 'assisted'] as const) expect(stageGaps(s, { 'CTL-HUM-06': gap }, all)).toEqual([]);
    expect(stageGaps('bounded', { 'CTL-HUM-06': { status: 'partly', note: '' } }, all)).toEqual([]);
    expect(stageGaps('bounded', { 'CTL-HUM-06': gap }, new Set(['CTL-MON-02']))).toEqual([]);
    expect(stageGaps(undefined, { 'CTL-HUM-06': gap }, all)).toEqual([]);
  });
  it('gate controls are real control ids', () => {
    for (const id of Object.values(RELEASE_GATE_CONTROLS).flat()) expect(all.has(id)).toBe(true);
  });
  it('stages are named, not numbered, and start before the pilot', () => {
    expect(STAGES).toEqual(['pre-pilot', 'replay', 'shadow', 'assisted', 'bounded', 'expansion']);
  });
});

describe('stage in a backup', () => {
  it('keeps a valid stage and date and drops bad ones', () => {
    expect(normaliseStage('shadow')).toBe('shadow');
    expect(normaliseStage('3')).toBeUndefined();
    expect(normaliseStageDate('2026-10-15')).toBe('2026-10-15');
    expect(normaliseStageDate('soon')).toBeUndefined();
    const u = { id: 'u', name: 'A', owner: 'B', answers: {}, createdAt: 'x', updatedAt: 'x', releaseStage: 'bounded', stageDate: '2026-10-01' };
    expect(parseRegister({ format: 'gcc-ai-governance-kit/register', version: 1, useCases: [u, { ...u, id: 'v', releaseStage: 'level-2', stageDate: 'x' }] })!
      .map((x) => [x.releaseStage, x.stageDate])).toEqual([['bounded', '2026-10-01'], [undefined, undefined]]);
  });
});
