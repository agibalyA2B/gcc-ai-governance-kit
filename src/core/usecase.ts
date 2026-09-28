import type { Answers } from './scoring';

export type Status = 'idea' | 'pilot' | 'production' | 'retired';
export interface UseCase {
  id: string; name: string; owner: string; businessUnit: string; purpose: string;
  status: Status; notes: string; answers: Answers; createdAt: string; updatedAt: string;
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
