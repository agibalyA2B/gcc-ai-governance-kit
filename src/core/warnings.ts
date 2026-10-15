import type { Answers, Tier } from './scoring';
import type { EvidenceMap } from './evidence';
import type { ActionRow } from './actions';
import type { AutonomyLevel } from './autonomy';

/**
 * Selective bad-practice warnings for the agent brief (ADR 015, plan §4). A warning shows only when its trigger fires
 * for this use case. Each reads: trigger, risk, required action (a platform track and a manual fallback for tools you
 * cannot change), evidence, owner. Text lives in the i18n catalogues under `wr.<id>.*`.
 */
export type Severity = 'critical' | 'high';
export type Owner = 'owner' | 'platform' | 'risk' | 'supervisor' | 'procurement';
export interface WarningContext { answers: Answers; tier: Tier; level: AutonomyLevel; rows: ActionRow[]; evidence: EvidenceMap; applicable: Set<string> }
export interface WarningDef { id: string; severity: Severity; gcc?: boolean; owner: Owner; when: (c: WarningContext) => boolean }

const agentic = (c: WarningContext) => c.answers.ai_type === 'agentic';
const genOrAgent = (c: WarningContext) => c.answers.ai_type === 'generative' || agentic(c);
const acts = (c: WarningContext) => agentic(c) || c.answers.autonomy === 'monitored' || c.answers.autonomy === 'full';
const has = (c: WarningContext, p: ActionRow['permission']) => c.rows.some((r) => r.permission === p);
/** A control that applies here and is not yet evidenced as met. */
const unmet = (c: WarningContext, id: string) => c.applicable.has(id) && c.evidence[id]?.status !== 'met' && c.evidence[id]?.status !== 'na';
const publicFacing = (c: WarningContext) => c.answers.affected === 'public' || c.answers.affected === 'vulnerable';

export const WARNINGS: WarningDef[] = [
  { id: 'owner', severity: 'critical', owner: 'owner',
    when: (c) => c.evidence['CTL-ACC-02']?.status === 'gap' || c.rows.some((r) => r.permission === 'approval' && !r.approver.trim()) },
  { id: 'stop', severity: 'critical', owner: 'platform', when: (c) => acts(c) && c.level <= 2 && unmet(c, 'CTL-HUM-06') },
  { id: 'perms', severity: 'critical', owner: 'platform', when: (c) => agentic(c) && !!c.answers.access && c.answers.access !== 'none' && unmet(c, 'CTL-SEC-04') },
  { id: 'irreversible', severity: 'critical', owner: 'owner',
    when: (c) => !!c.answers.reversibility && c.answers.reversibility !== 'easy' && c.rows.some((r) => ['update', 'communicate', 'decide'].includes(r.id) && r.permission === 'allowed') },
  { id: 'subagent', severity: 'critical', owner: 'platform', when: (c) => agentic(c) && c.level <= 2 },
  { id: 'rubber', severity: 'high', owner: 'supervisor', when: (c) => has(c, 'approval') },
  { id: 'copy', severity: 'high', owner: 'supervisor', when: (c) => c.level === 3 },
  { id: 'drift', severity: 'high', owner: 'owner', when: (c) => c.level <= 2 && c.answers.monitoring !== 'yes' },
  { id: 'updates', severity: 'high', owner: 'procurement', when: (c) => c.answers.third_party === 'local' || c.answers.third_party === 'external' },
  { id: 'injection', severity: 'high', owner: 'platform', when: (c) => genOrAgent(c) && !!c.answers.access && c.answers.access !== 'none' },
  { id: 'dialect', severity: 'high', gcc: true, owner: 'owner', when: (c) => genOrAgent(c) && publicFacing(c) },
  { id: 'holiday', severity: 'high', gcc: true, owner: 'risk', when: (c) => has(c, 'approval') && publicFacing(c) },
];

export const WARNING_FIELDS = ['trigger', 'risk', 'platform', 'manual', 'evidence'] as const;

/** The warnings that apply to one use case, critical first. Level 4 and Unacceptable have no brief, so no warnings. */
export function warningsFor(c: WarningContext): WarningDef[] {
  if (c.tier === 'unacceptable' || c.level === 4) return [];
  return WARNINGS.filter((w) => w.when(c)).sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1));
}
