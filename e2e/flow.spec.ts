import { test, expect } from '@playwright/test';

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
