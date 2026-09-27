// Screenshots for the in-app user guide, in both languages.
// Run: npx playwright test -c scripts/media/playwright.media.config.ts guide-shots
import { test, type Page } from '@playwright/test';

test.use({ video: 'off', viewport: { width: 1200, height: 750 } });

const shot = (page: Page, lang: string, name: string) =>
  page.screenshot({ path: `public/guide/${lang}/${name}.jpg`, type: 'jpeg', quality: 82 });

for (const lang of ['en', 'ar'] as const) {
  test(`guide screenshots (${lang})`, async ({ page }) => {
    await page.goto('./');
    await page.evaluate((l) => { localStorage.clear(); localStorage.setItem('gaigk.lang', l); }, lang);
    await page.reload();
    await page.locator('.how').waitFor();
    await shot(page, lang, 'home');
    await page.locator('[data-action="samples"]').click();
    const href = await page.locator('table.register tbody tr a').first().getAttribute('href');
    const base = href!.replace(/\/[a-z]+$/, '');
    await page.goto(`./${base}/quick`);
    await page.locator('fieldset.question').first().waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, lang, 'quick');
    await page.goto(`./${base}/tier`);
    await page.locator('details.breakdown summary').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, lang, 'tier');
    await page.goto(`./${base}/controls`);
    await page.locator('li.control').first().waitFor();
    await page.locator('.card h3').first().evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120));
    await shot(page, lang, 'controls');
    await page.goto(`./${base}/export`);
    await page.locator('.export-bar').waitFor();
    await shot(page, lang, 'export');
  });
}
