import type { Answers } from './scoring';
import { normaliseEvidence, type EvidenceMap } from './evidence';

export type Status = 'idea' | 'pilot' | 'production' | 'retired';
export interface UseCase {
  id: string; name: string; owner: string; businessUnit: string; purpose: string;
  status: Status; notes: string; answers: Answers; createdAt: string; updatedAt: string;
  /** Control-evidence map; optional so registers saved before 0.3.0 still load. */
  evidence?: EvidenceMap;
  /** Per-deployment profiles: the product this use case is one deployment of, and a label for it (ADR 011). */
  product?: string;
  deployment?: string;
}

export const newId = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `uc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export function blankUseCase(now = new Date().toISOString()): UseCase {
  return { id: newId(), name: '', owner: '', businessUnit: '', purpose: '', status: 'idea', notes: '', answers: {}, createdAt: now, updatedAt: now };
}

export function sampleUseCases(lang: 'en' | 'ar', now = new Date().toISOString()): UseCase[] {
  const ar = lang === 'ar';
  return [
    { ...blankUseCase(now), name: ar ? 'وكيل فرز طلبات خدمات المتعاملين' : 'Citizen service triage agent',
      owner: ar ? 'إدارة خدمة المتعاملين' : 'Customer Service Dept.', businessUnit: ar ? 'العمليات' : 'Operations',
      purpose: ar ? 'يوجّه الطلبات الواردة تلقائياً، ويراجع موظفٌ حالات الرفض.' : 'Routes incoming requests automatically; staff review refusals.',
      status: 'pilot',
      answers: { runtime_ai: 'yes', impact: 'recommend-individuals', data: 'personal', affected: 'public', ai_type: 'agentic', autonomy: 'monitored', oversight: 'exceptions', access: 'record', reversibility: 'easy' } },
    { ...blankUseCase(now), name: ar ? 'روبوت محادثة للأسئلة الشائعة' : 'Website FAQ chatbot',
      owner: ar ? 'القنوات الرقمية' : 'Digital Channels', businessUnit: ar ? 'تجربة المتعاملين' : 'Customer Experience',
      purpose: ar ? 'يجيب عن الأسئلة العامة ويحيل إلى موظف عند الحاجة.' : 'Answers general questions and hands over to a person when needed.',
      status: 'production',
      answers: { runtime_ai: 'yes', impact: 'public-info', data: 'none', affected: 'public', ai_type: 'generative', autonomy: 'monitored', oversight: 'exceptions', access: 'none', reversibility: 'easy' } },
  ];
}

export const REGISTER_FORMAT = 'gcc-ai-governance-kit/register';

/** Validates an imported register file and returns its use cases with evidence cleaned, or null if it is not one. */
export function parseRegister(x: unknown): UseCase[] | null {
  const o = x as { format?: string; version?: number; useCases?: unknown };
  if (!o || o.format !== REGISTER_FORMAT || o.version !== 1 || !Array.isArray(o.useCases)) return null;
  const ok = o.useCases.every((u: Partial<UseCase>) => typeof u?.id === 'string' && typeof u?.name === 'string'
    && typeof u?.owner === 'string' && !!u.answers && typeof u.answers === 'object');
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  return ok ? (o.useCases as UseCase[]).map((u) => ({ ...u, evidence: normaliseEvidence(u.evidence), product: str(u.product), deployment: str(u.deployment) })) : null;
}
