import { fixOrder } from './fixorder';
import { CROSSWALK, type Control } from './controls';

const ctl = (id: string, theme: string, depends_on?: string[]): Control => ({
  id, theme, title_en: id, title_ar: id, control_text_en: '', control_text_ar: '', applies_when: { min_tier: 'little' },
  ...(depends_on ? { depends_on } : {}), refs: {} as Control['refs'], source_urls: [], verified: true, verified_on: null, notes: '',
});
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe('fix-in-this-order list (G2)', () => {
  const A = ctl('CTL-ACC-01', 'accountability');
  const B = ctl('CTL-MON-01', 'monitoring', ['CTL-ACC-01']);
  const C = ctl('CTL-TRA-01', 'transparency');

  it('lists only Gap and Partly controls, prerequisites first', () => {
    const out = fixOrder([B, A, C], { 'CTL-ACC-01': { status: 'partly', note: '' }, 'CTL-MON-01': { status: 'gap', note: '' }, 'CTL-TRA-01': { status: 'met', note: '' } });
    expect(ids(out)).toEqual(['CTL-ACC-01', 'CTL-MON-01']);
    expect(out[1].after).toEqual([{ id: 'CTL-ACC-01', status: 'partly' }]);
  });
  it('ties go Gap before Partly, then by theme order, then by id', () => {
    const D = ctl('CTL-DAT-01', 'data');
    const out = fixOrder([D, C, A], { 'CTL-DAT-01': { status: 'gap', note: '' }, 'CTL-TRA-01': { status: 'gap', note: '' }, 'CTL-ACC-01': { status: 'partly', note: '' } });
    expect(ids(out)).toEqual(['CTL-TRA-01', 'CTL-DAT-01', 'CTL-ACC-01']);
  });
  it('a prerequisite not yet reviewed is named but not listed; Met and N/A ones are satisfied', () => {
    expect(fixOrder([A, B], { 'CTL-MON-01': { status: 'gap', note: '' } })[0].after).toEqual([{ id: 'CTL-ACC-01', status: 'unset' }]);
    for (const status of ['met', 'na'] as const)
      expect(fixOrder([A, B], { 'CTL-ACC-01': { status, note: '' }, 'CTL-MON-01': { status: 'gap', note: '' } })[0].after).toEqual([]);
  });
  it('ignores dependencies on controls that do not apply', () => {
    expect(fixOrder([B], { 'CTL-MON-01': { status: 'gap', note: '' } })[0].after).toEqual([]);
  });
  it('is empty when nothing is at Gap or Partly', () => {
    expect(fixOrder([A, B, C], {})).toEqual([]);
  });
  it('orders the real crosswalk with every prerequisite before its dependants', () => {
    const ev = Object.fromEntries(CROSSWALK.map((c) => [c.id, { status: 'gap' as const, note: '' }]));
    const out = ids(fixOrder(CROSSWALK, ev));
    expect(out).toHaveLength(CROSSWALK.length);
    for (const c of CROSSWALK) for (const d of c.depends_on ?? []) expect(out.indexOf(d)).toBeLessThan(out.indexOf(c.id));
  });
});
