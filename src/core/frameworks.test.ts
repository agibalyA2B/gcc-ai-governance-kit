import { FRAMEWORKS, FRAMEWORK_SOURCES, refSource } from './frameworks';
import { CROSSWALK } from './controls';

describe('official source links (every reference is checkable)', () => {
  it('every framework has an https official source', () => {
    for (const f of FRAMEWORKS) expect(FRAMEWORK_SOURCES[f.id]).toMatch(/^https:\/\//);
  });
  it('every reference in the crosswalk resolves to a link, except the two documents with no public URL', () => {
    for (const c of CROSSWALK) for (const f of FRAMEWORKS) for (const r of c.refs[f.id] ?? []) {
      const u = refSource(f.id, r);
      if (/^(Data Sharing Policy|Agentic Reference)/.test(r)) expect(u).toBeNull();
      else expect(u).toMatch(/^https:\/\//);
    }
  });
  it('Agentic Guide sections link to the EGSEP guide', () => {
    expect(refSource('uae_gov_code', 'Agentic Guide §05')).toContain('egsep.ae');
  });
});

describe('UAE PDPL and CSC AI Security Policy (added 16 Oct 2026)', () => {
  it('both frameworks exist with official sources and verified references', () => {
    expect(FRAMEWORK_SOURCES.uae_pdpl).toContain('uaelegislation.gov.ae');
    expect(FRAMEWORK_SOURCES.uae_csc_ai).toContain('csc.gov.ae');
    const pdpl = CROSSWALK.filter((c) => (c.refs.uae_pdpl ?? []).length);
    const csc = CROSSWALK.filter((c) => (c.refs.uae_csc_ai ?? []).length);
    expect(pdpl.length).toBe(8);
    expect(csc.length).toBe(15);
    for (const c of pdpl) for (const r of c.refs.uae_pdpl) expect(r).toMatch(/^Art\. (5|8|9|13|18|20|21)$/);
    for (const c of csc) for (const r of c.refs.uae_csc_ai) expect(r).toMatch(/^2\.[1-6]\.\d$/);
    for (const c of [...pdpl, ...csc]) expect(c.verified).toBe(true);
  });
  it('the right to challenge cites PDPL Art. 18 (objection to automated decisions)', () => {
    expect(CROSSWALK.find((c) => c.id === 'CTL-HUM-02')!.refs.uae_pdpl).toEqual(['Art. 18']);
  });
});
