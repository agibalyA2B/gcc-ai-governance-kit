// Prints the in-app guide to docs/USER-GUIDE.pdf (EN) and docs/USER-GUIDE-ar.pdf (AR) with the print stylesheet.
// Run after guide-shots, against a fresh build: npm run media:guide
import { test } from '@playwright/test';

test.use({ video: 'off' });

for (const lang of ['en', 'ar'] as const) {
  test(`guide pdf (${lang})`, async ({ page }) => {
    await page.goto('./');
    await page.evaluate((l) => localStorage.setItem('gaigk.lang', l), lang);
    await page.goto('./#/guide');
    await page.reload();
    await page.locator('.guide img').last().scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => undefined); }));
      document.getElementById('print-root')!.innerHTML = document.querySelector('.guide')!.outerHTML;
    });
    await page.pdf({
      path: `docs/USER-GUIDE${lang === 'ar' ? '-ar' : ''}.pdf`, format: 'A4', printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
    });
  });
}
