import { reportView } from './views';
import { computeTier } from '../core/scoring';
import { applicableControls } from '../core/controls';
import { ALL_FRAMEWORKS } from '../core/frameworks';
import { sampleUseCases } from '../core/usecase';

describe('committee report evidence', () => {
  const uc = sampleUseCases('en')[0];
  const r = computeTier(uc.answers);
  const [first, second] = applicableControls(r.tier, uc.answers, [...ALL_FRAMEWORKS]);
  const withEvidence = { ...uc, evidence: { [first.id]: { status: 'met' as const, note: 'Policy <v2> approved' }, [second.id]: { status: 'gap' as const, note: '' } } };

  it('shows each control status and its evidence, escaped', () => {
    const html = reportView('en', withEvidence, r, [...ALL_FRAMEWORKS]);
    expect(html).toContain('Evidence status');
    expect(html).toContain('Policy &lt;v2&gt; approved');
    expect(html).toMatch(/<td>Met<\/td><td><strong>/);
    expect(html).toContain('1 Met');
    expect(html).toContain('1 Gap');
  });
  it('renders Arabic status labels', () => {
    expect(reportView('ar', withEvidence, r, [...ALL_FRAMEWORKS])).toContain('<td>مستوفى</td>');
  });
  it('still renders for a use case with no evidence', () => {
    expect(reportView('en', uc, r, [...ALL_FRAMEWORKS])).toContain('<td>☐</td>');
  });
});

describe('level 4 clarifier', () => {
  it('appears next to the official level-4 term in both languages, and only for level 4', async () => {
    const { scoringView } = await import('./views');
    for (const [lang, term, clar] of [['en', 'Not suitable for AI yet', 'Not ready for autonomy yet'], ['ar', 'غير مناسب للذكاء الاصطناعي حالياً', 'غير جاهز للاستقلالية بعد']] as const) {
      const html = scoringView(lang);
      expect(html).toContain(term);
      expect(html.match(/class="l4-clarify"/g)).toHaveLength(1);
      expect(html).toContain(clar);
    }
  });
});

describe('fix-in-this-order section (ADR 018)', () => {
  const uc = sampleUseCases('en')[0];
  const r = computeTier(uc.answers);
  const ids = applicableControls(r.tier, uc.answers, [...ALL_FRAMEWORKS]).map((c) => c.id);
  it('lists Gap and Partly controls in the committee report, prerequisites first, in both languages', () => {
    const pre = ids.includes('CTL-MON-02') && ids.includes('CTL-MON-03') ? ['CTL-MON-02', 'CTL-MON-03'] : null;
    const ev = pre ? { [pre[0]]: { status: 'partly' as const, note: '' }, [pre[1]]: { status: 'gap' as const, note: '' } } : { [ids[0]]: { status: 'gap' as const, note: '' } };
    const html = reportView('en', { ...uc, evidence: ev }, r, [...ALL_FRAMEWORKS]);
    expect(html).toContain('Fix in this order');
    if (pre) expect(html.indexOf(`data-ctl="${pre[0]}"`)).toBeLessThan(html.indexOf(`data-ctl="${pre[1]}"`));
    expect(reportView('ar', { ...uc, evidence: ev }, r, [...ALL_FRAMEWORKS])).toContain('ترتيب المعالجة');
  });
  it('says so when nothing is open', () => {
    expect(reportView('en', uc, r, [...ALL_FRAMEWORKS])).toContain('No control is marked Gap or Partly met yet.');
  });
});

describe('target-framework gap count in the committee report (ADR 019)', () => {
  const uc = sampleUseCases('en')[0];
  const r = computeTier(uc.answers);
  it('appears only when a target is picked, with the NIST functions for NIST', () => {
    expect(reportView('en', uc, r, [...ALL_FRAMEWORKS])).not.toContain('data-testid="gap-line"');
    const html = reportView('en', uc, r, [...ALL_FRAMEWORKS], 'nist_ai_rmf');
    expect(html).toMatch(/\d+ of \d+ controls mapped to NIST AI RMF are still at Gap or Partly met/);
    expect(html).toContain('data-testid="gap-nist"');
    expect(html).toContain('not a conformity assessment');
    expect(reportView('en', uc, r, [...ALL_FRAMEWORKS], 'uae_csc_ai')).not.toContain('data-testid="gap-nist"');
    expect(reportView('ar', uc, r, [...ALL_FRAMEWORKS], 'nist_ai_rmf')).toContain('الحوكمة (Govern)');
  });
});
