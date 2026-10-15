import { WARNINGS, WARNING_FIELDS, warningsFor, type WarningContext } from './warnings';
import { actionMatrix } from './actions';
import { applicableControls, CROSSWALK } from './controls';
import { computeTier } from './scoring';
import { ALL_FRAMEWORKS } from './frameworks';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';

const ctx = (answers: Record<string, string>, extra: Partial<WarningContext> = {}): WarningContext => {
  const tier = computeTier(answers).tier;
  const m = actionMatrix(answers, tier, {});
  return { answers, tier, level: m.level, rows: m.rows, evidence: {}, applicable: new Set(applicableControls(tier, answers, [...ALL_FRAMEWORKS]).map((c) => c.id)), ...extra };
};
const ids = (c: WarningContext) => warningsFor(c).map((w) => w.id);
const agent = { runtime_ai: 'yes', impact: 'recommend-individuals', data: 'personal', affected: 'public', ai_type: 'agentic', autonomy: 'monitored', oversight: 'exceptions', access: 'record', reversibility: 'easy', usage: 'high', complexity: 'medium', readiness: 'medium', third_party: 'external', monitoring: 'adhoc' };
const quietTool = { runtime_ai: 'yes', impact: 'internal', data: 'none', affected: 'staff', ai_type: 'predictive', autonomy: 'suggests', oversight: 'every', access: 'none', reversibility: 'easy', usage: 'high', complexity: 'low', readiness: 'low', third_party: 'no', monitoring: 'yes' };

describe('warning catalogue', () => {
  it('every warning has all fields, an owner and a title, in English and Arabic', () => {
    const cat = [en as Record<string, string>, ar as Record<string, string>];
    for (const w of WARNINGS) for (const c of cat) {
      for (const f of [...WARNING_FIELDS, 'title']) expect(c[`wr.${w.id}.${f}`]?.trim()).toBeTruthy();
      expect(c[`wr.role.${w.owner}`]?.trim()).toBeTruthy();
    }
  });
  it('evidence lines cite only real control ids', () => {
    const real = new Set(CROSSWALK.map((c) => c.id));
    for (const w of WARNINGS) for (const id of (en as Record<string, string>)[`wr.${w.id}.evidence`].match(/CTL-[A-Z]+-\d+/g) ?? []) expect(real.has(id)).toBe(true);
  });
  it('approval-rate and review-time signals are investigation triggers, not pass marks', () => {
    expect((en as Record<string, string>)['wr.rubber.platform']).toMatch(/triggers to investigate, never as pass marks/);
    expect((en as Record<string, string>)['wr.rubber.manual']).toMatch(/only in testing or the assisted stage/);
  });
});

describe('warnings are selective', () => {
  it('a public-facing level 2 agent with a vendor gets the critical agent warnings and the GCC ones', () => {
    const got = ids(ctx(agent));
    for (const id of ['owner', 'stop', 'perms', 'subagent', 'rubber', 'drift', 'updates', 'injection', 'dialect', 'holiday']) expect(got).toContain(id);
    expect(got).not.toContain('copy');
  });
  it('critical warnings come first', () => {
    const sev = warningsFor(ctx(agent)).map((w) => w.severity);
    expect(sev.indexOf('high')).toBeGreaterThan(sev.lastIndexOf('critical'));
  });
  it('an internal level 3 assistant with no vendor and monitoring in place gets only the level 3 warnings', () => {
    expect(ids(ctx(quietTool))).toEqual(['owner', 'rubber', 'copy']);
  });
  it('naming every approver clears the owner warning; evidencing controls as met clears theirs', () => {
    const c = ctx(agent);
    const named = { ...c, rows: c.rows.map((r) => ({ ...r, approver: 'Supervisor' })), evidence: { 'CTL-HUM-06': { status: 'met' as const, note: '' }, 'CTL-SEC-04': { status: 'na' as const, note: '' } } };
    expect(ids(named)).not.toContain('owner');
    expect(ids(named)).not.toContain('stop');
    expect(ids(named)).not.toContain('perms');
  });
  it('a hard-to-undo action left Allowed raises the irreversible warning', () => {
    const c = ctx({ ...quietTool, reversibility: 'effort' });
    expect(ids({ ...c, rows: c.rows.map((r) => (r.id === 'update' ? { ...r, permission: 'allowed' as const } : r)) })).toContain('irreversible');
  });
  it('level 4 and Unacceptable get no warnings (no brief)', () => {
    expect(ids(ctx({ ...agent, usage: 'low' }))).toEqual([]);
    expect(ids(ctx({ ...agent, impact: 'prohibited' }))).toEqual([]);
  });
});
