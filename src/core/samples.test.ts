import { privateSectorExamples } from './samples';
import { computeTier } from './scoring';

// Illustrative examples for the private-sector pack (not calibration fixtures): their tiers are what the current
// weights produce, locked so a weight change that moves them is noticed.
describe('private-sector examples', () => {
  it('covers HR, Marketing, Sales, Finance, Supply chain and construction disputes, with a spread of tiers', () => {
    const ex = privateSectorExamples('en');
    expect(ex.map((u) => u.businessUnit)).toEqual(['HR', 'Marketing', 'Sales', 'Finance', 'Supply chain', 'Commercial & claims']);
    expect(ex.map((u) => computeTier(u.answers).tier)).toEqual(['high', 'limited', 'limited', 'little', 'high', 'high']);
    for (const u of ex) {
      expect(computeTier(u.answers).quickComplete).toBe(true);
      expect(u.answers.runtime_ai).toBe('yes');
      expect(u.purpose.length).toBeGreaterThan(20);
    }
  });
  it('has the same examples and answers in Arabic', () => {
    const [en, ar] = [privateSectorExamples('en'), privateSectorExamples('ar')];
    expect(ar.map((u) => u.answers)).toEqual(en.map((u) => u.answers));
    for (const u of ar) expect(u.name).toMatch(/[؀-ۿ]/);
  });
  it('gives each example a fresh id', () => {
    const a = privateSectorExamples('en'); const b = privateSectorExamples('en');
    expect(new Set([...a, ...b].map((u) => u.id)).size).toBe(12);
  });
});
