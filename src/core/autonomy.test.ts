import { recommendAutonomy } from './autonomy';

const base = { usage: 'high', complexity: 'low', readiness: 'high', autonomy: 'full' };

describe('recommendAutonomy', () => {
  it('is incomplete until the three prioritisation answers exist', () => {
    expect(recommendAutonomy({ autonomy: 'full' }, 'limited').complete).toBe(false);
  });
  it('high use, low complexity, high readiness -> level 4', () => {
    expect(recommendAutonomy(base, 'limited').recommended).toBe(4);
  });
  it('low readiness -> level 1 (not suitable yet)', () => {
    expect(recommendAutonomy({ ...base, readiness: 'low' }, 'limited').recommended).toBe(1);
  });
  it('high complexity -> assistance only, or not suitable when readiness is not high', () => {
    expect(recommendAutonomy({ ...base, complexity: 'high' }, 'limited').recommended).toBe(2);
    expect(recommendAutonomy({ ...base, complexity: 'high', readiness: 'medium' }, 'limited').recommended).toBe(1);
  });
  it('medium complexity -> supervised autonomy', () => {
    expect(recommendAutonomy({ ...base, complexity: 'medium' }, 'limited').recommended).toBe(3);
  });
  it('high risk tier or a regulated domain caps full autonomy at supervised', () => {
    expect(recommendAutonomy(base, 'high')).toMatchObject({ recommended: 3, capReasons: ['tier-high'] });
    expect(recommendAutonomy({ ...base, regulated: 'yes' }, 'limited').capReasons).toEqual(['regulated']);
  });
  it('flags when actual autonomy exceeds the recommendation', () => {
    const r = recommendAutonomy({ ...base, complexity: 'medium' }, 'limited');
    expect(r.actual).toBe(4);
    expect(r.exceeds).toBe(true);
  });
  it('unacceptable tier -> level 1', () => {
    expect(recommendAutonomy(base, 'unacceptable').recommended).toBe(1);
  });
});
