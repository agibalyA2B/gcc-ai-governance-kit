import type { UseCase } from './usecase';
import { ALL_FRAMEWORKS, type FrameworkId } from './frameworks';

const KEY_CASES = 'gaigk.usecases.v1';
const KEY_FW = 'gaigk.frameworks.v1';

/** Browser-only persistence. Falls back to memory when storage is blocked (private mode, policies). */
class Store {
  private memory = new Map<string, string>();
  readonly persistent: boolean;

  constructor() {
    let ok = false;
    try { localStorage.setItem('gaigk.probe', '1'); localStorage.removeItem('gaigk.probe'); ok = true; } catch { ok = false; }
    this.persistent = ok;
  }
  private get(k: string): string | null {
    if (!this.persistent) return this.memory.get(k) ?? null;
    try { return localStorage.getItem(k); } catch { return this.memory.get(k) ?? null; }
  }
  private set(k: string, v: string): void {
    this.memory.set(k, v);
    if (this.persistent) try { localStorage.setItem(k, v); } catch { /* quota or policy: keep memory copy */ }
  }

  list(): UseCase[] {
    try { return JSON.parse(this.get(KEY_CASES) ?? '[]') as UseCase[]; } catch { return []; }
  }
  save(uc: UseCase): void {
    const all = this.list();
    const i = all.findIndex((x) => x.id === uc.id);
    const next = { ...uc, updatedAt: new Date().toISOString() };
    if (i >= 0) all[i] = next; else all.push(next);
    this.set(KEY_CASES, JSON.stringify(all));
  }
  get1(id: string): UseCase | undefined { return this.list().find((x) => x.id === id); }
  remove(id: string): void { this.set(KEY_CASES, JSON.stringify(this.list().filter((x) => x.id !== id))); }
  replaceAll(cases: UseCase[]): void { this.set(KEY_CASES, JSON.stringify(cases)); }
  clear(): void { this.set(KEY_CASES, '[]'); }

  frameworks(): FrameworkId[] {
    try {
      const v = JSON.parse(this.get(KEY_FW) ?? 'null');
      return Array.isArray(v) ? v.filter((x: string) => (ALL_FRAMEWORKS as string[]).includes(x)) : [...ALL_FRAMEWORKS];
    } catch { return [...ALL_FRAMEWORKS]; }
  }
  setFrameworks(fw: FrameworkId[]): void { this.set(KEY_FW, JSON.stringify(fw)); }
}

export const store = new Store();
