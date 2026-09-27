export type FrameworkId = 'uae_charter' | 'uae_gov_code' | 'dubai_ethics' | 'sdaia' | 'iso42001' | 'nist_ai_rmf' | 'eu_ai_act';

export const FRAMEWORKS: { id: FrameworkId; en: string; ar: string; short: string }[] = [
  { id: 'uae_charter', en: 'UAE AI Charter', ar: 'ميثاق الإمارات للذكاء الاصطناعي', short: 'UAE' },
  { id: 'uae_gov_code', en: 'UAE Gov Services Code', ar: 'كود الإمارات للخدمات الحكومية', short: 'UAE Gov Code' },
  { id: 'dubai_ethics', en: 'Dubai AI Ethics', ar: 'أخلاقيات الذكاء الاصطناعي في دبي', short: 'Dubai' },
  { id: 'sdaia', en: 'SDAIA AI Ethics', ar: 'مبادئ أخلاقيات الذكاء الاصطناعي (سدايا)', short: 'SDAIA' },
  { id: 'iso42001', en: 'ISO/IEC 42001', ar: 'آيزو/آي إي سي 42001', short: 'ISO 42001' },
  { id: 'nist_ai_rmf', en: 'NIST AI RMF', ar: 'إطار NIST لإدارة مخاطر الذكاء الاصطناعي', short: 'NIST' },
  { id: 'eu_ai_act', en: 'EU AI Act', ar: 'قانون الاتحاد الأوروبي للذكاء الاصطناعي', short: 'EU AI Act' },
];

export const ALL_FRAMEWORKS = FRAMEWORKS.map((f) => f.id);
