import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('sample use case reaches a High tier with controls and exports', async ({ page }) => {
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await expect(page.locator('table.register tbody tr')).toHaveCount(2);
  await page.getByRole('link', { name: 'Citizen service triage agent' }).click();
  await expect(page.locator('.tier-result .tier-badge')).toContainText('High risk');
  await expect(page.locator('.reasons li').first()).toBeVisible();
  await page.getByRole('link', { name: 'See applicable controls' }).click();
  const controls = page.locator('li.control');
  await expect(controls.first()).toBeVisible();
  expect(await controls.count()).toBeGreaterThan(5);
  await expect(page.locator('.vbadge').first()).toBeVisible();
  await page.getByRole('link', { name: 'Export' }).last().click();
  const [csv] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Controls (CSV)' }).click()]);
  expect(csv.suggestedFilename()).toMatch(/^controls-.*\.csv$/);
  const [xlsx] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Controls (XLSX)' }).click()]);
  expect(xlsx.suggestedFilename()).toMatch(/\.xlsx$/);
});

test('new use case: validation, quick check and tier', async ({ page }) => {
  await page.getByTestId('new-uc').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#err-name')).toBeVisible();
  await page.getByLabel('Name').fill('Loan approval model');
  await page.getByLabel('Accountable owner').fill('Retail Credit');
  await page.getByRole('button', { name: 'Continue' }).click();
  const pick = async (q: string, v: string) => page.locator(`input[name="${q}"][value="${v}"]`).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.toast')).toContainText('uses AI when it runs');
  await pick('runtime_ai', 'yes');
  await pick('impact', 'decide-individuals'); await pick('data', 'sensitive'); await pick('affected', 'public');
  await pick('ai_type', 'predictive'); await pick('autonomy', 'approval'); await pick('oversight', 'every');
  await pick('access', 'none'); await pick('reversibility', 'effort');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.tier-result .tier-badge')).toContainText('High risk');
  await expect(page.locator('.trigger')).toContainText('T-SENSITIVE-DECISIONS');
  await expect(page.locator('.prompt.strong')).toBeVisible();
  await expect(page.locator('.tier-source')).toContainText('Your tier comes from the 8 quick-check questions');
  await page.getByRole('link', { name: 'Start the deep-dive' }).click();
  await expect(page.locator('.badge-optional')).toHaveCount(2);
  await expect(page.locator('.prio-note')).toContainText('These are not risk questions');
});

test('a solution with no AI at runtime gets pointers instead of a tier', async ({ page }) => {
  await page.getByTestId('new-uc').click();
  await page.getByLabel('Name').fill('Invoice portal built with AI coding tools');
  await page.getByLabel('Accountable owner').fill('Finance IT');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('fieldset.question')).toHaveCount(8);
  await page.locator('input[name="runtime_ai"][value="no"]').check();
  await expect(page.locator('.scope-none h3')).toHaveText("AI governance controls don't apply");
  await expect(page.locator('fieldset.question')).toHaveCount(0);
  await expect(page.locator('.stepper li').nth(2).locator('.disabled')).toBeVisible();
  await page.locator('.actions').getByRole('link', { name: 'Register' }).click();
  await expect(page.locator('table.register tbody tr')).toContainText('No AI at runtime');
  await page.getByRole('link', { name: 'Invoice portal built with AI coding tools' }).click();
  await page.locator('input[name="runtime_ai"][value="yes"]').check();
  await expect(page.locator('fieldset.question')).toHaveCount(8);
});

test('control-evidence map is saved per use case and exported', async ({ page }) => {
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await page.getByRole('link', { name: 'Citizen service triage agent' }).click();
  await page.getByRole('link', { name: 'See applicable controls' }).click();
  const first = page.locator('li.control').first();
  await first.locator('select[data-action="ev-status"]').selectOption('met');
  await first.locator('textarea[data-action="ev-note"]').fill('AI policy v2, approved 12 Mar');
  await page.locator('li.control').nth(1).locator('select[data-action="ev-status"]').selectOption('gap');
  await expect(page.getByTestId('ev-summary')).toContainText('1 Met');
  await expect(page.getByTestId('ev-summary')).toContainText('1 Gap');
  await expect(first).toHaveAttribute('data-status', 'met');
  await page.reload();
  await expect(page.locator('li.control').first().locator('textarea[data-action="ev-note"]')).toHaveValue('AI policy v2, approved 12 Mar');
  await page.getByRole('link', { name: 'Export' }).last().click();
  const [csv] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Controls (CSV)' }).click()]);
  const text = readFileSync((await csv.path())!, 'utf8');
  expect(text).toContain('Evidence status');
  expect(text).toContain('AI policy v2, approved 12 Mar');
  const [xlsx] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Controls (XLSX)' }).click()]);
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(Object.values(XLSX.read(readFileSync((await xlsx.path())!)).Sheets)[0]);
  expect(rows[0]['Evidence status']).toBe('Met');
  expect(rows[1]['Evidence status']).toBe('Gap');
  expect(rows[2]['Evidence status']).toBe('Not reviewed');
  // The backup keeps the evidence, and restoring it brings the evidence back.
  await page.goto('./');
  await page.getByTestId('data-menu').locator('summary').click();
  const [backup] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save a backup (.json)' }).click()]);
  const saved = JSON.parse(readFileSync((await backup.path())!, 'utf8'));
  expect(Object.values(saved.useCases.find((u: { name: string }) => u.name === 'Citizen service triage agent').evidence)).toContainEqual({ status: 'met', note: 'AI policy v2, approved 12 Mar' });
});

test('a register saved before evidence existed still restores', async ({ page }) => {
  const old = { format: 'gcc-ai-governance-kit/register', version: 1, useCases: [{ id: 'old-1', name: 'Legacy chatbot', owner: 'Digital', businessUnit: '', purpose: '', status: 'pilot', notes: '',
    answers: { impact: 'public-info', data: 'none', affected: 'public', ai_type: 'generative', autonomy: 'monitored', oversight: 'exceptions', access: 'none', reversibility: 'easy' }, createdAt: '2026-09-01', updatedAt: '2026-09-01' }] };
  await page.locator('input[data-action="import-file"]').setInputFiles({ name: 'old.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(old)) });
  await expect(page.locator('table.register tbody tr')).toHaveCount(1);
  await page.getByRole('link', { name: 'Legacy chatbot' }).click();
  await expect(page.locator('.tier-result .tier-badge')).toContainText('Limited');
  await page.getByRole('link', { name: 'See applicable controls' }).click();
  await expect(page.getByTestId('ev-summary')).toContainText('0 Met');
});

test('sensitivity view shows the tier once operational gaps are fixed', async ({ page }) => {
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await page.getByRole('link', { name: 'Website FAQ chatbot' }).click();
  await expect(page.getByTestId('sensitivity')).toHaveCount(0);
  await expect(page.locator('.sensitivity')).toContainText('Complete the deep-dive');
  await page.getByRole('link', { name: 'Start the deep-dive' }).click();
  for (const [q, v] of [['security_tested', 'no'], ['monitoring', 'no']] as const) await page.locator(`input[name="${q}"][value="${v}"]`).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.tier-result .tier-lg')).toContainText('High risk');
  const card = page.getByTestId('sensitivity');
  await expect(card).toContainText('bring the tier down to');
  await expect(card.locator('.tier-badge')).toContainText('Limited');
  await expect(card.locator('li')).toHaveCount(2);
});

test('a product can have several deployment profiles, grouped in the register', async ({ page }) => {
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  const faq = page.locator('tr', { has: page.getByRole('link', { name: 'Website FAQ chatbot' }) });
  await faq.getByRole('button', { name: 'Add deployment' }).click();
  await expect(page.locator('#f-product')).toHaveValue('Website FAQ chatbot');
  await page.locator('#f-name').fill('Website FAQ chatbot (agent)');
  await page.locator('#f-deployment').fill('Agent');
  await page.locator('#f-deployment').blur();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('input[name="autonomy"][value="full"]').check();
  await page.locator('input[name="reversibility"][value="hard"]').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.tier-result .tier-lg')).toContainText('High risk');
  await page.goto('./');
  const product = page.getByTestId('product-row');
  await expect(product).toHaveCount(1);
  await expect(product).toContainText('Website FAQ chatbot');
  await expect(product).toContainText('2 deployments');
  await expect(product.locator('.tier-badge')).toContainText('High risk');
  await expect(page.locator('tr.deployment-row')).toHaveCount(2);
  await expect(page.locator('.deploy-chip')).toHaveText('Agent');
});

test('a filled register template (CSV or XLSX) imports into the app', async ({ page }) => {
  await page.getByTestId('data-menu').locator('summary').click();
  await expect(page.getByRole('button', { name: 'Import a filled register (.xlsx or .csv)' })).toBeVisible();
  await page.locator('input[data-action="import-table-file"]').setInputFiles('public/templates/en/register.csv');
  await expect(page.locator('table.register tbody tr')).toHaveCount(2);
  await expect(page.locator('.toast')).toContainText('Imported 2 use cases');
  await page.getByRole('link', { name: 'Citizen service triage agent' }).click();
  await expect(page.locator('.tier-result .tier-lg')).toContainText('High risk');
  await page.goto('./');
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('gaigk.lang', 'ar'); });
  await page.reload();
  await page.locator('input[data-action="import-table-file"]').setInputFiles('public/templates/ar/register.xlsx');
  await expect(page.locator('table.register tbody tr')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'روبوت محادثة للأسئلة الشائعة' })).toBeVisible();
});

test('private-sector examples load with a spread of tiers', async ({ page }) => {
  await page.getByRole('button', { name: 'Load 6 private-sector examples' }).click();
  await expect(page.locator('table.register tbody tr')).toHaveCount(6);
  await page.locator('select[data-action="filter"]').selectOption('high');
  await expect(page.locator('table.register tbody tr')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Construction claims drafting assistant' })).toBeVisible();
});

test('Arabic mode renders RTL register and tier', async ({ page }) => {
  await page.getByTestId('lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'تحميل مثالين' }).click();
  await page.getByRole('link', { name: 'وكيل فرز طلبات خدمات المتعاملين' }).click();
  await expect(page.locator('.tier-result .tier-badge')).toContainText('مخاطر مرتفعة');
});

test('no network request carries use-case data', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => { if (r.method() !== 'GET') requests.push(`${r.method()} ${r.url()}`); });
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await page.getByRole('link', { name: 'Website FAQ chatbot' }).click();
  await expect(page.locator('.tier-result .tier-badge')).toContainText('Limited');
  expect(requests).toEqual([]);
});

test('prioritisation gives a recommended autonomy level and flags over-autonomy', async ({ page }) => {
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await page.getByRole('link', { name: 'Citizen service triage agent' }).click();
  await expect(page.locator('.autonomy.pending')).toBeVisible();
  await page.getByRole('link', { name: 'Answer them now' }).click();
  for (const [q, v] of [['usage', 'high'], ['complexity', 'medium'], ['readiness', 'medium']] as const)
    await page.locator(`input[name="${q}"][value="${v}"]`).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.autonomy .auto-level')).toContainText('Level 2');
  await expect(page.locator('.auto-fits')).toBeVisible();
});

test('"not suitable yet" lists concrete steps instead of only a warning', async ({ page }) => {
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await page.getByRole('link', { name: 'Website FAQ chatbot' }).click();
  await page.getByRole('link', { name: 'Answer them now' }).click();
  for (const q of ['usage', 'complexity', 'readiness']) await page.locator(`input[name="${q}"][value="low"]`).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.autonomy .auto-level')).toContainText('Level 4');
  await expect(page.locator('.auto-exceeds')).toContainText('not suitable for AI yet');
  await expect(page.locator('.auto-steps li')).toHaveCount(4);
  await expect(page.locator('.auto-steps')).toContainText('accountable owner');  await page.getByRole('link', { name: 'Details' }).click();
  await page.getByRole('link', { name: 'Quick check' }).click();
  await page.locator('input[name="impact"][value="prohibited"]').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.autonomy')).toContainText('prohibited');
  await expect(page.locator('.autonomy')).not.toContainText('Usage is low');
  await expect(page.locator('.auto-steps')).toHaveCount(0);
});

test('home shows the three-step path and keeps backup tools in a secondary menu', async ({ page }) => {
  await expect(page.locator('.how li')).toHaveCount(3);
  await expect(page.getByTestId('new-uc')).toHaveText('Start your first assessment');
  await expect(page.getByRole('button', { name: 'Restore a saved register (.json)' })).toBeHidden();
  await page.getByTestId('data-menu').locator('summary').click();
  await expect(page.getByRole('button', { name: 'Restore a saved register (.json)' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Restore a saved register (.json)' })).toBeHidden();
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await expect(page.getByTestId('new-uc')).toHaveText('Assess another use case');
  await page.getByTestId('data-menu').locator('summary').click();
  const [json] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save a backup (.json)' }).click()]);
  expect(json.suggestedFilename()).toMatch(/^ai-register-.*\.json$/);
});

test('templates page says no upload is needed and links back to the app', async ({ page }) => {
  await page.goto('./#/templates');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prefer spreadsheets? Work offline');
  await expect(page.locator('main')).toContainText('nothing to download or upload');
  await page.getByRole('link', { name: 'Start an assessment in the browser instead' }).click();
  await expect(page.locator('#f-name')).toBeVisible();
});

test('user guide is linked from the header, covers six topics and loads its screenshots', async ({ page }) => {
  await page.getByRole('link', { name: 'Guide' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('User guide');
  await expect(page.locator('.guide-sec')).toHaveCount(6);
  await expect(page.locator('.tiers dt')).toHaveCount(4);
  const imgs = page.locator('.guide img');
  await expect(imgs).toHaveCount(5);
  for (const img of await imgs.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
  }
  await page.getByTestId('lang-toggle').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('دليل الاستخدام');
  await expect(page.locator('.guide img').first()).toHaveAttribute('src', /guide\/ar\/home\.jpg$/);
});
