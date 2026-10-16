export type FrameworkId = 'uae_charter' | 'uae_gov_code' | 'uae_pdpl' | 'uae_csc_ai' | 'dubai_ethics' | 'sdaia' | 'iso42001' | 'nist_ai_rmf' | 'eu_ai_act';

export const FRAMEWORKS: { id: FrameworkId; en: string; ar: string; short: string }[] = [
  { id: 'uae_charter', en: 'UAE AI Charter', ar: 'ميثاق الإمارات للذكاء الاصطناعي', short: 'UAE' },
  { id: 'uae_gov_code', en: 'UAE Gov Services Code', ar: 'كود الإمارات للخدمات الحكومية', short: 'UAE Gov Code' },
  { id: 'uae_pdpl', en: 'UAE PDPL', ar: 'قانون حماية البيانات الشخصية', short: 'PDPL' },
  { id: 'uae_csc_ai', en: 'UAE AI Security Policy (CSC)', ar: 'السياسة الوطنية للأمن السيبراني للذكاء الاصطناعي', short: 'CSC AI' },
  { id: 'dubai_ethics', en: 'Dubai AI Ethics', ar: 'أخلاقيات الذكاء الاصطناعي في دبي', short: 'Dubai' },
  { id: 'sdaia', en: 'SDAIA AI Ethics', ar: 'مبادئ أخلاقيات الذكاء الاصطناعي (سدايا)', short: 'SDAIA' },
  { id: 'iso42001', en: 'ISO/IEC 42001', ar: 'آيزو/آي إي سي 42001', short: 'ISO 42001' },
  { id: 'nist_ai_rmf', en: 'NIST AI RMF', ar: 'إطار NIST لإدارة مخاطر الذكاء الاصطناعي', short: 'NIST' },
  { id: 'eu_ai_act', en: 'EU AI Act', ar: 'قانون الاتحاد الأوروبي للذكاء الاصطناعي', short: 'EU AI Act' },
];

export const ALL_FRAMEWORKS = FRAMEWORKS.map((f) => f.id);

// Primary official source per framework (suggested by the AI Safety UAE community, 16 Oct 2026): every reference links to
// where it can be checked. ISO/IEC 42001 is paywalled: the link goes to the official ISO page, not the text.
export const FRAMEWORK_SOURCES: Record<FrameworkId, string> = {
  uae_charter: 'https://uaelegislation.gov.ae/en/policy/details/the-uae-charter-for-the-development-and-use-of-artificial-intelligence',
  uae_gov_code: 'https://uaecabinet.ae/en/news/under-directives-of-uae-president-and-in-world-first-mohammed-bin-rashid-reveals-new-uae-government-framework-to-deploy-agentic-ai-across-50-of-government-sectors-operations-within-two-years',
  uae_pdpl: 'https://uaelegislation.gov.ae/en/legislations/1972',
  uae_csc_ai: 'https://csc.gov.ae/en/w/national-artificial-intelligence-security-policy',
  dubai_ethics: 'https://www.digitaldubai.ae/docs/default-source/ai-principles-resources/ai-ethics.pdf',
  sdaia: 'https://sdaia.gov.sa/en/SDAIA/about/Documents/ai-principles.pdf',
  iso42001: 'https://www.iso.org/standard/81230.html',
  nist_ai_rmf: 'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf',
  eu_ai_act: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
};

// The UAE Gov Services Code framework cites four documents; two have no public URL (cited in the control notes).
export function refSource(fw: FrameworkId, ref: string): string | null {
  if (fw === 'uae_gov_code') {
    if (/^Agentic Guide/.test(ref)) return 'https://uaemodel.egsep.ae/agentic_ai_guide_website.html';
    if (/^(Data Sharing Policy|Agentic Reference)/.test(ref)) return null;
    return FRAMEWORK_SOURCES.uae_gov_code;
  }
  return FRAMEWORK_SOURCES[fw];
}
