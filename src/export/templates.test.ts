import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as XLSX from 'xlsx';
import crosswalkData from '../../data/crosswalk.json';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LANGS = ['en', 'ar'] as const;
const FILES = ['register', 'impact-assessment', 'control-checklist'] as const;
const EXTS = ['xlsx', 'csv', 'md'] as const;

// Regenerate the pack so this test is a real check of the build script, not just of files left
// over from a previous run.
execFileSync('node', ['scripts/build-templates.mjs'], { cwd: ROOT, stdio: 'pipe' });

describe('templates pack', () => {
  it('writes all 18 template files', () => {
    for (const lang of LANGS) {
      for (const file of FILES) {
        for (const ext of EXTS) {
          const path = join(ROOT, 'public/templates', lang, `${file}.${ext}`);
          expect(existsSync(path), path).toBe(true);
        }
      }
    }
  });

  it('ar/control-checklist.xlsx opens RTL with one row per crosswalk control', () => {
    const buf = readFileSync(join(ROOT, 'public/templates/ar/control-checklist.xlsx'));
    const wb = XLSX.read(buf, { type: 'buffer' });
    expect(wb.Workbook?.Views?.[0]?.RTL).toBe(true);

    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
    // Two header rows (machine field names, human labels) precede the data rows.
    expect(rows.length - 2).toBe((crosswalkData as unknown[]).length);
  });
});
