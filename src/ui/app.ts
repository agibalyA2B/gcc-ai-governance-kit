import { applyLang, initialLang, storeLang, t, type Lang } from '../i18n';
import { computeTier, topReasons, aiInScope, type Answers } from '../core/scoring';
import { store } from '../core/store';
import { blankUseCase, sampleUseCases, newId, parseRegister, REGISTER_FORMAT, type UseCase } from '../core/usecase';
import { setEvidence, type EvidenceStatus } from '../core/evidence';
import { newDeployment } from '../core/products';
import { privateSectorExamples } from '../core/samples';
import { applicableControls } from '../core/controls';
import { FRAMEWORKS, type FrameworkId } from '../core/frameworks';
import { toCsv, toXlsx, download, readTable, type Row } from '../export/tabular';
import { casesFromRows } from '../core/importTable';
import * as V from './views';

const REPO = 'https://github.com/agibalyA2B/gcc-ai-governance-kit';
let lang: Lang = initialLang();
let regFilter = '';
let ctlFw = '';
let ctlVerifiedOnly = false;
const showPoints = true;

const app = () => document.getElementById('app')!;
const route = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);

function shell(content: string): string {
  return `<a class="skip" href="#main">${t(lang, 'nav.skip')}</a>
  <header class="header">
    <a class="brand" href="#/"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#C8A96A" stroke-width="1.6" aria-hidden="true"><rect x="6" y="6" width="16" height="16"/><rect x="6" y="6" width="16" height="16" transform="rotate(45 14 14)"/><circle cx="14" cy="14" r="3"/></svg>${t(lang, 'app.title')}</a>
    <nav class="nav" aria-label="${t(lang, 'nav.primary')}">
      <a href="#/guide">${t(lang, 'nav.guide')}</a>
      <a href="#/scoring">${t(lang, 'nav.scoring')}</a>
      <a href="#/templates">${t(lang, 'nav.templates')}</a>
      <a href="#/about">${t(lang, 'nav.about')}</a>
      <a href="${REPO}" target="_blank" rel="noopener">${t(lang, 'nav.github')}</a>
      <button type="button" class="lang-toggle" data-testid="lang-toggle" lang="${lang === 'ar' ? 'en' : 'ar'}"
        aria-label="${t(lang, 'lang.toggle.label')}">${t(lang, 'lang.toggle')}</button>
    </nav>
  </header>
  <main id="main" tabindex="-1">${content}</main>
  <footer class="site-footer"><p>${t(lang, 'footer.privacy')} · ${t(lang, 'footer.licence')}</p></footer>
  <div id="print-root"></div>
  <div class="toast" role="status" aria-live="polite"></div>`;
}

function toast(msg: string): void {
  const el = document.querySelector<HTMLElement>('.toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function stamp(): string { return new Date().toISOString().slice(0, 10); }
function slug(s: string): string { return (s || 'use-case').toLowerCase().replace(/[^a-z0-9؀-ۿ]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40); }

function controlRows(uc: UseCase, fw: FrameworkId[]): Row[] {
  const r = computeTier(uc.answers);
  if (r.tier === 'unacceptable') return [];
  return applicableControls(r.tier, uc.answers, fw).map((c) => {
    const row: Row = {
      [t(lang, 'rep.id')]: c.id,
      [t(lang, 'rep.theme')]: t(lang, `theme.${c.theme}`),
      [t(lang, 'rep.control')]: lang === 'ar' ? c.title_ar : c.title_en,
      [t(lang, 'rep.text')]: lang === 'ar' ? c.control_text_ar : c.control_text_en,
    };
    for (const f of FRAMEWORKS.filter((x) => fw.includes(x.id))) row[f.short] = (c.refs[f.id] ?? []).join('; ');
    row[t(lang, 'rep.status')] = c.verified ? t(lang, 'ctl.verified') : t(lang, 'ctl.needs');
    const e = uc.evidence?.[c.id];
    row[t(lang, 'ev.status')] = e?.status ? t(lang, `ev.${e.status}`) : t(lang, 'ev.unset');
    row[t(lang, 'ev.note')] = e?.note ?? '';
    row[t(lang, 'ctl.sources')] = c.source_urls.join(' ');
    return row;
  });
}

function registerRows(cases: UseCase[]): Row[] {
  return cases.map((uc) => {
    const r = computeTier(uc.answers);
    return {
      [t(lang, 'uc.name')]: uc.name, [t(lang, 'uc.owner')]: uc.owner, [t(lang, 'uc.businessUnit')]: uc.businessUnit,
      [t(lang, 'uc.purpose')]: uc.purpose, [t(lang, 'uc.status')]: t(lang, `status.${uc.status}`),
      [t(lang, 'reg.product')]: uc.product ?? '', [t(lang, 'uc.deployment')]: uc.deployment ?? '',
      [t(lang, 'reg.type')]: uc.answers.ai_type ? t(lang, `aitype.${uc.answers.ai_type}`) : '',
      [t(lang, 'reg.tier')]: !aiInScope(uc.answers) ? t(lang, 'scope.badge') : r.quickComplete ? t(lang, `tier.${r.tier}`) : t(lang, 'tier.pending'),
      [t(lang, 'tier.points')]: r.points, [t(lang, 'tier.why')]: topReasons(r, lang).join(' | '),
      [t(lang, 'reg.deep')]: r.deepComplete ? t(lang, 'reg.deep.done') : t(lang, 'reg.deep.todo'), [t(lang, 'reg.updated')]: uc.updatedAt.slice(0, 10),
    };
  });
}

function render(focus = true): void {
  applyLang(lang);
  document.title = t(lang, 'app.title');
  const [page, id, stepRaw] = route();
  let content = '';
  let uc: UseCase | undefined;

  if (!page) content = V.registerView(lang, store.list(), store.frameworks(), store.persistent, regFilter);
  else if (page === 'guide') content = V.guideView(lang, import.meta.env.BASE_URL);
  else if (page === 'scoring') content = V.scoringView(lang);
  else if (page === 'about') content = V.aboutView(lang);
  else if (page === 'templates') content = V.templatesView(lang, import.meta.env.BASE_URL);
  else if (page === 'new') {
    const fresh = blankUseCase();
    store.save(fresh);
    location.replace(`#/uc/${fresh.id}/details`);
    return;
  } else if (page === 'uc' && id && (uc = store.get1(id))) {
    let step = (V.STEPS as readonly string[]).includes(stepRaw) ? (stepRaw as V.Step) : 'details';
    if (!aiInScope(uc.answers) && step !== 'details') step = 'quick';
    const r = computeTier(uc.answers);
    const body =
      step === 'details' ? V.detailsForm(lang, uc)
      : step === 'quick' ? V.questionsForm(lang, uc, 'quick', showPoints)
      : !r.quickComplete ? `<p class="notice">${t(lang, 'step.locked')}</p><a class="btn" href="#/uc/${uc.id}/quick">${t(lang, 'step.quick')}</a>`
      : step === 'tier' ? V.tierView(lang, uc, r)
      : step === 'deep' ? V.questionsForm(lang, uc, 'deep', showPoints)
      : step === 'controls' ? V.controlsView(lang, uc, r, store.frameworks(), ctlFw, ctlVerifiedOnly)
      : V.exportView(lang, uc);
    content = `<p class="crumb"><a href="#/">${t(lang, 'nav.home')}</a> / ${uc.name ? V.caseBadge(lang, uc, r) : ''} <span>${uc.name ? uc.name.replace(/[<>&]/g, '') : t(lang, 'reg.untitled')}</span></p>
      ${V.stepper(lang, uc, step, r)}${body}`;
  } else content = `<section class="card"><h1 tabindex="-1">${t(lang, 'nf.title')}</h1><a class="btn" href="#/">${t(lang, 'nav.home')}</a></section>`;

  app().innerHTML = shell(content);
  if (focus) (document.querySelector<HTMLElement>('main h1, main h2') ?? document.getElementById('main'))?.focus({ preventScroll: false });
}

function currentUc(): UseCase | undefined { const [page, id] = route(); return page === 'uc' && id ? store.get1(id) : undefined; }

function closeMenus(when: (m: HTMLDetailsElement) => boolean = () => true): void {
  for (const m of document.querySelectorAll<HTMLDetailsElement>('details.menu[open]')) if (when(m)) m.open = false;
}

function onClick(e: Event): void {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action], .lang-toggle');
  closeMenus((m) => !m.contains(e.target as Node) || !!el);
  if (!el) return;
  if (el.classList.contains('lang-toggle')) {
    lang = lang === 'ar' ? 'en' : 'ar';
    storeLang(lang);
    render(false);
    document.querySelector<HTMLElement>('.lang-toggle')?.focus();
    return;
  }
  const action = el.dataset.action;
  const uc = currentUc();
  switch (action) {
    case 'samples': for (const s of sampleUseCases(lang)) store.save(s); render(); break;
    case 'samples-private': for (const s of privateSectorExamples(lang)) store.save(s); render(); break;
    case 'duplicate': { const src = store.get1(el.dataset.id!); if (src) { store.save({ ...src, id: newId(), name: `${src.name} (${t(lang, 'reg.copy')})`, createdAt: new Date().toISOString() }); render(false); } break; }
    case 'add-deployment': {
      const src = store.get1(el.dataset.id!);
      if (src) {
        if (!src.product) store.save({ ...src, product: src.name });
        const d = newDeployment(src);
        store.save(d);
        location.hash = `#/uc/${d.id}/details`;
      }
      break;
    }
    case 'delete': if (confirm(t(lang, 'reg.confirm.delete'))) { store.remove(el.dataset.id!); render(false); } break;
    case 'clear': if (confirm(t(lang, 'reg.confirm.clear'))) { store.clear(); render(); } break;
    case 'import': document.querySelector<HTMLInputElement>('[data-action="import-file"]')?.click(); break;
    case 'import-table': document.querySelector<HTMLInputElement>('[data-action="import-table-file"]')?.click(); break;
    case 'export-json':
      download(`ai-register-${stamp()}.json`, JSON.stringify({ format: REGISTER_FORMAT, version: 1, useCases: store.list() }, null, 2), 'application/json');
      break;
    case 'export-xlsx':
      download(`ai-register-${stamp()}.xlsx`, toXlsx([{ name: t(lang, 'reg.sheet'), rows: registerRows(store.list()) }], lang === 'ar'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      break;
    case 'ctl-csv': if (uc) download(`controls-${slug(uc.name)}-${stamp()}.csv`, toCsv(controlRows(uc, store.frameworks())), 'text/csv;charset=utf-8'); break;
    case 'ctl-xlsx': if (uc) download(`controls-${slug(uc.name)}-${stamp()}.xlsx`, toXlsx([{ name: t(lang, 'step.controls'), rows: controlRows(uc, store.frameworks()) }], lang === 'ar'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); break;
    case 'goto': document.getElementById(el.dataset.target!)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
    case 'print-guide': {
      const g = document.querySelector('.guide');
      if (g) { document.getElementById('print-root')!.innerHTML = g.outerHTML; window.print(); }
      break;
    }
    case 'pdf':
      if (uc) {
        document.getElementById('print-root')!.innerHTML = V.reportView(lang, uc, computeTier(uc.answers), store.frameworks());
        window.print();
      }
      break;
  }
}

function onChange(e: Event): void {
  const el = e.target as HTMLInputElement | HTMLSelectElement;
  if (el.name === 'fw') {
    const checked = [...document.querySelectorAll<HTMLInputElement>('input[name="fw"]:checked')].map((x) => x.value as FrameworkId);
    store.setFrameworks(checked);
    toast(t(lang, 'fw.saved'));
    return;
  }
  if (el.dataset.action === 'filter') { regFilter = el.value; render(false); return; }
  if (el.dataset.action === 'ctl-fw') { ctlFw = el.value; render(false); return; }
  if (el.dataset.action === 'ctl-verified') { ctlVerifiedOnly = (el as HTMLInputElement).checked; render(false); return; }
  if (el.dataset.action === 'import-file') { void importFile((el as HTMLInputElement).files?.[0]); return; }
  if (el.dataset.action === 'import-table-file') { void importTableFile((el as HTMLInputElement).files?.[0]); return; }
  if (el.dataset.action === 'ev-status' || el.dataset.action === 'ev-note') { saveEvidence(el); return; }
  const form = el.closest<HTMLFormElement>('form[data-form]');
  const uc = currentUc();
  if (!form || !uc) return;
  if (form.dataset.form === 'details') {
    const fd = new FormData(form);
    store.save({ ...uc, name: String(fd.get('name') ?? '').trim(), owner: String(fd.get('owner') ?? '').trim(), businessUnit: String(fd.get('businessUnit') ?? ''),
      purpose: String(fd.get('purpose') ?? ''), status: String(fd.get('status') ?? 'idea') as UseCase['status'], notes: String(fd.get('notes') ?? ''),
      product: String(fd.get('product') ?? '').trim() || undefined, deployment: String(fd.get('deployment') ?? '').trim() || undefined });
  } else if (el.type === 'radio') {
    const answers: Answers = { ...uc.answers, [el.name]: el.value };
    store.save({ ...uc, answers });
    if (el.name === 'runtime_ai') {
      render(false);
      document.querySelector<HTMLInputElement>(`input[name="runtime_ai"][value="${el.value}"]`)?.focus();
      return;
    }
    const qs = form.querySelectorAll('fieldset.question');
    const done = [...qs].filter((f) => f.querySelector('input:checked')).length;
    const p = form.querySelector('.progress'); if (p) p.textContent = `${done}/${qs.length}`;
  }
}

/** Saves one control's evidence and refreshes the tally in place, so focus and scroll stay where the user is. */
function saveEvidence(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void {
  const uc = currentUc();
  const id = el.dataset.ctl;
  if (!uc || !id) return;
  const patch = el.dataset.action === 'ev-status' ? { status: el.value as EvidenceStatus | '' } : { note: el.value };
  const next = { ...uc, evidence: setEvidence(uc.evidence ?? {}, id, patch) };
  store.save(next);
  const li = el.closest<HTMLElement>('li.control');
  if (li && el.dataset.action === 'ev-status') li.dataset.status = el.value;
  const r = computeTier(next.answers);
  const ids = applicableControls(r.tier, next.answers, store.frameworks()).map((c) => c.id);
  const sum = document.querySelector<HTMLElement>('[data-testid="ev-summary"]');
  if (sum) sum.innerHTML = V.evidenceSummaryText(lang, ids, next.evidence);
}

function onSubmit(e: Event): void {
  const form = e.target as HTMLFormElement;
  if (!form.dataset.form) return;
  e.preventDefault();
  const uc = currentUc();
  if (!uc) return;
  if (form.dataset.form === 'details') {
    let ok = true;
    for (const k of ['name', 'owner']) {
      const input = form.querySelector<HTMLInputElement>(`[name="${k}"]`)!;
      const err = form.querySelector<HTMLElement>(`#err-${k}`)!;
      const missing = !input.value.trim();
      err.hidden = !missing; input.setAttribute('aria-invalid', String(missing));
      if (missing) { input.setAttribute('aria-describedby', `err-${k}`); if (ok) input.focus(); ok = false; }
    }
    if (ok) location.hash = `#/uc/${uc.id}/quick`;
    return;
  }
  const level = form.dataset.form as 'quick' | 'deep';
  if (level === 'quick' && !uc.answers.runtime_ai) {
    toast(t(lang, 'intake.required'));
    form.querySelector<HTMLInputElement>('input[name="runtime_ai"]')?.focus();
    return;
  }
  const unanswered = [...form.querySelectorAll('fieldset.question')].find((f) => !f.querySelector('input:checked'));
  if (level === 'quick' && unanswered) { toast(t(lang, 'quick.incomplete')); unanswered.querySelector<HTMLInputElement>('input')?.focus(); return; }
  location.hash = level === 'quick' ? `#/uc/${uc.id}/tier` : `#/uc/${uc.id}/tier`;
}

/** Adds imported use cases, asking whether to replace the current register (same rule as a JSON restore). */
function addImported(cases: UseCase[]): void {
  const replace = store.list().length ? confirm(t(lang, 'reg.import.replace')) : true;
  if (replace) store.replaceAll(cases);
  else {
    const existing = new Map(store.list().map((u) => [u.id, u]));
    for (const u of cases) existing.set(u.id, u);
    store.replaceAll([...existing.values()]);
  }
  render();
}

async function importTableFile(file?: File): Promise<void> {
  if (!file) return;
  try {
    const res = casesFromRows(readTable(await file.arrayBuffer()));
    if (!res || !res.cases.length) throw new Error('empty');
    addImported(res.cases);
    toast(t(lang, 'reg.import.table.ok').replace('{n}', String(res.cases.length)).replace('{s}', String(res.skipped.length)).replace('{w}', String(res.warnings.length)));
  } catch {
    toast(t(lang, 'reg.import.table.bad'));
  }
}

async function importFile(file?: File): Promise<void> {
  if (!file) return;
  try {
    const cases = parseRegister(JSON.parse(await file.text()));
    if (!cases) throw new Error('schema');
    addImported(cases);
    toast(t(lang, 'reg.import.ok').replace('{n}', String(cases.length)));
  } catch {
    toast(t(lang, 'reg.import.bad'));
  }
}

export function start(): void {
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('submit', onSubmit);
  // Evidence notes save as the user types, so closing the tab never loses them.
  document.addEventListener('input', (e) => { const el = e.target as HTMLTextAreaElement; if (el.dataset?.action === 'ev-note') saveEvidence(el); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });
  window.addEventListener('hashchange', () => render());
  window.addEventListener('afterprint', () => { const p = document.getElementById('print-root'); if (p) p.innerHTML = ''; });
  render(false);
}
