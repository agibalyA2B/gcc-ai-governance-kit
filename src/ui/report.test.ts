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
