import { buildBrief, briefMarkdown, BLOCKS, RECORDS } from './brief';
import { blankUseCase, type UseCase } from './usecase';
import { CROSSWALK } from './controls';
import { ALL_FRAMEWORKS } from './frameworks';

const agent = { runtime_ai: 'yes', impact: 'recommend-individuals', data: 'personal', affected: 'public', ai_type: 'agentic', autonomy: 'monitored', oversight: 'exceptions', access: 'internal', reversibility: 'easy' };
const prio = { 1: { usage: 'high', complexity: 'low', readiness: 'high' }, 2: { usage: 'high', complexity: 'low', readiness: 'medium' }, 3: { usage: 'high', complexity: 'low', readiness: 'low' }, 4: { usage: 'low', complexity: 'low', readiness: 'high' } };
// A Limited-tier internal agent, so level 1 is reachable.
const internal = { ...agent, impact: 'internal', data: 'internal', affected: 'staff' };
const uc = (answers: Record<string, string>, extra: Partial<UseCase> = {}): UseCase => ({ ...blankUseCase('2026-10-15'), name: 'Triage agent', owner: 'Service Dept.', purpose: 'Route requests', answers, ...extra });
const fw = [...ALL_FRAMEWORKS];
const block = (b: ReturnType<typeof buildBrief>, id: string) => b.blocks.find((x) => x.id === id)!;

describe('agent brief blocks per level', () => {
  it('levels 1-3 give all six blocks in order', () => {
    for (const n of [1, 2, 3] as const) {
      const b = buildBrief(uc({ ...internal, ...prio[n] }), 'en', fw);
      expect(b).toMatchObject({ kind: 'brief', level: n });
      expect(b.blocks.map((x) => x.id)).toEqual([...BLOCKS]);
    }
  });
  it('Done follows the level: L1 sample audit, L2 stop and approve, L3 a person decides every output', () => {
    const d = (n: 1 | 2 | 3) => block(buildBrief(uc({ ...internal, ...prio[n] }), 'en', fw), 'done').items.join(' ');
    expect(d(1)).toContain('Sample audit');
    expect(d(1)).toContain('step-down to level 2');
    expect(d(2)).toContain('Stop and approve');
    expect(d(2)).not.toContain('Sample audit');
    expect(d(3)).toContain('A person decides every output');
  });
  it('level 4 gives no brief and no Authority, only a readiness explanation with next steps', () => {
    const b = buildBrief(uc({ ...internal, ...prio[4] }), 'en', fw);
    expect(b.kind).toBe('readiness');
    expect(b.blocks).toEqual([]);
    expect(b.readiness.join(' ')).toContain('Not ready for autonomy yet');
    expect(b.readiness.length).toBeGreaterThan(2);
  });
  it('an Unacceptable tier gives no brief', () => {
    const b = buildBrief(uc({ ...agent, impact: 'prohibited' }), 'en', fw);
    expect(b).toMatchObject({ kind: 'prohibited', blocks: [] });
  });
});

describe('Authority comes from the action matrix', () => {
  it('lists the six actions with the setting that applies, and the delegation principles', () => {
    const b = buildBrief(uc({ ...internal, ...prio[2] }, { actions: { communicate: { permission: 'blocked', approver: 'Supervisor' } } }), 'en', fw);
    const a = block(b, 'authority');
    expect(a.table!.rows).toHaveLength(6);
    expect(a.table!.rows[4]).toEqual(['Communicate with the customer or citizen', 'Blocked', '—', '—', 'Supervisor']);
    expect(a.after!.join(' ')).toContain('Role for accountability, task for privilege');
    expect(a.after!.join(' ')).toContain('never gets more authority than its caller');
  });
  it('the handover spec adds the platform-enforcement line; the annex does not', () => {
    const u = uc({ ...internal, ...prio[2] });
    expect(block(buildBrief(u, 'en', fw, 'handover'), 'authority').after!.join(' ')).toContain('Enforce these limits in the platform');
    expect(block(buildBrief(u, 'en', fw, 'annex'), 'authority').after!.join(' ')).not.toContain('Enforce these limits');
  });
});

describe('Evidence: the four records as references, no double entry', () => {
  it('references only real control ids', () => {
    const ids = new Set(CROSSWALK.map((c) => c.id));
    for (const r of RECORDS) for (const id of r.controls) expect(ids.has(id)).toBe(true);
  });
  it('shows the evidence-map status of each referenced control', () => {
    const b = buildBrief(uc({ ...agent, ...prio[2] }, { evidence: { 'CTL-MON-03': { status: 'met', note: '' } } }), 'en', fw);
    const rows = block(b, 'evidence').table!.rows;
    expect(rows.map((r) => r[0])).toEqual(['Manifest', 'Authorisation', 'Each consequential action', 'Outcome']);
    expect(rows[2][2]).toContain('CTL-MON-03 Agent action audit trail (Met)');
    expect(block(b, 'evidence').after!.join(' ')).toContain('doi:10.5281/zenodo.23232998');
  });
  it('a non-agentic use case only references the controls that apply to it', () => {
    const b = buildBrief(uc({ ...agent, ai_type: 'predictive', ...prio[3] }), 'en', fw);
    expect(block(b, 'evidence').table!.rows[2][2]).not.toContain('CTL-MON-03');
  });
});

describe('Constraints', () => {
  it('always asks where inference and tool payloads are processed, and names who is responsible', () => {
    const b = buildBrief(uc({ ...agent, ...prio[2], third_party: 'external', cross_border: 'unsure' }), 'en', fw);
    const c = block(b, 'constraints');
    expect(c.items.join(' ')).toContain('inference and tool payloads');
    expect(c.items.join(' ')).toContain('written answer from the provider');
    expect(c.after!.join(' ')).toContain('vendor or integrator');
  });
});

describe('Markdown outputs', () => {
  it('carry the not-an-enforcement-mechanism notice and all six headings, in both languages', () => {
    for (const lang of ['en', 'ar'] as const) {
      const md = briefMarkdown(buildBrief(uc({ ...agent, ...prio[2] }), lang, fw), lang, '2026-10-15');
      expect(md.match(/^## /gm)!.length).toBe(8); // six blocks, warnings, sign-off
      expect(md).not.toMatch(/\b(br|act|perm)\.[a-z]/); // no untranslated keys
      expect(md).not.toContain('undefined');
    }
    expect(briefMarkdown(buildBrief(uc({ ...agent, ...prio[2] }), 'en', fw), 'en')).toContain('not an enforcement mechanism');
  });
  it('the handover spec has no sign-off table', () => {
    expect(briefMarkdown(buildBrief(uc({ ...agent, ...prio[2] }), 'en', fw, 'handover'), 'en')).not.toContain('## Sign-off');
  });
  it('escapes table pipes in user text', () => {
    const md = briefMarkdown(buildBrief(uc({ ...internal, ...prio[1] }, { actions: { draft: { limits: 'a | b' } } }), 'en', fw), 'en');
    expect(md).toContain('a \\| b');
  });
});
