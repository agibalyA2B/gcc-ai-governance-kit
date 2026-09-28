import { applicableControls, CROSSWALK } from './controls';
import { ALL_FRAMEWORKS } from './frameworks';

const byId = (id: string) => CROSSWALK.find((c) => c.id === id)!;
const ids = (tier: 'little' | 'limited' | 'high', ai_type: string) => applicableControls(tier, { ai_type }, [...ALL_FRAMEWORKS]).map((c) => c.id);

describe('security controls split from CTL-SEC-02 (ADR 010)', () => {
  it('CTL-SEC-02 stays the threat assessment; red-team testing and model supply chain are separate controls', () => {
    expect(byId('CTL-SEC-02').title_en).toBe('AI-specific security assessment');
    expect(byId('CTL-SEC-09').title_en).toMatch(/red-team/i);
    expect(byId('CTL-SEC-10').title_en).toMatch(/supply chain/i);
  });
  it('red-team and jailbreak testing applies to generative and agentic systems from Limited', () => {
    expect(ids('limited', 'generative')).toContain('CTL-SEC-09');
    expect(ids('limited', 'agentic')).toContain('CTL-SEC-09');
    expect(ids('limited', 'predictive')).not.toContain('CTL-SEC-09');
    expect(ids('little', 'generative')).not.toContain('CTL-SEC-09');
  });
  it('model supply-chain security applies to every AI type from Limited', () => {
    for (const t of ['predictive', 'generative', 'agentic']) expect(ids('limited', t)).toContain('CTL-SEC-10');
  });
  it('both new rows are verified, dated and sourced, and cite only confirmed references', () => {
    for (const id of ['CTL-SEC-09', 'CTL-SEC-10']) {
      const c = byId(id);
      expect(c.verified).toBe(true);
      expect(c.verified_on).toBe('2026-09-28');
      expect(c.source_urls.length).toBeGreaterThanOrEqual(3);
      expect(c.refs.uae_charter).toEqual([]);
    }
    expect(byId('CTL-SEC-09').refs.nist_ai_rmf).toEqual(['MEASURE 1.3', 'MEASURE 2.6', 'MEASURE 2.7']);
    expect(byId('CTL-SEC-10').refs.nist_ai_rmf).toEqual(['GOVERN 6.1', 'MAP 4.1', 'MANAGE 3.2']);
  });
});
