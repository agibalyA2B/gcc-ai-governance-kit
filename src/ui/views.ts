import { t, type Lang } from '../i18n';
import { QUESTIONS, computeTier, topReasons, TIER_ORDER, type Tier, type TierResult } from '../core/scoring';
import { FRAMEWORKS, type FrameworkId } from '../core/frameworks';
import { applicableControls, verifiedShare, THEMES, CROSSWALK, type Control } from '../core/controls';
import type { UseCase } from '../core/usecase';
import { esc, tierIcon } from './html';
import { recommendAutonomy } from '../core/autonomy';

export const STEPS = ['details', 'quick', 'tier', 'deep', 'controls', 'export'] as const;
export type Step = (typeof STEPS)[number];

const L = (lang: Lang, en: string, ar: string) => (lang === 'ar' ? ar : en);

export function tierBadge(lang: Lang, tier: Tier | null, size: 'sm' | 'lg' = 'sm'): string {
  if (!tier) return `<span class="tier-badge tier-none">${t(lang, 'tier.pending')}</span>`;
  return `<span class="tier-badge tier-${tier} ${size === 'lg' ? 'tier-lg' : ''}"><span aria-hidden="true">${tierIcon[tier]}</span> ${t(lang, `tier.${tier}`)}</span>`;
}

export function frameworkChips(lang: Lang, selected: FrameworkId[]): string {
  return `<fieldset class="chips"><legend>${t(lang, 'fw.legend')}</legend>${FRAMEWORKS.map((f) => `
    <label class="chip"><input type="checkbox" name="fw" value="${f.id}" ${selected.includes(f.id) ? 'checked' : ''}/>
    <span>${esc(L(lang, f.en, f.ar))}</span></label>`).join('')}</fieldset>`;
}

function howItWorks(lang: Lang, hasCases: boolean): string {
  return `<section class="how" aria-labelledby="how-h"><h2 id="how-h" class="sr-only">${t(lang, 'how.title')}</h2>
    <ol>${[1, 2, 3].map((n) => `<li><span class="how-num" aria-hidden="true">${n}</span><div><strong>${t(lang, `how.${n}.h`)}</strong><p>${t(lang, `how.${n}.p`)}</p></div></li>`).join('')}</ol>
    <a class="btn primary btn-lg" href="#/new" data-testid="new-uc"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 3v12M3 9h12"/></svg>${t(lang, hasCases ? 'how.cta.more' : 'how.cta.first')}</a>
  </section>`;
}

export function registerView(lang: Lang, cases: UseCase[], selected: FrameworkId[], persistent: boolean, filter: string): string {
  const rows = cases
    .map((uc) => ({ uc, r: computeTier(uc.answers) }))
    .filter(({ r }) => !filter || (r.quickComplete && r.tier === filter))
    .sort((a, b) => TIER_ORDER.indexOf(b.r.tier) - TIER_ORDER.indexOf(a.r.tier) || b.uc.updatedAt.localeCompare(a.uc.updatedAt));
  const table = cases.length
    ? `<div class="table-wrap"><table class="register">
        <caption class="sr-only">${t(lang, 'reg.caption')}</caption>
        <thead><tr><th scope="col">${t(lang, 'reg.name')}</th><th scope="col">${t(lang, 'reg.owner')}</th>
        <th scope="col">${t(lang, 'reg.type')}</th><th scope="col">${t(lang, 'reg.tier')}</th>
        <th scope="col">${t(lang, 'reg.deep')}</th><th scope="col">${t(lang, 'reg.updated')}</th><th scope="col"><span class="sr-only">${t(lang, 'reg.actions')}</span></th></tr></thead>
        <tbody>${rows.map(({ uc, r }) => `<tr>
          <td><a href="#/uc/${esc(uc.id)}/${r.quickComplete ? 'tier' : 'details'}">${esc(uc.name || t(lang, 'reg.untitled'))}</a></td>
          <td>${esc(uc.owner)}</td>
          <td>${uc.answers.ai_type ? t(lang, `aitype.${uc.answers.ai_type}`) : '—'}</td>
          <td>${tierBadge(lang, r.quickComplete ? r.tier : null)}</td>
          <td>${r.deepComplete ? t(lang, 'reg.deep.done') : t(lang, 'reg.deep.todo')}</td>
          <td>${esc(uc.updatedAt.slice(0, 10))}</td>
          <td><div class="row-actions"><button type="button" class="link" data-action="duplicate" data-id="${esc(uc.id)}">${t(lang, 'reg.duplicate')}</button>
          <button type="button" class="link danger" data-action="delete" data-id="${esc(uc.id)}">${t(lang, 'reg.delete')}</button></div></td>
        </tr>`).join('')}</tbody></table></div>`
    : `<div class="empty"><p>${t(lang, 'reg.empty')}</p>
        <button type="button" class="btn" data-action="samples">${t(lang, 'reg.samples')}</button></div>`;
  return `
    <section class="hero"><div><span class="eyebrow">${t(lang, 'app.eyebrow')}</span><h1>${t(lang, 'app.tagline')}</h1><p>${t(lang, 'app.intro')}</p></div></section>
    ${howItWorks(lang, cases.length > 0)}
    ${persistent ? '' : `<p class="notice warn" role="alert">${t(lang, 'store.unavailable')}</p>`}
    ${frameworkChips(lang, selected)}
    <div class="toolbar">
      <label class="filter">${t(lang, 'reg.filter')}
        <select data-action="filter"><option value="">${t(lang, 'reg.filter.all')}</option>
        ${TIER_ORDER.map((x) => `<option value="${x}" ${filter === x ? 'selected' : ''}>${t(lang, `tier.${x}`)}</option>`).join('')}</select></label>
      <span class="spacer"></span>
      <details class="menu" data-testid="data-menu"><summary class="btn">${t(lang, 'data.menu')}</summary>
        <div class="menu-panel"><p class="small muted">${t(lang, 'data.hint')}</p>
        <button type="button" class="btn" data-action="export-json" ${cases.length ? '' : 'disabled'}>${t(lang, 'reg.export.json')}</button>
        <button type="button" class="btn" data-action="export-xlsx" ${cases.length ? '' : 'disabled'}>${t(lang, 'reg.export.xlsx')}</button>
        <button type="button" class="btn" data-action="import">${t(lang, 'reg.import')}</button></div></details>
      <input type="file" accept="application/json,.json" data-action="import-file" hidden />
    </div>
    ${table}
    ${cases.length ? `<p class="muted"><button type="button" class="link danger" data-action="clear">${t(lang, 'reg.clear')}</button></p>` : ''}`;
}

export function stepper(lang: Lang, uc: UseCase, step: Step, r: TierResult): string {
  const enabled = (s: Step) => s === 'details' || (s === 'quick' ? !!uc.name && !!uc.owner : r.quickComplete);
  const done = (s: Step) => s === 'details' ? !!uc.name && !!uc.owner : s === 'quick' || s === 'tier' ? r.quickComplete : s === 'deep' ? r.deepComplete : false;
  return `<nav class="stepper" aria-label="${t(lang, 'step.nav')}"><ol>${STEPS.map((s, i) => `
    <li class="${s === step ? 'current' : done(s) ? 'done' : ''}">${enabled(s)
      ? `<a href="#/uc/${esc(uc.id)}/${s}" ${s === step ? 'aria-current="step"' : ''}><span class="num">${s !== step && done(s) ? '✓' : i + 1}</span> ${t(lang, `step.${s}`)}</a>`
      : `<span class="disabled"><span class="num">${i + 1}</span> ${t(lang, `step.${s}`)}</span>`}</li>`).join('')}</ol></nav>`;
}

export function detailsForm(lang: Lang, uc: UseCase): string {
  const field = (id: keyof UseCase, required = false, textarea = false) => `
    <div class="field"><label for="f-${id}">${t(lang, `uc.${id}`)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    ${textarea
      ? `<textarea id="f-${id}" name="${id}" rows="3">${esc(uc[id])}</textarea>`
      : `<input id="f-${id}" name="${id}" value="${esc(uc[id])}" ${required ? 'required aria-required="true"' : ''} autocomplete="off"/>`}
    <p class="field-error" id="err-${id}" hidden>${t(lang, 'uc.required')}</p></div>`;
  return `<form class="card" data-form="details" novalidate>
    <h2 tabindex="-1">${t(lang, 'step.details')}</h2>
    ${field('name', true)}${field('owner', true)}${field('businessUnit')}${field('purpose', false, true)}
    <div class="field"><label for="f-status">${t(lang, 'uc.status')}</label><select id="f-status" name="status">
      ${(['idea', 'pilot', 'production', 'retired'] as const).map((s) => `<option value="${s}" ${uc.status === s ? 'selected' : ''}>${t(lang, `status.${s}`)}</option>`).join('')}</select></div>
    ${field('notes', false, true)}
    <div class="actions"><button class="btn primary" type="submit">${t(lang, 'nav.next')}</button></div></form>`;
}

function questionBlock(lang: Lang, uc: UseCase, qs: typeof QUESTIONS.questions, showPoints: boolean): string {
  return qs.map((q, i) => `<fieldset class="question"><legend><span class="qnum">${i + 1}.</span> ${esc(L(lang, q.text_en, q.text_ar))}</legend>
      <p class="help">${esc(L(lang, q.help_en, q.help_ar))}</p>
      ${q.options.map((o) => `<label class="option"><input type="radio" name="${q.id}" value="${o.id}" ${uc.answers[q.id] === o.id ? 'checked' : ''}/>
        <span>${esc(L(lang, o.en, o.ar))}</span>${showPoints && q.level !== 'prio' ? `<span class="pts">+${o.points}</span>` : ''}</label>`).join('')}
    </fieldset>`).join('');
}

export function questionsForm(lang: Lang, uc: UseCase, level: 'quick' | 'deep', showPoints: boolean): string {
  const qs = QUESTIONS.questions.filter((q) => q.level === level);
  const answered = qs.filter((q) => uc.answers[q.id]).length;
  const prio = level === 'deep' ? QUESTIONS.questions.filter((q) => q.level === 'prio') : [];
  return `<form class="card" data-form="${level}">
    <h2 tabindex="-1">${t(lang, `step.${level}`)}</h2>
    <p class="muted">${t(lang, `${level}.intro`)} <span class="progress" aria-live="polite">${answered}/${qs.length}</span></p>
    ${questionBlock(lang, uc, qs, showPoints)}
    ${prio.length ? `<section class="prio-block"><h3>${t(lang, 'prio.title')}</h3><p class="muted">${t(lang, 'prio.intro')}</p>${questionBlock(lang, uc, prio, false)}</section>` : ''}
    <div class="actions"><button class="btn primary" type="submit">${t(lang, 'nav.next')}</button></div></form>`;
}

export function autonomyCard(lang: Lang, uc: UseCase, r: TierResult): string {
  const a = recommendAutonomy(uc.answers, r.tier);
  if (!a.complete) return `<div class="autonomy pending"><h3>${t(lang, 'auto.title')}</h3><p class="muted">${t(lang, 'auto.pending')}</p>
    <a class="link" href="#/uc/${esc(uc.id)}/deep">${t(lang, 'auto.answer')}</a></div>`;
  return `<div class="autonomy ${a.exceeds ? 'warn' : 'ok'}"><h3>${t(lang, 'auto.title')}</h3>
    <p class="auto-level"><strong>${t(lang, 'auto.level')} ${a.recommended}</strong>: ${t(lang, `auto.l${a.recommended}`)}</p>
    <p class="muted">${t(lang, `auto.l${a.recommended}.desc`)}</p>
    ${a.capReasons.length ? `<p class="small">${t(lang, `auto.cap.${a.capReasons[0]}`)}</p>` : ''}
    ${a.actual ? `<p class="${a.exceeds ? 'auto-exceeds' : 'auto-fits'}">${t(lang, a.exceeds ? 'auto.exceeds' : 'auto.fits').replace('{n}', String(a.actual))}</p>` : ''}
  </div>`;
}

export function tierView(lang: Lang, uc: UseCase, r: TierResult): string {
  const reasons = topReasons(r, lang);
  const qText = (id: string) => { const q = QUESTIONS.questions.find((x) => x.id === id)!; return L(lang, q.text_en, q.text_ar); };
  return `<section class="card tier-card">
    <h2 tabindex="-1">${t(lang, 'tier.title')}</h2>
    <div class="tier-result">${tierBadge(lang, r.tier, 'lg')}
      ${r.quickTier && r.quickTier !== r.tier ? `<p class="muted">${t(lang, 'tier.raised')} ${tierBadge(lang, r.quickTier)}</p>` : ''}</div>
    <h3>${t(lang, 'tier.why')}</h3>
    <ul class="reasons">${reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    ${r.firedTriggers.length ? `<p class="trigger"><strong>${t(lang, 'tier.trigger')}</strong> ${r.firedTriggers.map((x) => esc(x.id)).join(', ')}</p>` : ''}
    <details class="breakdown"><summary>${t(lang, 'tier.breakdown')} (${r.points} ${t(lang, 'tier.points')})</summary>
      <table><thead><tr><th scope="col">${t(lang, 'tier.question')}</th><th scope="col">${t(lang, 'tier.points')}</th></tr></thead>
      <tbody>${r.factors.map((f) => `<tr><td>${esc(qText(f.questionId))}</td><td>${f.points}</td></tr>`).join('')}</tbody></table>
      <p class="muted">${t(lang, 'tier.thresholds')} ${QUESTIONS.thresholds.limited} / ${QUESTIONS.thresholds.high}. <a href="#/scoring">${t(lang, 'nav.scoring')}</a></p>
    </details>
    ${autonomyCard(lang, uc, r)}
    ${!r.deepComplete ? `<div class="prompt ${r.tier === 'high' || r.tier === 'unacceptable' ? 'strong' : ''}">
      <p>${t(lang, r.tier === 'high' || r.tier === 'unacceptable' ? 'tier.deep.strong' : 'tier.deep.offer')}</p>
      <a class="btn" href="#/uc/${esc(uc.id)}/deep">${t(lang, 'tier.deep.cta')}</a></div>` : ''}
    <div class="actions"><a class="btn primary" href="#/uc/${esc(uc.id)}/controls">${t(lang, 'tier.to.controls')}</a></div>
  </section>`;
}

function refChips(c: Control, frameworks: FrameworkId[]): string {
  return FRAMEWORKS.filter((f) => frameworks.includes(f.id) && (c.refs[f.id] ?? []).length)
    .map((f) => `<span class="ref-chip">${esc(f.short)}: ${esc(c.refs[f.id].join(', '))}</span>`).join('');
}

export function verificationBadge(lang: Lang, c: Control): string {
  return c.verified
    ? `<span class="vbadge verified"><span aria-hidden="true">✓</span> ${t(lang, 'ctl.verified')}</span>`
    : `<span class="vbadge pending" title="${esc(c.notes)}"><span aria-hidden="true">⏱</span> ${t(lang, 'ctl.needs')}</span>`;
}

export function controlsView(lang: Lang, uc: UseCase, r: TierResult, frameworks: FrameworkId[], fwFilter: string, verifiedOnly: boolean): string {
  if (r.tier === 'unacceptable')
    return `<section class="card"><h2 tabindex="-1">${t(lang, 'step.controls')}</h2><p class="notice danger-note">${t(lang, 'ctl.unacceptable')}</p></section>`;
  if (!frameworks.length) return `<section class="card"><h2 tabindex="-1">${t(lang, 'step.controls')}</h2><p class="notice">${t(lang, 'ctl.nofw')}</p><a class="btn" href="#/">${t(lang, 'nav.home')}</a></section>`;
  let list = applicableControls(r.tier, uc.answers, frameworks);
  if (fwFilter) list = list.filter((c) => (c.refs[fwFilter as FrameworkId] ?? []).length);
  if (verifiedOnly) list = list.filter((c) => c.verified);
  const share = verifiedShare(applicableControls(r.tier, uc.answers, frameworks));
  return `<section class="card">
    <h2 tabindex="-1">${t(lang, 'step.controls')}</h2>
    <p class="muted">${t(lang, 'ctl.intro')} <strong>${share.verified}/${share.total}</strong> ${t(lang, 'ctl.verified.share')}</p>
    <div class="toolbar"><label class="filter">${t(lang, 'ctl.filter.fw')}<select data-action="ctl-fw"><option value="">${t(lang, 'reg.filter.all')}</option>
      ${FRAMEWORKS.filter((f) => frameworks.includes(f.id)).map((f) => `<option value="${f.id}" ${fwFilter === f.id ? 'selected' : ''}>${esc(L(lang, f.en, f.ar))}</option>`).join('')}</select></label>
      <label class="filter"><input type="checkbox" data-action="ctl-verified" ${verifiedOnly ? 'checked' : ''}/> ${t(lang, 'ctl.filter.verified')}</label></div>
    ${list.length ? THEMES.map((th) => {
      const items = list.filter((c) => c.theme === th);
      return items.length ? `<h3>${t(lang, `theme.${th}`)}</h3><ul class="controls">${items.map((c) => `<li class="control">
        <div class="control-head"><strong>${esc(L(lang, c.title_en, c.title_ar))}</strong>${verificationBadge(lang, c)}</div>
        <p>${esc(L(lang, c.control_text_en, c.control_text_ar))}</p>
        <div class="refs">${refChips(c, frameworks)}</div>
        ${c.source_urls.length ? `<p class="sources">${t(lang, 'ctl.sources')} ${c.source_urls.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">[${i + 1}]</a>`).join(' ')}</p>` : ''}
      </li>`).join('')}</ul>` : '';
    }).join('') : `<p class="notice">${t(lang, 'ctl.none')}</p>`}
    <div class="actions"><a class="btn primary" href="#/uc/${esc(uc.id)}/export">${t(lang, 'step.export')}</a></div>
  </section>`;
}

export function exportView(lang: Lang, uc: UseCase): string {
  return `<section class="card"><h2 tabindex="-1">${t(lang, 'step.export')}</h2><p class="muted">${t(lang, 'exp.intro')}</p>
    <div class="export-bar">
      <button type="button" class="btn primary" data-action="pdf">${t(lang, 'exp.pdf')}</button>
      <button type="button" class="btn" data-action="ctl-xlsx">${t(lang, 'exp.xlsx')}</button>
      <button type="button" class="btn" data-action="ctl-csv">${t(lang, 'exp.csv')}</button></div>
    <p class="muted">${t(lang, 'exp.pdf.hint')}</p>
    <div class="actions"><a class="btn" href="#/">${t(lang, 'nav.home')}</a></div></section>`;
}

export function reportView(lang: Lang, uc: UseCase, r: TierResult, frameworks: FrameworkId[]): string {
  const list = r.tier === 'unacceptable' ? [] : applicableControls(r.tier, uc.answers, frameworks);
  const share = verifiedShare(list);
  const fwNames = FRAMEWORKS.filter((f) => frameworks.includes(f.id)).map((f) => L(lang, f.en, f.ar)).join(' · ');
  return `<article class="report" aria-hidden="true">
    <header><h1>${t(lang, 'rep.title')}</h1><p>${esc(new Date().toISOString().slice(0, 10))}</p></header>
    <table class="kv"><tbody>
      <tr><th>${t(lang, 'uc.name')}</th><td>${esc(uc.name)}</td></tr><tr><th>${t(lang, 'uc.owner')}</th><td>${esc(uc.owner)}</td></tr>
      <tr><th>${t(lang, 'uc.businessUnit')}</th><td>${esc(uc.businessUnit)}</td></tr><tr><th>${t(lang, 'uc.purpose')}</th><td>${esc(uc.purpose)}</td></tr>
      <tr><th>${t(lang, 'uc.status')}</th><td>${t(lang, `status.${uc.status}`)}</td></tr>
      <tr><th>${t(lang, 'reg.tier')}</th><td>${tierBadge(lang, r.tier)} (${r.points} ${t(lang, 'tier.points')}; ${r.deepComplete ? t(lang, 'reg.deep.done') : t(lang, 'reg.deep.todo')})</td></tr>
      <tr><th>${t(lang, 'fw.legend')}</th><td>${esc(fwNames)}</td></tr>
      ${(() => { const a = recommendAutonomy(uc.answers, r.tier); return a.complete ? `<tr><th>${t(lang, 'auto.title')}</th><td>${t(lang, 'auto.level')} ${a.recommended}: ${t(lang, `auto.l${a.recommended}`)}${a.exceeds ? ` — ${t(lang, 'auto.exceeds').replace('{n}', String(a.actual))}` : ''}</td></tr>` : ''; })()}</tbody></table>
    <h2>${t(lang, 'tier.why')}</h2><ul>${topReasons(r, lang).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${t(lang, 'rep.controls')}</h2>
    ${r.tier === 'unacceptable' ? `<p>${t(lang, 'ctl.unacceptable')}</p>` : `<table class="checklist"><thead><tr><th>☐</th><th>${t(lang, 'rep.control')}</th><th>${t(lang, 'rep.refs')}</th><th>${t(lang, 'rep.status')}</th></tr></thead>
    <tbody>${list.map((c) => `<tr><td>☐</td><td><strong>${esc(L(lang, c.title_en, c.title_ar))}</strong><br/>${esc(L(lang, c.control_text_en, c.control_text_ar))}</td>
      <td>${FRAMEWORKS.filter((f) => frameworks.includes(f.id) && (c.refs[f.id] ?? []).length).map((f) => `${esc(f.short)}: ${esc(c.refs[f.id].join(', '))}`).join('<br/>')}</td>
      <td>${c.verified ? t(lang, 'ctl.verified') : t(lang, 'ctl.needs')}</td></tr>`).join('')}</tbody></table>
    <p class="small">${t(lang, 'rep.verification')} ${share.verified}/${share.total}.</p>`}
    <h2>${t(lang, 'rep.signoff')}</h2>
    <table class="signoff"><tbody><tr><th>${t(lang, 'rep.prepared')}</th><td></td><th>${t(lang, 'rep.date')}</th><td></td></tr>
      <tr><th>${t(lang, 'rep.reviewed')}</th><td></td><th>${t(lang, 'rep.date')}</th><td></td></tr>
      <tr><th>${t(lang, 'rep.decision')}</th><td colspan="3">☐ ${t(lang, 'rep.approve')} &nbsp; ☐ ${t(lang, 'rep.conditions')} &nbsp; ☐ ${t(lang, 'rep.reject')}</td></tr></tbody></table>
    <footer class="small">${t(lang, 'rep.disclaimer')}</footer></article>`;
}

export function scoringView(lang: Lang): string {
  const section = (level: 'quick' | 'deep') => QUESTIONS.questions.filter((q) => q.level === level).map((q) => `
    <tr><th scope="row">${esc(L(lang, q.text_en, q.text_ar))}</th><td>${q.options.map((o) => `${esc(L(lang, o.en, o.ar))} <strong>+${o.points}</strong>`).join('<br/>')}</td></tr>`).join('');
  return `<section class="card"><h1 tabindex="-1">${t(lang, 'nav.scoring')}</h1><p>${t(lang, 'sc.intro')}</p>
    <ul><li>${t(lang, 'tier.little')}: &lt; ${QUESTIONS.thresholds.limited}</li><li>${t(lang, 'tier.limited')}: ${QUESTIONS.thresholds.limited}–${QUESTIONS.thresholds.high - 1}</li>
    <li>${t(lang, 'tier.high')}: ≥ ${QUESTIONS.thresholds.high}</li><li>${t(lang, 'tier.unacceptable')}: ${t(lang, 'sc.unacceptable')}</li></ul>
    <h2>${t(lang, 'sc.triggers')}</h2><ul>${QUESTIONS.triggers.map((x) => `<li><strong>${esc(x.id)}</strong> → ${t(lang, `tier.${x.min_tier}`)}: ${esc(L(lang, x.reason_en, x.reason_ar))}</li>`).join('')}</ul>
    <h2>${t(lang, 'step.quick')}</h2><table class="weights"><tbody>${section('quick')}</tbody></table>
    <h2>${t(lang, 'step.deep')}</h2><table class="weights"><tbody>${section('deep')}</tbody></table>
    <p class="muted">${t(lang, 'sc.deep.rule')}</p>
    <h2>${t(lang, 'auto.title')}</h2><p>${t(lang, 'sc.auto')}</p>
    <ul>${[4, 3, 2, 1].map((n) => `<li><strong>${t(lang, 'auto.level')} ${n}: ${t(lang, `auto.l${n}`)}</strong> — ${t(lang, `auto.l${n}.desc`)}</li>`).join('')}</ul></section>`;
}

export function aboutView(lang: Lang): string {
  const share = verifiedShare(CROSSWALK);
  return `<section class="card prose"><h1 tabindex="-1">${t(lang, 'nav.about')}</h1>
    <p>${t(lang, 'ab.intro')}</p>
    <p><strong>${share.verified}/${share.total}</strong> ${t(lang, 'ab.verified')}</p>
    <h2>${t(lang, 'ab.sources')}</h2><ul>
      <li>${t(lang, 'ab.src.uae')}</li>
      <li><a href="https://uaecabinet.ae/en/news/under-directives-of-uae-president-and-in-world-first-mohammed-bin-rashid-reveals-new-uae-government-framework-to-deploy-agentic-ai-across-50-of-government-sectors-operations-within-two-years" target="_blank" rel="noopener">${t(lang, 'ab.src.uaecode')}</a></li>
      <li><a href="https://uaemodel.egsep.ae/agentic_ai_guide_website.html" target="_blank" rel="noopener">${t(lang, 'ab.src.egsep')}</a></li>
      <li>${t(lang, 'ab.src.datapolicy')}</li>
      <li>${t(lang, 'ab.src.agenticref')}</li>
      <li>${t(lang, 'ab.src.matrix')}</li><li><a href="https://www.digitaldubai.ae/self-assessment" target="_blank" rel="noopener">${t(lang, 'ab.src.dubai')}</a></li>
      <li><a href="https://sdaia.gov.sa/en/SDAIA/about/Documents/ai-principles.pdf" target="_blank" rel="noopener">${t(lang, 'ab.src.sdaia')}</a></li>
      <li><a href="https://www.iso.org/standard/42001" target="_blank" rel="noopener">ISO/IEC 42001:2023</a> — ${t(lang, 'ab.iso')}</li>
      <li><a href="https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf" target="_blank" rel="noopener">NIST AI RMF 1.0</a>; <a href="https://airc.nist.gov/airmf-resources/crosswalks/" target="_blank" rel="noopener">${t(lang, 'ab.nistcw')}</a></li>
      <li><a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener">${t(lang, 'ab.src.eu')}</a></li></ul>
    <p class="muted">${t(lang, 'ab.checked')}</p>
    <h2>${t(lang, 'ab.privacy.h')}</h2><p>${t(lang, 'ab.privacy')}</p>
    <h2>${t(lang, 'ab.licence.h')}</h2><p>${t(lang, 'ab.licence')}</p>
    <h2>${t(lang, 'ab.disclaimer.h')}</h2><p>${t(lang, 'rep.disclaimer')}</p></section>`;
}

export function templatesView(lang: Lang, base: string): string {
  const files = [
    ['register', 'tpl.register'], ['impact-assessment', 'tpl.impact'], ['control-checklist', 'tpl.checklist'],
  ];
  return `<section class="card"><h1 tabindex="-1">${t(lang, 'tpl.title')}</h1><p>${t(lang, 'tpl.intro')}</p>
    <p><a class="btn" href="#/new">${t(lang, 'tpl.start')}</a></p>
    <table class="templates"><thead><tr><th scope="col">${t(lang, 'tpl.file')}</th><th scope="col">English</th><th scope="col">العربية</th></tr></thead><tbody>
    ${files.map(([f, k]) => `<tr><th scope="row">${t(lang, k)}</th>${(['en', 'ar'] as const).map((lg) => `<td>${['xlsx', 'csv', 'md']
      .map((ext) => `<a href="${base}templates/${lg}/${f}.${ext}" download>${ext.toUpperCase()}</a>`).join(' · ')}</td>`).join('')}</tr>`).join('')}
    </tbody></table><p class="muted">${t(lang, 'tpl.licence')}</p></section>`;
}

const GUIDE_SECTIONS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export function guideView(lang: Lang, base: string): string {
  const fig = (name: string, key: string) => `<figure class="shot"><img src="${base}guide/${lang}/${name}.jpg" alt="" loading="lazy" width="1200" height="750"/><figcaption>${t(lang, key)}</figcaption></figure>`;
  const sec = (id: (typeof GUIDE_SECTIONS)[number], body: string) => `<section class="guide-sec" id="gd-${id}"><h2>${t(lang, `gd.${id}.h`)}</h2>${body}</section>`;
  return `<article class="card prose guide">
    <h1 tabindex="-1">${t(lang, 'gd.title')}</h1>
    <p>${t(lang, 'gd.intro')}</p>
    <div class="guide-tools no-print"><button type="button" class="btn" data-action="print-guide">${t(lang, 'gd.print')}</button></div>
    <nav class="guide-toc no-print" aria-label="${t(lang, 'gd.toc')}"><ol>${GUIDE_SECTIONS.map((id) => `<li><button type="button" class="link" data-action="goto" data-target="gd-${id}">${t(lang, `gd.${id}.h`).replace(/^\d+\.\s*/, '')}</button></li>`).join('')}</ol></nav>
    ${sec('s1', `<ol class="steps"><li>${t(lang, 'gd.s1.1')}</li><li>${t(lang, 'gd.s1.2')}</li><li>${t(lang, 'gd.s1.3')}</li></ol>
      ${fig('home', 'gd.fig.home')}<p>${t(lang, 'gd.s1.fw')}</p>${fig('quick', 'gd.fig.quick')}<p>${t(lang, 'gd.s1.deep')}</p>${fig('tier', 'gd.fig.tier')}`)}
    ${sec('s2', `<p>${t(lang, 'gd.s2.intro')}</p><dl class="tiers">${TIER_ORDER.map((x) => `<dt>${tierBadge(lang, x)}</dt><dd>${t(lang, `gd.t.${x}`)}</dd>`).join('')}</dl>`)}
    ${sec('s3', `<p>${t(lang, 'gd.s3.p1')}</p><p>${t(lang, 'gd.s3.p2')}</p><p>${t(lang, 'gd.s3.badges')}</p>
      <ul class="badges"><li><span class="vbadge verified"><span aria-hidden="true">✓</span> ${t(lang, 'ctl.verified')}</span> ${t(lang, 'gd.s3.v')}</li>
      <li><span class="vbadge pending"><span aria-hidden="true">⏱</span> ${t(lang, 'ctl.needs')}</span> ${t(lang, 'gd.s3.n')}</li></ul>
      <p>${t(lang, 'gd.s3.filter')}</p>${fig('controls', 'gd.fig.controls')}`)}
    ${sec('s4', `<p>${t(lang, 'gd.s4.p1')}</p><ul>${[4, 3, 2, 1].map((n) => `<li><strong>${t(lang, 'auto.level')} ${n}:</strong> ${t(lang, `auto.l${n}`)}</li>`).join('')}</ul><p>${t(lang, 'gd.s4.p2')}</p>`)}
    ${sec('s5', `<ul class="plain"><li>${t(lang, 'gd.s5.pdf')}</li><li>${t(lang, 'gd.s5.ctl')}</li></ul>${fig('export', 'gd.fig.export')}
      <ul class="plain"><li>${t(lang, 'gd.s5.backup')}</li><li>${t(lang, 'gd.s5.share')}</li><li>${t(lang, 'gd.s5.tpl')}</li></ul>`)}
    ${sec('s6', `<p>${t(lang, 'gd.s6.p')}</p><p>${t(lang, 'gd.s6.clear')}</p>`)}
    <p class="muted small">${t(lang, 'rep.disclaimer')}</p>
  </article>`;
}

export { TIER_ORDER };
