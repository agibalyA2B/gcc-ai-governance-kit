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
