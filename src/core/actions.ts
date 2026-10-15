import type { Answers, Tier } from './scoring';
import { recommendAutonomy, type AutonomyLevel } from './autonomy';

/**
 * Action matrix (ADR 014): what the AI may do, per action, for one use case. The kit pre-fills a ceiling for each
 * action from the recommended autonomy level and the tier floors; the user may make a row stricter, never looser.
 */
export const ACTIONS = ['classify', 'recommend', 'draft', 'update', 'communicate', 'decide'] as const;
export type ActionId = (typeof ACTIONS)[number];
export const PERMISSIONS = ['allowed', 'approval', 'blocked'] as const;
export type Permission = (typeof PERMISSIONS)[number];
export type Reversible = '' | 'yes' | 'no';
export interface ActionSetting { permission?: Permission; limits?: string; reversible?: Reversible; approver?: string }
export type ActionMatrix = Partial<Record<ActionId, ActionSetting>>;
export type CapReason = 'tier-high' | 'irreversible' | 'regulated' | 'unacceptable';

/** Higher rank = more freedom. */
const RANK: Record<Permission, number> = { blocked: 0, approval: 1, allowed: 2 };
export const looser = (a: Permission, b: Permission): boolean => RANK[a] > RANK[b];
const min = (a: Permission, b: Permission): Permission => (RANK[a] <= RANK[b] ? a : b);

const A = 'allowed', N = 'approval', B = 'blocked';
/** Ceiling per recommended level, in ACTIONS order. Level 3: a person decides every output; level 4: nothing is delegated. */
const BY_LEVEL: Record<AutonomyLevel, Permission[]> = {
  1: [A, A, A, A, A, A],
  2: [A, A, A, A, N, N],
  3: [N, A, A, N, N, B],
  4: [B, B, B, B, B, B],
};
/** Level used until the three prioritisation questions are answered: the most cautious level that still delegates. */
export const PROVISIONAL_LEVEL: AutonomyLevel = 3;

export interface ActionRow {
  id: ActionId;
  /** The most this action may do, from the level and the tier floors. */
  ceiling: Permission;
  /** What applies: the user's setting if it is not looser than the ceiling, otherwise the ceiling. */
  permission: Permission;
  /** A stored setting (for example from an imported file) was looser than the ceiling and was ignored. */
  loosened: boolean;
  capReasons: CapReason[];
  limits: string; reversible: Reversible; approver: string;
}
export interface MatrixResult { level: AutonomyLevel; provisional: boolean; rows: ActionRow[] }

/** Tier floors: the strictest an action must be whatever the level. */
function floors(id: ActionId, tier: Tier, answers: Answers): { cap: Permission; reason: CapReason }[] {
  if (tier === 'unacceptable') return [{ cap: B, reason: 'unacceptable' }];
  const out: { cap: Permission; reason: CapReason }[] = [];
  if (tier === 'high' && (id === 'decide' || id === 'communicate')) out.push({ cap: N, reason: 'tier-high' });
  if (id === 'decide' && answers.reversibility && answers.reversibility !== 'easy') out.push({ cap: N, reason: 'irreversible' });
  if (id === 'update' && answers.reversibility === 'hard') out.push({ cap: N, reason: 'irreversible' });
  if (id === 'decide' && answers.regulated === 'yes') out.push({ cap: N, reason: 'regulated' });
  return out;
}

export function actionMatrix(answers: Answers, tier: Tier, settings: ActionMatrix = {}): MatrixResult {
  const a = recommendAutonomy(answers, tier);
  const provisional = !a.complete;
  const level: AutonomyLevel = tier === 'unacceptable' ? 4 : a.recommended ?? PROVISIONAL_LEVEL;
  const rows = ACTIONS.map((id, i): ActionRow => {
    const base = BY_LEVEL[level][i];
    const fl = floors(id, tier, answers);
    const ceiling = fl.reduce((p, f) => min(p, f.cap), base);
    const capReasons = fl.filter((f) => looser(base, f.cap)).map((f) => f.reason);
    const s = settings[id] ?? {};
    const chosen = s.permission;
    const loosened = !!chosen && looser(chosen, ceiling);
    return {
      id, ceiling, permission: chosen && !loosened ? chosen : ceiling, loosened, capReasons,
      limits: s.limits ?? '', reversible: s.reversible ?? '', approver: s.approver ?? '',
    };
  });
  return { level, provisional, rows };
}

const MAX_TEXT = 500;
const isPerm = (p: unknown): p is Permission => (PERMISSIONS as readonly unknown[]).includes(p);

/** Cleans stored or imported settings: unknown actions and values are dropped, text is capped. */
export function normaliseActions(raw: unknown): ActionMatrix | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: ActionMatrix = {};
  for (const id of ACTIONS) {
    const v = (raw as Record<string, unknown>)[id] as Record<string, unknown> | undefined;
    if (!v || typeof v !== 'object') continue;
    const text = (x: unknown) => (typeof x === 'string' ? x.slice(0, MAX_TEXT) : '');
    const s: ActionSetting = {};
    if (isPerm(v.permission)) s.permission = v.permission;
    if (text(v.limits)) s.limits = text(v.limits);
    if (v.reversible === 'yes' || v.reversible === 'no') s.reversible = v.reversible;
    if (text(v.approver)) s.approver = text(v.approver);
    if (Object.keys(s).length) out[id] = s;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Applies one edit. A permission looser than the ceiling is refused (returns null) so the caller can warn. */
export function setAction(settings: ActionMatrix = {}, id: ActionId, patch: ActionSetting, ceiling: Permission): ActionMatrix | null {
  if (patch.permission && looser(patch.permission, ceiling)) return null;
  return normaliseActions({ ...settings, [id]: { ...settings[id], ...patch } }) ?? {};
}
