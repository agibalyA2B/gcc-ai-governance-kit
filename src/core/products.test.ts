import { groupByProduct, newDeployment } from './products';
import { blankUseCase, parseRegister, type UseCase } from './usecase';

const quick = { runtime_ai: 'yes', data: 'internal', affected: 'staff', ai_type: 'generative', oversight: 'every', access: 'none', reversibility: 'easy' };
const uc = (over: Partial<UseCase>): UseCase => ({ ...blankUseCase('2026-09-28'), owner: 'Ops', ...over });

describe('groupByProduct', () => {
  const internal = uc({ id: 'a', name: 'Claims drafter (internal)', product: 'Claims drafter', deployment: 'Internal', answers: { ...quick, impact: 'internal', autonomy: 'suggests' } });
  const saas = uc({ id: 'b', name: 'Claims drafter (SaaS)', product: ' claims drafter ', deployment: 'SaaS', answers: { ...quick, impact: 'decide-organisations', affected: 'public', autonomy: 'monitored' } });
  const solo = uc({ id: 'c', name: 'FAQ bot', answers: { ...quick, impact: 'public-info', autonomy: 'suggests' } });

  it('groups deployments of the same product (case and spacing ignored) and keeps standalone use cases apart', () => {
    const groups = groupByProduct([internal, solo, saas]);
    expect(groups.map((g) => [g.product, g.cases.map((c) => c.id)])).toEqual([['Claims drafter', ['a', 'b']], [null, ['c']]]);
  });
  it('rates a product by its highest-tier deployment', () => {
    const [g] = groupByProduct([internal, saas]);
    expect(g.highest).toBe('high');
  });
  it('a deployment still being assessed does not count towards the product tier', () => {
    const draft = uc({ id: 'd', product: 'Claims drafter', deployment: 'Agent', answers: {} });
    expect(groupByProduct([internal, draft])[0].highest).toBe('little');
  });
});

describe('newDeployment', () => {
  it('copies the product details and answers into a fresh, unnamed deployment', () => {
    const src = uc({ id: 'a', name: 'Claims drafter', businessUnit: 'Legal', answers: { impact: 'internal' }, evidence: { 'CTL-ACC-01': { status: 'met', note: 'x' } } });
    const d = newDeployment(src, '2026-09-29');
    expect(d.id).not.toBe('a');
    expect(d).toMatchObject({ product: 'Claims drafter', deployment: '', name: 'Claims drafter', owner: 'Ops', businessUnit: 'Legal', answers: { impact: 'internal' }, evidence: {} });
    expect(src.product).toBeUndefined();
  });
  it('keeps an existing product name', () => {
    expect(newDeployment(uc({ name: 'X (internal)', product: 'X' })).product).toBe('X');
  });
});

describe('register import keeps product and deployment', () => {
  it('round-trips the new fields and still loads registers without them', () => {
    const base = { id: 'u1', name: 'A', owner: 'B', answers: {}, createdAt: 'x', updatedAt: 'x' };
    const reg = (u: object) => ({ format: 'gcc-ai-governance-kit/register', version: 1, useCases: [u] });
    expect(parseRegister(reg({ ...base, product: 'P', deployment: 'SaaS' }))![0]).toMatchObject({ product: 'P', deployment: 'SaaS' });
    expect(parseRegister(reg({ ...base, product: 42 }))![0].product).toBeUndefined();
    expect(parseRegister(reg(base))![0].product).toBeUndefined();
  });
});
