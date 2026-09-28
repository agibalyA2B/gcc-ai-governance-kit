import { normaliseEvidence, setEvidence, evidenceSummary } from './evidence';
import { parseRegister } from './usecase';

describe('normaliseEvidence', () => {
  it('keeps valid entries and drops anything malformed', () => {
    const raw = {
      'CTL-ACC-01': { status: 'met', note: 'Policy approved 2026-03' },
      'CTL-SEC-02': { status: 'partly', note: '' },
      'CTL-DAT-01': { status: 'bogus', note: 'kept, status cleared' },
      'not-a-control': { status: 'met', note: 'x' },
      'CTL-MON-01': 'met',
      'CTL-MON-02': { status: '', note: '' },
    };
    expect(normaliseEvidence(raw)).toEqual({
      'CTL-ACC-01': { status: 'met', note: 'Policy approved 2026-03' },
      'CTL-SEC-02': { status: 'partly', note: '' },
      'CTL-DAT-01': { status: '', note: 'kept, status cleared' },
    });
  });
  it('returns an empty map for missing or non-object input', () => {
    expect(normaliseEvidence(undefined)).toEqual({});
    expect(normaliseEvidence([1, 2])).toEqual({});
  });
});

describe('setEvidence', () => {
  it('merges a change without mutating, and removes an entry that becomes empty', () => {
    const a = setEvidence({}, 'CTL-ACC-01', { status: 'gap' });
    const b = setEvidence(a, 'CTL-ACC-01', { note: 'No owner named yet' });
    expect(a).toEqual({ 'CTL-ACC-01': { status: 'gap', note: '' } });
    expect(b).toEqual({ 'CTL-ACC-01': { status: 'gap', note: 'No owner named yet' } });
    expect(setEvidence(b, 'CTL-ACC-01', { status: '', note: '  ' })).toEqual({});
  });
});

describe('evidenceSummary', () => {
  it('counts statuses over the applicable controls only', () => {
    const map = { 'CTL-A-01': { status: 'met', note: '' }, 'CTL-A-02': { status: 'gap', note: '' }, 'CTL-A-09': { status: 'met', note: '' } } as const;
    expect(evidenceSummary(['CTL-A-01', 'CTL-A-02', 'CTL-A-03'], map)).toEqual({ met: 1, partly: 0, gap: 1, na: 0, unset: 1 });
  });
});

describe('parseRegister', () => {
  const uc = { id: 'u1', name: 'Chatbot', owner: 'Digital', answers: { impact: 'internal' }, createdAt: 'x', updatedAt: 'x' };
  it('loads a register saved before evidence existed', () => {
    const cases = parseRegister({ format: 'gcc-ai-governance-kit/register', version: 1, useCases: [uc] });
    expect(cases).toHaveLength(1);
    expect(cases![0].evidence).toEqual({});
    expect(cases![0].answers).toEqual({ impact: 'internal' });
  });
  it('keeps valid evidence and cleans invalid entries on import', () => {
    const cases = parseRegister({ format: 'gcc-ai-governance-kit/register', version: 1,
      useCases: [{ ...uc, evidence: { 'CTL-ACC-01': { status: 'met', note: 'Minutes 12' }, junk: 1 } }] });
    expect(cases![0].evidence).toEqual({ 'CTL-ACC-01': { status: 'met', note: 'Minutes 12' } });
  });
  it('rejects files that are not a register', () => {
    expect(parseRegister({ format: 'other', version: 1, useCases: [] })).toBeNull();
    expect(parseRegister({ format: 'gcc-ai-governance-kit/register', version: 1, useCases: [{ id: 1 }] })).toBeNull();
  });
});

describe('register JSON Schema', () => {
  it('accepts registers with and without evidence, and rejects a bad status', async () => {
    const Ajv = (await import('ajv')).default;
    const schema = (await import('../../data/schema/usecase.schema.json')).default;
    const validate = new Ajv({ allErrors: true }).compile(schema);
    const uc = { id: 'u1', name: 'Chatbot', owner: 'Digital', answers: {}, createdAt: 'x', updatedAt: 'x' };
    const reg = (u: object) => ({ format: 'gcc-ai-governance-kit/register', version: 1, useCases: [u] });
    expect(validate(reg(uc))).toBe(true);
    expect(validate(reg({ ...uc, evidence: { 'CTL-ACC-01': { status: 'met', note: 'Minutes 12' } } }))).toBe(true);
    expect(validate(reg({ ...uc, evidence: { 'CTL-ACC-01': { status: 'done', note: '' } } }))).toBe(false);
  });
});
