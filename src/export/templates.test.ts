import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as XLSX from 'xlsx';
import crosswalkData from '../../data/crosswalk.json';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LANGS = ['en', 'ar'] as const;
const FILES = [
  'register', 'impact-assessment', 'control-checklist',
  'vendor-ai-risk-assessment', 'committee-charter', 'raci',
] as const;
const EXTS = ['xlsx', 'csv', 'md'] as const;

// Regenerate the pack so this test is a real check of the build script, not just of files left
// over from a previous run.
execFileSync('node', ['scripts/build-templates.mjs'], { cwd: ROOT, stdio: 'pipe' });

describe('templates pack', () => {
  it('writes all 36 template files', () => {
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

  it('every RACI activity row has exactly one "A" (accountable) in both languages', () => {
    const roleColumnStart = 1; // column 0 is the activity label
    for (const lang of LANGS) {
      const buf = readFileSync(join(ROOT, 'public/templates', lang, 'raci.csv'));
      const text = buf.toString('utf8').replace(/^﻿/, '');
      const rows = text.split('\r\n').filter(Boolean).map((line) => line.split(','));
      const dataRows = rows.slice(2, -1); // skip the two header rows and the closing disclaimer row
      expect(dataRows.length).toBeGreaterThan(0);
      for (const row of dataRows) {
        const aCount = row.slice(roleColumnStart).filter((cell) => cell === 'A').length;
        expect(aCount, `row "${row[0]}" (${lang})`).toBe(1);
      }
    }
  });

  it('the RACI says it is an illustrative starting point, in every format and language', () => {
    const line = { en: 'Illustrative starting point. Adapt the roles to your organisation.', ar: 'نقطة انطلاق توضيحية. عدّل الأدوار بما يلائم مؤسستك.' };
    for (const lang of LANGS) {
      const md = readFileSync(join(ROOT, 'public/templates', lang, 'raci.md'), 'utf8');
      expect(md.split('\n')[2]).toBe(`**${line[lang]}**`);
      const csvRows = readFileSync(join(ROOT, 'public/templates', lang, 'raci.csv'), 'utf8').split('\r\n').filter(Boolean);
      expect(csvRows.at(-1)!.startsWith(line[lang])).toBe(true);
      const wb = XLSX.read(readFileSync(join(ROOT, 'public/templates', lang, 'raci.xlsx')), { type: 'buffer' });
      const rows = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      expect(rows.at(-1)![0]).toBe(line[lang]);
    }
  });

  it('ar xlsx files of the new templates open RTL', () => {
    for (const file of ['vendor-ai-risk-assessment', 'committee-charter', 'raci'] as const) {
      const buf = readFileSync(join(ROOT, 'public/templates/ar', `${file}.xlsx`));
      const wb = XLSX.read(buf, { type: 'buffer' });
      expect(wb.Workbook?.Views?.[0]?.RTL, file).toBe(true);
    }
  });
});
