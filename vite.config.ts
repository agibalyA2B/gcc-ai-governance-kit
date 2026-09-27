/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/gcc-ai-governance-kit/',
  test: { environment: 'jsdom', globals: true, include: ['src/**/*.test.ts'] },
});
