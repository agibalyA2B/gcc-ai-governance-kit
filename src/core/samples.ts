import { blankUseCase, type UseCase } from './usecase';

type Ex = { name: [string, string]; owner: [string, string]; unit: [string, string]; purpose: [string, string]; answers: Record<string, string> };

// Private-sector pack: one illustrative use case per business function. Answers are typical, not prescriptive.
const EXAMPLES: Ex[] = [
  { name: ['CV screening assistant', 'مساعد فرز السير الذاتية'], owner: ['Talent Acquisition', 'استقطاب المواهب'], unit: ['HR', 'الموارد البشرية'],
    purpose: ['Ranks applicants against the job profile; recruiters only see the shortlist.', 'يرتّب المتقدمين وفق متطلبات الوظيفة، ولا يطّلع مسؤولو التوظيف إلا على القائمة المختصرة.'],
    answers: { runtime_ai: 'yes', impact: 'recommend-individuals', data: 'personal', affected: 'public', ai_type: 'predictive', autonomy: 'suggests', oversight: 'exceptions', access: 'none', reversibility: 'effort' } },
  { name: ['Campaign content generator', 'مولّد محتوى الحملات'], owner: ['Brand & Communications', 'العلامة التجارية والاتصال'], unit: ['Marketing', 'التسويق'],
    purpose: ['Drafts social posts and email copy; the marketing team edits and approves everything before it is published.', 'يُعدّ مسودات منشورات التواصل الاجتماعي ورسائل البريد، ويراجعها فريق التسويق ويعتمدها كاملة قبل النشر.'],
    answers: { runtime_ai: 'yes', impact: 'public-info', data: 'internal', affected: 'public', ai_type: 'generative', autonomy: 'suggests', oversight: 'every', access: 'none', reversibility: 'easy' } },
  { name: ['Lead-scoring model', 'نموذج تقييم العملاء المحتملين'], owner: ['Sales Operations', 'عمليات المبيعات'], unit: ['Sales', 'المبيعات'],
    purpose: ['Scores prospects in the CRM so the sales team can prioritise follow-up.', 'يقيّم العملاء المحتملين في نظام إدارة علاقات العملاء ليحدد فريق المبيعات أولويات المتابعة.'],
    answers: { runtime_ai: 'yes', impact: 'internal', data: 'personal', affected: 'public', ai_type: 'predictive', autonomy: 'suggests', oversight: 'every', access: 'internal', reversibility: 'easy' } },
  { name: ['Expense anomaly detection', 'رصد المصروفات غير المعتادة'], owner: ['Financial Control', 'الرقابة المالية'], unit: ['Finance', 'المالية'],
    purpose: ['Flags unusual expense claims for a finance officer to review; it takes no action itself.', 'ينبّه إلى مطالبات المصروفات غير المعتادة ليراجعها موظف مالي، دون أن يتخذ أي إجراء بنفسه.'],
    answers: { runtime_ai: 'yes', impact: 'internal', data: 'personal', affected: 'staff', ai_type: 'predictive', autonomy: 'suggests', oversight: 'every', access: 'none', reversibility: 'easy' } },
  { name: ['Demand forecasting and reorder agent', 'وكيل توقع الطلب وإعادة الطلب'], owner: ['Procurement & Planning', 'المشتريات والتخطيط'], unit: ['Supply chain', 'سلاسل الإمداد'],
    purpose: ['Forecasts demand and places purchase orders with suppliers on its own; planners review exceptions.', 'يتوقع الطلب ويُصدر أوامر الشراء للموردين من تلقاء نفسه، ويراجع المخططون الحالات الاستثنائية.'],
    answers: { runtime_ai: 'yes', impact: 'internal', data: 'internal', affected: 'staff', ai_type: 'agentic', autonomy: 'monitored', oversight: 'exceptions', access: 'record', reversibility: 'effort' } },
  { name: ['Construction claims drafting assistant', 'مساعد إعداد مطالبات المقاولات'], owner: ['Contracts & Claims', 'العقود والمطالبات'], unit: ['Commercial & claims', 'الشؤون التجارية والمطالبات'],
    purpose: ['Drafts delay and variation claims from project correspondence, with citations; a claims specialist reviews every draft before it is sent.', 'يُعدّ مسودات مطالبات التأخير والتغيير من مراسلات المشروع مع الإحالة إلى مصادرها، ويراجع مختص المطالبات كل مسودة قبل إرسالها.'],
    answers: { runtime_ai: 'yes', impact: 'decide-organisations', data: 'personal', affected: 'public', ai_type: 'generative', autonomy: 'suggests', oversight: 'every', access: 'none', reversibility: 'effort' } },
];

export function privateSectorExamples(lang: 'en' | 'ar', now = new Date().toISOString()): UseCase[] {
  const i = lang === 'ar' ? 1 : 0;
  return EXAMPLES.map((e) => ({ ...blankUseCase(now), name: e.name[i], owner: e.owner[i], businessUnit: e.unit[i], purpose: e.purpose[i],
    status: 'idea' as const, answers: { ...e.answers } }));
}
