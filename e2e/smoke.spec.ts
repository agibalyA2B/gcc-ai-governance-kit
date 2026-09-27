import { test, expect } from '@playwright/test';

test('loads in English and toggles to Arabic RTL', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI governance');
  await page.getByTestId('lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test.describe('Arabic browser', () => {
  test.use({ locale: 'ar-AE' });
  test('opens in Arabic by default', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });
});
