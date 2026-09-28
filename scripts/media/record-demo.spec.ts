// Records the README demo (video + screenshots). Run: npx playwright test -c scripts/media/playwright.media.config.ts
import { test } from '@playwright/test';

test('demo', async ({ page }) => {
  const pause = (ms = 900) => page.waitForTimeout(ms);
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await pause(1200);
  await page.getByRole('button', { name: 'Load 2 sample use cases' }).click();
  await pause();
  await page.screenshot({ path: 'docs/media/register-en.png' });
  await page.getByTestId('new-uc').click();
  await pause(600);
  await page.getByLabel('Name').pressSequentially('Benefits eligibility agent', { delay: 35 });
  await page.getByLabel('Accountable owner').pressSequentially('Social Services', { delay: 35 });
  await page.getByRole('button', { name: 'Continue' }).click();
  await pause(600);
  const answers: [string, string][] = [['runtime_ai', 'yes'], ['impact', 'decide-individuals'], ['data', 'sensitive'], ['affected', 'vulnerable'], ['ai_type', 'agentic'],
    ['autonomy', 'full'], ['oversight', 'complaints'], ['access', 'record'], ['reversibility', 'effort']];
  for (const [q, v] of answers) {
    const input = page.locator(`input[name="${q}"][value="${v}"]`);
    await input.scrollIntoViewIfNeeded();
    await input.check();
    await pause(350);
  }
  await page.getByRole('button', { name: 'Continue' }).click();
  await pause(1500);
  await page.locator('details.breakdown summary').click();
  await pause(1200);
  await page.screenshot({ path: 'docs/media/tier-en.png', fullPage: true });
  await page.getByRole('link', { name: 'See applicable controls' }).click();
  await pause(1500);
  await page.mouse.wheel(0, 700);
  await pause(1200);
  await page.screenshot({ path: 'docs/media/controls-en.png' });
  await page.getByTestId('lang-toggle').click();
  await pause(1500);
  await page.mouse.wheel(0, -2000);
  await pause(800);
  await page.screenshot({ path: 'docs/media/controls-ar.png' });
  await page.getByRole('link', { name: 'السجل' }).first().click();
  await pause(1500);
  await page.screenshot({ path: 'docs/media/register-ar.png' });
});
