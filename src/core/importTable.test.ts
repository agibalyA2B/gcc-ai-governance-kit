import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { casesFromRows } from './importTable';
import { readTable } from '../export/tabular';
import { computeTier } from './scoring';

const ROOT = join(__dirname, '../..');
const header = ['id', 'name', 'owner', 'status', 'product', 'deployment', 'runtime_ai', 'ai_type', 'impact', 'data', 'affected', 'autonomy', 'oversight', 'access', 'reversibility', 'tier'];

describe('casesFromRows', () => {
  it('maps columns by field name, accepts option ids or visible labels, and recomputes the tier', () => {
    const rows = [header,
      ['', 'Claims drafter', 'Legal', 'pilot', 'Claims suite', 'SaaS', 'yes', 'generative', 'decide-organisations', 'internal', 'Customers or the public', 'suggests', 'every', 'none', 'effort', 'little']];
    const { cases, skipped, warnings } = casesFromRows(rows)!;
    expect(skipped).toEqual([]);
    expect(warnings).toEqual([]);
    expect(cases[0]).toMatchObject({ name: 'Claims drafter', owner: 'Legal', status: 'pilot', product: 'Claims suite', deployment: 'SaaS' });
    expect(cases[0].answers.affected).toBe('public');
    expect(computeTier(cases[0].answers).tier).toBe('limited'); // the typed "little" is ignored
  });
  it('skips the human-label row, blank rows and rows without a name or owner, and reports why', () => {
    const rows = [header, ['ID', 'Use case', 'Owner'], [], ['', '', 'Ops'], ['', 'No owner', '']];
    const { cases, skipped } = casesFromRows(rows)!;
    expect(cases).toEqual([]);
    expect(skipped).toEqual([{ row: 4, reason: 'name' }, { row: 5, reason: 'owner' }]);
  });
  it('warns about unrecognised answers and statuses instead of guessing', () => {
    const rows = [header, ['', 'Bot', 'Ops', 'live', '', '', 'yes', 'robotic', 'internal']];
    const { cases, warnings } = casesFromRows(rows)!;
    expect(cases[0].status).toBe('idea');
    expect(cases[0].answers.ai_type).toBeUndefined();
    expect(warnings).toEqual([{ row: 2, field: 'status', value: 'live' }, { row: 2, field: 'ai_type', value: 'robotic' }]);
  });
  it('gives every row a unique id, keeping a supplied one', () => {
    const { cases } = casesFromRows([header, ["keep-me", "A", "B"], ["keep-me", "C", "D"], ["", "E", "F"]])!;
    expect(cases[0].id).toBe('keep-me');
    expect(new Set(cases.map((c) => c.id)).size).toBe(3);
  });
  it('returns null when the name or owner column is missing', () => {
    expect(casesFromRows([['title', 'who'], ['A', 'B']])).toBeNull();
  });
});

describe('the register template imports back', () => {
  for (const [lang, ext] of [['en', 'xlsx'], ['en', 'csv'], ['ar', 'xlsx'], ['ar', 'csv']] as const)
    it(`${lang}/register.${ext}: both example rows, with their stated tiers`, () => {
      const buf = readFileSync(join(ROOT, 'public/templates', lang, `register.${ext}`));
      const rows = readTable(new Uint8Array(buf).buffer);
      const { cases, skipped, warnings } = casesFromRows(rows)!;
      expect(skipped).toEqual([]);
      expect(warnings).toEqual([]);
      expect(cases.map((c) => computeTier(c.answers).tier)).toEqual(['limited', 'high']);
    });
});
