import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['record-demo.spec.ts', 'guide-shots.spec.ts', 'guide-pdf.spec.ts'],
  outputDir: '../../test-results/media',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4173/gcc-ai-governance-kit/',
    viewport: { width: 1280, height: 800 },
    video: { mode: 'on', size: { width: 1280, height: 800 } },
  },
  webServer: { command: 'npm run build && npm run preview', port: 4173, reuseExistingServer: true },
});
