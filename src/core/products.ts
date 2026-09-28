import { computeTier, aiInScope, maxTier, type Tier } from './scoring';
import { blankUseCase, newId, type UseCase } from './usecase';

/**
 * Per-deployment profiles (ADR 011): one product can have several deployments (internal, SaaS, agent, ...). Each
 * deployment is a full use case with its own answers and evidence; the optional `product` field links them.
 */
export interface ProductGroup { product: string | null; cases: UseCase[]; highest: Tier | null }

const key = (p?: string) => (p ?? '').trim().toLowerCase();

/** Groups use cases by product, in first-seen order; standalone use cases each get their own group. */
export function groupByProduct(cases: UseCase[]): ProductGroup[] {
  const groups: ProductGroup[] = [];
  const byKey = new Map<string, ProductGroup>();
  for (const uc of cases) {
    const k = key(uc.product);
    let g = k ? byKey.get(k) : undefined;
    if (!g) {
      g = { product: k ? uc.product!.trim() : null, cases: [], highest: null };
      groups.push(g);
      if (k) byKey.set(k, g);
    }
    g.cases.push(uc);
    const r = computeTier(uc.answers);
    if (aiInScope(uc.answers) && r.quickComplete) g.highest = g.highest ? maxTier(g.highest, r.tier) : r.tier;
  }
  return groups;
}

/** A new deployment of the same product: details and answers copied, evidence and deployment label left blank. */
export function newDeployment(src: UseCase, now = new Date().toISOString()): UseCase {
  return { ...blankUseCase(now), name: src.name, owner: src.owner, businessUnit: src.businessUnit, purpose: src.purpose,
    status: src.status, answers: { ...src.answers }, evidence: {}, product: src.product?.trim() || src.name, deployment: '', id: newId() };
}
