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

describe('UAE AI Charter references (verified 15 Oct 2026)', () => {
  const OFFICIAL = [
    'Strengthening human-machine ties', 'Safety', 'Algorithmic bias', 'Data privacy', 'Transparency', 'Human oversight',
    'Governance and accountability', 'Technological excellence', 'Human commitment', 'Peaceful coexistence with AI',
    'Promoting AI awareness for an inclusive future', 'Commitment to treaties and applicable laws',
  ];
  it('every control is verified', () => {
    expect(CROSSWALK.filter((c) => !c.verified).map((c) => c.id)).toEqual([]);
  });
  it('every Charter reference uses an official principle name', () => {
    for (const c of CROSSWALK) for (const name of c.refs.uae_charter) expect(OFFICIAL).toContain(name);
  });
});

describe('oversight effectiveness control (ADR 013)', () => {
  it('applies to every AI type from Limited, is verified, and treats approval signals as triggers', () => {
    const c = byId('CTL-HUM-11');
    expect(c.theme).toBe('human-oversight');
    expect(c.verified).toBe(true);
    for (const t of ['predictive', 'generative', 'agentic']) expect(ids('limited', t)).toContain('CTL-HUM-11');
    expect(ids('little', 'agentic')).not.toContain('CTL-HUM-11');
    expect(c.control_text_en).toMatch(/triggers to investigate/);
  });
});

describe('NIST AI RMF references (completed 9 Nov 2026)', () => {
  // Every subcategory ID in NIST AI 100-1, Tables 1-4 (72 in all).
  const range = (fn: string, ids: string) => ids.split(' ').map((n) => `${fn} ${n}`);
  const NIST_IDS = [
    ...range('GOVERN', '1.1 1.2 1.3 1.4 1.5 1.6 1.7 2.1 2.2 2.3 3.1 3.2 4.1 4.2 4.3 5.1 5.2 6.1 6.2'),
    ...range('MAP', '1.1 1.2 1.3 1.4 1.5 1.6 2.1 2.2 2.3 3.1 3.2 3.3 3.4 3.5 4.1 4.2 5.1 5.2'),
    ...range('MEASURE', '1.1 1.2 1.3 2.1 2.2 2.3 2.4 2.5 2.6 2.7 2.8 2.9 2.10 2.11 2.12 2.13 3.1 3.2 3.3 4.1 4.2 4.3'),
    ...range('MANAGE', '1.1 1.2 1.3 1.4 2.1 2.2 2.3 2.4 3.1 3.2 4.1 4.2 4.3'),
  ];
  it('every NIST reference is a real AI RMF 1.0 subcategory', () => {
    expect(NIST_IDS).toHaveLength(72);
    for (const c of CROSSWALK) for (const r of c.refs.nist_ai_rmf) expect(NIST_IDS).toContain(r);
  });
  it('every control carries a NIST reference except three that no subcategory covers, and says so', () => {
    const unmapped = CROSSWALK.filter((c) => !c.refs.nist_ai_rmf.length).map((c) => c.id);
    expect(unmapped).toEqual(['CTL-TRA-04', 'CTL-TRA-08', 'CTL-DAT-09']);
    for (const id of unmapped) expect(byId(id).notes).toMatch(/no subcategory covers/);
  });
  it('rows given NIST references cite the NIST AI RMF source', () => {
    for (const c of CROSSWALK) if (c.refs.nist_ai_rmf.length) expect(c.source_urls.some((u) => u.includes('nvlpubs.nist.gov'))).toBe(true);
  });
});
