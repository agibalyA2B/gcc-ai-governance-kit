import crosswalkData from '../../data/crosswalk.json';
import type { Tier } from './scoring';
import { TIER_ORDER } from './scoring';
import type { FrameworkId } from './frameworks';
import type { Answers } from './scoring';

export interface Control {
  id: string; theme: string; title_en: string; title_ar: string; control_text_en: string; control_text_ar: string;
  applies_when: { min_tier: Exclude<Tier, 'unacceptable'>; ai_types?: string[]; data?: string[] };
  refs: Record<FrameworkId, string[]>;
  source_urls: string[]; verified: boolean; verified_on: string | null; notes: string;
}

export const CROSSWALK = crosswalkData as unknown as Control[];
export const THEMES = ['accountability', 'transparency', 'data', 'human-oversight', 'safety-security', 'monitoring'] as const;

/** Controls that apply to a use case: tier gate, AI-type and data filters, and at least one selected framework reference. */
export function applicableControls(tier: Tier, answers: Answers, frameworks: FrameworkId[], all: Control[] = CROSSWALK): Control[] {
  const rank = TIER_ORDER.indexOf(tier === 'unacceptable' ? 'high' : tier);
  const dataLevel = answers.data === 'sensitive' ? ['personal', 'sensitive'] : answers.data === 'personal' ? ['personal'] : [];
  return all.filter((c) => {
    if (TIER_ORDER.indexOf(c.applies_when.min_tier) > rank) return false;
    const types = c.applies_when.ai_types ?? [];
    if (types.length && !types.includes(answers.ai_type)) return false;
    const data = c.applies_when.data ?? [];
    if (data.length && !data.some((d) => dataLevel.includes(d))) return false;
    return frameworks.some((f) => (c.refs[f] ?? []).length > 0);
  });
}

export function verifiedShare(list: Control[]): { verified: number; total: number; pct: number } {
  const verified = list.filter((c) => c.verified).length;
  return { verified, total: list.length, pct: list.length ? Math.round((verified / list.length) * 100) : 0 };
}
