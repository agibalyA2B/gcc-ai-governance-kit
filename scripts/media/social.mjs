// Renders docs/media/social-preview.png (1280x640) for the repository's social preview.
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 640 } });
await page.goto(new URL('./social.html', import.meta.url).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fileURLToPath(new URL('../../docs/media/social-preview.png', import.meta.url)) });
await browser.close();
