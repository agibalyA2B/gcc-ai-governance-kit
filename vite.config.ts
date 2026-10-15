/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  base: '/gcc-ai-governance-kit/',
  define: { __KIT_VERSION__: JSON.stringify(pkg.version) },
  test: { environment: 'jsdom', globals: true, include: ['src/**/*.test.ts'] },
});
